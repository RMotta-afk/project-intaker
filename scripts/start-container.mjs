import { spawn } from "node:child_process";
import { resolve } from "node:path";

const cwd = process.cwd();
const prismaBin = resolve(cwd, "node_modules/.bin/prisma");
const nextBin = resolve(cwd, "node_modules/next/dist/bin/next");
let stopping = false;
let children = [];

function start(name, command, args) {
  const child = spawn(command, args, { cwd, env: process.env, stdio: "inherit" });
  child.on("error", (error) => console.error(`${name} could not start: ${error.message}`));
  return child;
}

function exitOf(child) {
  return new Promise((resolveExit) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolveExit({ code: child.exitCode, signal: child.signalCode });
      return;
    }
    child.once("exit", (code, signal) => resolveExit({ code, signal }));
    child.once("error", () => resolveExit({ code: 1, signal: null }));
  });
}

function stop(signal = "SIGTERM") {
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill(signal);
  }
}

process.on("SIGTERM", () => stop());
process.on("SIGINT", () => stop("SIGINT"));

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must point to persistent SQLite storage.");

  const migration = start("Prisma migration", prismaBin, ["migrate", "deploy"]);
  children = [migration];
  const migrationExit = await exitOf(migration);
  if (stopping) return;
  if (migrationExit.code !== 0) throw new Error("Prisma migration failed; application was not started.");

  const web = start("Next.js", process.execPath, [nextBin, "start"]);
  const worker = start("Triage worker", process.execPath, [
    "--conditions=react-server", "--import", "tsx", "src/server/jobs/worker-entry.ts",
  ]);
  children = [web, worker];

  const first = await Promise.race([
    exitOf(web).then((result) => ({ name: "Next.js", result })),
    exitOf(worker).then((result) => ({ name: "Triage worker", result })),
  ]);
  if (!stopping) {
    console.error(`${first.name} exited unexpectedly (${first.result.code ?? first.result.signal}).`);
    process.exitCode = 1;
    stop();
  }
  await Promise.all(children.map(exitOf));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Container startup failed.");
  stop();
  process.exitCode = 1;
});
