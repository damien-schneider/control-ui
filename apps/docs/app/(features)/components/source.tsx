"use client";

import { ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { SourceFile } from "@/app/(features)/model/types";
import { Code, CodeActions, CodeContent, CodeCopy, CodeHeader, CodeTitle } from "@/components/control-ui/ui/code";
import { CollapsibleContent, CollapsibleTrigger, Collapsible as UICollapsible } from "@/components/control-ui/ui/collapsible";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";

export function CodeBlock({ code, lang = "tsx", fileName }: { code: string; lang?: string; fileName?: string }) {
  return (
    <Code>
      {fileName ? (
        <CodeHeader>
          <CodeTitle>{fileName}</CodeTitle>
          <CodeActions>
            <CodeCopy value={code} />
          </CodeActions>
        </CodeHeader>
      ) : null}
      <CodeContent code={code} lang={lang} />
    </Code>
  );
}

export function CommandBlock({ label, command }: { label: string; command: string }) {
  return (
    <Code density="compact" overflow="wrap" className="my-0">
      <CodeHeader>
        <CodeTitle>{label}</CodeTitle>
        <CodeActions>
          <CodeCopy value={command} />
        </CodeActions>
      </CodeHeader>
      <CodeContent code={command} lang="bash" />
    </Code>
  );
}

export function DocsCollapsible({
  id,
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <UICollapsible id={id} defaultOpen={defaultOpen} className="min-w-0 scroll-mt-20 overflow-hidden rounded-xl border bg-background">
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left text-body font-medium transition-colors hover:bg-muted/30">
        <span>
          {title}
          {subtitle ? <span className="ml-2 font-normal text-muted-foreground">{subtitle}</span> : null}
        </span>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t">{children}</CollapsibleContent>
    </UICollapsible>
  );
}

function sourceFileName(path: string) {
  return path.split("/").at(-1) ?? path;
}

function languageForPath(path: string) {
  const extension = path.split(".").at(-1);

  if (extension === "tsx") return "tsx";
  if (extension === "ts") return "ts";
  if (extension === "jsx") return "jsx";
  if (extension === "js" || extension === "mjs") return "js";
  if (extension === "json") return "json";
  if (extension === "css") return "css";
  if (extension === "md" || extension === "mdx") return "markdown";

  return undefined;
}

export function SourceTabs({ files }: { files: SourceFile[] }) {
  const [activePath, setActivePath] = useState(files[0]?.path ?? "");
  const activeFile = files.find((file) => file.path === activePath) ?? files[0];
  const selectedPath = activeFile?.path ?? files[0]?.path ?? "";

  if (!activeFile) return null;

  return (
    <Tabs value={selectedPath} onValueChange={setActivePath}>
      <Code className="my-0">
        <ScrollArea className="border-b" scrollbarVisibility="hover">
          <div className="p-2">
            <TabsList className="w-max">
              {files.map((file) => (
                <TabsTab key={file.path} value={file.path}>
                  {sourceFileName(file.path)}
                </TabsTab>
              ))}
            </TabsList>
          </div>
        </ScrollArea>
        <CodeHeader>
          <div className="min-w-0">
            <div className="text-label font-medium">{activeFile.label}</div>
            <div className="truncate text-caption text-muted-foreground">{activeFile.path}</div>
          </div>
          <CodeActions>
            <CodeCopy value={activeFile.code} />
          </CodeActions>
        </CodeHeader>
        <TabsPanel key={activeFile.path} value={activeFile.path}>
          <CodeContent code={activeFile.code} lang={languageForPath(activeFile.path)} />
        </TabsPanel>
      </Code>
    </Tabs>
  );
}

export function PreviewTabs({
  anchorId = "preview",
  code,
  children,
  controls,
  previewClassName = "flex min-h-[280px] items-center justify-center",
}: {
  anchorId?: string | null;
  code: string;
  children: ReactNode;
  controls?: ReactNode;
  previewClassName?: string;
}) {
  const [tab, setTab] = useState("preview");

  return (
    <div id={anchorId ?? undefined} className="mb-8 min-w-0 scroll-mt-20 overflow-hidden rounded-xl border bg-background">
      <Tabs value={tab} onValueChange={setTab}>
        {/* Controls overlay the list instead of nesting in it: role="tablist" takes tabs only, and Base UI's composite keydown would eat their arrow keys. */}
        <div className="relative">
          <TabsList variant="browser" className="w-full rounded-none">
            <TabsTab value="preview">Preview</TabsTab>
            <TabsTab value="code">Code</TabsTab>
          </TabsList>
          {controls ? <div className="absolute inset-y-0 right-3 flex items-center justify-end gap-1.5">{controls}</div> : null}
        </div>
        <TabsPanel value="preview" className={previewClassName}>
          {children}
        </TabsPanel>
        <TabsPanel value="code">
          <Code chrome="embedded">
            <CodeContent code={code} lang="tsx" />
          </Code>
        </TabsPanel>
      </Tabs>
    </div>
  );
}
