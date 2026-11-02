import { beforeEach, describe, expect, it, vi } from "vitest";
import { triageFixture } from "../../contracts/fixtures";

const db = vi.hoisted(() => ({ findUnique: vi.fn(), updateMany: vi.fn(), transaction: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("../db", () => ({ getDb: () => ({ $transaction: db.transaction }) }));

import { answerClarifications, updateIntake } from "./update";

const current = {
  id: "intake-1", title: "Portal", description: "Original description", industry: "Retail",
  budget: "USD 20,000 – USD 30,000", timeline: "January 2, 2035 – April 2, 2035",
  status: "COMPLETED", triageJson: JSON.stringify(triageFixture), clarificationAnswersJson: null,
  updatedAt: new Date("2035-01-01T00:00:00.000Z"),
};

describe("project revisions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.findUnique.mockResolvedValue(current);
    db.updateMany.mockResolvedValue({ count: 1 });
    db.transaction.mockImplementation((callback) => callback({ intake: { findUnique: db.findUnique, updateMany: db.updateMany } }));
  });

  it("saves title-only edits without requeueing triage", async () => {
    await expect(updateIntake("intake-1", { title: "New portal" })).resolves.toEqual({ kind: "updated", retriaged: false });
    expect(db.updateMany.mock.calls[0][0].data).toMatchObject({ title: "New portal" });
    expect(db.updateMany.mock.calls[0][0].data).not.toHaveProperty("status");
  });

  it("requeues description edits, keeps the prior triage, and clears the lease", async () => {
    await expect(updateIntake("intake-1", { description: "New description" })).resolves.toEqual({ kind: "updated", retriaged: true });
    expect(db.updateMany.mock.calls[0][0]).toMatchObject({
      where: { id: "intake-1", status: "COMPLETED", updatedAt: current.updatedAt },
      data: { description: "New description", status: "PENDING", triageJson: null, previousTriageJson: current.triageJson, attempt: 0, leaseToken: null },
    });
  });

  it("saves answers only for current questions and requeues with answer history", async () => {
    const answer = { question: triageFixture.followUpQuestions[0], answer: "Prioritize order history." };
    await expect(answerClarifications("intake-1", { answers: [answer] })).resolves.toEqual({ kind: "updated", retriaged: true });
    expect(db.updateMany.mock.calls[0][0].data).toMatchObject({
      status: "PENDING", previousTriageJson: current.triageJson,
      clarificationAnswersJson: JSON.stringify([answer]),
    });
    await expect(answerClarifications("intake-1", { answers: [{ question: "Unrelated?", answer: "No" }] }))
      .resolves.toEqual({ kind: "invalid" });
  });
});
