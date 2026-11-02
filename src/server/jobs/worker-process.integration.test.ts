import { afterAll, describe, expect, it, vi } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

vi.mock("server-only", () => ({}));

const integration = describe.runIf(process.env.RUN_DB_INTEGRATION === "1");

integration("separate worker process lifecycle", () => {
  let createRoute: typeof import("../../../app/api/intakes/route");
  let retryRoute: typeof import("../../../app/api/intakes/[id]/retry/route");
  let db: typeof import("../db");
  const ids: string[] = [];

  async function startWorker(options: {
    failure?: string;
    delayMs?: number;
    leaseMs?: number;
  } = {}): Promise<ChildProcess> {
    const child = spawn(process.execPath, [
      "--conditions=react-server",
      "--import",
      "tsx",
      "src/server/jobs/worker-entry.ts",
    ], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL ?? "file:./test.db",
        WORKER_ADAPTER_MODULE: "./scripts/fake-worker-adapter.ts",
        WORKER_POLL_INTERVAL_MS: "25",
        WORKER_LEASE_MS: String(options.leaseMs ?? 2_000),
        ...(options.failure ? { FAKE_WORKER_FAILURE: options.failure } : { FAKE_WORKER_FAILURE: "" }),
        FAKE_WORKER_DELAY_MS: String(options.delayMs ?? 0),
      },
      stdio: ["ignore", "ignore", "ignore"],
    });
    return child;
  }

  async function waitForExit(child: ChildProcess): Promise<void> {
    if (child.exitCode !== null || child.signalCode !== null) return;
    await new Promise<void>((resolveExit, rejectExit) => {
      child.once("exit", () => resolveExit());
      child.once("error", rejectExit);
    });
  }

  async function waitForStatus(id: string, status: string, timeoutMs = 8_000) {
    const end = Date.now() + timeoutMs;
    while (Date.now() < end) {
      const record = await db.getDb().intake.findUnique({ where: { id } });
      if (record?.status === status) return record;
      await delay(25);
    }
    throw new Error(`Timed out waiting for intake ${id} to reach ${status}.`);
  }

  async function waitForAttempt(id: string, attempt: number, timeoutMs = 8_000) {
    const end = Date.now() + timeoutMs;
    while (Date.now() < end) {
      const record = await db.getDb().intake.findUnique({ where: { id } });
      if (record?.attempt === attempt) return record;
      await delay(25);
    }
    throw new Error(`Timed out waiting for intake ${id} to reach attempt ${attempt}.`);
  }

  async function createIntake(title: string): Promise<string> {
    const response = await createRoute.POST(new Request("http://localhost/api/intakes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        description: "A process-level worker integration request.",
        budget: "$12,000",
        timeline: "Six weeks",
        industry: "Software",
      }),
    }));
    expect(response.status).toBe(201);
    const { id } = await response.json();
    ids.push(id);
    return id;
  }

  it("runs separate-process failure, retry, success and expired-lease recovery", async () => {
    createRoute = await import("../../../app/api/intakes/route");
    retryRoute = await import("../../../app/api/intakes/[id]/retry/route");
    db = await import("../db");

    const retriedId = await createIntake("Process failure and retry");
    let child = await startWorker({ failure: "auth" });
    await waitForStatus(retriedId, "FAILED");
    child.kill("SIGTERM");
    await waitForExit(child);

    const retryResponse = await retryRoute.POST(new Request(`http://localhost/api/intakes/${retriedId}/retry`, { method: "POST" }), {
      params: Promise.resolve({ id: retriedId }),
    });
    expect(retryResponse.status).toBe(202);
    child = await startWorker();
    const retriedRecord = await waitForStatus(retriedId, "COMPLETED");
    child.kill("SIGTERM");
    await waitForExit(child);
    expect(retriedRecord).toMatchObject({ status: "COMPLETED", attempt: 1 });

    const recoveryId = await createIntake("Process restart recovery");
    child = await startWorker({ delayMs: 3_000, leaseMs: 150 });
    const crashedAttempt = await waitForStatus(recoveryId, "PROCESSING");
    child.kill("SIGKILL");
    await waitForExit(child);
    await delay(200);

    child = await startWorker({ leaseMs: 2_000, delayMs: 500 });
    const reclaimedAttempt = await waitForAttempt(recoveryId, 2);
    const recovered = await waitForStatus(recoveryId, "COMPLETED");
    child.kill("SIGTERM");
    await waitForExit(child);

    expect(recovered).toMatchObject({ status: "COMPLETED", attempt: 2 });
    expect(recovered.leaseToken).toBeNull();
    expect(reclaimedAttempt.leaseToken).not.toBe(crashedAttempt.leaseToken);
  });

  afterAll(async () => {
    if (db) {
      if (ids.length) await db.getDb().intake.deleteMany({ where: { id: { in: ids } } });
      await db.disconnectDb();
    }
    await rm(resolve("prisma/test.db"), { force: true });
    await rm(resolve("prisma/test.db-journal"), { force: true });
  });
});
