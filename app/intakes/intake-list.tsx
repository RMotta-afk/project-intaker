import Link from "next/link";
import type { PublicIntake } from "@/contracts/intake";
import styles from "./intake-list.module.css";

const statusLabels: Record<PublicIntake["status"], string> = {
  PENDING: "Pending triage",
  PROCESSING: "Triage in progress",
  COMPLETED: "Triage complete",
  FAILED: "Triage needs attention",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function IntakeList({
  intakes,
  loading = false,
  error,
  onRetry,
}: {
  intakes: PublicIntake[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}) {
  return (
    <section className={styles.section} aria-labelledby="requests-heading">
      <div className={styles.headingRow}>
        <div>
          <p className={styles.eyebrow}>WORKSPACE</p>
          <h1 id="requests-heading">Project requests</h1>
          <p className={styles.intro}>Review incoming work and follow each request through triage.</p>
        </div>
        <Link className={styles.createLink} href="/new">＋ New request</Link>
      </div>

      {error ? (
        <div className={styles.message} role="alert">
          <h2>Requests could not be loaded</h2>
          <p>{error}</p>
          {onRetry && <button type="button" onClick={onRetry}>Try again</button>}
        </div>
      ) : loading ? (
        <p className={styles.message} role="status">Loading project requests…</p>
      ) : intakes.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">↗</span>
          <h2>Your request list is empty</h2>
          <p>When a project comes in, it will appear here with its triage status.</p>
          <Link href="/new">Create the first request</Link>
        </div>
      ) : (
        <ul className={styles.list}>
          {intakes.map((intake) => (
            <li className={styles.card} key={intake.id}>
              <Link className={styles.cardLink} href={`/intakes/${encodeURIComponent(intake.id)}`}>
                <span className={styles.cardMain}>
                  <span className={styles.title}>{intake.title}</span>
                  <span className={styles.meta}>{intake.industry} <span aria-hidden="true">·</span> Added {formatDate(intake.createdAt)}</span>
                </span>
                <span className={`${styles.status} ${styles[intake.status.toLowerCase()]}`}>
                  <span className={styles.statusMark} aria-hidden="true" />
                  {statusLabels[intake.status]}
                </span>
                <span className={styles.arrow} aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
