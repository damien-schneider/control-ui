"use client";

import Link from "next/link";
import { SourceTabs } from "@/app/(features)/components/source";
import type { DocsHook } from "@/app/(features)/model/types";
import { PageHeader, SectionTitle } from "./shared";

export function HookPage({ hook }: { hook: DocsHook }) {
  return (
    <section className="mx-auto min-w-0 w-full max-w-3xl px-5 py-12">
      <PageHeader label="Hooks" title={hook.name} summary={hook.summary} />
      <div className="grid min-w-0 gap-10">
        <div id="install" className="min-w-0 scroll-mt-20 rounded-xl border bg-background p-5">
          <p className="text-body leading-6 text-muted-foreground">
            Installed to <code>{hook.target}</code> with {hook.install}. It is local UI behavior — yours to own and edit.
          </p>
          {hook.references && hook.references.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {hook.references.map((reference) => (
                <Link
                  key={reference.href}
                  href={reference.href}
                  className="inline-flex h-8 items-center rounded-md border bg-background px-3 text-label font-medium transition hover:bg-muted"
                >
                  Used by {reference.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        <section id="source" className="min-w-0 scroll-mt-20">
          <SectionTitle title="Source" description="Installed hook source" />
          <SourceTabs files={[hook.source]} />
        </section>
      </div>
    </section>
  );
}
