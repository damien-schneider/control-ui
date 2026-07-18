"use client";

import { UtilPreview } from "@/app/(features)/components/previews";
import { SourceTabs } from "@/app/(features)/components/source";
import type { DocsUtil } from "@/app/(features)/model/types";
import { PageHeader, SectionTitle } from "./shared";

export function UtilPage({ util }: { util: DocsUtil }) {
  return (
    <section className="mx-auto min-w-0 w-full max-w-3xl px-5 py-12">
      <PageHeader label="Utils" title={util.name} summary={util.summary} />
      <div className="grid min-w-0 gap-10">
        {util.hasPreview ? (
          <section id="preview" className="min-w-0 scroll-mt-20">
            <SectionTitle title="Preview" description="Standalone, independent of any one component" />
            <div className="min-w-0 overflow-hidden rounded-xl border bg-background">
              <UtilPreview utilId={util.id} />
            </div>
          </section>
        ) : null}
        <div id="install" className="min-w-0 scroll-mt-20 rounded-xl border bg-background p-5">
          <p className="text-body leading-6 text-muted-foreground">
            Installed to <code>{util.target}</code> with {util.install ?? "every Control UI component"}, so the shared helper stays in one
            place.
          </p>
        </div>
        <section id="source" className="min-w-0 scroll-mt-20">
          <SectionTitle title="Source" description="Installed util source" />
          <SourceTabs files={[util.source]} />
        </section>
      </div>
    </section>
  );
}
