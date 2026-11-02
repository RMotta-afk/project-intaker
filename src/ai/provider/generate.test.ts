import { describe, expect, it, vi } from "vitest";
import type { IntakeInput } from "../../contracts/intake";
import { InvalidTriageOutputError } from "../validated-triage";
import { generateTriage } from "./generate";
import { ProviderTransportError } from "./transport";

const intake: IntakeInput = {
  title: "Customer portal refresh",
  description: "Refresh customer pages and clarify integrations.",
  budget: "$20,000–$30,000",
  timeline: "Three months",
  industry: "Retail",
};

function providerResponse(content: string) {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("generateTriage adapter", () => {
  it("returns only validated output from the provider content", async () => {
    const fetchImpl = vi.fn(async () => providerResponse(JSON.stringify({
      summary: "The client wants refreshed customer pages. Integration details need discovery.",
      tags: [" Portal ", "Retail", "Discovery"],
      risks: ["Confirm the required commerce integrations."],
    })));

    await expect(generateTriage(intake, { apiKey: "test-key", fetchImpl })).resolves.toEqual({
      summary: "The client wants refreshed customer pages. Integration details need discovery.",
      tags: ["Portal", "Retail", "Discovery"],
      risks: ["Confirm the required commerce integrations."],
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("maps invalid provider content to a terminal safe failure", async () => {
    const fetchImpl = vi.fn(async () => providerResponse('{"summary":"Invented output"}'));

    const generation = generateTriage(intake, { apiKey: "test-key", fetchImpl });
    await expect(generation).rejects.toBeInstanceOf(InvalidTriageOutputError);
    await expect(generation).rejects.toMatchObject({ code: "INVALID_OUTPUT", retryable: false });
  });

  it("returns a safe terminal failure when provider configuration is missing", async () => {
    await expect(generateTriage(intake, { apiKey: "", fetchImpl: vi.fn() }))
      .rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE", retryable: false });
  });

  it("preserves classified transport failures", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ error: { message: "limited" } }), { status: 429 }));

    const generation = generateTriage(intake, { apiKey: "test-key", fetchImpl });
    await expect(generation).rejects.toBeInstanceOf(ProviderTransportError);
    await expect(generation).rejects.toMatchObject({ code: "PROVIDER_RATE_LIMIT", retryable: true });
  });
});
