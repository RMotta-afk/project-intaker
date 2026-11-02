import { describe, expect, it } from "vitest";
import { triageFixture } from "../../contracts/fixtures";
import { InvalidTriageOutputError, validateTriageResponse } from "./index";

const validResponse = JSON.stringify(triageFixture);

describe("validateTriageResponse", () => {
  it("returns validated output with only contract normalization", () => {
    expect(validateTriageResponse(validResponse)).toEqual(JSON.parse(validResponse));
    expect(validateTriageResponse(validResponse.replace('"Portal"', '" Portal "')).tags[0]).toBe("Portal");
  });

  it.each([
    "",
    "{ malformed",
    JSON.stringify({ ...triageFixture, summary: "Only one sentence." }),
    JSON.stringify({ ...triageFixture, summary: "Two. Sentences.", tags: ["A", "a", "C"] }),
    JSON.stringify({ ...triageFixture, summary: "Two. Sentences.", risks: [] }),
    JSON.stringify({ ...triageFixture, summary: "Two. Sentences.", extra: true }),
  ])("rejects invalid output as a typed safe failure", (content) => {
    expect(() => validateTriageResponse(content)).toThrow(InvalidTriageOutputError);
    try {
      validateTriageResponse(content);
    } catch (error) {
      expect(error).toMatchObject({ code: "INVALID_OUTPUT", retryable: false, message: "INVALID_OUTPUT" });
    }
  });
});
