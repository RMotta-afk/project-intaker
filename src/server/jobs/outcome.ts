import "server-only";

import { TriageFailureCodeSchema, TriageSchema, type TriageFailureCode } from "../../contracts/intake";
import { getDb } from "../db";

const BASE_BACKOFF_MS = 1_000;
const MAX_BACKOFF_BASE_MS = 60_000;
const MAX_JITTER_FRACTION = 0.2;

export type CompletionResult =
  | { kind: "completed" }
  | { kind: "invalid-output" }
  | { kind: "stale-token" }
  | { kind: "storage-error" };

export type FailureResult =
  | { kind: "retry-scheduled"; errorCode: TriageFailureCode; availableAt: Date }
  | { kind: "failed"; errorCode: TriageFailureCode }
  | { kind: "stale-token" }
  | { kind: "storage-error" };

export interface TransitionOptions {
  now?: () => Date;
}

export interface FailureOptions extends TransitionOptions {
  random?: () => number;
}

/** Commit validated triage only while this worker still owns the active lease. */
export async function completeClaim(
  intakeId: string,
  leaseToken: string,
  triage: unknown,
  options: TransitionOptions = {},
): Promise<CompletionResult> {
  const parsed = TriageSchema.safeParse(triage);
  if (!parsed.success) return { kind: "invalid-output" };

  const now = (options.now ?? (() => new Date()))();
  try {
    const result = await getDb().intake.updateMany({
      where: { id: intakeId, status: "PROCESSING", leaseToken },
      data: {
        status: "COMPLETED",
        triageJson: JSON.stringify(parsed.data),
        errorCode: null,
        leaseToken: null,
        leaseExpiresAt: null,
        availableAt: now,
        updatedAt: now,
      },
    });

    return result.count === 1 ? { kind: "completed" } : { kind: "stale-token" };
  } catch {
    return { kind: "storage-error" };
  }
}

/**
 * Commit a safe failure code for the active lease. Transient provider failures
 * are rescheduled with a bounded exponential delay; auth and invalid output
 * failures are terminal because another identical call cannot fix them.
 */
export async function failClaim(
  intakeId: string,
  leaseToken: string,
  failure: unknown,
  options: FailureOptions = {},
): Promise<FailureResult> {
  const errorCode = classifyFailure(failure);
  const now = (options.now ?? (() => new Date()))();

  try {
    return await getDb().$transaction(async (transaction) => {
      const current = await transaction.intake.findFirst({
        where: { id: intakeId, status: "PROCESSING", leaseToken },
        select: { attempt: true, maxAttempts: true },
      });
      if (!current) return { kind: "stale-token" } as const;

      const retryable = isRetryable(errorCode) && current.attempt < current.maxAttempts;
      const where = {
        id: intakeId,
        status: "PROCESSING",
        leaseToken,
        attempt: current.attempt,
      };

      if (!retryable) {
        const terminalCode = isRetryable(errorCode) ? "ATTEMPTS_EXHAUSTED" : errorCode;
        const updated = await transaction.intake.updateMany({
          where,
          data: {
            status: "FAILED",
            errorCode: terminalCode,
            triageJson: null,
            leaseToken: null,
            leaseExpiresAt: null,
            updatedAt: now,
          },
        });
        return updated.count === 1
          ? { kind: "failed", errorCode: terminalCode } as const
          : { kind: "stale-token" } as const;
      }

      const delayMs = retryDelayMs(current.attempt, options.random ?? Math.random);
      const availableAt = new Date(now.getTime() + delayMs);
      const updated = await transaction.intake.updateMany({
        where,
        data: {
          status: "PENDING",
          errorCode,
          triageJson: null,
          availableAt,
          leaseToken: null,
          leaseExpiresAt: null,
          updatedAt: now,
        },
      });
      return updated.count === 1
        ? { kind: "retry-scheduled", errorCode, availableAt } as const
        : { kind: "stale-token" } as const;
    });
  } catch {
    return { kind: "storage-error" };
  }
}

function classifyFailure(failure: unknown): TriageFailureCode {
  const candidate = typeof failure === "string"
    ? failure
    : typeof failure === "object" && failure !== null && "code" in failure
      ? failure.code
      : undefined;
  const parsed = TriageFailureCodeSchema.safeParse(candidate);
  return parsed.success ? parsed.data : "PROVIDER_ERROR";
}

function isRetryable(code: TriageFailureCode): boolean {
  return code !== "PROVIDER_AUTH" && code !== "INVALID_OUTPUT" && code !== "ATTEMPTS_EXHAUSTED";
}

function retryDelayMs(attempt: number, random: () => number): number {
  const baseMs = Math.min(MAX_BACKOFF_BASE_MS, BASE_BACKOFF_MS * 2 ** Math.max(0, attempt - 1));
  const sample = random();
  const normalized = Number.isFinite(sample) ? Math.max(0, Math.min(1, sample)) : 0;
  return Math.floor(baseMs + baseMs * MAX_JITTER_FRACTION * normalized);
}
