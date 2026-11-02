import { describe, expect, it, vi } from "vitest";
import { TriageSchema } from "../../contracts/intake";
import { triageEvaluationCases } from "./cases";
import { generateTriage } from "../provider/generate";
import { validateTriageResponse } from "../validated-triage";

const validTriage = {
  summary: "The intake describes a requested project outcome. Open details need review before scope is confirmed.",
  tags: ["Project", "Discovery", "Review"],
  risks: ["Confirm the unresolved details with the requester."],
};

function response(status: number, content: string) {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status });
}

describe("triage evaluation regressions", () => {
  it.each(triageEvaluationCases)("passes each typed evaluation intake through the adapter: $id", async ({ intake }) => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void input;
      void init;
      return response(200, JSON.stringify(validTriage));
    });

    const result = await generateTriage(intake, { apiKey: "offline-test-key", fetchImpl });

    expect(TriageSchema.parse(result)).toEqual(validTriage);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const requestBody = JSON.parse(String(fetchImpl.mock.calls[0][1]?.body)) as {
      messages: Array<{ content: string }>;
    };
    expect(requestBody.messages[1].content).toContain(JSON.stringify(intake));
  });

  it.each([
    ["wrong tag count", JSON.stringify({ ...validTriage, tags: ["Only", "Two"] })],
    ["malformed JSON", "{not-json"],
    ["empty output", ""],
  ])("rejects %s in the validation boundary", (_label, content) => {
    expect(() => validateTriageResponse(content)).toThrow();
  });

  it.each([
    ["rate limit", 429, "PROVIDER_RATE_LIMIT"],
    ["authentication failure", 401, "PROVIDER_AUTH"],
  ] as const)("classifies mocked provider %s", async (_label, status, code) => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ error: { message: "offline fixture" } }), { status }));
    await expect(generateTriage(triageEvaluationCases[0].intake, { apiKey: "offline-test-key", fetchImpl }))
      .rejects.toMatchObject({ code });
  });
});
