import { IntakeInputSchema, PublicIntakeSchema } from "../../contracts/intake";
import type { PrismaClient } from "@prisma/client";
import { getDb } from "../db";

export type CreateIntakeResult =
  | { kind: "created"; intake: ReturnType<typeof PublicIntakeSchema.parse> }
  | { kind: "invalid" }
  | { kind: "storage-error" };

/** Validate and persist an intake before any analysis work is scheduled. */
export async function createIntake(
  input: unknown,
  database: Pick<PrismaClient, "intake"> = getDb(),
): Promise<CreateIntakeResult> {
  const parsed = IntakeInputSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };

  let saved: Awaited<ReturnType<typeof database.intake.create>>;
  try {
    saved = await database.intake.create({
      data: {
        ...parsed.data,
        status: "PENDING",
      },
    });
  } catch {
    return { kind: "storage-error" };
  }

  const publicResult = PublicIntakeSchema.safeParse({
    id: saved.id,
    title: saved.title,
    description: saved.description,
    budget: saved.budget,
    timeline: saved.timeline,
    industry: saved.industry,
    createdAt: saved.createdAt.toISOString(),
    status: saved.status,
    retryAvailable: false,
  });

  if (!publicResult.success) return { kind: "storage-error" };
  return { kind: "created", intake: publicResult.data };
}
