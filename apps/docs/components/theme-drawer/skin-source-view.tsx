"use client";

import { BookOpenIcon, ChevronRightIcon, CodeXmlIcon, DownloadIcon, EyeIcon, FileCodeIcon, PaletteIcon, WrapTextIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, Suspense, useState } from "react";
import type { SourceFile } from "@/app/(features)/model/types";
import { Badge } from "@/components/control-ui/ui/badge";
import { Button, ButtonLink } from "@/components/control-ui/ui/button";
import { Card, CardContent } from "@/components/control-ui/ui/card";
import { Code, CodeActions, CodeContent, CodeCopy, CodeHeader, CodeTitle } from "@/components/control-ui/ui/code";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/control-ui/ui/empty";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Spinner } from "@/components/control-ui/ui/spinner";
import { Tabs, TabsList, TabsPanel, TabsSurface, TabsTab } from "@/components/control-ui/ui/tabs";
import { Toggle } from "@/components/control-ui/ui/toggle";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { ThemeModeSwitch } from "@/components/theme-toggle";
import { SKIN_META_BY_ID } from "./presets";
import type { SkinSourceState } from "./skin-source";
import { THEME_CATEGORIES } from "./theme-categories";
import { ThemeExport } from "./theme-export";
import type { SkinId } from "./types";

function SkinSourceBrowser({ files }: { files: SourceFile[] }) {
  const [activePath, setActivePath] = useState(files[0]?.path ?? "");
  const [wrap, setWrap] = useState(false);
  const file = files.find((item) => item.path === activePath) ?? files[0];
  if (!file) return null;
  const name = file.path.split("/").at(-1) ?? file.path;
  const language = name.split(".").at(-1) ?? "css";
  const description = file.label.split(" — ").slice(1).join(" — ");
  const lineCount = file.code.trimEnd().split("\n").length;

  return (
    <Tabs value={file.path} onValueChange={setActivePath} className="min-w-0">
      <ScrollArea>
        <TabsList aria-label="Source files" variant="browser" className="w-full">
          {files.map((item) => (
            <TabsTab key={item.path} value={item.path}>
              <FileCodeIcon aria-hidden />
              {item.path.split("/").at(-1)}
            </TabsTab>
          ))}
        </TabsList>
      </ScrollArea>
      <TabsSurface className="min-w-0">
        <Code overflow={wrap ? "wrap" : "scroll"} chrome="embedded">
          <CodeHeader className="flex-wrap gap-2">
            <CodeTitle title={file.path} className="min-w-0 flex-1">
              {description || name}
            </CodeTitle>
            <CodeActions>
              <Toggle size="xs" variant="quiet" aria-label="Wrap lines" pressed={wrap} onPressedChange={setWrap}>
                <WrapTextIcon aria-hidden />
                Wrap
              </Toggle>
              <ButtonLink
                render={<a href={`data:text/plain;charset=utf-8,${encodeURIComponent(file.code)}`} download={name} />}
                variant="quiet"
                size="xs"
                iconOnly
                aria-label={`Download ${name}`}
                title={`Download ${name}`}
              >
                <DownloadIcon aria-hidden />
              </ButtonLink>
              <CodeCopy value={file.code} />
            </CodeActions>
          </CodeHeader>
          <TabsPanel key={file.path} value={file.path}>
            <CodeContent code={file.code} lang={language} />
          </TabsPanel>
        </Code>
      </TabsSurface>
      <div className="mx-1 mt-2 flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <Text size="micro" tone="muted" mono className="min-w-0 truncate" title={file.path}>
          {file.path}
        </Text>
        <Text size="micro" tone="muted" numeric className="shrink-0">
          {language.toUpperCase()} · {lineCount.toLocaleString()} lines
        </Text>
      </div>
    </Tabs>
  );
}

