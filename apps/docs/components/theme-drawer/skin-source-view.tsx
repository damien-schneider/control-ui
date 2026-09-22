"use client";

import Link from "next/link";
import { SourceTabs } from "@/app/(features)/components/source";
import { Button } from "@/components/control-ui/ui/button";
import { Spinner } from "@/components/control-ui/ui/spinner";
import { SKIN_META_BY_ID } from "./presets";
import type { SkinSourceState } from "./skin-source";
import type { SkinId } from "./types";

function SkinSourceFiles({ label, source, onRetry }: { label: string; source: SkinSourceState; onRetry: () => void }) {
  if (source.status === "ready") return <SourceTabs files={source.files} overflow="wrap" />;

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

export function SkinSourcePanel({ skin, source, onRetry }: { skin: SkinId; source: SkinSourceState; onRetry: () => void }) {
  const meta = SKIN_META_BY_ID[skin];
  const packFiles = meta.paths?.filter((file) => file.slot === "theme" || file.slot === "skin" || file.slot === "config") ?? [];

  return (
    <section id="theme-skin" aria-labelledby="theme-skin-title" className="flex min-w-0 flex-col gap-4">
      <header className="min-w-0">
        <h2 id="theme-skin-title" className="text-heading-4 font-semibold text-foreground">
          {meta.label}
        </h2>
        <p className="mt-1 text-caption text-pretty text-muted-foreground">{meta.description}</p>
        <p className="mt-2 text-micro text-muted-foreground">
          Switch skins from the sidebar picker.{" "}
          <Link href="/architecture" className="text-foreground underline underline-offset-2">
            How skin layers resolve
          </Link>
        </p>
      </header>

      <dl className="grid gap-2 border-border/70 border-y py-3">
        {packFiles.map((file) => {
          const [name, role] = file.label.split(" — ");
          return (
            <div key={file.path} className="min-w-0">
              <dt className="font-mono text-micro font-medium text-foreground">{name}</dt>
              <dd className="text-micro leading-4 text-muted-foreground">{role}</dd>
            </div>
          );
        })}
      </dl>

      <SkinSourceFiles label={meta.label} source={source} onRetry={onRetry} />
    </section>
  );
}
