import "server-only";

import type { GenerateTriage, IntakeInput } from "../../contracts/intake";
import { claimNextIntake } from "./claim";
import { completeClaim, failClaim, type FailureResult } from "./outcome";

export type WorkerRunResult =
  | { kind: "idle" }
  | { kind: "completed"; intakeId: string }
  | { kind: "failed"; intakeId: string; outcome: FailureResult }
  | { kind: "stale-token"; intakeId: string }
  | { kind: "storage-error"; intakeId: string };

export interface WorkerOptions {
  pollIntervalMs?: number;
  leaseMs?: number;
  signal?: AbortSignal;
  now?: () => Date;
  random?: () => number;
  createToken?: () => string;
  wait?: (milliseconds: number, signal?: AbortSignal) => Promise<void>;
  onResult?: (result: WorkerRunResult) => void | Promise<void>;
}

/** Claim one saved intake, call the adapter outside a DB transaction, then commit by lease token. */
export async function runWorkerOnce(
  generateTriage: GenerateTriage,
  options: Pick<WorkerOptions, "leaseMs" | "now" | "random" | "createToken"> = {},
): Promise<WorkerRunResult> {
  const claim = await claimNextIntake({
    now: options.now?.(),
    leaseMs: options.leaseMs,
    createToken: options.createToken,
  });
  if (!claim) return { kind: "idle" };

  const input: IntakeInput = {
    title: claim.title,
    description: claim.description,
    budget: claim.budget,
    timeline: claim.timeline,
    industry: claim.industry,
  };

  let output: unknown;
  try {
    // This may perform network I/O. It intentionally runs after the claim has committed.
    output = await generateTriage(input);
  } catch (failure) {
    const outcome = await failClaim(claim.id, claim.leaseToken, failure, {
      now: options.now,
      random: options.random,
    });
    return failureResult(claim.id, outcome);
  }

  const completion = await completeClaim(claim.id, claim.leaseToken, output, { now: options.now });
  if (completion.kind === "completed") return { kind: "completed", intakeId: claim.id };
  if (completion.kind === "stale-token") return { kind: "stale-token", intakeId: claim.id };
  if (completion.kind === "storage-error") return { kind: "storage-error", intakeId: claim.id };

  const outcome = await failClaim(claim.id, claim.leaseToken, "INVALID_OUTPUT", {
    now: options.now,
    random: options.random,
  });
  return failureResult(claim.id, outcome);
}

/** Run a single-concurrency poll loop until its AbortSignal is cancelled. */
export async function runWorker(
  generateTriage: GenerateTriage,
  options: WorkerOptions = {},
): Promise<void> {
  const pollIntervalMs = options.pollIntervalMs ?? 1_000;
  if (!Number.isFinite(pollIntervalMs) || pollIntervalMs < 0) {
    throw new RangeError("Poll interval must be a non-negative number.");
  }

  const wait = options.wait ?? waitForPoll;
  while (!options.signal?.aborted) {
    const result = await runWorkerOnce(generateTriage, options);
    await options.onResult?.(result);

    if ((result.kind === "idle" || result.kind === "storage-error") && !options.signal?.aborted) {
      await wait(pollIntervalMs, options.signal);
    }
  }
}

function failureResult(intakeId: string, outcome: FailureResult): WorkerRunResult {
  if (outcome.kind === "stale-token") return { kind: "stale-token", intakeId };
  if (outcome.kind === "storage-error") return { kind: "storage-error", intakeId };
  return { kind: "failed", intakeId, outcome };
}

function waitForPoll(milliseconds: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.resolve();

  return new Promise((resolve) => {
    const timer = setTimeout(finish, milliseconds);
    function finish() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", finish);
      resolve();
    }
    signal?.addEventListener("abort", finish, { once: true });
  });
}
