# Triage review rubric

Use this rubric to review a generated triage against the original intake. It is a
small qualitative review aid, not a benchmark and not a claim about model quality.

For each case, record the case ID, prompt version, model identifier, review date,
and the exact output reviewed. Do not include credentials or customer data.

## Review criteria

Score each item `pass`, `needs review`, or `fail`, and cite the output phrase and
the intake detail that supports the judgment.

- **Requested outcome:** Does the summary preserve the main requested outcome and
  important stated constraints?
- **Source faithfulness:** Are claims supported by the intake? Are unstated
  requirements, integrations, dates, budgets, approvals, or capabilities avoided?
- **Actionable risks:** Does each risk identify a concrete uncertainty, dependency,
  constraint, or decision that a project team can investigate or resolve?
- **Requirement/decision distinction:** Are stated requests kept distinct from
  questions or recommendations that still need confirmation?
- **Instruction handling:** Is instruction-like text in the intake treated as
  untrusted content rather than followed as directions to the system?
- **Useful wording:** Is the summary understandable and specific enough for an
  intake reviewer to act on?

## Evidence notes

Record only observed issues and supporting phrases. A structurally valid result
can still fail qualitative review. Mocked provider responses demonstrate control
flow and regression behavior only; they do not measure live model quality. Any
manual judgment should be labeled as such and kept separate from deterministic
schema or transport checks.
