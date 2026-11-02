import { RisksPartSchema, SummaryPartSchema, TagsPartSchema, TriageSchema, type TriageInput, type Triage } from "../../contracts/intake";
import { InvalidTriageOutputError } from "../validated-triage";
import type { z } from "zod";
import type { TriageTask } from "./request";
import { requestOpenRouterCompletion, type OpenRouterConfig } from "./transport";

function parsePart<T>(content: string, schema: z.ZodType<T>): T {
  try {
    const parsed: unknown = JSON.parse(content);
    const result = schema.safeParse(parsed);
    if (result.success) return result.data;
  } catch { /* Invalid provider data is handled by the same bounded repair. */ }
  throw new InvalidTriageOutputError();
}

async function generatePart<T>(intake: TriageInput, task: TriageTask, schema: z.ZodType<T>, config: OpenRouterConfig): Promise<T> {
  const content = await requestOpenRouterCompletion(intake, task, config);
  try {
    return parsePart(content, schema);
  } catch (error) {
    if (!(error instanceof InvalidTriageOutputError)) throw error;
    const repaired = await requestOpenRouterCompletion(intake, task, config, content);
    return parsePart(repaired, schema);
  }
}

/** Run three independent requests concurrently, then validate their combined result. */
export async function generateTriage(
  intake: TriageInput,
  config: OpenRouterConfig = {},
): Promise<Triage> {
  const [summary, tags, risks] = await Promise.all([
    generatePart(intake, "summary", SummaryPartSchema, config),
    generatePart(intake, "tags", TagsPartSchema, config),
    generatePart(intake, "risks", RisksPartSchema, config),
  ]);
  return TriageSchema.parse({ ...summary, ...tags, ...risks });
}
