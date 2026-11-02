import { IntakeIdSchema, getIntake } from "@/server/intakes/read";
import { updateIntake } from "@/server/intakes/update";
import { jsonBodyError, readJsonBody } from "@/server/http/json-body";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { id: rawId } = await context.params;
  const parsedId = IntakeIdSchema.safeParse(rawId);
  if (!parsedId.success) {
    return Response.json(
      { error: { code: "INVALID_ID", message: "The intake ID is invalid." } },
      { status: 400 },
    );
  }

  try {
    const intake = await getIntake(parsedId.data);
    if (!intake) {
      return Response.json(
        { error: { code: "NOT_FOUND", message: "Intake not found." } },
        { status: 404 },
      );
    }
    return Response.json(intake);
  } catch {
    return Response.json(
      { error: { code: "INTERNAL_ERROR", message: "Unable to load this intake." } },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext): Promise<Response> {
  const { id } = await context.params;
  if (!IntakeIdSchema.safeParse(id).success) return Response.json({ error: { code: "INVALID_ID" } }, { status: 400 });
  const body = await readJsonBody(request);
  if (!body.success) return jsonBodyError(body);
  const result = await updateIntake(id, body.value);
  if (result.kind !== "updated") {
    const status = result.kind === "invalid" ? 400 : result.kind === "not-found" ? 404 : result.kind === "conflict" ? 409 : 500;
    return Response.json({ error: { code: result.kind.toUpperCase().replaceAll("-", "_") } }, { status });
  }
  const intake = await getIntake(id);
  return Response.json({ intake, retriaged: result.retriaged });
}
