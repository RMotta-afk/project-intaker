import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createIntake } from "./create";

let createCalls: unknown[];
let createFails: boolean;
const database = {
  intake: {
    create: async (args?: { data: Record<string, unknown> }) => {
      createCalls.push(args);
      if (createFails) throw new Error("database internals");
      return {
        id: "intake-123",
        ...args?.data,
        createdAt: new Date("2026-01-02T03:04:05.000Z"),
      };
    },
  },
};

const validInput = {
  title: "Website refresh",
  description: "Refresh the product website for a new audience.",
  budget: "$20,000",
  timeline: "Q1",
  industry: "Software",
};

describe("createIntake", () => {
  beforeEach(() => {
    createCalls = [];
    createFails = false;
  });

  it("rejects invalid input without writing to SQLite", async () => {
    const result = await createIntake({ ...validInput, title: "  " }, database as never);

    expect(result).toEqual({ kind: "invalid" });
    expect(createCalls).toHaveLength(0);
  });

  it("persists valid input as PENDING and returns its public ID", async () => {
    const result = await createIntake(validInput, database as never);

    expect(createCalls).toEqual([{ data: { ...validInput, status: "PENDING" } }]);
    expect(result).toEqual({
      kind: "created",
      intake: {
        ...validInput,
        id: "intake-123",
        createdAt: "2026-01-02T03:04:05.000Z",
        status: "PENDING",
        retryAvailable: false,
      },
    });
    expect(result.kind === "created" && "attempt" in result.intake).toBe(false);
  });

  it("maps persistence failures to a safe result", async () => {
    createFails = true;

    await expect(createIntake(validInput, database as never)).resolves.toEqual({ kind: "storage-error" });
  });
});
