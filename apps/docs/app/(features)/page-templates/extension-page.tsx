"use client";

import { SourceTabs } from "@/app/(features)/components/source";
import { registryInstallCommands } from "@/app/(features)/model/registry";
import type { DocsExtension } from "@/app/(features)/model/types";
import { Badge } from "@/components/control-ui/ui/badge";
import { hasExtensionDemo } from "./extension-demo-ids";
import { ExtensionDemo } from "./extension-demos";
import { InstallPanel, PageHeader, SectionCode, SectionTitle } from "./shared";

// Extension page: an optional installable layered on the library. The attach mode is the load-bearing fact —
// root extensions mount once and discover targets by anatomy; anchored extensions are activated from skin.config
// through a component-owned adornment anchor.
export function ExtensionPage({ extension }: { extension: DocsExtension }) {
  const commands = registryInstallCommands(extension.registryKind);
  const files = extension.supportFiles ? [extension.source, ...extension.supportFiles] : [extension.source];

  return (
    <section className="mx-auto min-w-0 w-full max-w-3xl px-5 py-12">
      <PageHeader label="Extensions" title={extension.name} summary={extension.summary} status={extension.status} />
      <div className="grid min-w-0 gap-10">
        {hasExtensionDemo(extension.id) ? (
          <section id="preview" className="min-w-0 scroll-mt-20">
            <SectionTitle
              title="Preview"
              description="Local demo scoped to this frame — real activation is skin-level, see Activation below."
            />
            <div className="min-w-0 rounded-xl border bg-background p-5">
              <ExtensionDemo extensionId={extension.id} />
            </div>
          </section>
        ) : null}
        <div id="attach" className="min-w-0 scroll-mt-20 rounded-xl border bg-background p-5">
          <p className="text-body leading-6 text-muted-foreground">
            <Badge variant="outline" size="sm" className="mr-2">
              {extension.attach === "anchored" ? "Anchored" : "Root-mounted"}
            </Badge>
            {extension.attach === "anchored" ? (
              <>
                Fills the <code>{extension.anchor}</code> anchor: the component owns the positioned wrapper (aria-hidden,
                pointer-events-none, paint-contained) and renders zero DOM until a skin.config fills it — install the item, activate it from
                skin.config, pay nothing anywhere else.
              </>
            ) : (
              <>
                Mounted once above its targets and attached through the emitted anatomy — no component imports it, and removing the item
                removes every byte. Not installed means no import, no listener, no cost.
              </>
            )}
          </p>
        </div>
        <InstallPanel commands={commands} manifestHref={`/r/${extension.registryKind}.json`} subtitle="registry">
          Installs to <code>{extension.target}</code>. Extensions are optional items layered on the library — no component bundle carries
          them.
        </InstallPanel>
        <SectionCode id="activation" title="Activation" description={extension.activation.description} code={extension.activation.code} />
        <section id="source" className="min-w-0 scroll-mt-20">
          <SectionTitle title="Source" description="Installed extension source" />
          <SourceTabs files={files} />
        </section>
      </div>
    </section>
  );
}
