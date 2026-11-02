import { randomUUID } from "node:crypto";
import { getDb } from "../db";

export const DEFAULT_LEASE_MS = 120_000;
const MAX_CAS_RETRIES = 8;

export type ClaimedIntake = {
  id: string;
  title: string;
  description: string;
  budget: string;
  timeline: string;
  industry: string;
  attempt: number;
  maxAttempts: number;
  createdAt: Date;
  leaseToken: string;
  leaseExpiresAt: Date;
};

export type ClaimOptions = {
  now?: Date;
  leaseMs?: number;
  createToken?: () => string;
};

/** Claim one due intake with an atomic compare-and-set lease transition. */
export async function claimNextIntake(options: ClaimOptions = {}): Promise<ClaimedIntake | null> {
  const now = options.now ?? new Date();
  const leaseMs = options.leaseMs ?? DEFAULT_LEASE_MS;
  const createToken = options.createToken ?? randomUUID;

  if (!Number.isFinite(now.getTime())) throw new RangeError("A valid claim time is required.");
  if (!Number.isFinite(leaseMs) || leaseMs <= 0) throw new RangeError("Lease duration must be positive.");

  const leaseExpiresAt = new Date(now.getTime() + leaseMs);
  const db = getDb();

  for (let attemptNumber = 0; attemptNumber < MAX_CAS_RETRIES; attemptNumber += 1) {
    const candidate = await db.intake.findFirst({
      where: {
        OR: [
          { status: "PENDING", availableAt: { lte: now } },
          { status: "PROCESSING", leaseExpiresAt: { lte: now } },
        ],
      },
      orderBy: [{ availableAt: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    });

    if (!candidate) return null;

    if (candidate.attempt >= candidate.maxAttempts) {
      const exhausted = await db.intake.updateMany({
        where: candidate.status === "PENDING"
          ? {
              id: candidate.id,
              status: "PENDING",
              attempt: candidate.attempt,
              availableAt: { lte: now },
            }
          : {
              id: candidate.id,
              status: "PROCESSING",
              attempt: candidate.attempt,
              leaseToken: candidate.leaseToken,
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

      if (exhausted.count === 0) continue;
      // Continue this poll to a different due job if one exists.
      continue;
    }

    const token = createToken();
    if (!token) throw new Error("Claim token factory returned an empty token.");

    const claimed = await db.intake.updateMany({
      where: candidate.status === "PENDING"
        ? {
            id: candidate.id,
            status: "PENDING",
            attempt: candidate.attempt,
            availableAt: { lte: now },
          }
        : {
            id: candidate.id,
            status: "PROCESSING",
            attempt: candidate.attempt,
            leaseToken: candidate.leaseToken,
            leaseExpiresAt: { lte: now },
          },
      data: {
        status: "PROCESSING",
        attempt: { increment: 1 },
        leaseToken: token,
        leaseExpiresAt,
        updatedAt: now,
      },
    });

    if (claimed.count === 0) continue;

    return {
      id: candidate.id,
      title: candidate.title,
      description: candidate.description,
      budget: candidate.budget,
      timeline: candidate.timeline,
      industry: candidate.industry,
      attempt: candidate.attempt + 1,
      maxAttempts: candidate.maxAttempts,
      createdAt: candidate.createdAt,
      leaseToken: token,
      leaseExpiresAt,
    };
  }

  return null;
}
