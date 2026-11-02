import { describe, expect, it } from "vitest";
import type { TriageInput } from "../../contracts/intake";
import { buildTriageRequest, TRIAGE_MAX_OUTPUT_TOKENS, TRIAGE_PROMPT_VERSION, TRIAGE_TASKS } from "./request";

const intake: TriageInput = {
  title: "Portal refresh",
  description: "Refresh the customer portal.",
  budget: "$20,000",
  timeline: "Three months",
  industry: "Retail",
  clarificationAnswers: [{ question: "Which workflow?", answer: "Order history." }],
};

describe("OpenRouter request builder", () => {
  it("builds three task-specific requests with the same cacheable input prefix and session", () => {
    expect(TRIAGE_PROMPT_VERSION).toBe("triage-v5");
    expect(TRIAGE_TASKS).toEqual(["summary", "tags", "risks"]);
    const requests = TRIAGE_TASKS.map((task) => buildTriageRequest(intake, "openai/gpt-4o-mini", task));
    expect(new Set(requests.map((request) => request.session_id)).size).toBe(1);
    expect(requests.every((request) => request.messages[0].content === requests[0].messages[0].content)).toBe(true);
    expect(requests.every((request) => request.messages[1].content === requests[0].messages[1].content)).toBe(true);
    expect(requests.every((request) => request.messages[1].content.includes('"answer":"Order history."'))).toBe(true);
    expect(requests.map((request) => request.messages[2].content)).toEqual(expect.arrayContaining([
      expect.stringContaining("2–3 sentence summary"),
      expect.stringContaining("exactly three distinct"),
      expect.stringContaining("1–8 concrete risks"),
    ]));
    expect(requests[0].max_tokens).toBe(TRIAGE_MAX_OUTPUT_TOKENS);
  });

  it("supplies invalid output as untrusted data for one repair", () => {
    const request = buildTriageRequest(intake, "openai/gpt-4o-mini", "risks", '{"risks":[{"text":"Budget"}]}');
    expect(request.messages).toHaveLength(4);
    expect(request.messages[3].content).toContain('"risks":[{"text":"Budget"}]');
    expect(request.messages[0].content).toContain("Every array item must be a plain string");
  });
});
