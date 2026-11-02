import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  updateMany: vi.fn(),
}));

const runAgainstSqlite = process.env.RUN_DB_INTEGRATION === "1";

vi.mock("server-only", () => ({}));
vi.mock("../db", async (importOriginal) => {
  if (process.env.RUN_DB_INTEGRATION === "1") return importOriginal();
  return { getDb: () => ({ intake: dbMocks }) };
});

import { claimNextIntake } from "./claim";
import { disconnectDb, getDb } from "../db";

const now = new Date("2026-11-02T12:00:00.000Z");

function intake(overrides: Record<string, unknown> = {}) {
  return {
    id: "intake-1",
    title: "Portal refresh",
    description: "Refresh the customer portal.",
    budget: "$20,000",
    timeline: "Q1",
    industry: "Software",
    status: "PENDING",
    attempt: 0,
    maxAttempts: 3,
    availableAt: new Date("2026-11-02T11:00:00.000Z"),
    leaseToken: null,
    leaseExpiresAt: null,
    createdAt: new Date("2026-11-01T12:00:00.000Z"),
    ...overrides,
  };
}

describe.runIf(!runAgainstSqlite)("claimNextIntake", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("claims a due pending intake with a fresh token and incremented attempt", async () => {
    dbMocks.findFirst.mockResolvedValue(intake());
    dbMocks.updateMany.mockResolvedValue({ count: 1 });

    const result = await claimNextIntake({
      now,
      leaseMs: 30_000,
      createToken: () => "fresh-lease-token",
    });

    expect(dbMocks.updateMany).toHaveBeenCalledWith({
      where: {
        id: "intake-1",
        status: "PENDING",
        attempt: 0,
        availableAt: { lte: now },
      },
      data: {
        status: "PROCESSING",
        attempt: { increment: 1 },
        leaseToken: "fresh-lease-token",
        leaseExpiresAt: new Date("2026-11-02T12:00:30.000Z"),
        updatedAt: now,
      },
    });
    expect(result).toMatchObject({
      id: "intake-1",
      title: "Portal refresh",
      attempt: 1,
      maxAttempts: 3,
      leaseToken: "fresh-lease-token",
      leaseExpiresAt: new Date("2026-11-02T12:00:30.000Z"),
    });
    expect(result).not.toHaveProperty("status");
  });

  it("reclaims an expired processing lease with a new token", async () => {
    dbMocks.findFirst.mockResolvedValue(intake({
      status: "PROCESSING",
      attempt: 1,
      leaseToken: "stale-token",
      leaseExpiresAt: new Date("2026-11-02T11:59:00.000Z"),
    }));
    dbMocks.updateMany.mockResolvedValue({ count: 1 });

    const result = await claimNextIntake({ now, createToken: () => "replacement-token" });

    expect(dbMocks.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        status: "PROCESSING",
        leaseToken: "stale-token",
        leaseExpiresAt: { lte: now },
      }),
      data: expect.objectContaining({ leaseToken: "replacement-token", attempt: { increment: 1 } }),
    }));
    expect(result?.leaseToken).toBe("replacement-token");
    expect(result?.attempt).toBe(2);
  });

  it("does not select a pending intake before its available time or an active lease", async () => {
    dbMocks.findFirst.mockResolvedValue(null);

    await expect(claimNextIntake({ now })).resolves.toBeNull();

    expect(dbMocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        OR: [
          { status: "PENDING", availableAt: { lte: now } },
          { status: "PROCESSING", leaseExpiresAt: { lte: now } },
        ],
      },
    }));
    expect(dbMocks.updateMany).not.toHaveBeenCalled();
  });

  it("marks exhausted crashed work failed instead of reclaiming it", async () => {
    dbMocks.findFirst
      .mockResolvedValueOnce(intake({
        status: "PROCESSING",
        attempt: 3,
        maxAttempts: 3,
        leaseToken: "expired-token",
        leaseExpiresAt: new Date("2026-11-02T11:59:00.000Z"),
      }))
      .mockResolvedValueOnce(null);
    dbMocks.updateMany.mockResolvedValue({ count: 1 });

    await expect(claimNextIntake({ now })).resolves.toBeNull();

    expect(dbMocks.updateMany).toHaveBeenCalledWith({
      where: {
        id: "intake-1",
        status: "PROCESSING",
        attempt: 3,
        leaseToken: "expired-token",
        leaseExpiresAt: { lte: now },
      },
      data: {
        status: "FAILED",
        errorCode: "ATTEMPTS_EXHAUSTED",
        leaseToken: null,
        leaseExpiresAt: null,
        updatedAt: now,
      },
    });
  });

  it("allows only one competing worker to win the same compare-and-set", async () => {
    const candidate = intake();
    let selectionCount = 0;
    let claimCount = 0;
    dbMocks.findFirst.mockImplementation(async () => {
      selectionCount += 1;
      return selectionCount <= 2 ? candidate : null;
    });
    dbMocks.updateMany.mockImplementation(async () => {
      claimCount += 1;
      return { count: claimCount === 1 ? 1 : 0 };
    });
    let tokenNumber = 0;

    const results = await Promise.all([
      claimNextIntake({ now, createToken: () => `token-${++tokenNumber}` }),
      claimNextIntake({ now, createToken: () => `token-${++tokenNumber}` }),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
    expect(dbMocks.updateMany).toHaveBeenCalledTimes(2);
  });
});

