import { IntakeIdSchema } from "@/server/intakes/read";
import { retryIntake } from "@/server/jobs/retry";
import { RetryIntakeResponseSchema } from "@/contracts/intake";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext): Promise<Response> {
  const { id: rawId } = await context.params;
  const parsedId = IntakeIdSchema.safeParse(rawId);
  if (!parsedId.success) {
    return Response.json(
      { error: { code: "INVALID_ID", message: "The intake ID is invalid." }, retryAvailable: false },
      { status: 400 },
    );
  }

  const result = await retryIntake(parsedId.data);
  if (result.kind === "not-found") {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Intake not found." }, retryAvailable: false },
      { status: 404 },
    );
  }
  if (result.kind === "conflict") {
    return Response.json(
      { error: { code: "RETRY_CONFLICT", message: "This intake cannot be retried in its current state." }, retryAvailable: false },
      { status: 409 },
    );
  }
  if (result.kind === "storage-error") {
    return Response.json(
      { error: { code: "STORAGE_ERROR", message: "Unable to retry this intake." }, retryAvailable: false },
      { status: 500 },
    );
  }

  const body = RetryIntakeResponseSchema.parse({
    id: result.intakeId,
    status: "PENDING",
    availableAt: result.availableAt.toISOString(),
    retryAvailable: false,
  });
  return Response.json(body, { status: 202 });
}
