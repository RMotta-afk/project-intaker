import {
  LegacyTriageSchema,
  IntakeListItemSchema,
  IntakeStatusSchema,
  PublicIntakeSchema,
  TriageFailureCodeSchema,
  TriageSchema,
  type IntakeListItem,
  type PublicIntake,
  type Triage,
} from "../../contracts/intake";
import { z } from "zod";
import { getDb } from "../db";

export const IntakeIdSchema = z.string().trim().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/u);
const MAX_STORED_TRIAGE_CHARS = 64_000;

export type { IntakeListItem } from "../../contracts/intake";

function parseTriage(triageJson: string | null): Triage | undefined {
  if (!triageJson || triageJson.length > MAX_STORED_TRIAGE_CHARS) return undefined;

  try {
    const parsed: unknown = JSON.parse(triageJson);
    const result = TriageSchema.safeParse(parsed);
    if (result.success) return result.data;

    const legacy = LegacyTriageSchema.safeParse(parsed);
    if (!legacy.success) return undefined;

    return TriageSchema.parse({
      ...legacy.data,
      projectBrief: {
        objective: null,
        primaryUsers: null,
        keyRequirements: [],
        constraints: [],
        successCriteria: [],
      },
      followUpQuestions: [
        "What outcome should define success for this project?",
        "Which users, workflows, and integrations should the team prioritize first?",
      ],
    });
  } catch {
    // A corrupt stored result should not make the saved source unavailable.
    return undefined;
  }
}

function parseErrorCode(errorCode: string | null): string | undefined {
  if (!errorCode) return undefined;
  const result = TriageFailureCodeSchema.safeParse(errorCode);
  return result.success ? result.data : undefined;
}

function parseStatus(status: string) {
  return IntakeStatusSchema.safeParse(status);
}

/** Return compact, newest-first public summaries without lease or attempt data. */
export async function listIntakes(): Promise<IntakeListItem[]> {
  const records = await getDb().intake.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
      industry: true,
      createdAt: true,
      status: true,
      errorCode: true,
    },
  });

  return records.flatMap((record) => {
    const status = parseStatus(record.status);
    if (!status.success) return [];

    const item = {
      id: record.id,
      title: record.title,
      industry: record.industry,
      createdAt: record.createdAt.toISOString(),
      status: status.data,
      ...(parseErrorCode(record.errorCode) ? { errorCode: parseErrorCode(record.errorCode) } : {}),
    };
    const result = IntakeListItemSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });
}

/** Read the complete public record while keeping persisted worker fields private. */
export async function getIntake(id: string): Promise<PublicIntake | null> {
  const record = await getDb().intake.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      budget: true,
      timeline: true,
      industry: true,
      status: true,
      triageJson: true,
      errorCode: true,
      createdAt: true,
    },
  });
  if (!record) return null;

  const status = parseStatus(record.status);
  if (!status.success) throw new Error("Stored intake has an invalid status.");

  const triage = parseTriage(record.triageJson);
  const result = PublicIntakeSchema.safeParse({
    id: record.id,
    title: record.title,
    description: record.description,
    budget: record.budget,
    timeline: record.timeline,
    industry: record.industry,
    createdAt: record.createdAt.toISOString(),
    status: status.data,
    ...(triage ? { triage } : {}),
    ...(parseErrorCode(record.errorCode) ? { errorCode: parseErrorCode(record.errorCode) } : {}),
    retryAvailable: status.data === "FAILED",
  });

  if (!result.success) throw new Error("Stored intake does not match the public contract.");
  return result.data;
}
