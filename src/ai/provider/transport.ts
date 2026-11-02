import type { TriageFailureCode } from "../../contracts/intake";
import { buildTriageRequest } from "./request";
import type { IntakeInput } from "../../contracts/intake";

export const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
export const PROVIDER_TIMEOUT_MS = 15_000;
const MAX_RESPONSE_CHARS = 16_000;
const MAX_DIAGNOSTIC_CHARS = 240;

export type ProviderFailureCode = Extract<
  TriageFailureCode,
  "PROVIDER_UNAVAILABLE" | "PROVIDER_AUTH" | "PROVIDER_RATE_LIMIT" | "PROVIDER_TIMEOUT" | "PROVIDER_ERROR"
>;

export class ProviderTransportError extends Error {
  readonly code: ProviderFailureCode;
  readonly retryable: boolean;
  readonly diagnostic?: string;

  constructor(code: ProviderFailureCode, retryable: boolean, diagnostic?: string) {
    super(code);
    this.name = "ProviderTransportError";
    this.code = code;
    this.retryable = retryable;
    this.diagnostic = diagnostic;
  }
}

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: unknown } }>;
  error?: { message?: unknown };
};

type FetchLike = typeof fetch;

export type OpenRouterConfig = {
  apiKey?: string;
  model?: string;
  fetchImpl?: FetchLike;
};

function safeDiagnostic(value: unknown, apiKey?: string): string | undefined {
  if (typeof value !== "string") return undefined;
  const safe = value
    .replace(/[\u0000-\u001f\u007f]/gu, " ")
    .replace(/\s+/gu, " ")
    .replace(/Bearer\s+\S+/giu, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/gu, "[redacted]")
    .replace(/key=[^\s&]+/giu, "key=[redacted]")
    .replace(/https?:\/\/\S+/giu, "[url]");
  const redacted = apiKey ? safe.split(apiKey).join("[redacted]") : safe;
  return redacted.slice(0, MAX_DIAGNOSTIC_CHARS) || undefined;
}

function getErrorMessage(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body) as ChatCompletionResponse;
    return typeof parsed.error?.message === "string" ? parsed.error.message : undefined;
  } catch {
    return undefined;
  }
}

async function readBody(response: Response): Promise<string> {
  const body = await response.text();
  return body.slice(0, MAX_RESPONSE_CHARS);
}

/** Makes exactly one bounded OpenRouter call. Retries belong to the durable worker. */
export async function requestOpenRouterCompletion(
  intake: IntakeInput,
  config: OpenRouterConfig = {},
): Promise<string> {
  if (typeof window !== "undefined") {
    throw new Error("OpenRouter transport is server-only.");
  }

  const apiKey = (config.apiKey ?? process.env.OPENROUTER_API_KEY)?.trim();
  if (!apiKey) throw new ProviderTransportError("PROVIDER_UNAVAILABLE", false);

  const model = config.model ?? process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const response = await (config.fetchImpl ?? fetch)(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
        "X-Title": "Project Intaker",
      },
      body: JSON.stringify(buildTriageRequest(intake, model)),
      signal: controller.signal,
    });

    const body = await readBody(response);
    if (!response.ok) {
      const diagnostic = safeDiagnostic(getErrorMessage(body), apiKey);
      if (response.status === 401 || response.status === 403) {
        throw new ProviderTransportError("PROVIDER_AUTH", false, diagnostic);
      }
      if (response.status === 429) {
        throw new ProviderTransportError("PROVIDER_RATE_LIMIT", true, diagnostic);
      }
      if ([500, 502, 503, 504].includes(response.status)) {
        throw new ProviderTransportError("PROVIDER_ERROR", true, diagnostic);
      }
      throw new ProviderTransportError("PROVIDER_ERROR", false, diagnostic);
    }

    let parsed: ChatCompletionResponse;
    try {
      parsed = JSON.parse(body) as ChatCompletionResponse;
    } catch {
      throw new ProviderTransportError("PROVIDER_ERROR", false, "Malformed provider response.");
    }
    const content = parsed.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.length === 0) {
      throw new ProviderTransportError("PROVIDER_ERROR", false, "Provider response omitted message content.");
    }
    if (content.length > MAX_RESPONSE_CHARS) {
      throw new ProviderTransportError("PROVIDER_ERROR", false, "Provider response exceeded the output limit.");
    }
    return content;
  } catch (error) {
    if (error instanceof ProviderTransportError) throw error;
    if (controller.signal.aborted || (error instanceof Error && error.name === "AbortError")) {
      throw new ProviderTransportError("PROVIDER_TIMEOUT", true);
    }
    // Network failures may recover on a later worker attempt; never expose the raw exception.
    throw new ProviderTransportError("PROVIDER_UNAVAILABLE", true);
  } finally {
    clearTimeout(timer);
  }
}
