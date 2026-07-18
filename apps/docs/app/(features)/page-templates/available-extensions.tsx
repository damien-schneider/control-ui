"use client";

import Link from "next/link";
import { CodeBlock, CommandBlock } from "@/app/(features)/components/source";
import { registryInstallCommand } from "@/app/(features)/model/registry";
import type { ComponentId, DocsExtension, PrimitiveId } from "@/app/(features)/model/types";
import { Badge } from "@/components/control-ui/ui/badge";
import { hasExtensionDemo } from "./extension-demo-ids";
import { ExtensionDemo } from "./extension-demos";
import { SectionTitle } from "./shared";

// Extensions are optional items layered on the library, never part of the host's bundle — this panel only
// OFFERS the ones whose appliesTo names this page; installing the host alone ships none of them. Cards with
// a demo render it here so the main preview above stays exactly what the bare install looks like.
export function AvailableExtensions({ hostId, extensions }: { hostId: ComponentId | PrimitiveId; extensions: DocsExtension[] }) {
  const available = extensions.filter((extension) => extension.appliesTo?.some((id) => id === hostId));
  if (available.length === 0) return null;

  return (
    <section id="extensions" className="min-w-0 scroll-mt-20">
      <SectionTitle
        title="Available extensions"
        description="Optional, separately installed items this surface can host — not part of the component's bundle."
      />
      <div className="grid gap-4">
        {available.map((extension) => (
          <div key={extension.id} className="min-w-0 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <Link href={`/extensions/${extension.id}`} className="font-medium hover:underline">
                {extension.name}
              </Link>
              <Badge variant="outline" size="sm">
                {extension.attach === "anchored" ? "Anchored" : "Root-mounted"}
              </Badge>
            </div>
            <p className="mb-3 text-body leading-6 text-muted-foreground">{extension.summary}</p>
            {hasExtensionDemo(extension.id) ? (
              <div className="mb-3 min-w-0">
                <ExtensionDemo extensionId={extension.id} />
              </div>
            ) : null}
            <div className="grid gap-3">
              <CommandBlock label="Install" command={registryInstallCommand(extension.registryKind)} />
              <CodeBlock code={extension.activation.code} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
