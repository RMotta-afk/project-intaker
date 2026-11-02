import type { IntakeInput, Triage } from "../../contracts/intake";
import { validateTriageResponse } from "../validated-triage";
import { requestOpenRouterCompletion, type OpenRouterConfig } from "./transport";

/** Generate validated triage through one provider attempt. Durable retry policy belongs to the worker. */
export async function generateTriage(
  intake: IntakeInput,
  config: OpenRouterConfig = {},
): Promise<Triage> {
  const content = await requestOpenRouterCompletion(intake, config);
  return validateTriageResponse(content);
}
