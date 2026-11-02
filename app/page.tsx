import { listIntakes } from "@/server/intakes/read";
import { IntakeQueue } from "./intakes/intake-queue";

export const dynamic = "force-dynamic";

export default async function Home() {
  const intakes = await listIntakes();
  return <main><IntakeQueue initialIntakes={intakes} /></main>;
}
