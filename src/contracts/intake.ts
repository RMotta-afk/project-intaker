import { z } from "zod";

export const IntakeInputSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(10_000),
  budget: z.string().trim().min(1).max(120),
  timeline: z.string().trim().min(1).max(120),
  industry: z.string().trim().min(1).max(120),
}).strict();

export const INTAKE_CURRENCIES = ["USD", "EUR", "GBP", "BRL", "CAD", "AUD", "JPY", "CHF", "INR", "MXN", "SGD"] as const;
export const IntakeCurrencySchema = z.enum(INTAKE_CURRENCIES);

const BudgetAmountSchema = z.string().trim()
  .regex(/^(?:0|[1-9]\d{0,2}(?:,\d{3})*|[1-9]\d*)(?:\.\d{1,2})?$/u, "Enter a valid amount with up to two decimal places.")
  .refine((amount) => Number.isSafeInteger(toMinorUnits(amount)), "Budget amount is too large.");

function toMinorUnits(amount: string): number {
  const [whole = "0", fraction = ""] = amount.replaceAll(",", "").split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

const CalendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, "Choose a valid calendar date.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Choose a valid calendar date.");

const IndustryTagsSchema = z.array(z.string().trim().min(1).max(60))
  .min(1, "Add at least one industry.")
  .max(5, "Add no more than five industries.")
  .refine((tags) => new Set(tags.map((tag) => tag.normalize("NFKC").toLocaleLowerCase("en-US"))).size === tags.length, "Industry tags must be distinct.")
  .refine((tags) => tags.join(", ").length <= 120, "Industry tags must fit within 120 characters in total.");

export const IndustryTagInputSchema = z.object({
  name: z.string().trim().min(1, "Enter an industry tag.").max(60, "Industry tags must be 60 characters or fewer."),
}).strict();

/** Structured request sent by the form. The server converts ranges into display strings for storage. */
export const IntakeSubmissionSchema = z.object({
  title: IntakeInputSchema.shape.title,
  description: IntakeInputSchema.shape.description,
  industryTags: IndustryTagsSchema,
  budgetRange: z.object({
    currency: IntakeCurrencySchema,
    minimum: BudgetAmountSchema,
    maximum: BudgetAmountSchema,
  }).strict().superRefine(({ minimum, maximum }, context) => {
    if (toMinorUnits(maximum) < toMinorUnits(minimum)) {
      context.addIssue({ code: "custom", path: ["maximum"], message: "Maximum budget must be at least the minimum budget." });
    }
  }),
  dateRange: z.object({
    start: CalendarDateSchema,
    end: CalendarDateSchema,
  }).strict().superRefine(({ start, end }, context) => {
    if (end < start) context.addIssue({ code: "custom", path: ["end"], message: "Target completion must be on or after the start date." });
  }),
}).strict();

export const IntakeUpdateSchema = IntakeSubmissionSchema.partial().strict()
  .refine((value) => Object.keys(value).length > 0, "Change at least one project field.");

export const ClarificationAnswerSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(2_000),
}).strict();
export const ClarificationAnswersSchema = z.array(ClarificationAnswerSchema).max(40);
export const AnswerSubmissionSchema = z.object({ answers: z.array(ClarificationAnswerSchema).min(1).max(4) }).strict()
  .refine(({ answers }) => new Set(answers.map(({ question }) => question)).size === answers.length, "Answer each question once.");

export const IntakeStatusSchema = z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]);
export const TriageFailureCodeSchema = z.enum([
  "PROVIDER_UNAVAILABLE",
  "PROVIDER_AUTH",
  "PROVIDER_RATE_LIMIT",
  "PROVIDER_TIMEOUT",
  "PROVIDER_ERROR",
  "INVALID_OUTPUT",
  "ATTEMPTS_EXHAUSTED",
]);

const TriageCoreSchema = z.object({
  summary: z.string().trim().min(1).max(2_000),
  tags: z.array(z.string().trim().min(1).max(48)).length(3),
  risks: z.array(z.string().trim().min(1).max(500)).min(1).max(8),
}).strict();

export const HistoricalProjectBriefSchema = z.object({
  objective: z.string().trim().min(1).max(600).nullable(),
  primaryUsers: z.string().trim().min(1).max(400).nullable(),
  keyRequirements: z.array(z.string().trim().min(1).max(400)).max(8),
  constraints: z.array(z.string().trim().min(1).max(400)).max(6),
  successCriteria: z.array(z.string().trim().min(1).max(400)).max(5),
}).strict();

const FollowUpQuestionSchema = z.string().trim().min(1).max(300).refine((question) => question.endsWith("?"), {
  message: "Each follow-up item must be a complete question.",
});

function hasDistinctTags(tags: string[]) {
  return new Set(tags.map((tag) => tag.normalize("NFKC").toLocaleLowerCase("en-US"))).size === 3;
}

function hasDistinctText(items: string[]) {
  return new Set(items.map((item) => item.normalize("NFKC").toLocaleLowerCase("en-US"))).size === items.length;
}

function hasTwoToThreeSentences(summary: string) {
  const sentences = summary.split(/[.!?]+(?:\s|$)/u).filter((sentence) => sentence.trim().length > 0);
  return sentences.length >= 2 && sentences.length <= 3;
}

