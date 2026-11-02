"use client";

import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { IntakeInputSchema, type IntakeInput } from "@/contracts/intake";
import styles from "./intake-form.module.css";

type FieldName = keyof IntakeInput;
type TextFieldName = "title" | "description";
type ValidationField = FieldName | "budget" | "timeline";

const fields: Array<{
  name: TextFieldName;
  label: string;
  hint: string;
  placeholder: string;
  multiline?: boolean;
}> = [
  { name: "title", label: "Project title", hint: "A short name your team will recognize.", placeholder: "e.g. Customer portal refresh" },
  { name: "description", label: "Describe your project", hint: "Include the problem, audience, and any important context.", placeholder: "Describe the project and what a successful outcome looks like…", multiline: true },
];

const validationOrder: ValidationField[] = ["title", "description", "industry", "budget", "timeline"];
const currencies = ["USD", "EUR", "GBP", "BRL", "CAD", "AUD", "JPY", "CHF", "INR", "MXN", "SGD"] as const;

function formatBudget(start: string, end: string, currency: string): string {
  if (!start || !end) return "";
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return money.format(Number(start.replaceAll(",", ""))) + " – " + money.format(Number(end.replaceAll(",", "")));
}

function formatBudgetInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/gu, "");
  const decimalAt = cleaned.indexOf(".");
  const integer = (decimalAt < 0 ? cleaned : cleaned.slice(0, decimalAt)).replace(/^0+(?=\d)/u, "");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
  if (decimalAt < 0) return grouped;
  const fraction = cleaned.slice(decimalAt + 1).replaceAll(".", "").slice(0, 2);
  return `${grouped}.${fraction}`;
}