function SkinSourceFiles({ label, source, onRetry }: { label: string; source: SkinSourceState; onRetry: () => void }) {
  if (source.status === "ready") return <SkinSourceBrowser files={source.files} />;

  if (source.status === "error") {
    return (
      <Empty variant="outline" role="alert" className="min-h-80">
        <EmptyHeader>
          <EmptyMedia>
            <FileCodeIcon aria-hidden />
          </EmptyMedia>
          <EmptyDescription>The {label} source could not be loaded.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="surface" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Empty variant="outline" role="status" className="min-h-80">
      <EmptyHeader>
        <EmptyMedia>
          <Spinner />
        </EmptyMedia>
        <EmptyDescription>Loading {label} source</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function SkinSourceGuide({ files }: { files: readonly Pick<SourceFile, "label" | "path" | "slot">[] }) {
  const packFiles = files.filter((file) => file.slot === "theme" || file.slot === "skin" || file.slot === "config");

  return (
    <Card size="sm">
      <CardContent>
        <Collapsible>
          <CollapsibleTrigger>
            <ChevronRightIcon aria-hidden />
            <Text size="caption" weight="medium" tone="foreground">
              About the skin files
            </Text>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <dl className="mt-4 grid gap-4 @2xl/source:grid-cols-3">
              {packFiles.map((file) => {
                const [name, role] = file.label.split(" — ");
                return (
                  <div key={file.path} className="min-w-0">
                    <Text as="dt" size="caption" weight="medium" tone="foreground" mono>
                      {name}
                    </Text>
                    <Text as="dd" size="caption" tone="muted" className="mt-1 text-pretty">
                      {role}
                    </Text>
                  </div>
                );
              })}
            </dl>
            <ButtonLink variant="link" size="xs" render={<Link href="/architecture" />} className="mt-4">
              How skin layers resolve
            </ButtonLink>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

export function SkinSourcePanel({ skin, source, onRetry }: { skin: SkinId; source: SkinSourceState; onRetry: () => void }) {
  const meta = SKIN_META_BY_ID[skin];

  return (
    <section id="theme-skin" aria-label={`${meta.label} source`} className="@container/source flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Heading level={2} size="heading-4">
            Skin source
          </Heading>
          <Badge variant="outline" size="sm">
            Read only
          </Badge>
        </div>
      </div>
      <SkinSourceFiles key={skin} label={meta.label} source={source} onRetry={onRetry} />
      <SkinSourceGuide files={meta.paths ?? []} />
    </section>
  );
}

type SkinWorkspaceProps = {
  skin: SkinId;
  source: SkinSourceState;
  onRetry: () => void;
  children: ReactNode;
};

export function SkinWorkspace(props: SkinWorkspaceProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-80 items-center justify-center">
          <Spinner aria-label="Loading skin workspace" />
        </div>
      }
    >
      <SkinWorkspaceContent {...props} />
    </Suspense>
  );
}

function SkinWorkspaceContent({ skin, source, onRetry, children }: SkinWorkspaceProps) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "source" ? "source" : "preview";
  const [previewVisited, setPreviewVisited] = useState(view === "preview");

  function changeView(nextView: string) {
    if (nextView === "preview") setPreviewVisited(true);
    const params = new URLSearchParams(searchParams.toString());
    if (nextView === "source") params.set("view", "source");
    else params.delete("view");
    const query = params.toString();
    window.history.replaceState(null, "", `/theme-editor${query ? `?${query}` : ""}`);
  }

  return (
    <section aria-label="Skin workspace" className="@container/workspace flex min-w-0 flex-col gap-5">
      <header className="flex flex-col gap-2 lg:hidden">
        <Text size="caption" weight="medium" tone="muted">
          Appearance
        </Text>
        <ThemeModeSwitch />
      </header>

      <Tabs value={view} onValueChange={changeView} className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList aria-label="Skin views">
            <TabsTab value="preview">
              <EyeIcon aria-hidden />
              Preview
            </TabsTab>
            <TabsTab value="source">
              <CodeXmlIcon aria-hidden />
              Source
            </TabsTab>
          </TabsList>
          <ButtonLink render={<Link href={`/skins/${skin}#source`} />} variant="quiet" size="sm">
            <BookOpenIcon aria-hidden />
            Skin documentation
          </ButtonLink>
        </div>
        <TabsPanel value="preview" keepMounted={previewVisited} className="min-w-0">
          <nav aria-label="Customize theme" className="mb-4 flex flex-wrap items-center gap-x-1 gap-y-2 lg:hidden">
            <Text size="caption" tone="muted" className="mr-2 inline-flex items-center gap-2">
              <PaletteIcon aria-hidden className="size-3.5" />
              Customize
            </Text>
            {THEME_CATEGORIES.filter((category) => category.id !== "skin").map((category) => (
              <ButtonLink
                key={category.id}
                render={<Link href={category.href} />}
                variant="quiet"
                size="xs"
                aria-label={`Edit ${category.title.toLowerCase()}`}
              >
                {category.title}
              </ButtonLink>
            ))}
          </nav>
          {children}
        </TabsPanel>
        <TabsPanel value="source" keepMounted className="flex min-w-0 flex-col gap-6">
          <ThemeExport />
          <SkinSourcePanel skin={skin} source={source} onRetry={onRetry} />
        </TabsPanel>
      </Tabs>
    </section>
  );
}
