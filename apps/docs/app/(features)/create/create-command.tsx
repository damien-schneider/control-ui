"use client";

import { useState } from "react";
import { CodeSnippet } from "@/app/(features)/components/source";
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from "@/components/control-ui/ui/field";
import { Input } from "@/components/control-ui/ui/input";
import { Toggle, ToggleGroup } from "@/components/control-ui/ui/toggle";
import { Text } from "@/components/control-ui/ui/typography";
import { env } from "@/env";
import { createAppCommand, normalizeProjectName, type PackageManagerId, packageManagerIds } from "./command";

const packageManagerLabels: Record<PackageManagerId, string> = {
  npm: "npm",
  pnpm: "pnpm",
  yarn: "Yarn",
  bun: "Bun",
};

export function CreateCommand() {
  const [projectName, setProjectName] = useState("my-control-ui-app");
  const [packageManager, setPackageManager] = useState<PackageManagerId>("npm");
  const normalizedProjectName = normalizeProjectName(projectName);
  const command = createAppCommand({ packageManager, projectName, registryBaseUrl: env.NEXT_PUBLIC_REGISTRY_URL });

  return (
    <div className="mt-4 grid min-w-0 gap-6">
      <Field>
        <FieldLabel>Project name</FieldLabel>
        <Input
          value={projectName}
          onChange={(event) => setProjectName(event.currentTarget.value)}
          autoComplete="off"
          maxLength={64}
          spellCheck={false}
        />
        <FieldDescription>
          Creates the folder{" "}
          <Text as="code" size="caption" tone="foreground" mono>
            {normalizedProjectName}
          </Text>
          .
        </FieldDescription>
      </Field>

      <FieldSet>
        <FieldLegend>Package manager</FieldLegend>
        <ToggleGroup value={[packageManager]} onValueChange={([next]) => next && setPackageManager(next)} className="w-full">
          {packageManagerIds.map((id) => (
            <Toggle key={id} value={id} className="flex-1">
              {packageManagerLabels[id]}
            </Toggle>
          ))}
        </ToggleGroup>
      </FieldSet>

      <div className="grid gap-2">
        <Text as="p" size="label" weight="medium" tone="foreground">
          Run this command
        </Text>
        <CodeSnippet code={command} highlight="none" />
        <Text as="p" size="caption" tone="muted">
          Dependencies install automatically. When Next.js is ready, open the Local URL printed in your terminal.
        </Text>
      </div>
    </div>
  );
}
