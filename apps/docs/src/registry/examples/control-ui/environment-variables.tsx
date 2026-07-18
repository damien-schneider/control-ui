"use client";

import { useState } from "react";

import { EnvironmentVariables } from "@/components/control-ui/environment-variables";
import type { EnvironmentVariableRow } from "@/components/control-ui/hooks/use-environment-variables";

const initialRows: EnvironmentVariableRow[] = [
  { key: "OPENAI_API_KEY", value: "sk-live-****************" },
  { key: "DATABASE_URL", value: "postgres://localhost:5432/app" },
];

export function EnvironmentVariablesExample() {
  const [saved, setSaved] = useState<Record<string, string> | null>(null);

  return (
    <div className="w-full max-w-3xl p-4">
      <EnvironmentVariables
        initialRows={initialRows}
        description="Import a .env file, paste multiple KEY=value lines, or edit variables one row at a time."
        onSubmit={({ variables }) => setSaved(variables)}
      />
      {saved ? (
        <div className="mt-3 rounded-[var(--radius-lg)] border bg-card px-3 py-2 text-meta text-muted-foreground shadow-sm">
          {Object.keys(saved).length} variables ready for submit
        </div>
      ) : null}
    </div>
  );
}
