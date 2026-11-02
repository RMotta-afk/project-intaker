import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  updateMany: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../db", () => ({
  getDb: () => ({
    intake: { updateMany: dbMocks.updateMany },
    $transaction: dbMocks.transaction,
  }),
}));

import { completeClaim, failClaim } from "./outcome";

const triage = {
  summary: "The client needs a refreshed project portal. Integration details need discovery.",
  tags: ["Portal", "Retail", "Redesign"],
  risks: ["Confirm identity and payment integrations."],
};
const fixedNow = new Date("2026-11-02T12:00:00.000Z");

describe("guarded job outcomes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.transaction.mockImplementation(async (callback) => callback({
      intake: {
        findFirst: dbMocks.findFirst,
        updateMany: dbMocks.updateMany,
      },
    }));
  });

  it("commits only valid output for the current token and preserves source fields", async () => {
    dbMocks.updateMany.mockResolvedValue({ count: 1 });

    await expect(completeClaim("intake-1", "lease-current", triage, { now: () => fixedNow }))
      .resolves.toEqual({ kind: "completed" });

    expect(dbMocks.updateMany).toHaveBeenCalledWith({
      where: { id: "intake-1", status: "PROCESSING", leaseToken: "lease-current" },
      data: expect.objectContaining({
        status: "COMPLETED",
        triageJson: JSON.stringify(triage),
        errorCode: null,
        leaseToken: null,
        leaseExpiresAt: null,
        updatedAt: fixedNow,
      }),
    });
    expect(dbMocks.updateMany.mock.calls[0][0].data).not.toHaveProperty("title");
    expect(dbMocks.updateMany.mock.calls[0][0].data).not.toHaveProperty("description");
  });

  it("rejects invalid output without writing", async () => {
    await expect(completeClaim("intake-1", "lease-current", { ...triage, tags: ["duplicate", "duplicate", "third"] }))
      .resolves.toEqual({ kind: "invalid-output" });
    expect(dbMocks.updateMany).not.toHaveBeenCalled();
  });

  it("rejects stale success tokens", async () => {
    dbMocks.updateMany.mockResolvedValue({ count: 0 });
    await expect(completeClaim("intake-1", "old-token", triage)).resolves.toEqual({ kind: "stale-token" });
  });

  it("schedules a bounded retry with injected clock and randomness", async () => {
    dbMocks.findFirst.mockResolvedValue({ attempt: 2, maxAttempts: 3 });
    dbMocks.updateMany.mockResolvedValue({ count: 1 });

    const result = await failClaim("intake-1", "lease-current", { code: "PROVIDER_TIMEOUT", message: "private details" }, {
      now: () => fixedNow,
      random: () => 1,
    });

    expect(result).toEqual({
      kind: "retry-scheduled",
      errorCode: "PROVIDER_TIMEOUT",
      availableAt: new Date(fixedNow.getTime() + 2_400),
    });
    expect(dbMocks.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "intake-1", status: "PROCESSING", leaseToken: "lease-current", attempt: 2 },
      data: expect.objectContaining({
        status: "PENDING",
        errorCode: "PROVIDER_TIMEOUT",
        leaseToken: null,
        leaseExpiresAt: null,
      }),
    }));
  });

  it("makes authentication failures terminal and never stores raw provider text", async () => {
    dbMocks.findFirst.mockResolvedValue({ attempt: 1, maxAttempts: 3 });
    dbMocks.updateMany.mockResolvedValue({ count: 1 });

    await expect(failClaim("intake-1", "lease-current", { code: "PROVIDER_AUTH", message: "secret key rejected" }, {
      now: () => fixedNow,
    })).resolves.toEqual({ kind: "failed", errorCode: "PROVIDER_AUTH" });
    expect(dbMocks.updateMany.mock.calls[0][0].data).toMatchObject({
      status: "FAILED",
      errorCode: "PROVIDER_AUTH",
      leaseToken: null,
      leaseExpiresAt: null,
    });
    expect(JSON.stringify(dbMocks.updateMany.mock.calls[0][0].data)).not.toContain("secret key rejected");
  });

  it("exhausts the durable attempt budget instead of scheduling another retry", async () => {
    dbMocks.findFirst.mockResolvedValue({ attempt: 3, maxAttempts: 3 });
    dbMocks.updateMany.mockResolvedValue({ count: 1 });

    await expect(failClaim("intake-1", "lease-current", "PROVIDER_UNAVAILABLE", { now: () => fixedNow }))
      .resolves.toEqual({ kind: "failed", errorCode: "ATTEMPTS_EXHAUSTED" });
    expect(dbMocks.updateMany.mock.calls[0][0].data).toMatchObject({ status: "FAILED", errorCode: "ATTEMPTS_EXHAUSTED" });
  });

  it("rejects stale failure tokens", async () => {
    dbMocks.findFirst.mockResolvedValue(null);
    await expect(failClaim("intake-1", "old-token", "PROVIDER_ERROR")).resolves.toEqual({ kind: "stale-token" });
    expect(dbMocks.updateMany).not.toHaveBeenCalled();
  });
});
