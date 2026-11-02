import "server-only";

import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";

const globalForPrisma = globalThis as typeof globalThis & {
  prismaClient?: PrismaClient;
};

/** Return the process-wide SQLite client, reusing it during Next.js hot reloads. */
export function getDb(): PrismaClient {
  if (!globalForPrisma.prismaClient) {
    const configuredUrl = process.env.DATABASE_URL;
    const databaseUrl = configuredUrl?.startsWith("file:./")
      ? `file:${resolve(process.cwd(), "prisma", configuredUrl.slice("file:./".length))}`
      : configuredUrl;

    globalForPrisma.prismaClient = new PrismaClient(
      databaseUrl ? { datasources: { db: { url: databaseUrl } } } : undefined,
    );
  }

  return globalForPrisma.prismaClient;
}

/** Disconnect the process-wide client during graceful shutdown or isolated tests. */
export async function disconnectDb(): Promise<void> {
  if (globalForPrisma.prismaClient) {
    await globalForPrisma.prismaClient.$disconnect();
    delete globalForPrisma.prismaClient;
  }
}
