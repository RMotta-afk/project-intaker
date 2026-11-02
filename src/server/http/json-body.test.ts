import { describe, expect, it } from "vitest";
import { jsonBodyError, readJsonBody } from "./json-body";

describe("bounded JSON request reader", () => {
  it("parses a JSON object as unknown data", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accepted: true }),
    });

    await expect(readJsonBody(request)).resolves.toEqual({ success: true, value: { accepted: true } });
  });

  it("rejects unsupported content types, malformed JSON, and oversized bodies", async () => {
    const unsupported = await readJsonBody(new Request("http://localhost", { method: "POST", body: "{}" }));
    const malformed = await readJsonBody(new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    }));
    const oversized = await readJsonBody(new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: "x".repeat(100) }),
    }), 32);

    expect(unsupported).toEqual({ success: false, reason: "unsupported" });
    expect(jsonBodyError({ success: false, reason: "unsupported" }).status).toBe(415);
    expect(malformed).toEqual({ success: false, reason: "invalid" });
    expect(jsonBodyError({ success: false, reason: "invalid" }).status).toBe(400);
    expect(oversized).toEqual({ success: false, reason: "too-large" });
    expect(jsonBodyError({ success: false, reason: "too-large" }).status).toBe(413);
  });
});
