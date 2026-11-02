import { IntakeInputSchema, IntakeSubmissionSchema, PublicIntakeSchema } from "../../contracts/intake";
import type { PrismaClient } from "@prisma/client";
import { getDb } from "../db";

export type CreateIntakeResult =
  | { kind: "created"; intake: ReturnType<typeof PublicIntakeSchema.parse> }
  | { kind: "invalid" }
  | { kind: "storage-error" };

export function formatCalendarDate(value: string): string {
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatBudgetAmount(value: string, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value.replaceAll(",", "")));
}

/** Validate and persist an intake before any analysis work is scheduled. */
export async function createIntake(
  input: unknown,
  database: Pick<PrismaClient, "intake"> = getDb(),
): Promise<CreateIntakeResult> {
  const parsed = IntakeSubmissionSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const submission = parsed.data;
  const normalized = IntakeInputSchema.parse({
    title: submission.title,
    description: submission.description,
    industry: submission.industryTags.join(", "),
    budget: `${formatBudgetAmount(submission.budgetRange.minimum, submission.budgetRange.currency)} – ${formatBudgetAmount(submission.budgetRange.maximum, submission.budgetRange.currency)}`,
    timeline: `${formatCalendarDate(submission.dateRange.start)} – ${formatCalendarDate(submission.dateRange.end)}`,
  });

  let saved: Awaited<ReturnType<typeof database.intake.create>>;
  try {
    saved = await database.intake.create({
      data: {
        ...normalized,
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
