"use client";

import { useEffect, useState } from "react";
import { IntakeListResponseSchema } from "@/contracts/intake";
import type { IntakeListItem } from "@/server/intakes/read";
import { IntakeList } from "./intake-list";

export function IntakeQueue({ initialIntakes }: { initialIntakes: IntakeListItem[] }) {
  const [intakes, setIntakes] = useState(initialIntakes);
  const [error, setError] = useState<string>();

  async function refresh(signal?: AbortSignal) {
    try {
      const response = await fetch("/api/intakes", { cache: "no-store", signal });
      if (!response.ok) throw new Error("Unable to refresh requests.");
      const body: unknown = await response.json();
      const parsed = IntakeListResponseSchema.safeParse(body);
      if (!parsed.success) throw new Error("The request list response was invalid.");
      setIntakes(parsed.data.intakes);
      setError(undefined);
    } catch (cause) {
      if (signal?.aborted) return;
      setError(cause instanceof Error ? cause.message : "Unable to refresh requests.");
    }
  }

  useEffect(() => {
    if (!intakes.some((item) => item.status === "PENDING" || item.status === "PROCESSING")) return;
    const controller = new AbortController();
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh(controller.signal);
    }, 3000);
    return () => { window.clearInterval(timer); controller.abort(); };
  }, [intakes]);

  return <IntakeList intakes={intakes} error={error} onRetry={() => void refresh()} />;
}
