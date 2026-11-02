import { describe, expect, it, vi } from "vitest";
import { triageFixture } from "../../contracts/fixtures";
import type { IntakeInput } from "../../contracts/intake";
import { InvalidTriageOutputError } from "../validated-triage";
import { generateTriage } from "./generate";

const intake: IntakeInput = {
  title: "Customer portal refresh", description: "Refresh customer pages and clarify integrations.",
  budget: "$20,000–$30,000", timeline: "Three months", industry: "Retail",
};

function providerResponse(content: string) {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });
}

describe("generateTriage adapter", () => {
  it("starts exactly three independent requests and combines validated parts", async () => {
    const pending: Array<(response: Response) => void> = [];
    const fetchImpl = vi.fn((_url: RequestInfo | URL, _init?: RequestInit) => {
      void _url;
      void _init;
      return new Promise<Response>((resolve) => pending.push(resolve));
    });
    const generation = generateTriage(intake, { apiKey: "test-key", fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    const requests = fetchImpl.mock.calls.map(([, init]) => JSON.parse(String(init?.body)));
    expect(requests.map((request) => request.messages[2].content)).toEqual(expect.arrayContaining([
      expect.stringContaining("summary"), expect.stringContaining("tags"), expect.stringContaining("risks"),
    ]));
    pending[0](providerResponse(JSON.stringify({ summary: triageFixture.summary })));
    pending[1](providerResponse(JSON.stringify({ tags: triageFixture.tags })));
    pending[2](providerResponse(JSON.stringify({ risks: triageFixture.risks, followUpQuestions: triageFixture.followUpQuestions })));
    await expect(generation).resolves.toEqual(triageFixture);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("repairs only the malformed part once", async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body));
      const task = request.messages[2].content as string;
      if (task.includes("summary")) return providerResponse(JSON.stringify({ summary: triageFixture.summary }));
      if (task.includes("tags")) return providerResponse(JSON.stringify({ tags: triageFixture.tags }));
      if (request.messages.length === 3) return providerResponse(JSON.stringify({ risks: [{ text: "Wrong type" }], followUpQuestions: triageFixture.followUpQuestions }));
      return providerResponse(JSON.stringify({ risks: triageFixture.risks, followUpQuestions: triageFixture.followUpQuestions }));
    });
    await expect(generateTriage(intake, { apiKey: "test-key", fetchImpl })).resolves.toEqual(triageFixture);
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });

  it("rejects a still-invalid part without storing partial output", async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const task = JSON.parse(String(init?.body)).messages[2].content as string;
      if (task.includes("summary")) return providerResponse(JSON.stringify({ summary: "One sentence." }));
      if (task.includes("tags")) return providerResponse(JSON.stringify({ tags: triageFixture.tags }));
      return providerResponse(JSON.stringify({ risks: triageFixture.risks, followUpQuestions: triageFixture.followUpQuestions }));
    });
    await expect(generateTriage(intake, { apiKey: "test-key", fetchImpl })).rejects.toBeInstanceOf(InvalidTriageOutputError);
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });
});
