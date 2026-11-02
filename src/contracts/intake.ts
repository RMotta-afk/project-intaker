import { z } from "zod";

export const IntakeInputSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(10_000),
  budget: z.string().trim().min(1).max(120),
  timeline: z.string().trim().min(1).max(120),
  industry: z.string().trim().min(1).max(120),
}).strict();

export const IntakeStatusSchema = z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]);

export const TriageSchema = z.object({
  summary: z.string().trim().min(1).max(2_000),
  tags: z.array(z.string().trim().min(1).max(48)).length(3),
  risks: z.array(z.string().trim().min(1).max(500)).min(1).max(8),
}).strict().refine(({ tags }) => new Set(tags.map((tag) => tag.toLocaleLowerCase())).size === 3, {
  message: "Tags must be distinct.",
  path: ["tags"],
}).refine(({ summary }) => {
  const sentences = summary.split(/[.!?]+(?:\s|$)/u).filter((sentence) => sentence.trim().length > 0);
  return sentences.length >= 2 && sentences.length <= 3;
}, {
  message: "Summary must contain 2–3 sentences.",
  path: ["summary"],
});

export const PublicIntakeSchema = IntakeInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  status: IntakeStatusSchema,
  triage: TriageSchema.optional(),
  errorCode: z.string().min(1).optional(),
});

export const TriageFailureCodeSchema = z.enum([
  "PROVIDER_UNAVAILABLE",
  "PROVIDER_AUTH",
  "PROVIDER_RATE_LIMIT",
  "PROVIDER_TIMEOUT",
  "PROVIDER_ERROR",
  "INVALID_OUTPUT",
  "ATTEMPTS_EXHAUSTED",
]);

export type IntakeInput = z.infer<typeof IntakeInputSchema>;
export type IntakeStatus = z.infer<typeof IntakeStatusSchema>;
export type Triage = z.infer<typeof TriageSchema>;
export type PublicIntake = z.infer<typeof PublicIntakeSchema>;
export type TriageFailureCode = z.infer<typeof TriageFailureCodeSchema>;

export type GenerateTriage = (intake: IntakeInput) => Promise<Triage>;
