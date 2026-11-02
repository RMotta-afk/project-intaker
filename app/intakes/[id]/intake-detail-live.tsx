"use client";

import { useCallback, useEffect, useState } from "react";
import { PublicIntakeSchema, RetryIntakeResponseSchema, type PublicIntake } from "@/contracts/intake";
import { IntakeDetail } from "./intake-detail";
import styles from "./intake-detail.module.css";

export function IntakeDetailLive({ initialIntake }: { initialIntake: PublicIntake }) {
  const [intake, setIntake] = useState(initialIntake);
  const [error, setError] = useState<string>();
  const [retrying, setRetrying] = useState(false);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/intakes/${encodeURIComponent(intake.id)}`, { cache: "no-store", signal });
      if (!response.ok) throw new Error("Could not refresh triage status.");
      const body: unknown = await response.json();
      const parsed = PublicIntakeSchema.safeParse(body);
      if (!parsed.success) throw new Error("The intake response was invalid.");
      setIntake(parsed.data);
      setError(undefined);
    } catch (cause) {
      if (signal?.aborted) return;
      setError(cause instanceof Error ? cause.message : "Could not refresh triage status.");
    }
  }, [intake.id]);

  useEffect(() => {
    if (intake.status === "COMPLETED" || intake.status === "FAILED") return;
    const controller = new AbortController();
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh(controller.signal);
    }, 3000);
    return () => { window.clearInterval(timer); controller.abort(); };
  }, [intake.status, refresh]);

  async function retry() {
    if (retrying) return;
    setRetrying(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/intakes/${encodeURIComponent(intake.id)}/retry`, { method: "POST" });
      if (!response.ok) throw new Error("Could not retry triage. Refresh and try again.");
      const body: unknown = await response.json();
      if (!RetryIntakeResponseSchema.safeParse(body).success) throw new Error("The retry response was invalid. Refresh and try again.");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not retry triage.");
    } finally {
      setRetrying(false);
    }
  }

  return <div className={styles.livePage}>
    <IntakeDetail intake={intake} />
    {intake.retryAvailable && <div className={styles.retryRow}>
      <button className={styles.retryButton} type="button" onClick={() => void retry()} disabled={retrying}>
        <span className={retrying ? styles.retrySpinner : styles.retryIcon} aria-hidden="true">{retrying ? "" : "↻"}</span>
        {retrying ? "Retrying triage…" : "Retry triage"}
      </button>
    </div>}
    {error && <p role="alert">{error} <button type="button" onClick={() => void refresh()}>Refresh</button></p>}
  </div>;
}
