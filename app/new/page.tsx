"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PublicIntakeSchema, type IntakeSubmission } from "@/contracts/intake";
import { IntakeForm } from "../new-intake/intake-form";

export default function NewIntakePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(input: IntakeSubmission) {
    if (saving) return;
    setSaving(true);
    setError(undefined);
    try {
      const response = await fetch("/api/intakes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error(response.status === 400 ? "Check the request fields and try again." : "Could not save the request. Try again.");
      const body: unknown = await response.json();
      const saved = PublicIntakeSchema.safeParse(body);
      if (!saved.success) throw new Error("The saved request response was invalid. Refresh and check the request list.");
      router.push(`/intakes/${encodeURIComponent(saved.data.id)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the request.");
      setSaving(false);
    }
  }

  return <main><h1>New project request</h1><IntakeForm onSubmit={(input) => void submit(input)} saving={saving} submitError={error} /></main>;
}
