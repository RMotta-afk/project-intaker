import { notFound } from "next/navigation";
import { getIntake, IntakeIdSchema } from "@/server/intakes/read";
import { IntakeDetailLive } from "./intake-detail-live";

export const dynamic = "force-dynamic";

export default async function IntakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!IntakeIdSchema.safeParse(id).success) notFound();
  const intake = await getIntake(id);
  if (!intake) notFound();
  return <main><IntakeDetailLive initialIntake={intake} /></main>;
}
