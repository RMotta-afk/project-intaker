import { describe, expect, it } from "vitest";
import { InvalidTriageOutputError, validateTriageResponse } from "./index";

const validResponse = JSON.stringify({
  summary: "The client wants a portal refresh. Integration details need discovery.",
  tags: ["Portal", "Retail", "Discovery"],
  risks: ["Confirm required account integrations."],
});

describe("validateTriageResponse", () => {
  it("returns validated output with only contract normalization", () => {
    expect(validateTriageResponse(validResponse)).toEqual(JSON.parse(validResponse));
    expect(validateTriageResponse(validResponse.replace('"Portal"', '" Portal "')).tags[0]).toBe("Portal");
  });

  it.each([
    "",
    "{ malformed",
    JSON.stringify({ summary: "Only one sentence.", tags: ["A", "B", "C"], risks: ["Risk."] }),
    JSON.stringify({ summary: "Two. Sentences.", tags: ["A", "a", "C"], risks: ["Risk."] }),
    JSON.stringify({ summary: "Two. Sentences.", tags: ["A", "B", "C"], risks: [] }),
    JSON.stringify({ summary: "Two. Sentences.", tags: ["A", "B", "C"], risks: ["Risk."], extra: true }),
  ])("rejects invalid output as a typed safe failure", (content) => {
    expect(() => validateTriageResponse(content)).toThrow(InvalidTriageOutputError);
    try {
      validateTriageResponse(content);
    } catch (error) {
      expect(error).toMatchObject({ code: "INVALID_OUTPUT", retryable: false, message: "INVALID_OUTPUT" });
    }
  });
});
