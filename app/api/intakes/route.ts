import { createIntake } from "@/server/intakes/create";
import { listIntakes } from "@/server/intakes/read";
import { jsonBodyError, readJsonBody } from "@/server/http/json-body";
import { IntakeListResponseSchema } from "@/contracts/intake";

export async function POST(request: Request): Promise<Response> {
  const body = await readJsonBody(request);
  if (!body.success) return jsonBodyError(body);

  const result = await createIntake(body.value);
  if (result.kind === "invalid") {
    return Response.json(
      { error: { code: "INVALID_INPUT", message: "Provide a title, description, industry tags, budget range, and project dates." } },
      { status: 400 },
    );
  }
  if (result.kind === "storage-error") {
    return Response.json(
      { error: { code: "STORAGE_ERROR", message: "Unable to save this intake." } },
      { status: 500 },
    );
  }

  return Response.json(result.intake, { status: 201 });
}

export async function GET(): Promise<Response> {
  try {
    const body = IntakeListResponseSchema.parse({ intakes: await listIntakes() });
    return Response.json(body);
  } catch {
    return Response.json(
      { error: { code: "STORAGE_ERROR", message: "Unable to load saved intakes." } },
      { status: 500 },
    );
  }
}
