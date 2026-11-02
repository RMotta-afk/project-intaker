import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../db", () => ({
  getDb: () => ({ intake: dbMocks }),
}));

import { getIntake, listIntakes } from "./read";

const createdAt = new Date("2026-11-02T12:00:00.000Z");
const triage = {
  summary: "The client needs a refreshed portal. Integration details need discovery.",
  tags: ["Portal", "Retail", "Redesign"],
  risks: ["Confirm identity and payment integrations."],
};

function record(overrides: Record<string, unknown> = {}) {
  return {
    id: "cmvypx38700008ats8z8y8brj",
    title: "Customer portal refresh",
    description: "Refresh the customer portal and clarify integration needs.",
    budget: "$20,000–$30,000",
    timeline: "Three months",
    industry: "Retail",
    status: "COMPLETED",
    triageJson: JSON.stringify(triage),
    errorCode: null,
    createdAt,
    attempt: 2,
    maxAttempts: 3,
    leaseToken: "private-lease-token",
    leaseExpiresAt: createdAt,
    ...overrides,
  };
}

describe("intake reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns compact summaries newest first and omits worker fields", async () => {
    dbMocks.findMany.mockResolvedValue([
      { id: "new", title: "New", industry: "Retail", createdAt, status: "PENDING", errorCode: null },
      { id: "old", title: "Old", industry: "Retail", createdAt: new Date("2026-11-01T12:00:00.000Z"), status: "PROCESSING", errorCode: null },
    ]);

    const result = await listIntakes();

    expect(dbMocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }));
    expect(result.map(({ id }) => id)).toEqual(["new", "old"]);
    expect(result[0]).not.toHaveProperty("attempt");
    expect(result[0]).not.toHaveProperty("leaseToken");
  });

  it("preserves source fields and valid triage on detail", async () => {
    dbMocks.findUnique.mockResolvedValue(record());

    const result = await getIntake("cmvypx38700008ats8z8y8brj");

    expect(result).toMatchObject({
      id: "cmvypx38700008ats8z8y8brj",
      title: "Customer portal refresh",
      description: "Refresh the customer portal and clarify integration needs.",
      budget: "$20,000–$30,000",
      timeline: "Three months",
      industry: "Retail",
      status: "COMPLETED",
      triage,
      retryAvailable: false,
    });
    expect(result).not.toHaveProperty("attempt");
    expect(result).not.toHaveProperty("leaseToken");
  });

  it("keeps source readable if stored triage JSON is corrupt", async () => {
    dbMocks.findUnique.mockResolvedValue(record({ triageJson: "{broken" }));

    const result = await getIntake("cmvypx38700008ats8z8y8brj");

    expect(result?.description).toBe("Refresh the customer portal and clarify integration needs.");
    expect(result).not.toHaveProperty("triage");
  });

  it("returns null for missing records", async () => {
    dbMocks.findUnique.mockResolvedValue(null);
    await expect(getIntake("missing")).resolves.toBeNull();
  });

  it("exposes retry availability only for failed detail records", async () => {
    dbMocks.findUnique.mockResolvedValue(record({ status: "FAILED", triageJson: null, errorCode: "PROVIDER_TIMEOUT" }));

    await expect(getIntake("cmvypx38700008ats8z8y8brj")).resolves.toMatchObject({
      status: "FAILED",
      retryAvailable: true,
    });
  });
});
