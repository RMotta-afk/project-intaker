import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  updateMany: vi.fn(),
  create: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../db", () => ({
  getDb: () => ({ intake: dbMocks }),
}));

import { retryIntake } from "./retry";

const fixedNow = new Date("2026-11-02T12:00:00.000Z");

describe("retryIntake", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.create.mockResolvedValue(undefined);
  });

  it("moves the failed row back to PENDING and preserves identity/source", async () => {
    dbMocks.findUnique.mockResolvedValue({
      id: "intake-original",
      status: "FAILED",
      maxAttempts: 3,
    });
    dbMocks.updateMany.mockResolvedValue({ count: 1 });

    await expect(retryIntake("intake-original", { now: () => fixedNow })).resolves.toEqual({
      kind: "retried",
      intakeId: "intake-original",
      availableAt: fixedNow,
      maxAttempts: 3,
    });

    expect(dbMocks.updateMany).toHaveBeenCalledWith({
      where: { id: "intake-original", status: "FAILED" },
      data: {
        status: "PENDING",
        triageJson: null,
        errorCode: null,
        attempt: 0,
        availableAt: fixedNow,
        leaseToken: null,
        leaseExpiresAt: null,
        updatedAt: fixedNow,
      },
    });
    expect(dbMocks.create).not.toHaveBeenCalled();
  });

  it("rejects missing, active, and completed intakes", async () => {
    dbMocks.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: "active", status: "PROCESSING", maxAttempts: 3 })
      .mockResolvedValueOnce({ id: "done", status: "COMPLETED", maxAttempts: 3 });

    await expect(retryIntake("missing")).resolves.toEqual({ kind: "not-found" });
    await expect(retryIntake("active")).resolves.toEqual({ kind: "conflict" });
    await expect(retryIntake("done")).resolves.toEqual({ kind: "conflict" });
    expect(dbMocks.updateMany).not.toHaveBeenCalled();
  });

  it("allows only one concurrent retry transition and creates no duplicate intake", async () => {
    dbMocks.findUnique.mockResolvedValue({ id: "intake-original", status: "FAILED", maxAttempts: 3 });
    dbMocks.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });

    const results = await Promise.all([
      retryIntake("intake-original", { now: () => fixedNow }),
      retryIntake("intake-original", { now: () => fixedNow }),
    ]);

    expect(results.map((result) => result.kind).sort()).toEqual(["conflict", "retried"]);
    expect(dbMocks.updateMany).toHaveBeenCalledTimes(2);
    expect(dbMocks.create).not.toHaveBeenCalled();
  });

  it("maps database errors to a safe result", async () => {
    dbMocks.findUnique.mockRejectedValue(new Error("private database details"));

    await expect(retryIntake("intake-original")).resolves.toEqual({ kind: "storage-error" });
  });
});
