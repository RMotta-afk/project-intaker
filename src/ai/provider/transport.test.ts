import { afterEach, describe, expect, it, vi } from "vitest";
import type { IntakeInput } from "../../contracts/intake";
import {
  OPENROUTER_ENDPOINT,
  ProviderTransportError,
  PROVIDER_TIMEOUT_MS,
  requestOpenRouterCompletion,
} from "./transport";

const intake: IntakeInput = {
  title: "Portal refresh",
  description: "Refresh the customer portal.",
  budget: "$20,000",
  timeline: "Three months",
  industry: "Retail",
};

afterEach(() => vi.useRealTimers());

function response(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("OpenRouter transport", () => {
  it("fails terminally when credentials are missing without making a request", async () => {
    const fetchImpl = vi.fn();
    await expect(requestOpenRouterCompletion(intake, "summary", { apiKey: "", fetchImpl }))
      .rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE", retryable: false });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects malformed credentials and model configuration before making a request", async () => {
    const fetchImpl = vi.fn();
    await expect(requestOpenRouterCompletion(intake, "summary", { apiKey: "bad key", fetchImpl }))
      .rejects.toMatchObject({ code: "PROVIDER_AUTH", retryable: false });
    await expect(requestOpenRouterCompletion(intake, "summary", { apiKey: "secret-key", model: "model name with spaces", fetchImpl }))
      .rejects.toMatchObject({ code: "PROVIDER_ERROR", retryable: false });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("makes one bounded authenticated request and returns message content", async () => {
    const calls: Array<{ url: RequestInfo | URL; init?: RequestInit }> = [];
    const fetchImpl: typeof fetch = async (url, init) => {
      calls.push({ url, init });
      return response(200, {
        choices: [{ message: { content: '{"summary":"First sentence. Second sentence.","tags":[],"risks":[]}' } }],
      });
    };

    await expect(requestOpenRouterCompletion(intake, "summary", { apiKey: "secret-key", fetchImpl }))
      .resolves.toContain('"summary"');
    expect(calls).toHaveLength(1);
    const { url, init } = calls[0];
    expect(url).toBe(OPENROUTER_ENDPOINT);
    expect(init?.headers).toMatchObject({ Authorization: "Bearer secret-key" });
    expect(JSON.parse(String(init?.body))).toMatchObject({ max_tokens: 800, model: "openai/gpt-4o-mini" });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it.each([
    [401, "PROVIDER_AUTH", false],
    [403, "PROVIDER_AUTH", false],
    [429, "PROVIDER_RATE_LIMIT", true],
    [500, "PROVIDER_ERROR", true],
    [502, "PROVIDER_ERROR", true],
    [503, "PROVIDER_ERROR", true],
    [504, "PROVIDER_ERROR", true],
    [400, "PROVIDER_ERROR", false],
  ] as const)("classifies HTTP %i", async (status, code, retryable) => {
    const fetchImpl = vi.fn(async () => response(status, { error: { message: "bad request https://provider.test/?key=leak" } }));
    let caught: unknown;
    try {
      await requestOpenRouterCompletion(intake, "summary", { apiKey: "secret-key", fetchImpl });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ProviderTransportError);
    expect(caught).toMatchObject({ code, retryable });
    expect((caught as ProviderTransportError).diagnostic).not.toContain("https://");
    expect((caught as ProviderTransportError).diagnostic).not.toContain("leak");
    expect((caught as ProviderTransportError).diagnostic).not.toContain("secret-key");
  });

  it("classifies a request aborted by the finite timeout as transient", async () => {
    vi.useFakeTimers();
    const fetchImpl: typeof fetch = vi.fn((_input, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
    }));
    const pending = requestOpenRouterCompletion(intake, "summary", { apiKey: "secret-key", fetchImpl });
    const assertion = expect(pending).rejects.toMatchObject({ code: "PROVIDER_TIMEOUT", retryable: true });
    await vi.advanceTimersByTimeAsync(PROVIDER_TIMEOUT_MS);
    await assertion;
  });

  it("classifies network errors as transient and hides the thrown message", async () => {
    const fetchImpl = vi.fn(async () => { throw new Error("secret-key https://private.example"); });
    await expect(requestOpenRouterCompletion(intake, "summary", { apiKey: "secret-key", fetchImpl }))
      .rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE", retryable: true, message: "PROVIDER_UNAVAILABLE" });
  });

  it("rejects malformed or oversized provider payloads", async () => {
    const malformedFetch = vi.fn(async () => new Response("not json", { status: 200 }));
    await expect(requestOpenRouterCompletion(intake, "summary", { apiKey: "secret-key", fetchImpl: malformedFetch }))
      .rejects.toMatchObject({ code: "PROVIDER_ERROR", retryable: false });

    const oversizedFetch = vi.fn(async () => response(200, {
      choices: [{ message: { content: "x".repeat(16_001) } }],
    }));
    await expect(requestOpenRouterCompletion(intake, "summary", { apiKey: "secret-key", fetchImpl: oversizedFetch }))
      .rejects.toMatchObject({ code: "PROVIDER_ERROR", retryable: false });

    const hugeEnvelopeFetch = vi.fn(async () => new Response(`{"choices":[],"unused":"${"x".repeat(65_000)}"}`, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    await expect(requestOpenRouterCompletion(intake, "summary", { apiKey: "secret-key", fetchImpl: hugeEnvelopeFetch }))
      .rejects.toMatchObject({ code: "PROVIDER_ERROR", retryable: false });
  });

  it.each([
    { choices: "not-an-array" },
    { choices: [{ message: { content: 42 } }] },
    { choices: [{ message: {} }] },
  ])("rejects a successful HTTP response with an invalid OpenRouter envelope: %j", async (body) => {
    const fetchImpl = vi.fn(async () => response(200, body));
    await expect(requestOpenRouterCompletion(intake, "summary", { apiKey: "secret-key", fetchImpl }))
      .rejects.toMatchObject({
        code: "PROVIDER_ERROR",
        retryable: false,
        message: "PROVIDER_ERROR",
      });
  });
});
