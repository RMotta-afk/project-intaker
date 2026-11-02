import type { GenerateTriage } from "../src/contracts/intake";

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export const generateTriage: GenerateTriage = async (intake) => {
  const waitMs = Number(process.env.FAKE_WORKER_DELAY_MS ?? 0);
  if (Number.isFinite(waitMs) && waitMs > 0) await delay(waitMs);

  if (process.env.FAKE_WORKER_FAILURE === "auth") {
    throw { code: "PROVIDER_AUTH", message: "Fake adapter simulates missing provider credentials." };
  }

  return {
    summary: `${intake.title} describes a project request. Further discovery is needed to confirm delivery details.`,
    tags: ["Project", "Intake", "Discovery"],
    risks: ["Confirm scope and dependencies with the requester."],
  };
};
