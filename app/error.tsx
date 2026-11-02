"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main role="alert"><h1>Could not load requests</h1><p>Your saved requests are still available. Please try again.</p><button type="button" onClick={reset}>Try again</button></main>;
}
