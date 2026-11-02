import { TriageSchema, type Triage } from "../../contracts/intake";

/**
 * Check the shared triage contract and return its normalized values. The
 * sentence check is intentionally approximate: punctuation followed by
 * whitespace/end counts as a sentence boundary, so abbreviations and decimal
 * numbers can be counted imperfectly.
 */
export function validateTriageQuality(value: unknown): Triage {
  const result = TriageSchema.safeParse(value);
  if (!result.success) {
    const details = result.error.issues.map((issue) => issue.message).join(" ");
    throw new Error(`Triage failed quality validation: ${details}`);
  }

  return result.data;
}
