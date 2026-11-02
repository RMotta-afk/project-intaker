export type JsonBodyResult =
  | { success: true; value: unknown }
  | { success: false; reason: "unsupported" | "too-large" | "invalid" };

/** Read a JSON request with a byte limit before parsing it. */
export async function readJsonBody(request: Request, maxBytes = 64 * 1024): Promise<JsonBodyResult> {
  if (!/^application\/json(?:\s*;|$)/iu.test(request.headers.get("content-type") ?? "")) {
    return { success: false, reason: "unsupported" };
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    if (!/^\d+$/u.test(declaredLength)) return { success: false, reason: "invalid" };
    const parsedLength = Number(declaredLength);
    if (!Number.isSafeInteger(parsedLength) || parsedLength < 0) return { success: false, reason: "invalid" };
    if (parsedLength > maxBytes) return { success: false, reason: "too-large" };
  }

  if (!request.body) return { success: false, reason: "invalid" };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return { success: false, reason: "too-large" };
      }
      chunks.push(value);
    }
  } catch {
    return { success: false, reason: "invalid" };
  }

  try {
    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    return { success: true, value };
  } catch {
    return { success: false, reason: "invalid" };
  }
}

export function jsonBodyError(result: Extract<JsonBodyResult, { success: false }>): Response {
  if (result.reason === "unsupported") {
    return Response.json({ error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Send this request as JSON." } }, { status: 415 });
  }
  if (result.reason === "too-large") {
    return Response.json({ error: { code: "REQUEST_TOO_LARGE", message: "This request is larger than the allowed limit." } }, { status: 413 });
  }
  return Response.json({ error: { code: "INVALID_INPUT", message: "Provide a valid JSON request." } }, { status: 400 });
}
