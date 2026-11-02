import { afterAll, describe, expect, it, vi } from "vitest";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";

vi.mock("server-only", () => ({}));

const integration = describe.runIf(process.env.RUN_DB_INTEGRATION === "1");

integration("SQLite retry through the worker", () => {
  const source = {
    title: "Retry integration check",
    description: "The original source must remain unchanged across retry.",
    budget: "$15,000",
    timeline: "One quarter",
    industry: "Software",
  };
  const triage = {
    summary: "The client needs a new software workflow. Access details need discovery.",
    tags: ["Workflow", "Software", "Discovery"],
    risks: ["Confirm access control requirements."],
  };
  const start = new Date("2035-01-01T12:00:00.000Z");

  let createRoute: typeof import("../../../app/api/intakes/route");
  let detailRoute: typeof import("../../../app/api/intakes/[id]/route");
  let retryRoute: typeof import("../../../app/api/intakes/[id]/retry/route");
  let worker: typeof import("./worker");
  let outcome: typeof import("./outcome");
  let db: typeof import("../db");
  let id: string;

  it("reuses the same intake after failure and rejects the stale attempt", async () => {
    createRoute = await import("../../../app/api/intakes/route");
    detailRoute = await import("../../../app/api/intakes/[id]/route");
    retryRoute = await import("../../../app/api/intakes/[id]/retry/route");
    worker = await import("./worker");
    outcome = await import("./outcome");
    db = await import("../db");

    const created = await createRoute.POST(new Request("http://localhost/api/intakes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(source),
    }));
    expect(created.status).toBe(201);
    id = (await created.json()).id;

    const failed = await worker.runWorkerOnce(async () => {
      throw { code: "PROVIDER_AUTH", message: "controlled missing-key failure" };
    }, { now: () => start, createToken: () => "first-attempt-token" });
    expect(failed).toMatchObject({
      kind: "failed",
      intakeId: id,
      outcome: { kind: "failed", errorCode: "PROVIDER_AUTH" },
    });

    const beforeRetry = await db.getDb().intake.findUnique({ where: { id } });
    expect(beforeRetry).toMatchObject({ ...source, status: "FAILED", attempt: 1 });
    const failedDetail = await detailRoute.GET(new Request(`http://localhost/api/intakes/${id}`), {
      params: Promise.resolve({ id }),
    });
    expect(await failedDetail.json()).toMatchObject({ id, status: "FAILED", retryAvailable: true });

    const retried = await retryRoute.POST(new Request(`http://localhost/api/intakes/${id}/retry`, { method: "POST" }), {
      params: Promise.resolve({ id }),
    });
    expect(retried.status).toBe(202);
    expect(await retried.json()).toMatchObject({ id, status: "PENDING", retryAvailable: false });

    await expect(outcome.completeClaim(id, "first-attempt-token", triage, { now: () => start }))
      .resolves.toEqual({ kind: "stale-token" });

    await expect(worker.runWorkerOnce(async () => triage, {
      now: () => new Date(start.getTime() + 1_000),
      createToken: () => "second-attempt-token",
    })).resolves.toEqual({ kind: "completed", intakeId: id });

    const [finalRecord, count] = await Promise.all([
      db.getDb().intake.findUnique({ where: { id } }),
      db.getDb().intake.count({ where: { id } }),
    ]);
    expect(count).toBe(1);
    expect(finalRecord).toMatchObject({ ...source, id, status: "COMPLETED", attempt: 1, triageJson: JSON.stringify(triage) });
  });

  afterAll(async () => {
    if (db) {
      if (id) await db.getDb().intake.deleteMany({ where: { id } });
      await db.disconnectDb();
    }
    await rm(resolve("prisma/test.db"), { force: true });
    await rm(resolve("prisma/test.db-journal"), { force: true });
  });
});
