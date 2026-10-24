"use client";

import type { DocsSkill, DocsSkillConcern } from "@/app/(features)/model/types";
import { Card, CardContent } from "@/components/control-ui/ui/card";
import { Text } from "@/components/control-ui/ui/typography";
import { AgentActions } from "./agent-actions";
import { PageHeader, SectionTitle } from "./shared";

export function SkillPage({ skill, concern }: { skill: DocsSkill; concern?: DocsSkillConcern }) {
  const label = concern ? `Skill / ${concern.title}` : "Skill";

  return (
    <section className="docs-article">
      <PageHeader label={label} title={skill.title} summary={skill.summary} actions={<AgentActions name={skill.title} />} />
      <div className="grid min-w-0 gap-8">
        <Card className="min-w-0">
          <CardContent>
            <Text as="div" size="caption" weight="medium" tone="muted">
              Goal
            </Text>
            <Text as="p" tone="foreground" className="mt-2">
              {skill.goal}
            </Text>
            {concern ? (
              <Text as="p" tone="muted" className="mt-3">
                {concern.summary}
              </Text>
            ) : null}
          </CardContent>
        </Card>

        <SkillRuleList id="checks" title="Checks" items={skill.checks} />
        <SkillRuleList id="avoid" title="Avoid" items={skill.avoid} muted />

        {skill.source ? (
          <section id="source" className="min-w-0 scroll-mt-20">
            <SectionTitle
              title="Source"
              description="Imported as local Control UI skill guidance, with this repo owning the final wording."
            />
            <div className="rounded-xl border bg-background p-5">
              <Text as="div" weight="medium" tone="foreground">
                {skill.source.label}
              </Text>
              <Text as="code" size="label" tone="muted" className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap">
                {skill.source.path}
              </Text>
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}

function SkillRuleList({ id, title, items, muted = false }: { id: string; title: string; items: readonly string[]; muted?: boolean }) {
  return (
    <section id={id} className="min-w-0 scroll-mt-20">
      <SectionTitle title={title} />
      <div className="grid gap-2">
        {items.map((item, index) => (
          <Card key={item} size="sm">
            <CardContent className="flex gap-3">
              <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full border bg-background">
                <Text size="caption" weight="medium" tone="muted">
                  {index + 1}
                </Text>
              </span>
              <Text tone={muted ? "muted" : "foreground"}>{item}</Text>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
