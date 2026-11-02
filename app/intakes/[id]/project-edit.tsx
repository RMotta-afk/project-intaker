"use client";

import { useState, type FormEvent } from "react";
import { INTAKE_CURRENCIES, IntakeUpdateSchema, PublicIntakeSchema, type PublicIntake } from "@/contracts/intake";
import styles from "./intake-detail.module.css";

function storedBudget(value: string) {
  const match = /^([A-Z]{3})\s+([\d,.]+)\s+–\s+\1\s+([\d,.]+)$/u.exec(value);
  return match ? { currency: match[1], minimum: match[2], maximum: match[3] } : null;
}

function storedDates(value: string) {
  const parts = value.split(" – ");
  if (parts.length !== 2) return null;
  const dates = parts.map((part) => new Date(`${part} 00:00:00 GMT`));
  return dates.every((date) => Number.isFinite(date.getTime()))
    ? { start: dates[0].toISOString().slice(0, 10), end: dates[1].toISOString().slice(0, 10) }
    : null;
}

export function ProjectEdit({ intake, onSaved, onClose }: {
  intake: PublicIntake;
  onSaved: (updated: PublicIntake) => void;
  onClose: () => void;
}) {
  const budget = storedBudget(intake.budget);
  const dates = storedDates(intake.timeline);
  const [title, setTitle] = useState(intake.title);
  const [description, setDescription] = useState(intake.description);
  const [industries, setIndustries] = useState(intake.industry);
  const [currency, setCurrency] = useState(budget?.currency ?? "USD");
  const [minimum, setMinimum] = useState(budget?.minimum ?? "");
  const [maximum, setMaximum] = useState(budget?.maximum ?? "");
  const [start, setStart] = useState(dates?.start ?? "");
  const [end, setEnd] = useState(dates?.end ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = {
      ...(title !== intake.title ? { title } : {}),
      ...(description !== intake.description ? { description } : {}),
      ...(industries !== intake.industry ? { industryTags: industries.split(",").map((value) => value.trim()).filter(Boolean) } : {}),
      ...((minimum || maximum) && (!budget || currency !== budget.currency || minimum !== budget.minimum || maximum !== budget.maximum)
        ? { budgetRange: { currency, minimum, maximum } } : {}),
      ...((start || end) && (!dates || start !== dates.start || end !== dates.end)
        ? { dateRange: { start, end } } : {}),
    };
    const parsed = IntakeUpdateSchema.safeParse(input);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check the project fields."); return; }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/intakes/${encodeURIComponent(intake.id)}`, {
        method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed.data),
      });
      if (!response.ok) throw new Error("Could not save changes. Refresh and try again.");
      const body: unknown = await response.json();
      if (typeof body !== "object" || body === null || !("intake" in body)) throw new Error("The update response was invalid.");
      const result = PublicIntakeSchema.safeParse(body.intake);
      if (!result.success) throw new Error("The update response was invalid.");
      onSaved(result.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save changes.");
    } finally { setSaving(false); }
  }

  return <form className={styles.editPanel} onSubmit={(event) => void save(event)}>
    <h2>Edit project request</h2>
    <p>Changes to the description, industries, budget, or dates start a new triage. Title changes save immediately.</p>
    <label>Project title<input value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} /></label>
    <label>Description<textarea value={description} maxLength={10_000} rows={5} onChange={(event) => setDescription(event.target.value)} /></label>
    <label>Industries <small>Separate tags with commas</small><input value={industries} onChange={(event) => setIndustries(event.target.value)} /></label>
    <div className={styles.editGrid}>
      <label>Currency<select value={currency} onChange={(event) => setCurrency(event.target.value)}>{INTAKE_CURRENCIES.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Minimum budget<input inputMode="decimal" value={minimum} onChange={(event) => setMinimum(event.target.value)} /></label>
      <label>Maximum budget<input inputMode="decimal" value={maximum} onChange={(event) => setMaximum(event.target.value)} /></label>
      <label>Start date<input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
      <label>Target completion<input type="date" min={start || undefined} value={end} onChange={(event) => setEnd(event.target.value)} /></label>
    </div>
    {(!budget || !dates) && <p>Older free-text budget or timeline values can be replaced by filling both values in the corresponding range.</p>}
    {error && <p role="alert" className={styles.editError}>{error}</p>}
    <div className={styles.editActions}><button type="button" onClick={onClose}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div>
  </form>;
}
