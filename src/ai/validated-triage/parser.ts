import { TriageSchema } from "../../contracts/intake";

const triageFields = new Set(Object.keys(TriageSchema.shape));

/**
 * Parse the provider's content as one JSON object. Markdown fences and prose
 * wrappers are deliberately rejected so malformed output is never repaired
 * into something that looks valid.
 */
export function parseTriageJson(content: string): unknown {
  if (content.trim().length === 0) {
    throw new Error("Provider returned empty triage content.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Provider returned malformed triage JSON.");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Triage JSON must be an object.");
  }

  const keys = Object.keys(parsed);
  if (keys.length !== triageFields.size || keys.some((key) => !triageFields.has(key))) {
    throw new Error("Triage JSON must contain exactly the shared triage fields.");
  }

  return parsed;
}
