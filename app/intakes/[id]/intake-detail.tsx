import Link from "next/link";
import type { PublicIntake } from "@/contracts/intake";
import styles from "./intake-detail.module.css";

const statusLabels: Record<PublicIntake["status"], string> = {
  PENDING: "Waiting for triage",
  PROCESSING: "Triage in progress",
  COMPLETED: "Triage complete",
  FAILED: "Triage needs attention",
};

const failureMessages: Record<string, string> = {
  PROVIDER_UNAVAILABLE: "Triage could not start because the service is unavailable. Your request is safe.",
  PROVIDER_AUTH: "Triage could not start because the service needs attention. Your request is safe.",
  PROVIDER_RATE_LIMIT: "Triage is temporarily busy. Your request is safe.",
  PROVIDER_TIMEOUT: "Triage took too long to respond. Your request is safe.",
  PROVIDER_ERROR: "Triage could not be completed. Your request is safe.",
  INVALID_OUTPUT: "Triage returned a result that could not be used. Your request is safe.",
  ATTEMPTS_EXHAUSTED: "Triage could not be completed after several attempts. Your request is safe.",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderBriefList(items: string[]) {
  return items.length > 0 ? (
    <ul className={styles.briefList}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  ) : <span>Not stated in the request.</span>;
}

export function IntakeDetail({ intake }: { intake: PublicIntake }) {
  const displayedTriage = intake.triage ?? intake.previousTriage;
  const failureMessage = intake.errorCode
    ? failureMessages[intake.errorCode] ?? "Triage could not be completed. Your request is safe."
    : "Triage could not be completed. Your request is safe.";

  return (
    <article className={styles.page}>
      <nav className={styles.navigation} aria-label="Request actions">
        <Link className={styles.backLink} href="/">← All requests</Link>
        <Link className={styles.createLink} href="/new">＋ New project</Link>
      </nav>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>PROJECT REQUEST</p>
          <h1>{intake.title}</h1>
          <p className={styles.headerMeta}>{intake.industry} <span aria-hidden="true">·</span> Submitted {formatDate(intake.createdAt)}</p>
        </div>
        <span className={`${styles.status} ${styles[intake.status.toLowerCase()]}`}>
          <span className={styles.statusMark} aria-hidden="true" />
          {statusLabels[intake.status]}
        </span>
      </header>

      {intake.status === "PENDING" && (
        <p className={styles.notice} role="status">Your request is saved. Triage will begin shortly.</p>
      )}
      {intake.status === "PROCESSING" && (
        <p className={styles.notice} role="status">Your request is saved while triage prepares a summary.</p>
      )}
      {intake.status === "FAILED" && (
        <p className={styles.failure} role="status">{failureMessage}</p>
      )}

      <section className={styles.source} aria-labelledby="source-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>ORIGINAL SUBMISSION</p>
            <h2 id="source-heading">Request details</h2>
          </div>
          <span className={styles.sourceBadge}>Submitted by requester</span>
        </div>
        <dl className={styles.fields}>
          <div className={styles.descriptionField}>
            <dt>Project description</dt>
            <dd className={styles.description}>{intake.description}</dd>
          </div>
          <div><dt>Budget</dt><dd>{intake.budget}</dd></div>
          <div><dt>Timeline</dt><dd>{intake.timeline}</dd></div>
          <div><dt>Industry</dt><dd>{intake.industry}</dd></div>
        </dl>
      </section>

      <section className={styles.triage} aria-labelledby="triage-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>AI ASSISTED REVIEW</p>
            <h2 id="triage-heading">Triage</h2>
          </div>
          <span className={styles.advisory}>Advisory only</span>
        </div>
        {displayedTriage ? (
          <div className={styles.result}>
            {!intake.triage && <p className={styles.previousLabel}>{intake.status === "FAILED" ? "Previous result · the latest triage failed" : "Previous result · a new triage is in progress"}</p>}
            <div className={styles.summaryBlock}>
              <h3>Summary</h3>
              <p>{displayedTriage.summary}</p>
            </div>
            <section className={styles.followUp} aria-labelledby="follow-up-heading">
              <h3 id="follow-up-heading">Questions to clarify with the requester</h3>
              <ol className={styles.questions}>
                {displayedTriage.followUpQuestions.map((question) => <li key={question}>{question}</li>)}
              </ol>
            </section>
            <div className={styles.resultColumns}>
              <div>
                <h3>Suggested tags</h3>
                <ul className={styles.tags}>
                  {displayedTriage.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              </div>
              <div>
                <h3>Risks to explore</h3>
                <ul className={styles.risks}>
                  {displayedTriage.risks.map((risk) => <li key={risk}>{risk}</li>)}
                </ul>
              </div>
            </div>
            {intake.triage && intake.previousTriage && <details className={styles.previousResult}>
              <summary>Compare with previous triage</summary>
              <h3>Previous summary</h3><p>{intake.previousTriage.summary}</p>
              <h3>Previous tags</h3><p>{intake.previousTriage.tags.join(", ")}</p>
              <h3>Previous risks</h3>{renderBriefList(intake.previousTriage.risks)}
              <h3>Previous questions</h3>{renderBriefList(intake.previousTriage.followUpQuestions)}
            </details>}
          </div>
        ) : (
          <p className={styles.triagePending}>
            {intake.status === "FAILED" ? "A triage result is not available yet." : "A summary, follow-up questions, suggested tags, and risks will appear here when triage is complete."}
          </p>
        )}
      </section>
    </article>
  );
}
