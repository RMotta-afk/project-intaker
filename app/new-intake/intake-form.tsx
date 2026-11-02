"use client";

import { useState, type FormEvent } from "react";
import { IntakeInputSchema, type IntakeInput } from "@/contracts/intake";
import styles from "./intake-form.module.css";

type FieldName = keyof IntakeInput;

const fields: Array<{
  name: FieldName;
  label: string;
  hint: string;
  placeholder: string;
  multiline?: boolean;
}> = [
  {
    name: "title",
    label: "Project title",
    hint: "A short name your team will recognize.",
    placeholder: "e.g. Customer portal refresh",
  },
  {
    name: "description",
    label: "What do you need?",
    hint: "Include the problem, audience, and any important context.",
    placeholder: "Describe the project and what a successful outcome looks like…",
    multiline: true,
  },
  {
    name: "budget",
    label: "Budget",
    hint: "An estimate or range is fine.",
    placeholder: "e.g. $20,000–$30,000",
  },
  {
    name: "timeline",
    label: "Timeline",
    hint: "Share a target date or approximate duration.",
    placeholder: "e.g. Three months",
  },
  {
    name: "industry",
    label: "Industry",
    hint: "The organization’s primary industry.",
    placeholder: "e.g. Retail",
  },
];

export function IntakeForm({
  onSubmit,
  saving = false,
  submitError,
}: {
  onSubmit: (input: IntakeInput) => void;
  saving?: boolean;
  submitError?: string;
}) {
  const [values, setValues] = useState<IntakeInput>({
    title: "",
    description: "",
    budget: "",
    timeline: "",
    industry: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(nextValues: IntakeInput) {
    const result = IntakeInputSchema.safeParse(nextValues);
    const nextErrors: Partial<Record<FieldName, string>> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as FieldName | undefined;
        if (field && !nextErrors[field]) nextErrors[field] = issue.message;
      }
    }
    setErrors(nextErrors);
    return result;
  }

  function updateField(name: FieldName, value: string) {
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    if (submitted || errors[name]) validate(nextValues);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const result = validate(values);
    if (result.success) onSubmit(result.data);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {fields.map(({ name, label, hint, placeholder, multiline }) => {
        const errorId = `${name}-error`;
        const hintId = `${name}-hint`;
        const describedBy = [hintId, errors[name] ? errorId : undefined].filter(Boolean).join(" ");
        return (
          <div className={styles.field} key={name}>
            <label htmlFor={name}>{label}<span aria-hidden="true"> *</span></label>
            <p className={styles.hint} id={hintId}>{hint}</p>
            {multiline ? (
              <textarea
                id={name}
                name={name}
                value={values[name]}
                placeholder={placeholder}
                rows={5}
                maxLength={10_000}
                aria-invalid={Boolean(errors[name])}
                aria-describedby={describedBy}
                onChange={(event) => updateField(name, event.target.value)}
              />
            ) : (
              <input
                id={name}
                name={name}
                value={values[name]}
                placeholder={placeholder}
                maxLength={name === "title" ? 160 : 120}
                aria-invalid={Boolean(errors[name])}
                aria-describedby={describedBy}
                onChange={(event) => updateField(name, event.target.value)}
              />
            )}
            {errors[name] && <p className={styles.error} id={errorId}>{errors[name]}</p>}
          </div>
        );
      })}

      {submitError && <p className={styles.submitError} role="alert">{submitError}</p>}
      <div className={styles.actions}>
        <p>Your request is saved before triage begins.</p>
        <button type="submit" disabled={saving}>
          {saving ? "Saving request…" : "Save request"}
        </button>
      </div>
    </form>
  );
}
