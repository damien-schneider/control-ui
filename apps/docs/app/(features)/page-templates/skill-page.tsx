"use client";

import type { DocsSkill, DocsSkillConcern } from "@/app/(features)/model/types";
import { Card } from "@/components/control-ui/ui/card";
import { Text } from "@/components/control-ui/ui/typography";
import { PageHeader, SectionTitle } from "./shared";

export function SkillPage({ skill, concern }: { skill: DocsSkill; concern?: DocsSkillConcern }) {
  const label = concern ? `Skill / ${concern.title}` : "Skill";

  return (
    <section className="docs-article">
      <PageHeader label={label} title={skill.title} summary={skill.summary} />
      <div className="grid min-w-0 gap-8">
        <Card className="min-w-0 gap-0 p-5">
          <Text as="div" size="label" weight="medium" tone="muted" className="uppercase tracking-[0.08em]">
            Goal
          </Text>
          <Text as="p" tone="foreground" className="mt-2 leading-6">
            {skill.goal}
          </Text>
          {concern ? (
            <Text as="p" tone="muted" className="mt-3 leading-6">
              {concern.summary}
            </Text>
          ) : null}
        </Card>

        <SkillRuleList id="checks" title="Checks" items={skill.checks} />
        <SkillRuleList id="avoid" title="Avoid" items={skill.avoid} muted />

        {skill.source ? (
          <section id="source" className="min-w-0 scroll-mt-20">
            <SectionTitle
              title="Source"
              description="Imported as local Control UI skill guidance, with this repo owning the final wording."
            />
            <Text as="div" tone="muted" className="rounded-xl border bg-background p-5 leading-6">
              <Text as="div" weight="medium" tone="foreground">
                {skill.source.label}
              </Text>
              <code className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap text-label">{skill.source.path}</code>
            </Text>
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
          <Card key={item} className="flex-row gap-3 px-4 py-3 text-body leading-6">
            <Text
              size="caption"
              weight="medium"
              tone="muted"
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border bg-background"
            >
              {index + 1}
            </Text>
            <span className={muted ? "text-muted-foreground" : "text-foreground"}>{item}</span>
          </Card>
        ))}
      </div>
    </section>
  );
}
