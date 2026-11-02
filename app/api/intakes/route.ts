import { createIntake } from "@/server/intakes/create";
import { listIntakes } from "@/server/intakes/read";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { code: "INVALID_INPUT", message: "Provide a valid intake request." } },
      { status: 400 },
    );
  }

  const result = await createIntake(body);
  if (result.kind === "invalid") {
    return Response.json(
      { error: { code: "INVALID_INPUT", message: "Provide all five valid intake fields." } },
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
    return Response.json({ intakes: await listIntakes() });
  } catch {
    return Response.json(
      { error: { code: "STORAGE_ERROR", message: "Unable to load saved intakes." } },
      { status: 500 },
    );
  }
}
