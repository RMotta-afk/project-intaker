import { describe, expect, it } from "vitest";
import { triageFixture } from "./fixtures";
import { IndustrySuggestionsSchema, IntakeInputSchema, IntakeListResponseSchema, IntakeSubmissionSchema, PublicIntakeSchema, TriageSchema } from "./intake";

const intake = {
  title: "Website redesign",
  description: "A new customer website is needed.",
  budget: "$20,000–$30,000",
  timeline: "Three months",
  industry: "Retail",
};

describe("shared intake contracts", () => {
  it("accepts all five required intake fields", () => {
    expect(IntakeInputSchema.parse(intake)).toEqual(intake);
  });

  it("rejects missing fields and unexpected keys", () => {
    expect(IntakeInputSchema.safeParse({ title: "Only title" }).success).toBe(false);
    expect(IntakeInputSchema.safeParse({ ...intake, admin: true }).success).toBe(false);
  });

  it("validates structured budget, date, and industry values", () => {
    const submission = {
      title: "Website redesign",
      description: "A new customer website is needed.",
      industryTags: ["Retail", "Fabric"],
      budgetRange: { currency: "USD", minimum: "20,000", maximum: "30,000" },
      dateRange: { start: "2026-02-28", end: "2026-03-01" },
    };
    expect(IntakeSubmissionSchema.safeParse(submission).success).toBe(true);
    expect(IntakeSubmissionSchema.safeParse({ ...submission, budgetRange: { currency: "USD", minimum: "0.29", maximum: "0.30" } }).success).toBe(true);
    expect(IntakeSubmissionSchema.safeParse({ ...submission, budgetRange: { ...submission.budgetRange, maximum: "19,999" } }).success).toBe(false);
    expect(IntakeSubmissionSchema.safeParse({ ...submission, dateRange: { start: "2026-02-29", end: "2026-03-01" } }).success).toBe(false);
    expect(IntakeSubmissionSchema.safeParse({ ...submission, industryTags: ["Retail", " retail "] }).success).toBe(false);
    expect(IntakeSubmissionSchema.safeParse({ ...submission, budgetRange: { ...submission.budgetRange, currency: "ZZZ" } }).success).toBe(false);
  });

  it("validates public API payloads and rejects malformed nested values", () => {
    const publicIntake = {
      id: "intake-123",
      ...intake,
      createdAt: "2026-11-02T12:00:00.000Z",
      status: "COMPLETED",
      triage: triageFixture,
      retryAvailable: false,
    };
    expect(PublicIntakeSchema.safeParse(publicIntake).success).toBe(true);
    expect(PublicIntakeSchema.safeParse({ ...publicIntake, errorCode: "private provider error" }).success).toBe(false);
    expect(IntakeListResponseSchema.safeParse({ intakes: [{ id: "id", title: "Title", industry: "Retail", createdAt: "bad", status: "PENDING" }] }).success).toBe(false);
    expect(IndustrySuggestionsSchema.safeParse({ tags: ["Retail", " retail "] }).success).toBe(false);
  });

  it("accepts 2–3 sentences, three distinct tags and a risk checklist", () => {
    expect(TriageSchema.safeParse(triageFixture).success).toBe(true);
  });

  it("rejects duplicate tags and one-sentence summaries", () => {
    expect(TriageSchema.safeParse({ ...triageFixture, tags: ["Retail", "retail", "Web"] }).success).toBe(false);
    expect(TriageSchema.safeParse({ ...triageFixture, summary: "Only one sentence." }).success).toBe(false);
    expect(TriageSchema.safeParse({ ...triageFixture, projectBrief: undefined }).success).toBe(false);
    expect(TriageSchema.safeParse({ ...triageFixture, followUpQuestions: ["Question one?"] }).success).toBe(false);
  });
});
