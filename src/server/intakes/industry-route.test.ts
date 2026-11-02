import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
  industryTag: {
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock("@/server/db", () => ({ getDb: () => dbMock }));

import { GET, POST } from "../../../app/api/industries/route";

describe("industry tag routes", () => {
  beforeEach(() => {
    dbMock.industryTag.findMany.mockReset();
    dbMock.industryTag.upsert.mockReset();
  });

  it("combines default and saved industry suggestions", async () => {
    dbMock.industryTag.findMany.mockResolvedValue([{ name: "Fabric" }, { name: "Technology" }]);

    const response = await GET();
    const body = await response.json() as { tags: string[] };

    expect(response.status).toBe(200);
    expect(body.tags).toContain("Fabric");
    expect(body.tags).toContain("Retail");
    expect(body.tags).toContain("Technology");
    expect(body.tags).toContain("Healthcare");
    expect(body.tags).toEqual([...body.tags].sort((a, b) => a.localeCompare(b)));
  });

  it("still serves built-in suggestions if the database is unavailable", async () => {
    dbMock.industryTag.findMany.mockRejectedValue(new Error("database unavailable"));

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ tags: expect.arrayContaining(["Retail", "Technology", "Healthcare"]) });
  });

  it("normalizes new tags so spelling variants reuse the existing tag", async () => {
    dbMock.industryTag.upsert.mockResolvedValue({ name: "Tech" });

    const response = await POST(new Request("http://localhost/api/industries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "  TECH  " }),
    }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ name: "Tech" });
    expect(dbMock.industryTag.upsert).toHaveBeenCalledWith({
      where: { normalized: "tech" },
      create: { name: "TECH", normalized: "tech" },
      update: {},
      select: { name: true },
    });
  });

  it("rejects empty industry tags", async () => {
    const response = await POST(new Request("http://localhost/api/industries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "   " }),
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: { message: "Enter an industry tag." } });
    expect(dbMock.industryTag.upsert).not.toHaveBeenCalled();
  });
});
