"use client";

import { useState } from "react";
import { CodeSnippet } from "@/app/(features)/components/source";
import { Button } from "@/components/control-ui/ui/button";
import { CodeCopy } from "@/components/control-ui/ui/code";
import { Input } from "@/components/control-ui/ui/input";
import { Label } from "@/components/control-ui/ui/label";
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
    <div className="mt-4 min-w-0 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="project-name" className="block">
          Project name
        </Label>
        <Input
          id="project-name"
          value={projectName}
          onChange={(event) => setProjectName(event.currentTarget.value)}
          autoComplete="off"
          maxLength={64}
          spellCheck={false}
          aria-describedby="project-name-hint"
        />
        <Text id="project-name-hint" as="p" size="caption" tone="muted">
          Creates the folder{" "}
          <Text as="code" size="caption" tone="foreground" className="font-mono">
            {normalizedProjectName}
          </Text>
          .
        </Text>
      </div>

      <fieldset className="space-y-2">
        <Text as="legend" size="label" weight="medium" tone="foreground">
          Package manager
        </Text>
        <div className="grid grid-cols-4 gap-1 rounded-[var(--radius-control)] bg-muted/60 p-1">
          {packageManagerIds.map((id) => (
            <Button
              key={id}
              type="button"
              variant="quiet"
              size="sm"
              active={packageManager === id}
              aria-pressed={packageManager === id}
              onClick={() => setPackageManager(id)}
              className="w-full"
            >
              {packageManagerLabels[id]}
            </Button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Text as="p" size="label" weight="medium" tone="foreground">
          Run this command
        </Text>
        <CodeSnippet code={command} highlight="none">
          <CodeCopy value={command} variant="solid" tone="primary" aria-label="Copy command" />
        </CodeSnippet>
        <Text as="p" size="caption" tone="muted" className="leading-relaxed">
          Dependencies install automatically. When Next.js is ready, open the Local URL printed in your terminal.
        </Text>
      </div>
    </div>
  );
}
