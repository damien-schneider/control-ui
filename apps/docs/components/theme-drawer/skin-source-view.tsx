"use client";

import { BookOpenIcon, CodeXmlIcon, DownloadIcon, EyeIcon, FileCodeIcon, PaletteIcon, WrapTextIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, Suspense, useState } from "react";
import type { SourceFile } from "@/app/(features)/model/types";
import { Badge } from "@/components/control-ui/ui/badge";
import { Button, ButtonLink } from "@/components/control-ui/ui/button";
import { Code, CodeActions, CodeContent, CodeCopy, CodeHeader, CodeTitle } from "@/components/control-ui/ui/code";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Spinner } from "@/components/control-ui/ui/spinner";
import { Tabs, TabsList, TabsPanel, TabsSurface, TabsTab } from "@/components/control-ui/ui/tabs";
import { Toggle } from "@/components/control-ui/ui/toggle";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { ThemeModeSwitch } from "@/components/theme-toggle";
import { SKIN_META_BY_ID } from "./presets";
import { SkinPresetControls } from "./skin-preset-controls";
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
              <FileCodeIcon aria-hidden className="size-3.5 shrink-0" />
              {item.path.split("/").at(-1)}
            </TabsTab>
          ))}
        </TabsList>
      </ScrollArea>
      <TabsSurface className="-mt-px min-w-0">
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
      <Text as="div" size="micro" tone="muted" className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 pt-2">
        <span className="min-w-0 truncate font-mono" title={file.path}>
          {file.path}
        </span>
        <span className="shrink-0">
          {language.toUpperCase()} · {lineCount.toLocaleString()} lines
        </span>
      </Text>
    </Tabs>
  );
}

function SkinSourceFiles({ label, source, onRetry }: { label: string; source: SkinSourceState; onRetry: () => void }) {
  if (source.status === "ready") return <SkinSourceBrowser files={source.files} />;

  if (source.status === "error") {
    return (
      <div
        role="alert"
        className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-(--radius-panel) border border-border bg-card px-6 text-center"
      >
        <FileCodeIcon aria-hidden className="size-6 text-muted-foreground" />
        <Text as="p" size="label" tone="muted">
          The {label} source could not be loaded.
        </Text>
        <Button variant="surface" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <Text
      role="status"
      as="div"
      size="label"
      tone="muted"
      className="flex min-h-80 items-center justify-center gap-2 rounded-(--radius-panel) border border-border bg-card"
    >
      <Spinner />
      Loading {label} source
    </Text>
  );
}

export function SkinSourceGuide({ files }: { files: readonly Pick<SourceFile, "label" | "path" | "slot">[] }) {
  const packFiles = files.filter((file) => file.slot === "theme" || file.slot === "skin" || file.slot === "config");

  return (
    <details className="rounded-(--radius-panel) border border-border bg-muted/30 px-4 py-3">
      <summary className="cursor-pointer text-caption font-medium text-foreground">About the skin files</summary>
      <dl className="mt-4 grid gap-4 @2xl/source:grid-cols-3">
        {packFiles.map((file) => {
          const [name, role] = file.label.split(" — ");
          return (
            <div key={file.path} className="min-w-0">
              <Text as="dt" size="caption" weight="medium" tone="foreground" className="font-mono">
                {name}
              </Text>
              <Text as="dd" size="caption" tone="muted" className="mt-1 text-pretty">
                {role}
              </Text>
            </div>
          );
        })}
      </dl>
      <Link href="/architecture" className="mt-4 inline-block text-caption text-primary-text underline underline-offset-4">
        How skin layers resolve
      </Link>
    </details>
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
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 lg:hidden">
        <div className="flex min-w-0 flex-col gap-2">
          <Text size="caption" weight="medium" tone="muted">
            Skin preset
          </Text>
          <SkinPresetControls label="Skin preset" className="w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Text size="caption" weight="medium" tone="muted">
            Appearance
          </Text>
          <ThemeModeSwitch />
        </div>
      </header>

      <Tabs value={view} onValueChange={changeView} className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <TabsList aria-label="Skin views">
            <TabsTab value="preview">
              <EyeIcon aria-hidden className="size-4" />
              Preview
            </TabsTab>
            <TabsTab value="source">
              <CodeXmlIcon aria-hidden className="size-4" />
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
