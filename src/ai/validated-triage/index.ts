import type { Triage } from "../../contracts/intake";
import { parseTriageJson } from "./parser";
import { validateTriageQuality } from "./quality";

/** Safe failure returned when untrusted model content violates the triage contract. */
export class InvalidTriageOutputError extends Error {
  readonly code = "INVALID_OUTPUT" as const;
  readonly retryable = false;

  constructor() {
    super("INVALID_OUTPUT");
    this.name = "InvalidTriageOutputError";
  }
}

/** Parse and validate a provider response without exposing its contents in failures. */
export function validateTriageResponse(content: string): Triage {
  try {
    return validateTriageQuality(parseTriageJson(content));
  } catch {
    throw new InvalidTriageOutputError();
  }
}
