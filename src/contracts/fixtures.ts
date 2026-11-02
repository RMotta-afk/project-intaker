import type { PublicIntake } from "./intake";

const original = {
  id: "demo-intake",
  title: "Customer portal refresh",
  description: "Refresh the customer portal and clarify integration needs.",
  budget: "$20,000–$30,000",
  timeline: "Three months",
  industry: "Retail",
  createdAt: "2026-11-02T12:00:00.000Z",
};

export const intakeFixtures = {
  pending: { ...original, status: "PENDING" },
  processing: { ...original, status: "PROCESSING" },
  completed: {
    ...original,
    status: "COMPLETED",
    triage: {
      summary: "The client wants a refreshed customer portal. Integration details need discovery.",
      tags: ["Portal", "Retail", "Redesign"],
      risks: ["Confirm identity and payment integrations."],
    },
  },
  failed: { ...original, status: "FAILED", errorCode: "PROVIDER_UNAVAILABLE" },
} satisfies Record<string, PublicIntake>;
