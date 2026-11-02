import { describe, expect, it } from "vitest";
import { validateTriageQuality } from "./quality";

const valid = {
  summary: "The client needs a new project portal. Integration requirements need discovery.",
  tags: ["Portal", "Retail", "Discovery"],
  risks: ["Confirm the identity provider."],
};

describe("validateTriageQuality", () => {
  it("returns contract-normalized triage", () => {
    expect(validateTriageQuality({
      ...valid,
      tags: [" Portal ", " RETAIL ", " Discovery "],
      risks: [" Confirm the identity provider. "],
    })).toEqual({
      ...valid,
      tags: ["Portal", "RETAIL", "Discovery"],
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
});
