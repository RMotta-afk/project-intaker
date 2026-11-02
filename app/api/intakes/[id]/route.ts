import { IntakeIdSchema, getIntake } from "@/server/intakes/read";

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
