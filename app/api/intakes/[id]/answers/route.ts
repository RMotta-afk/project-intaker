import { IntakeIdSchema, getIntake } from "@/server/intakes/read";
import { answerClarifications } from "@/server/intakes/update";
import { jsonBodyError, readJsonBody } from "@/server/http/json-body";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const { id } = await context.params;
  if (!IntakeIdSchema.safeParse(id).success) return Response.json({ error: { code: "INVALID_ID" } }, { status: 400 });
  const body = await readJsonBody(request);
  if (!body.success) return jsonBodyError(body);
  const result = await answerClarifications(id, body.value);
  if (result.kind !== "updated") {
    const status = result.kind === "invalid" ? 400 : result.kind === "not-found" ? 404 : result.kind === "conflict" ? 409 : 500;
    return Response.json({ error: { code: result.kind.toUpperCase().replaceAll("-", "_") } }, { status });
  }
  return Response.json({ intake: await getIntake(id), retriaged: true }, { status: 202 });
}
