import { beforeEach, describe, expect, it, vi } from "vitest";
import { triageFixture } from "../../contracts/fixtures";

const mocks = vi.hoisted(() => ({
  claimNextIntake: vi.fn(),
  completeClaim: vi.fn(),
  failClaim: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("./claim", () => ({ claimNextIntake: mocks.claimNextIntake }));
vi.mock("./outcome", () => ({
  completeClaim: mocks.completeClaim,
  failClaim: mocks.failClaim,
}));

import { runWorker, runWorkerOnce } from "./worker";

const claim = {
  id: "intake-1",
  title: "Portal refresh",
  description: "Refresh the customer portal.",
  budget: "$20,000",
  timeline: "Q1",
  industry: "Software",
  clarificationAnswers: [{ question: "Which workflow is first?", answer: "Order history." }],
  attempt: 1,
  maxAttempts: 3,
  createdAt: new Date("2026-11-02T12:00:00.000Z"),
  leaseToken: "lease-current",
  leaseExpiresAt: new Date("2026-11-02T12:02:00.000Z"),
};
const triage = triageFixture;

describe("worker single-job runner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.claimNextIntake.mockResolvedValue(claim);
    mocks.completeClaim.mockResolvedValue({ kind: "completed" });
    mocks.failClaim.mockResolvedValue({ kind: "retry-scheduled", errorCode: "PROVIDER_TIMEOUT", availableAt: new Date() });
  });

  it("calls the adapter after claiming and commits validated output by the current lease", async () => {
    const order: string[] = [];
    mocks.claimNextIntake.mockImplementation(async () => { order.push("claim"); return claim; });
    mocks.completeClaim.mockImplementation(async () => { order.push("complete"); return { kind: "completed" }; });
    const adapter = vi.fn(async () => { order.push("adapter"); return triage; });

    await expect(runWorkerOnce(adapter)).resolves.toEqual({ kind: "completed", intakeId: "intake-1" });

    expect(order).toEqual(["claim", "adapter", "complete"]);
    expect(adapter).toHaveBeenCalledWith({
      title: claim.title,
      description: claim.description,
      budget: claim.budget,
      timeline: claim.timeline,
      industry: claim.industry,
      clarificationAnswers: claim.clarificationAnswers,
    });
    expect(mocks.completeClaim).toHaveBeenCalledWith("intake-1", "lease-current", triage, { now: undefined });
  });

  it("routes adapter errors through safe failure persistence", async () => {
    const adapter = vi.fn().mockRejectedValue({ code: "PROVIDER_TIMEOUT", message: "private transport details" });

    const result = await runWorkerOnce(adapter);
    expect(result).toMatchObject({
      kind: "failed",
      intakeId: "intake-1",
      outcome: { kind: "retry-scheduled", errorCode: "PROVIDER_TIMEOUT" },
    });
    expect(mocks.failClaim).toHaveBeenCalledWith("intake-1", "lease-current", {
      code: "PROVIDER_TIMEOUT",
      message: "private transport details",
    }, { now: undefined, random: undefined });
    expect(JSON.stringify(result)).not.toContain("private transport details");
  });

  it("turns invalid adapter output into a terminal safe failure", async () => {
    mocks.completeClaim.mockResolvedValue({ kind: "invalid-output" });
    mocks.failClaim.mockResolvedValue({ kind: "failed", errorCode: "INVALID_OUTPUT" });

    await expect(runWorkerOnce(vi.fn(async () => ({ ...triage, tags: ["same", "same", "tag"] }))))
      .resolves.toMatchObject({ kind: "failed", outcome: { kind: "failed", errorCode: "INVALID_OUTPUT" } });
    expect(mocks.failClaim).toHaveBeenCalledWith("intake-1", "lease-current", "INVALID_OUTPUT", {
      now: undefined,
      random: undefined,
    });
  });

  it("returns idle when there is no due intake", async () => {
    mocks.claimNextIntake.mockResolvedValue(null);
    const adapter = vi.fn();

    await expect(runWorkerOnce(adapter)).resolves.toEqual({ kind: "idle" });
    expect(adapter).not.toHaveBeenCalled();
  });
});

describe("worker poll loop", () => {
  beforeEach(() => vi.clearAllMocks());

  it("waits while idle and exits cleanly when shutdown aborts the signal", async () => {
    mocks.claimNextIntake.mockResolvedValue(null);
    const controller = new AbortController();
    const wait = vi.fn(async (_milliseconds: number, signal?: AbortSignal) => {
      expect(signal).toBe(controller.signal);
      controller.abort();
    });
    const onResult = vi.fn();

    await runWorker(vi.fn(async () => triage), {
      pollIntervalMs: 25,
      signal: controller.signal,
      wait,
      onResult,
    });

    expect(wait).toHaveBeenCalledOnce();
    expect(onResult).toHaveBeenCalledWith({ kind: "idle" });
    expect(mocks.claimNextIntake).toHaveBeenCalledOnce();
  });
});
