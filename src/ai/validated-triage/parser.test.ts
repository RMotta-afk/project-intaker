import { describe, expect, it } from "vitest";
import { parseTriageJson } from "./parser";

const valid = {
  summary: "The client needs a new project portal. Integration requirements need discovery.",
  tags: ["Portal", "Retail", "Discovery"],
  risks: ["Confirm the identity provider."],
};

describe("parseTriageJson", () => {
  it("parses a strict JSON object with the shared fields", () => {
    expect(parseTriageJson(JSON.stringify(valid))).toEqual(valid);
  });

  it.each(["", "   ", "{", "```json\n{}\n```", "Here is the JSON: {}"])(
    "rejects empty or malformed content: %j",
    (content) => {
      expect(() => parseTriageJson(content)).toThrow();
    },
  );

  it.each([
    JSON.stringify([]),
    JSON.stringify({ ...valid, extra: "unexpected" }),
    JSON.stringify({ summary: valid.summary, tags: valid.tags }),
  ])("rejects wrong shapes and missing or extra fields: %s", (content) => {
    expect(() => parseTriageJson(content)).toThrow();
  });
});
