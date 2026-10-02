"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { SourceTabs } from "@/app/(features)/components/source";
import type { SourceFile } from "@/app/(features)/model/types";
import { Button, ButtonLink } from "@/components/control-ui/ui/button";
import { Spinner } from "@/components/control-ui/ui/spinner";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";
import { SKIN_META_BY_ID } from "./presets";
import type { SkinSourceState } from "./skin-source";
import type { SkinId } from "./types";

function SkinSourceFiles({ label, source, onRetry }: { label: string; source: SkinSourceState; onRetry: () => void }) {
  if (source.status === "ready") return <SourceTabs files={source.files} overflow="scroll" />;

  if (source.status === "error") {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-label text-muted-foreground">The {label} source could not be loaded.</p>
        <Button variant="surface" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-40 items-center justify-center gap-2 text-label text-muted-foreground">
      <Spinner />
      Loading {label} source
    </div>
  );
}

export function SkinSourceGuide({ files }: { files: readonly Pick<SourceFile, "label" | "path" | "slot">[] }) {
  const packFiles = files.filter((file) => file.slot === "theme" || file.slot === "skin" || file.slot === "config");

  return (
    <details className="border-border/70 border-y py-3">
      <summary className="cursor-pointer text-caption font-medium text-foreground">About the skin files</summary>
      <dl className="mt-4 grid gap-4 @2xl/source:grid-cols-3">
        {packFiles.map((file) => {
          const [name, role] = file.label.split(" — ");
          return (
            <div key={file.path} className="min-w-0">
              <dt className="font-mono text-caption font-medium text-foreground">{name}</dt>
              <dd className="mt-1 text-caption text-pretty text-muted-foreground">{role}</dd>
            </div>
          );
        })}
      </dl>
    </details>
  );
}

export function SkinSourcePanel({ skin, source, onRetry }: { skin: SkinId; source: SkinSourceState; onRetry: () => void }) {
  const meta = SKIN_META_BY_ID[skin];

  return (
    <section id="theme-skin" aria-label={`${meta.label} source`} className="@container/source flex min-w-0 flex-col gap-5">
      <SkinSourceGuide files={meta.paths ?? []} />
      <SkinSourceFiles label={meta.label} source={source} onRetry={onRetry} />
    </section>
  );
}

type SkinWorkspaceProps = {
  skin: SkinId;
  source: SkinSourceState;
  onRetry: () => void;
  actions: ReactNode;
  children: ReactNode;
};

export function SkinWorkspace(props: SkinWorkspaceProps) {
  return (
    <Suspense fallback={<Spinner aria-label="Loading skin workspace" />}>
      <SkinWorkspaceContent {...props} />
    </Suspense>
  );
}

function SkinWorkspaceContent({ skin, source, onRetry, actions, children }: SkinWorkspaceProps) {
  const meta = SKIN_META_BY_ID[skin];
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "source" ? "source" : "preview";

  function changeView(nextView: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextView === "source") params.set("view", "source");
    else params.delete("view");
    const query = params.toString();
    window.history.replaceState(null, "", `/theme-editor${query ? `?${query}` : ""}`);
  }

  return (
    <section aria-label="Skin workspace" className="flex min-w-0 flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <h2 className="text-heading-2 font-display text-foreground">{meta.label}</h2>
          <p className="mt-2 text-body text-pretty text-muted-foreground">{meta.description}</p>
        </div>
        <ButtonLink render={<Link href={`/skins/${skin}#source`} />} variant="surface" size="sm">
          Skin documentation
        </ButtonLink>
      </header>

      <Tabs value={view} onValueChange={changeView} className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <TabsList aria-label="Skin views">
            <TabsTab value="preview">Preview</TabsTab>
            <TabsTab value="source">Source</TabsTab>
          </TabsList>
          {actions}
        </div>
        <TabsPanel value="preview" className="min-w-0">
          {children}
        </TabsPanel>
        <TabsPanel value="source" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-heading-4 font-display">Skin source</h3>
            <Link href="/architecture" className="text-caption text-muted-foreground underline underline-offset-4 hover:text-foreground">
              How skin layers resolve
            </Link>
          </div>
          <SkinSourcePanel skin={skin} source={source} onRetry={onRetry} />
        </TabsPanel>
      </Tabs>
    </section>
  );
}
