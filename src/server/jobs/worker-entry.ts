import { loadEnvConfig } from "@next/env";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { runWorker, type TriageGenerator } from "./worker";
import { disconnectDb } from "../db";
import type { TriageInput } from "../../contracts/intake";

function readMilliseconds(name: string, fallback: number, minimum: number, maximum: number): number {
  const configured = process.env[name];
  if (!configured) return fallback;
  const value = Number(configured);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be a whole number between ${minimum} and ${maximum} milliseconds.`);
  }
  return value;
}

async function loadAdapter(): Promise<TriageGenerator> {
  const configuredPath = process.env.WORKER_ADAPTER_MODULE;
  if (!configuredPath) {
    throw new Error("Set WORKER_ADAPTER_MODULE to a server-side module exporting generateTriage.");
  }

  const moduleUrl = pathToFileURL(resolve(process.cwd(), configuredPath)).href;
  const loaded: unknown = await import(moduleUrl);
  if (typeof loaded !== "object" || loaded === null || !("generateTriage" in loaded)) {
    throw new Error("Worker adapter module must export generateTriage.");
  }

  const adapter = loaded.generateTriage;
  if (typeof adapter !== "function") {
    throw new Error("Worker adapter generateTriage export must be a function.");
  }
  return async (intake: TriageInput) => {
    const result: unknown = await adapter(intake);
    return result;
  };
}

async function main(): Promise<void> {
  loadEnvConfig(process.cwd());
  const generateTriage = await loadAdapter();
  const controller = new AbortController();
  const stop = () => controller.abort();
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  try {
    console.info("Intake worker started.");
    await runWorker(generateTriage, {
      signal: controller.signal,
      pollIntervalMs: readMilliseconds("WORKER_POLL_INTERVAL_MS", 1_000, 10, 60_000),
      leaseMs: readMilliseconds("WORKER_LEASE_MS", 120_000, 1, 86_400_000),
      onResult(result) {
        if (result.kind === "idle") return;
        console.info(JSON.stringify(result));
      },
    });
  } finally {
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
    await disconnectDb();
  }
}

main().catch(async () => {
  console.error("Intake worker stopped because its configuration or database is unavailable.");
  await disconnectDb();
  process.exitCode = 1;
});
