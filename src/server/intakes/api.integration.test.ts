import { afterAll, describe, expect, it, vi } from "vitest";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";

vi.mock("server-only", () => ({}));

const integration = describe.runIf(process.env.RUN_DB_INTEGRATION === "1");

integration("SQLite intake API integration", () => {
  const source = {
    title: "Integration check",
    description: "A saved source request survives API reads.",
    budgetRange: { currency: "USD", minimum: "10,000", maximum: "20,000" },
    dateRange: { start: "2026-01-02", end: "2026-03-02" },
    industryTags: ["Software"],
  };

  let collection: typeof import("../../../app/api/intakes/route");
  let detail: typeof import("../../../app/api/intakes/[id]/route");
  let db: typeof import("../db");
  let savedId: string;

  it("creates, lists, and opens the same persisted source intake", async () => {
    collection = await import("../../../app/api/intakes/route");
    detail = await import("../../../app/api/intakes/[id]/route");
    db = await import("../db");

    const createResponse = await collection.POST(new Request("http://localhost/api/intakes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(source),
    }));
    expect(createResponse.status).toBe(201);
    const created = await createResponse.json();
    savedId = created.id;
    expect(created).toMatchObject({
      title: source.title,
      description: source.description,
      budget: "USD 10,000 – USD 20,000",
      timeline: "January 2, 2026 – March 2, 2026",
      industry: "Software",
      status: "PENDING",
    });

    const listResponse = await collection.GET();
    expect(listResponse.status).toBe(200);
    const list = await listResponse.json();
    expect(list.intakes[0]).toMatchObject({ id: savedId, title: source.title, status: "PENDING" });

    const detailResponse = await detail.GET(new Request(`http://localhost/api/intakes/${savedId}`), {
      params: Promise.resolve({ id: savedId }),
    });
    expect(detailResponse.status).toBe(200);
    expect(await detailResponse.json()).toMatchObject({ id: savedId, status: "PENDING", retryAvailable: false });
  });

  afterAll(async () => {
    if (db) {
      if (savedId) await db.getDb().intake.deleteMany({ where: { id: savedId } });
      await db.disconnectDb();
    }
    await rm(resolve("prisma/test.db"), { force: true });
    await rm(resolve("prisma/test.db-journal"), { force: true });
  });
});