describe.runIf(runAgainstSqlite)("claimNextIntake against SQLite", () => {
  const ids: string[] = [];
  const sqlite = getDb();
  const integrationNow = new Date("2035-01-01T12:00:00.000Z");

  async function createRecord(
    values: Parameters<typeof sqlite.intake.create>[0]["data"],
  ): Promise<string> {
    const record = await sqlite.intake.create({ data: values });
    ids.push(record.id);
    return record.id;
  }

  it("handles due work, active leases, exhausted recovery, and competing claims", async () => {
    const source = {
      title: "SQLite claim integration",
      description: "Persisted intake used for the claim recovery integration test.",
      budget: "Unknown",
      timeline: "Flexible",
      industry: "Software",
    };

    await createRecord({ ...source, status: "PENDING", availableAt: new Date(integrationNow.getTime() - 1000) });
    const concurrent = await Promise.all([
      claimNextIntake({ now: integrationNow }),
      claimNextIntake({ now: integrationNow }),
    ]);
    expect(concurrent.filter(Boolean)).toHaveLength(1);
    expect(concurrent.find(Boolean)?.attempt).toBe(1);
    expect(concurrent.find(Boolean)?.leaseToken).toBeTruthy();

    await createRecord({
      ...source,
      title: "Active lease",
      status: "PROCESSING",
      attempt: 1,
      leaseToken: "active-token",
      leaseExpiresAt: new Date(integrationNow.getTime() + 60_000),
      availableAt: new Date(integrationNow.getTime() - 60_000),
    });
    await createRecord({ ...source, title: "Not due", status: "PENDING", availableAt: new Date(integrationNow.getTime() + 60_000) });
    expect(await claimNextIntake({ now: integrationNow })).toBeNull();

    const expiredId = await createRecord({
      ...source,
      title: "Expired lease",
      status: "PROCESSING",
      attempt: 1,
      leaseToken: "old-token",
      leaseExpiresAt: new Date(integrationNow.getTime() - 1000),
      availableAt: new Date(integrationNow.getTime() - 60_000),
    });
    const reclaimed = await claimNextIntake({ now: integrationNow, createToken: () => "new-token" });
    expect(reclaimed).toMatchObject({ id: expiredId, attempt: 2, leaseToken: "new-token" });

    const exhaustedId = await createRecord({
      ...source,
      title: "Exhausted crash",
      status: "PROCESSING",
      attempt: 3,
      maxAttempts: 3,
      leaseToken: "last-token",
      leaseExpiresAt: new Date(integrationNow.getTime() - 1000),
      availableAt: new Date(integrationNow.getTime() - 60_000),
    });
    expect(await claimNextIntake({ now: integrationNow })).toBeNull();
    await expect(sqlite.intake.findUnique({ where: { id: exhaustedId } })).resolves.toMatchObject({
      status: "FAILED",
      errorCode: "ATTEMPTS_EXHAUSTED",
      leaseToken: null,
      leaseExpiresAt: null,
    });
  });

  afterAll(async () => {
    await sqlite.intake.deleteMany({ where: { id: { in: ids } } });
    await disconnectDb();
  });
});
