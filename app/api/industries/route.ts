import { z } from "zod";
import { getDb } from "@/server/db";

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

const IndustryTagInput = z.object({
  name: z.string().trim().min(1, "Enter an industry tag.").max(60, "Industry tags must be 60 characters or fewer."),
}).strict();

function normalize(name: string): string {
  return name.normalize("NFKC").trim().toLocaleLowerCase("en-US");
}

export async function GET(): Promise<Response> {
  try {
    const tags = await getDb().industryTag.findMany({
      orderBy: [{ name: "asc" }, { createdAt: "asc" }],
      select: { name: true },
    });
    const tagsByNormalizedName = new Map(DEFAULT_INDUSTRIES.map((name) => [normalize(name), name]));
    for (const tag of tags) {
      const key = normalize(tag.name);
      if (!tagsByNormalizedName.has(key)) tagsByNormalizedName.set(key, tag.name);
    }
    const suggestions = [...tagsByNormalizedName.values()].sort((a, b) => a.localeCompare(b));
    return Response.json({ tags: suggestions });
  } catch {
    return Response.json({ tags: [...DEFAULT_INDUSTRIES].sort((a, b) => a.localeCompare(b)) });
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "Provide an industry tag." } }, { status: 400 });
  }

  const parsed = IndustryTagInput.safeParse(body);
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
    return Response.json({ name: tag.name }, { status: 201 });
  } catch {
    return Response.json({ error: { message: "Unable to save this industry suggestion." } }, { status: 500 });
  }
}
