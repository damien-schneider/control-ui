"use client";

import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { Code, CodeActions, CodeContent, CodeCopy, CodeHeader, CodeTitle } from "@/components/control-ui/ui/code";
import { Input } from "@/components/control-ui/ui/input";
import { createAppCommand, normalizeProjectName, type PackageManagerId, packageManagerIds } from "./command";

const packageManagerLabels: Record<PackageManagerId, string> = {
  npm: "npm",
  pnpm: "pnpm",
  yarn: "Yarn",
  bun: "Bun",
};

export function CreateCommand({ registryBaseUrl }: { registryBaseUrl: string }) {
  const [projectName, setProjectName] = useState("my-control-ui-app");
  const [packageManager, setPackageManager] = useState<PackageManagerId>("npm");
  const normalizedProjectName = normalizeProjectName(projectName);
  const command = createAppCommand({ packageManager, projectName, registryBaseUrl });

  return (
    <div className="min-w-0 space-y-6">
      <div className="space-y-2">
        <label htmlFor="project-name" className="block text-label font-medium text-foreground">
          Project name
        </label>
        <Input
          id="project-name"
          value={projectName}
          onChange={(event) => setProjectName(event.currentTarget.value)}
          autoComplete="off"
          maxLength={64}
          spellCheck={false}
          aria-describedby="project-name-hint"
        />
        <p id="project-name-hint" className="text-caption text-muted-foreground">
          Creates the folder <code className="font-mono text-foreground">{normalizedProjectName}</code>.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-label font-medium text-foreground">Package manager</legend>
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
        <p className="text-label font-medium text-foreground">Run this command</p>
        <Code density="compact" className="my-0">
          <CodeHeader>
            <CodeTitle>Terminal</CodeTitle>
            <CodeActions>
              <CodeCopy value={command} variant="solid" tone="primary" aria-label="Copy command" />
            </CodeActions>
          </CodeHeader>
          <CodeContent code={command} lang="bash" highlight="none" />
        </Code>
        <p className="text-caption leading-relaxed text-muted-foreground">
          Dependencies install automatically. When Next.js is ready, open the Local URL printed in your terminal.
        </p>
      </div>
    </div>
  );
}
