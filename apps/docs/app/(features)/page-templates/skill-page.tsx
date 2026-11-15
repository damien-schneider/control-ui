"use client";

import type { DocsSkill, DocsSkillConcern } from "@/app/(features)/model/types";
import { Badge } from "@/components/control-ui/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
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
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle>{skill.source.label}</CardTitle>
                <CardDescription>
                  <Text as="code" mono className="block truncate">
                    {skill.source.path}
                  </Text>
                </CardDescription>
              </CardHeader>
            </Card>
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
              <Badge variant="outline" size="sm" className="mt-px">
                {index + 1}
              </Badge>
              <Text tone={muted ? "muted" : "foreground"}>{item}</Text>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
