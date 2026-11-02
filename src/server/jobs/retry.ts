import "server-only";

import { getDb } from "../db";

export type RetryResult =
  | { kind: "retried"; intakeId: string; availableAt: Date; maxAttempts: number }
  | { kind: "not-found" }
  | { kind: "conflict" }
  | { kind: "storage-error" };

export interface RetryOptions {
  now?: () => Date;
}

/** Requeue a failed or completed run while preserving its prior result for comparison. */
export async function retryIntake(intakeId: string, options: RetryOptions = {}): Promise<RetryResult> {
  const now = (options.now ?? (() => new Date()))();

  try {
    const db = getDb();
    const existing = await db.intake.findUnique({
      where: { id: intakeId },
      select: { id: true, status: true, maxAttempts: true, triageJson: true },
    });
    if (!existing) return { kind: "not-found" };
    if (existing.status !== "FAILED" && existing.status !== "COMPLETED") return { kind: "conflict" };

    const updated = await db.intake.updateMany({
      where: { id: intakeId, status: existing.status },
      data: {
        status: "PENDING",
        triageJson: null,
        ...(existing.status === "COMPLETED" ? { previousTriageJson: existing.triageJson } : {}),
        errorCode: null,
        attempt: 0,
        availableAt: now,
        leaseToken: null,
        leaseExpiresAt: null,
        updatedAt: now,
      },
    });

    if (updated.count !== 1) return { kind: "conflict" };
    return {
      kind: "retried",
      intakeId: existing.id,
      availableAt: now,
      maxAttempts: existing.maxAttempts,
    };
  } catch {
    return { kind: "storage-error" };
  }
}
