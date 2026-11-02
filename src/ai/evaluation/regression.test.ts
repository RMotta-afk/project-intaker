import { describe, expect, it, vi } from "vitest";
import { TriageSchema } from "../../contracts/intake";
import { triageFixture } from "../../contracts/fixtures";
import { triageEvaluationCases } from "./cases";
import { generateTriage } from "../provider/generate";
import { validateTriageResponse } from "../validated-triage";

const validTriage = triageFixture;

function response(status: number, content: string) {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status });
}

describe("triage evaluation regressions", () => {
  it.each(triageEvaluationCases)("passes each typed evaluation intake through the adapter: $id", async ({ intake }) => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void input;
      const task = JSON.parse(String(init?.body)).messages[2].content as string;
      if (task.includes("summary")) return response(200, JSON.stringify({ summary: validTriage.summary }));
      if (task.includes("tags")) return response(200, JSON.stringify({ tags: validTriage.tags }));
      return response(200, JSON.stringify({ risks: validTriage.risks, followUpQuestions: validTriage.followUpQuestions }));
    });

    const result = await generateTriage(intake, { apiKey: "offline-test-key", fetchImpl });

    expect(TriageSchema.parse(result)).toEqual(validTriage);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    const requestBody = JSON.parse(String(fetchImpl.mock.calls[0][1]?.body)) as {
      max_tokens: number;
      messages: Array<{ content: string }>;
    };
    expect(requestBody.max_tokens).toBe(800);
    expect(requestBody.messages[0].content).toContain("Ground every statement");
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
