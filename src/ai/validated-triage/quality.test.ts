import { describe, expect, it } from "vitest";
import { triageFixture } from "../../contracts/fixtures";
import { validateTriageQuality } from "./quality";

const valid = triageFixture;

describe("validateTriageQuality", () => {
  it("returns contract-normalized triage", () => {
    expect(validateTriageQuality({
      ...valid,
      tags: [" Portal ", " RETAIL ", " Discovery "],
      risks: [" Confirm the identity provider. "],
    })).toEqual({
      ...valid,
      tags: ["Portal", "RETAIL", "Discovery"],
      risks: ["Confirm the identity provider."],
    });
  });

  it("rejects duplicate tags after case and whitespace normalization", () => {
    expect(() => validateTriageQuality({
      ...valid,
      tags: ["Portal", " portal ", "Discovery"],
    })).toThrow();
  });

  it.each([
    "Only one sentence.",
    "First. Second. Third. Fourth.",
  ])("rejects summaries outside the 2–3 sentence range: %s", (summary) => {
    expect(() => validateTriageQuality({ ...valid, summary })).toThrow();
  });

  it("rejects empty risks and overlong output", () => {
    expect(() => validateTriageQuality({ ...valid, risks: ["   "] })).toThrow();
    expect(() => validateTriageQuality({ ...valid, summary: `${"x".repeat(2_001)}. Next.` })).toThrow();
    expect(() => validateTriageQuality({ ...valid, risks: ["x".repeat(501)] })).toThrow();
  });

  it("requires two distinct complete follow-up questions and the project brief shape", () => {
    expect(() => validateTriageQuality({ ...valid, followUpQuestions: ["Only one question?"] })).toThrow();
    expect(() => validateTriageQuality({ ...valid, followUpQuestions: ["Repeat this?", "repeat this?"] })).toThrow();
    expect(() => validateTriageQuality({ ...valid, projectBrief: { objective: "Goal" } })).toThrow();
  });
});