function formatDate(value: string): string {
  return new Date(value + "T00:00:00.000Z").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function messageForIssue(field: FieldName, issueMessage: string): string {
  if (field === "title") return issueMessage.includes("Too big") ? "Project title must be 160 characters or fewer." : "Project title must have a value.";
  if (field === "description") return issueMessage.includes("Too big") ? "Project description must be 10,000 characters or fewer." : "Project description must have a value.";
  if (field === "industry") return issueMessage.includes("Too big") ? "Industry tags must fit within 120 characters in total." : "Add at least one industry.";
  if (field === "budget") return "Enter a valid budget range.";
  return "Choose a valid project date range.";
}

export function IntakeForm({
  onSubmit,
  saving = false,
  submitError,
}: {
  onSubmit: (input: IntakeInput) => void;
  saving?: boolean;
  submitError?: string;
}) {
  const [values, setValues] = useState<Record<TextFieldName, string>>({ title: "", description: "" });
  const [industryTags, setIndustryTags] = useState<string[]>([]);
  const [industryInput, setIndustryInput] = useState("");
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  const [industryLoaded, setIndustryLoaded] = useState(false);
  const [industryLoading, setIndustryLoading] = useState(false);
  const [budgetStart, setBudgetStart] = useState("");
  const [budgetEnd, setBudgetEnd] = useState("");
  const [budgetCurrency, setBudgetCurrency] = useState<(typeof currencies)[number]>("USD");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<Partial<Record<ValidationField, string>>>({});
  const [toast, setToast] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [industryOpen, setIndustryOpen] = useState(false);
  const industryLoadStarted = useRef(false);

  const filteredIndustries = useMemo(() => {
    const query = industryInput.trim().toLocaleLowerCase();
    return industryOptions
      .filter((tag) => !industryTags.some((selected) => selected.toLocaleLowerCase() === tag.toLocaleLowerCase()))
      .filter((tag) => !query || tag.toLocaleLowerCase().includes(query))
      .sort((a, b) => {
        if (!query) return a.localeCompare(b);
        const aStartsWith = a.toLocaleLowerCase().startsWith(query);
        const bStartsWith = b.toLocaleLowerCase().startsWith(query);
        return Number(bStartsWith) - Number(aStartsWith) || a.localeCompare(b);
      })
      .slice(0, 8);
  }, [industryInput, industryOptions, industryTags]);

  function validate(
    nextValues: Record<TextFieldName, string>,
    tags: string[],
    min: string,
    max: string,
    start: string,
    end: string,
  ) {
    const nextErrors: Partial<Record<ValidationField, string>> = {};
    const minValue = Number(min.replaceAll(",", ""));
    const maxValue = Number(max.replaceAll(",", ""));

    if (!nextValues.title.trim()) nextErrors.title = "Project title must have a value.";
    if (!nextValues.description.trim()) nextErrors.description = "Project description must have a value.";
    if (tags.length === 0) nextErrors.industry = "Add at least one industry.";

    if (!min || !max) {
      nextErrors.budget = "Enter both a minimum and maximum budget.";
    } else if (!Number.isFinite(minValue) || !Number.isFinite(maxValue) || minValue < 0 || maxValue < minValue) {
      nextErrors.budget = "Maximum budget must be at least the minimum budget.";
    }

    if (!start || !end) {
      nextErrors.timeline = "Choose both a start date and a target completion date.";
    } else if (end < start) {
      nextErrors.timeline = "Target completion must be on or after the start date.";
    }

    const contractInput = {
      ...nextValues,
      industry: tags.join(", "),
      budget: nextErrors.budget ? "validating budget range" : formatBudget(min, max, budgetCurrency),
      timeline: nextErrors.timeline ? "validating project dates" : formatDate(start) + " – " + formatDate(end),
    };
    const result = IntakeInputSchema.safeParse(contractInput);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as FieldName | undefined;
        if (field && !nextErrors[field]) nextErrors[field] = messageForIssue(field, issue.message);
      }
    }
    setErrors(nextErrors);
    return nextErrors;
  }

  function scrollToFirstError(nextErrors: Partial<Record<ValidationField, string>>) {
    const field = validationOrder.find((name) => nextErrors[name]);
    if (!field) {
      setToast("");
      return;
    }
    const message = nextErrors[field] ?? "Check the highlighted field.";
    setToast(message);
    const targetId: Record<ValidationField, string> = {
      title: "title",
      description: "description",
      industry: "industry-input",
      budget: "budget-start",
      timeline: "timeline-start",
    };
    window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId[field]);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.focus({ preventScroll: true });
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const pendingTags = industryInput.split(",").map((tag) => tag.trim()).filter(Boolean);
    const tagMap = new Map(industryTags.map((tag) => [tag.toLocaleLowerCase(), tag]));
    for (const tag of pendingTags) {
      if (!tagMap.has(tag.toLocaleLowerCase())) tagMap.set(tag.toLocaleLowerCase(), tag);
    }
    const tagsToSubmit = [...tagMap.values()];
    const nextErrors = validate(values, tagsToSubmit, budgetStart, budgetEnd, startDate, endDate);
    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError(nextErrors);
      return;
    }
    setToast("");
    setIndustryTags(tagsToSubmit);
    setIndustryInput("");
    for (const tag of pendingTags) void saveIndustryTag(tag);
    onSubmit({
      ...values,
      industry: tagsToSubmit.join(", "),
      budget: formatBudget(budgetStart, budgetEnd, budgetCurrency),
      timeline: formatDate(startDate) + " – " + formatDate(endDate),
    });
  }

  function updateText(name: TextFieldName, value: string) {
    const next = { ...values, [name]: value };
    setValues(next);
    if (submitted || errors[name]) validate(next, industryTags, budgetStart, budgetEnd, startDate, endDate);
  }

  function updateBudget(min: string, max: string) {
    setBudgetStart(min);
    setBudgetEnd(max);
    if (submitted || errors.budget) validate(values, industryTags, min, max, startDate, endDate);
  }

  function updateDates(start: string, end: string) {
    setStartDate(start);
    setEndDate(end);
    if (submitted || errors.timeline) validate(values, industryTags, budgetStart, budgetEnd, start, end);
  }

  async function loadIndustryTags() {
    setIndustryOpen(true);
    if (industryLoadStarted.current) return;
    industryLoadStarted.current = true;
    setIndustryLoading(true);
    try {
      const response = await fetch("/api/industries", { cache: "no-store" });
      if (!response.ok) throw new Error("Industry suggestions are unavailable.");
      const result = await response.json() as { tags?: unknown };
      setIndustryOptions(Array.isArray(result.tags) ? result.tags.filter((tag): tag is string => typeof tag === "string") : []);
      setIndustryLoaded(true);
    } catch {
      industryLoadStarted.current = false;
    } finally {
      setIndustryLoading(false);
    }
  }

  async function saveIndustryTag(name: string) {
    try {
      const response = await fetch("/api/industries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) return;
      const result = await response.json() as { name?: string };
      if (result.name) setIndustryOptions((options) => options.some((item) => item.toLocaleLowerCase() === result.name?.toLocaleLowerCase()) ? options : [...options, result.name!].sort((a, b) => a.localeCompare(b)));
    } catch {
      // Intake creation remains available if saving a suggestion fails.
    }
  }

  function addIndustryTag(candidate: string) {
    const tag = candidate.trim().replace(/,$/u, "").trim();
    setIndustryInput("");
    if (!tag) return;
    if (industryTags.some((selected) => selected.toLocaleLowerCase() === tag.toLocaleLowerCase())) return;
    const nextTags = [...industryTags, tag];
    setIndustryTags(nextTags);
    void saveIndustryTag(tag);
    if (submitted || errors.industry) validate(values, nextTags, budgetStart, budgetEnd, startDate, endDate);
  }

  function handleIndustryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && industryInput.trim()) {
      event.preventDefault();
      addIndustryTag(industryInput);
      setIndustryOpen(false);
    }
    if (event.key === "Escape") setIndustryOpen(false);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {toast && <p className={styles.toast} role="alert" aria-live="assertive">{toast}</p>}
      {fields.map(({ name, label, hint, placeholder, multiline }) => {
        const errorId = name + "-error";
        const hintId = name + "-hint";
        const describedBy = [hintId, errors[name] ? errorId : undefined].filter(Boolean).join(" ");
        return (
          <fieldset className={`${styles.rangeField} ${styles.legendFieldCard}`} key={name}>
            <legend>{label}<span aria-hidden="true"> *</span></legend>
            <p className={styles.hint} id={hintId}>{hint}</p>
            {multiline ? (
              <div className={styles.field}>
                <label className={styles.srOnly} htmlFor={name}>Project description</label>
                <textarea id={name} name={name} value={values[name]} placeholder={placeholder} rows={5} maxLength={10_000} aria-invalid={Boolean(errors[name])} aria-describedby={describedBy} onChange={(event) => updateText(name, event.target.value)} />
              </div>
            ) : (
              <div className={styles.field}>
                <label className={styles.srOnly} htmlFor={name}>Project title</label>
                <input id={name} name={name} value={values[name]} placeholder={placeholder} maxLength={160} aria-invalid={Boolean(errors[name])} aria-describedby={describedBy} onChange={(event) => updateText(name, event.target.value)} />
              </div>
            )}
            {errors[name] && <p className={styles.error} id={errorId}>{errors[name]}</p>}
          </fieldset>
        );
      })}

      <fieldset className={`${styles.rangeField} ${styles.legendFieldCard}`}>
        <legend>Industry<span aria-hidden="true"> *</span></legend>
        <p className={styles.hint} id="industry-hint">Add one or more industries. Choose a suggestion or type a tag and press Enter.</p>
        <div className={styles.industryBox}>
          <div className={styles.chips}>
            {industryTags.map((tag) => <span className={styles.chip} key={tag}>{tag}<button type="button" aria-label={`Remove ${tag}`} onClick={() => {
              const next = industryTags.filter((item) => item !== tag);
              setIndustryTags(next);
              if (submitted || errors.industry) validate(values, next, budgetStart, budgetEnd, startDate, endDate);
            }}>×</button></span>)}
            <label className={styles.srOnly} htmlFor="industry-input">Industry tag</label>
            <input
              id="industry-input"
              name="industry"
              value={industryInput}
              maxLength={60}
              placeholder={industryTags.length ? "Add another industry" : "e.g. Retail, Fabric manufacturing"}
              aria-invalid={Boolean(errors.industry)}
              aria-describedby={errors.industry ? "industry-error" : "industry-hint"}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={industryOpen}
              aria-controls="industry-options"
              onFocus={() => void loadIndustryTags()}
              onChange={(event) => {
                const value = event.target.value;
                if (value.includes(",")) {
                  const [tag, ...rest] = value.split(",");
                  addIndustryTag(tag);
                  setIndustryInput(rest.join(",").trim());
                  return;
                }
                setIndustryInput(value);
                setIndustryOpen(true);
              }}
              onKeyDown={handleIndustryKeyDown}
              onBlur={() => window.setTimeout(() => setIndustryOpen(false), 120)}
            />
          </div>
          {industryOpen && (industryLoading || !industryLoaded || Boolean(industryInput.trim()) || filteredIndustries.length > 0) && (
            <div className={styles.suggestions}>
              {industryLoading && <p>Loading saved industries…</p>}
              {!industryLoading && industryLoaded && filteredIndustries.length > 0 && (
                <ul id="industry-options" role="listbox" aria-label="Saved industries">
                  {filteredIndustries.map((tag) => <li key={tag}><button type="button" role="option" aria-selected="false" onMouseDown={(event) => event.preventDefault()} onClick={() => { addIndustryTag(tag); setIndustryOpen(false); }}>{tag}</button></li>)}
                </ul>
              )}
              {!industryLoading && industryLoaded && industryInput.trim() && !filteredIndustries.some((tag) => tag.toLocaleLowerCase() === industryInput.trim().toLocaleLowerCase()) && (
                <button className={styles.addSuggestion} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { addIndustryTag(industryInput); setIndustryOpen(false); }}>
                  Add “{industryInput.trim()}” as a new industry
                </button>
              )}
              {!industryLoading && industryLoaded && industryInput.trim() && filteredIndustries.length === 0 && <p>No saved matches. You can add this as a new industry.</p>}
            </div>
          )}
        </div>
        {errors.industry && <p className={styles.error} id="industry-error">{errors.industry}</p>}
      </fieldset>

      <fieldset className={`${styles.rangeField} ${styles.legendFieldCard} ${styles.budgetField}`}>
        <legend>Budget range<span aria-hidden="true"> *</span></legend>
        <p className={styles.hint} id="budget-hint">Choose a currency and enter the lowest and highest total project values.</p>
        <div className={`${styles.field} ${styles.budgetCurrency}`}>
          <label htmlFor="budget-currency">Currency</label>
          <select id="budget-currency" name="budget-currency" value={budgetCurrency} aria-describedby="budget-hint" onChange={(event) => setBudgetCurrency(event.target.value as (typeof currencies)[number])}>
            {currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
          </select>
        </div>
        <div className={`${styles.pairedFields} ${styles.budgetValues}`}>
          <div className={styles.field}>
            <label htmlFor="budget-start">Minimum budget</label>
            <input id="budget-start" name="budget-start" type="text" inputMode="decimal" placeholder="20,000" value={budgetStart} aria-invalid={Boolean(errors.budget)} aria-describedby={errors.budget ? "budget-error" : "budget-hint"} onChange={(event) => updateBudget(formatBudgetInput(event.target.value), budgetEnd)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="budget-end">Maximum budget</label>
            <input id="budget-end" name="budget-end" type="text" inputMode="decimal" placeholder="30,000" value={budgetEnd} aria-invalid={Boolean(errors.budget)} aria-describedby={errors.budget ? "budget-error" : "budget-hint"} onChange={(event) => updateBudget(budgetStart, formatBudgetInput(event.target.value))} />
          </div>
        </div>
        {errors.budget && <p className={styles.error} id="budget-error">{errors.budget}</p>}
      </fieldset>

      <fieldset className={`${styles.rangeField} ${styles.legendFieldCard} ${styles.dateField}`}>
        <legend>Project dates<span aria-hidden="true"> *</span></legend>
        <p className={styles.hint} id="timeline-hint">Choose when work should begin and the target completion date.</p>
        <div className={styles.pairedFields}>
          <div className={styles.field}>
            <label htmlFor="timeline-start">Start date</label>
            <input id="timeline-start" name="timeline-start" type="date" max={endDate || undefined} value={startDate} aria-invalid={Boolean(errors.timeline)} aria-describedby={errors.timeline ? "timeline-error" : "timeline-hint"} onChange={(event) => updateDates(event.target.value, endDate)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="timeline-end">Target completion</label>
            <input id="timeline-end" name="timeline-end" type="date" min={startDate || undefined} value={endDate} aria-invalid={Boolean(errors.timeline)} aria-describedby={errors.timeline ? "timeline-error" : "timeline-hint"} onChange={(event) => updateDates(startDate, event.target.value)} />
          </div>
        </div>
        {errors.timeline && <p className={styles.error} id="timeline-error">{errors.timeline}</p>}
      </fieldset>

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
