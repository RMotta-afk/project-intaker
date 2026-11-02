"use client";

import { useCallback, useEffect, useState } from "react";
import { PublicIntakeSchema, RetryIntakeResponseSchema, type PublicIntake } from "@/contracts/intake";
import { IntakeDetail } from "./intake-detail";
import { ProjectEdit } from "./project-edit";
import styles from "./intake-detail.module.css";

export function IntakeDetailLive({ initialIntake }: { initialIntake: PublicIntake }) {
  const [intake, setIntake] = useState(initialIntake);
  const [error, setError] = useState<string>();
  const [retrying, setRetrying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answering, setAnswering] = useState(false);

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
      setAnswers({});
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not retry triage.");
    } finally {
      setRetrying(false);
    }
  }

  async function submitAnswers(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selected = intake.triage?.followUpQuestions.flatMap((question) => {
      const answer = answers[question]?.trim();
      return answer ? [{ question, answer }] : [];
    }) ?? [];
    if (selected.length === 0) { setError("Answer at least one question before regenerating triage."); return; }
    setAnswering(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/intakes/${encodeURIComponent(intake.id)}/answers`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: selected }),
      });
      if (!response.ok) throw new Error("Could not save the answers. Refresh and try again.");
      const body: unknown = await response.json();
      if (typeof body !== "object" || body === null || !("intake" in body)) throw new Error("The answer response was invalid.");
      const parsed = PublicIntakeSchema.safeParse(body.intake);
      if (!parsed.success) throw new Error("The answer response was invalid.");
      setIntake(parsed.data);
      setAnswers({});
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save the answers."); }
    finally { setAnswering(false); }
  }

  return <div className={styles.livePage}>
    <IntakeDetail intake={intake} />
    <div className={styles.retryRow}>
      <button className={styles.editToggle} type="button" onClick={() => setEditing((value) => !value)}>{editing ? "Close editor" : "Edit project"}</button>
      {intake.retryAvailable && <>
      <button className={styles.retryButton} type="button" onClick={() => void retry()} disabled={retrying}>
        <span className={retrying ? styles.retrySpinner : styles.retryIcon} aria-hidden="true">{retrying ? "" : "↻"}</span>
        {retrying ? "Retrying triage…" : "Retry triage"}
      </button>
      </>}
    </div>
    {editing && <ProjectEdit intake={intake} onClose={() => setEditing(false)} onSaved={(updated) => { setIntake(updated); setEditing(false); setError(undefined); }} />}
    {intake.status === "COMPLETED" && intake.triage && <form className={styles.answerPanel} onSubmit={(event) => void submitAnswers(event)}>
      <h2>Answer clarification questions</h2>
      <p>Your answers are saved with the project and included in the next AI triage.</p>
      {intake.triage.followUpQuestions.map((question) => <label key={question}>{question}
        <textarea maxLength={2_000} value={answers[question] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [question]: event.target.value }))} placeholder="Add an answer" />
      </label>)}
      <button type="submit" disabled={answering}>{answering ? "Saving answers…" : "Save answers and regenerate"}</button>
    </form>}
    {(intake.clarificationAnswers?.length ?? 0) > 0 && <section className={styles.answerPanel} aria-label="Saved clarification answers">
      <h2>Saved answers</h2>
      {intake.clarificationAnswers?.map(({ question, answer }) => <div key={question}><strong>{question}</strong><p>{answer}</p></div>)}
    </section>}
    {error && <p role="alert">{error} <button type="button" onClick={() => void refresh()}>Refresh</button></p>}
  </div>;
}
