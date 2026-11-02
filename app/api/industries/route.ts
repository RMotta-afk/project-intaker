import { IndustrySuggestionsSchema, IndustryTagInputSchema, IndustryTagResponseSchema } from "@/contracts/intake";
import { getDb } from "@/server/db";
import { jsonBodyError, readJsonBody } from "@/server/http/json-body";

const DEFAULT_INDUSTRIES = [
  "Agriculture",
  "Construction",
  "Education",
  "Energy & Utilities",
  "Fabric & Textiles",
  "Financial Services",
  "Healthcare",
  "Manufacturing",
  "Media & Entertainment",
  "Professional Services",
  "Real Estate",
  "Retail",
  "Technology",
  "Transportation & Logistics",
  "Travel & Hospitality",
];

function normalize(name: string): string {
  return name.normalize("NFKC").trim().toLocaleLowerCase("en-US");
}

export async function GET(): Promise<Response> {
  try {
    const tags = await getDb().industryTag.findMany({
      orderBy: [{ name: "asc" }, { createdAt: "asc" }],
      take: 2_000,
      select: { name: true },
    });
    const tagsByNormalizedName = new Map(DEFAULT_INDUSTRIES.map((name) => [normalize(name), name]));
    for (const tag of tags) {
      const key = normalize(tag.name);
      if (!tagsByNormalizedName.has(key)) tagsByNormalizedName.set(key, tag.name);
    }
    const suggestions = [...tagsByNormalizedName.values()].sort((a, b) => a.localeCompare(b));
    const parsed = IndustrySuggestionsSchema.safeParse({ tags: suggestions });
    return Response.json(parsed.success ? parsed.data : { tags: [...DEFAULT_INDUSTRIES].sort((a, b) => a.localeCompare(b)) });
  } catch {
    return Response.json({ tags: [...DEFAULT_INDUSTRIES].sort((a, b) => a.localeCompare(b)) });
  }
}

export async function POST(request: Request): Promise<Response> {
  const body = await readJsonBody(request, 4 * 1024);
  if (!body.success) return jsonBodyError(body);

  const parsed = IndustryTagInputSchema.safeParse(body.value);
  if (!parsed.success) {
    return Response.json({ error: { message: parsed.error.issues[0]?.message ?? "Provide an industry tag." } }, { status: 400 });
  }

  const name = parsed.data.name;
  try {
    const tag = await getDb().industryTag.upsert({
      where: { normalized: normalize(name) },
      create: { name, normalized: normalize(name) },
      update: {},
      select: { name: true },
    });
    const result = IndustryTagResponseSchema.safeParse({ name: tag.name });
    if (!result.success) return Response.json({ error: { message: "Unable to save this industry suggestion." } }, { status: 500 });
    return Response.json(result.data, { status: 201 });
  } catch {
    return Response.json({ error: { message: "Unable to save this industry suggestion." } }, { status: 500 });
  }
}
