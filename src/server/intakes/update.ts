import "server-only";

import { AnswerSubmissionSchema, ClarificationAnswersSchema, IntakeUpdateSchema, TriageSchema } from "../../contracts/intake";
import { getDb } from "../db";
import { formatBudgetAmount, formatCalendarDate } from "./create";

export type RevisionResult = { kind: "updated"; retriaged: boolean } | { kind: "invalid" | "not-found" | "conflict" | "storage-error" };

const requeue = (now: Date) => ({
  status: "PENDING",
  triageJson: null,
  errorCode: null,
  attempt: 0,
  availableAt: now,
  leaseToken: null,
  leaseExpiresAt: null,
  updatedAt: now,
} as const);

export async function updateIntake(id: string, input: unknown): Promise<RevisionResult> {
  const parsed = IntakeUpdateSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const change = parsed.data;
  const patch = {
    ...(change.title !== undefined ? { title: change.title } : {}),
    ...(change.description !== undefined ? { description: change.description } : {}),
    ...(change.industryTags !== undefined ? { industry: change.industryTags.join(", ") } : {}),
    ...(change.budgetRange !== undefined ? { budget: `${formatBudgetAmount(change.budgetRange.minimum, change.budgetRange.currency)} – ${formatBudgetAmount(change.budgetRange.maximum, change.budgetRange.currency)}` } : {}),
    ...(change.dateRange !== undefined ? { timeline: `${formatCalendarDate(change.dateRange.start)} – ${formatCalendarDate(change.dateRange.end)}` } : {}),
  };

  try {
    return await getDb().$transaction(async (transaction) => {
      const current = await transaction.intake.findUnique({ where: { id }, select: {
        id: true, title: true, description: true, industry: true, budget: true, timeline: true,
        status: true, triageJson: true, updatedAt: true,
      } });
      if (!current) return { kind: "not-found" } as const;
      const changed = Object.entries(patch).some(([key, value]) => current[key as keyof typeof patch] !== value);
      if (!changed) return { kind: "updated", retriaged: false } as const;
      const retriaged = Object.entries(patch).some(([key, value]) => key !== "title" && current[key as keyof typeof patch] !== value);
      const now = new Date();
      const result = await transaction.intake.updateMany({
        where: { id, status: current.status, updatedAt: current.updatedAt },
        data: {
          ...patch,
          ...(retriaged ? {
            ...requeue(now),
            ...(current.triageJson ? { previousTriageJson: current.triageJson } : {}),
          } : { updatedAt: now }),
        },
      });
      return result.count === 1 ? { kind: "updated", retriaged } as const : { kind: "conflict" } as const;
    });
  } catch {
    return { kind: "storage-error" };
  }
}

export async function answerClarifications(id: string, input: unknown): Promise<RevisionResult> {
  const parsed = AnswerSubmissionSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  try {
    return await getDb().$transaction(async (transaction) => {
      const current = await transaction.intake.findUnique({ where: { id }, select: {
        status: true, triageJson: true, clarificationAnswersJson: true, updatedAt: true,
      } });
      if (!current) return { kind: "not-found" } as const;
      if (current.status !== "COMPLETED" || !current.triageJson) return { kind: "conflict" } as const;
      const triage = TriageSchema.safeParse(JSON.parse(current.triageJson));
      if (!triage.success || parsed.data.answers.some(({ question }) => !triage.data.followUpQuestions.includes(question))) return { kind: "invalid" } as const;
      const existing = ClarificationAnswersSchema.safeParse(JSON.parse(current.clarificationAnswersJson ?? "[]"));
      if (!existing.success) return { kind: "storage-error" } as const;
      const answers = [...existing.data];
      for (const answer of parsed.data.answers) {
        const index = answers.findIndex((item) => item.question === answer.question);
        if (index >= 0) answers[index] = answer;
        else answers.push(answer);
      }
      if (!ClarificationAnswersSchema.safeParse(answers).success) return { kind: "invalid" } as const;
      const now = new Date();
      const result = await transaction.intake.updateMany({
        where: { id, status: "COMPLETED", updatedAt: current.updatedAt },
        data: { ...requeue(now), previousTriageJson: current.triageJson, clarificationAnswersJson: JSON.stringify(answers) },
      });
      return result.count === 1 ? { kind: "updated", retriaged: true } as const : { kind: "conflict" } as const;
    });
  } catch {
    return { kind: "storage-error" };
  }
}