export const LegacyTriageSchema = TriageCoreSchema
  .refine(({ tags }) => hasDistinctTags(tags), {
    message: "Tags must be distinct.",
    path: ["tags"],
  })
  .refine(({ summary }) => hasTwoToThreeSentences(summary), {
    message: "Summary must contain 2–3 sentences.",
    path: ["summary"],
  });

export const SummaryPartSchema = z.object({ summary: TriageCoreSchema.shape.summary }).strict()
  .refine(({ summary }) => hasTwoToThreeSentences(summary), {
    message: "Summary must contain 2–3 sentences.", path: ["summary"],
  });
export const TagsPartSchema = z.object({ tags: TriageCoreSchema.shape.tags }).strict()
  .refine(({ tags }) => hasDistinctTags(tags), {
    message: "Tags must be distinct.", path: ["tags"],
  });
export const RisksPartSchema = z.object({
  risks: TriageCoreSchema.shape.risks,
  followUpQuestions: z.array(FollowUpQuestionSchema).min(2).max(4),
}).strict()
  .refine(({ followUpQuestions }) => hasDistinctText(followUpQuestions), {
    message: "Follow-up questions must be distinct.", path: ["followUpQuestions"],
  })
  .refine(({ risks }) => hasDistinctText(risks), {
    message: "Risk items must be distinct.", path: ["risks"],
  });

export const TriageSchema = TriageCoreSchema.extend({
  followUpQuestions: RisksPartSchema.shape.followUpQuestions,
}).strict()
  .refine(({ tags }) => hasDistinctTags(tags), {
    message: "Tags must be distinct.",
    path: ["tags"],
  })
  .refine(({ summary }) => hasTwoToThreeSentences(summary), {
    message: "Summary must contain 2–3 sentences.",
    path: ["summary"],
  })
  .refine(({ followUpQuestions }) => hasDistinctText(followUpQuestions), {
    message: "Follow-up questions must be distinct.",
    path: ["followUpQuestions"],
  })
  .refine(({ risks }) => hasDistinctText(risks), {
    message: "Risk items must be distinct.",
    path: ["risks"],
  });

export const PublicIntakeSchema = IntakeInputSchema.extend({
  id: z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/u),
  createdAt: z.string().datetime(),
  status: IntakeStatusSchema,
  triage: TriageSchema.optional(),
  previousTriage: TriageSchema.optional(),
  clarificationAnswers: ClarificationAnswersSchema.optional(),
  errorCode: TriageFailureCodeSchema.optional(),
  retryAvailable: z.boolean(),
}).strict().superRefine((intake, context) => {
  if (intake.retryAvailable !== (intake.status === "FAILED" || intake.status === "COMPLETED")) {
    context.addIssue({ code: "custom", path: ["retryAvailable"], message: "Retry availability must match the intake status." });
  }
  if (intake.triage && intake.status !== "COMPLETED") {
    context.addIssue({ code: "custom", path: ["triage"], message: "Triage is only available for completed intakes." });
  }
});

export const IntakeListItemSchema = z.object({
  id: z.string().min(1).max(128),
  title: IntakeInputSchema.shape.title,
  industry: IntakeInputSchema.shape.industry,
  createdAt: z.string().datetime(),
  status: IntakeStatusSchema,
  errorCode: TriageFailureCodeSchema.optional(),
  tags: z.array(z.string().trim().min(1).max(48)).max(3).optional(),
}).strict();

export const IntakeListResponseSchema = z.object({ intakes: z.array(IntakeListItemSchema) }).strict();
export const IndustrySuggestionsSchema = z.object({ tags: z.array(z.string().trim().min(1).max(60)).max(2_000) }).strict()
  .refine(({ tags }) => new Set(tags.map((tag) => tag.normalize("NFKC").toLocaleLowerCase("en-US"))).size === tags.length);
export const IndustryTagResponseSchema = z.object({ name: z.string().trim().min(1).max(60) }).strict();
export const RetryIntakeResponseSchema = z.object({
  id: z.string().min(1).max(128),
  status: z.literal("PENDING"),
  availableAt: z.string().datetime(),
  retryAvailable: z.literal(false),
}).strict();

export type IntakeInput = z.infer<typeof IntakeInputSchema>;
export type IntakeSubmission = z.infer<typeof IntakeSubmissionSchema>;
export type IntakeUpdate = z.infer<typeof IntakeUpdateSchema>;
export type ClarificationAnswer = z.infer<typeof ClarificationAnswerSchema>;
export type TriageInput = IntakeInput & { clarificationAnswers?: ClarificationAnswer[] };
export type IntakeListItem = z.infer<typeof IntakeListItemSchema>;
export type IntakeStatus = z.infer<typeof IntakeStatusSchema>;
export type Triage = z.infer<typeof TriageSchema>;
export type SummaryPart = z.infer<typeof SummaryPartSchema>;
export type TagsPart = z.infer<typeof TagsPartSchema>;
export type RisksPart = z.infer<typeof RisksPartSchema>;
export type PublicIntake = z.infer<typeof PublicIntakeSchema>;
export type TriageFailureCode = z.infer<typeof TriageFailureCodeSchema>;

export type GenerateTriage = (intake: TriageInput) => Promise<Triage>;
