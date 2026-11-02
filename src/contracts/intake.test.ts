import { describe, expect, it } from "vitest";
import { IntakeInputSchema, TriageSchema } from "./intake";

const intake = {
  title: "Website redesign",
  description: "A new customer website is needed.",
  budget: "$20,000–$30,000",
  timeline: "Three months",
  industry: "Retail",
};

const triage = {
  summary: "The client wants a refreshed customer website. The budget is stated, but platform needs are unclear.",
  tags: ["Website", "Retail", "Redesign"],
  risks: ["Confirm integrations and content ownership."],
};

describe("shared intake contracts", () => {
  it("accepts all five required intake fields", () => {
    expect(IntakeInputSchema.parse(intake)).toEqual(intake);
  });

  it("rejects missing fields and unexpected keys", () => {
    expect(IntakeInputSchema.safeParse({ title: "Only title" }).success).toBe(false);
    expect(IntakeInputSchema.safeParse({ ...intake, admin: true }).success).toBe(false);
  });

  it("accepts 2–3 sentences, three distinct tags and a risk checklist", () => {
    expect(TriageSchema.safeParse(triage).success).toBe(true);
  });

  it("rejects duplicate tags and one-sentence summaries", () => {
    expect(TriageSchema.safeParse({ ...triage, tags: ["Retail", "retail", "Web"] }).success).toBe(false);
    expect(TriageSchema.safeParse({ ...triage, summary: "Only one sentence." }).success).toBe(false);
  });
});
