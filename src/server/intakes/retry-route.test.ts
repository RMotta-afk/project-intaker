import { beforeEach, describe, expect, it, vi } from "vitest";

const retryIntakeMock = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("@/server/jobs/retry", () => ({ retryIntake: retryIntakeMock }));

import { POST } from "../../../app/api/intakes/[id]/retry/route";

function request(id: string) {
  return POST(new Request(`http://localhost/api/intakes/${id}/retry`, { method: "POST" }), {
    params: Promise.resolve({ id }),
  });
}

describe("POST /api/intakes/[id]/retry", () => {
  beforeEach(() => retryIntakeMock.mockReset());

  it("accepts a valid retry and returns only public retry state", async () => {
    retryIntakeMock.mockResolvedValue({
      kind: "retried",
      intakeId: "intake-123",
      availableAt: new Date("2026-11-02T12:00:00.000Z"),
      maxAttempts: 3,
    });

    const response = await request("intake-123");

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({
      id: "intake-123",
      status: "PENDING",
      availableAt: "2026-11-02T12:00:00.000Z",
      retryAvailable: false,
    });
    expect(retryIntakeMock).toHaveBeenCalledWith("intake-123");
  });

  it("rejects invalid IDs before calling the service", async () => {
    const response = await request("bad/id");

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: { code: "INVALID_ID", message: "The intake ID is invalid." },
      retryAvailable: false,
    });
    expect(retryIntakeMock).not.toHaveBeenCalled();
  });

  it("returns safe not-found and conflict responses", async () => {
    retryIntakeMock.mockResolvedValueOnce({ kind: "not-found" }).mockResolvedValueOnce({ kind: "conflict" });

    const missing = await request("missing");
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({
      error: { code: "NOT_FOUND", message: "Intake not found." },
      retryAvailable: false,
    });

    const conflict = await request("intake-123");
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toEqual({
      error: { code: "RETRY_CONFLICT", message: "This intake cannot be retried in its current state." },
      retryAvailable: false,
    });
  });

  it("maps storage failures to a safe response", async () => {
    retryIntakeMock.mockResolvedValue({ kind: "storage-error", detail: "private database internals" });

    const response = await request("intake-123");

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      error: { code: "STORAGE_ERROR", message: "Unable to retry this intake." },
      retryAvailable: false,
    });
    expect(JSON.stringify(body)).not.toContain("private database internals");
  });
});
