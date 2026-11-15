"use client";

import { UtilPreview } from "@/app/(features)/components/previews";
import { SourceTabs } from "@/app/(features)/components/source";
import type { DocsUtil } from "@/app/(features)/model/types";
import { Card, CardContent } from "@/components/control-ui/ui/card";
import { Text } from "@/components/control-ui/ui/typography";
import { AgentActions } from "./agent-actions";
import { PageHeader, SectionStack, SectionTitle } from "./shared";

export function UtilPage({ util }: { util: DocsUtil }) {
  return (
    <section className="docs-article">
      <PageHeader label="Utils" title={util.name} summary={util.summary} actions={<AgentActions name={util.name} />} />
      <SectionStack>
        {util.hasPreview ? (
          <section id="preview" className="min-w-0 scroll-mt-20">
            <SectionTitle title="Preview" description="Standalone, independent of any one component" />
            <Card className="min-w-0">
              <CardContent>
                <UtilPreview utilId={util.id} />
              </CardContent>
            </Card>
          </section>
        ) : null}
        <Card id="install" className="min-w-0 scroll-mt-20">
          <CardContent>
            <Text as="p" tone="muted">
              Installed to <code>{util.target}</code> with {util.install ?? "every Control UI component"}, so the shared helper stays in one
              place.
            </Text>
          </CardContent>
        </Card>
        <section id="source" className="min-w-0 scroll-mt-20">
          <SectionTitle title="Source" description="Installed util source" />
          <SourceTabs files={[util.source]} />
        </section>
      </SectionStack>
    </section>
  );
}
