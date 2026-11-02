import type { PublicIntake, Triage } from "./intake";

export const triageFixture: Triage = {
  summary: "The client wants a refreshed customer portal with clearer account workflows. Integration details need confirmation before delivery planning.",
  projectBrief: {
    objective: "Refresh the customer portal and make account workflows easier to use.",
    primaryUsers: "Existing retail customers.",
    keyRequirements: ["Provide responsive account pages.", "Show customer order history."],
    constraints: ["Keep the existing commerce platform."],
    successCriteria: ["Customers can find account and order information more easily."],
  },
  tags: ["Portal", "Retail", "Discovery"],
  risks: ["Confirm which commerce platform integrations are required."],
  followUpQuestions: [
    "Which account workflows should be prioritized for launch?",
    "Which commerce platform integrations must the portal support?",
  ],
};

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
  pending: { ...original, status: "PENDING", retryAvailable: false },
  processing: { ...original, status: "PROCESSING", retryAvailable: false },
  completed: {
    ...original,
    status: "COMPLETED",
    retryAvailable: false,
    triage: triageFixture,
  },
  failed: { ...original, status: "FAILED", errorCode: "PROVIDER_UNAVAILABLE", retryAvailable: true },
} satisfies Record<string, PublicIntake>;
