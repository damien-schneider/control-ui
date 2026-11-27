"use client";

import { CodeIcon, PackageIcon } from "lucide-react";
import { useId, useState } from "react";
import { Code, CodeContent } from "@/components/control-ui/ui/code";
import { Tabs, TabsList, TabsPanel, TabsSurface, TabsTab } from "@/components/control-ui/ui/tabs";
import { Text } from "@/components/control-ui/ui/typography";

export type InstallMethod = { id: string; label: string; command: string; note: string };

const methodIcons = { package: PackageIcon, source: CodeIcon } as const;

function isMethodIcon(id: string): id is keyof typeof methodIcons {
  return Object.hasOwn(methodIcons, id);
}

function MethodIcon({ id }: { id: string }) {
  const Icon = isMethodIcon(id) ? methodIcons[id] : PackageIcon;
  return <Icon aria-hidden="true" />;
}

export function InstallSwitch({ methods }: { methods: readonly [InstallMethod, ...InstallMethod[]] }) {
  const noteId = useId();
  const [activeId, setActiveId] = useState(methods[0].id);
  const active = methods.find((method) => method.id === activeId) ?? methods[0];

  return (
    <div className="grid min-w-0 justify-items-start gap-2.5">
      <Tabs value={active.id} onValueChange={setActiveId} className="max-w-full min-w-0 @3xl/home:min-w-80">
        <TabsList aria-label="Install method" aria-describedby={noteId} variant="browser" className="w-full">
          {methods.map((method) => (
            <TabsTab key={method.id} value={method.id}>
              <MethodIcon id={method.id} />
              {method.label}
            </TabsTab>
          ))}
        </TabsList>
        <TabsSurface className="min-w-0">
          <TabsPanel key={active.id} value={active.id}>
            <Code overflow="wrap" chrome="embedded">
              <CodeContent
                code={active.command}
                lang="bash"
                highlight="none"
                copyLabel={`Copy the ${active.label.toLowerCase()} install command`}
              />
            </Code>
          </TabsPanel>
        </TabsSurface>
      </Tabs>
      <Text as="p" id={noteId} size="label" tone="muted">
        {active.note}
      </Text>
    </div>
  );
}
