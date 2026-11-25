"use client";

import { IntentLink } from "@/app/(features)/client/intent-link";
import { SourceTabs } from "@/app/(features)/components/source";
import type { DocsHook } from "@/app/(features)/model/types";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { Card, CardContent } from "@/components/control-ui/ui/card";
import { Text } from "@/components/control-ui/ui/typography";
import { AgentActions } from "./agent-actions";
import { PageHeader, SectionStack, SectionTitle } from "./shared";

export function HookPage({ hook }: { hook: DocsHook }) {
  return (
    <section className="docs-article">
      <PageHeader label="Hooks" title={hook.name} summary={hook.summary} actions={<AgentActions name={hook.name} />} />
      <SectionStack>
        <Card id="install" className="min-w-0 scroll-mt-20">
          <CardContent>
            <Text as="p" tone="muted">
              Installed to <code>{hook.target}</code> with {hook.install}. It is local UI behavior — yours to own and edit.
            </Text>
            {hook.references && hook.references.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {hook.references.map((reference) => (
                  <ButtonLink key={reference.href} render={<IntentLink href={reference.href} />} variant="surface" size="sm">
                    Used by {reference.label}
                  </ButtonLink>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
        <section id="source" className="min-w-0 scroll-mt-20">
          <SectionTitle title="Source" description="Installed hook source" />
          <SourceTabs files={[hook.source]} />
        </section>
      </SectionStack>
    </section>
  );
}
