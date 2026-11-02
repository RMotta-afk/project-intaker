# Triage quality review record

- Review date: 2026-11-02
- Prompt version: `triage-v1`
- Configured model: not observed; the adapter default is `openai/gpt-4o-mini`
- Cases: `triageEvaluationCases` in `src/ai/evaluation/cases.ts`
- Review basis: local deterministic checks only; no provider credentials or generated live output were available.

## Deterministic checks

The offline regression suite passes against mocked provider responses. It verifies that all five typed evaluation intakes pass through the integrated adapter, and that wrong tag counts, malformed/empty content, rate limits, and authentication errors are handled as expected. These checks establish contract and control-flow behavior; they do not measure model quality.

## Qualitative review

No generated output was available for manual scoring. The criteria and evidence format are in `review-rubric.md`. Requested outcome fidelity, unsupported claims, actionable risks, requirement/decision distinctions, and handling of instruction-like input remain unassessed until a live or otherwise captured provider response is reviewed.

## Live review and limitations

Live provider review was not run because `OPENROUTER_API_KEY` was absent on 2026-11-02. No provider request was made. Consequently, this record makes no claim about output quality, consistency, latency, or current model behavior. Repeat the manual rubric review when an authorized key is available and record the selected model and exact prompt version with the reviewed output.
