"use client";

import type { DocsSkill, DocsSkillConcern } from "@/app/(features)/model/types";
import { Card } from "@/components/control-ui/ui/card";
import { PageHeader, SectionTitle } from "./shared";

export function SkillPage({ skill, concern }: { skill: DocsSkill; concern?: DocsSkillConcern }) {
  const label = concern ? `Skill / ${concern.title}` : "Skill";

  return (
    <section className="docs-article">
      <PageHeader label={label} title={skill.title} summary={skill.summary} />
      <div className="grid min-w-0 gap-8">
        <Card className="min-w-0 gap-0 p-5">
          <div className="text-label font-medium uppercase tracking-[0.08em] text-muted-foreground">Goal</div>
          <p className="mt-2 text-body leading-6 text-foreground">{skill.goal}</p>
          {concern ? <p className="mt-3 text-body leading-6 text-muted-foreground">{concern.summary}</p> : null}
        </Card>

        <SkillRuleList id="checks" title="Checks" items={skill.checks} />
        <SkillRuleList id="avoid" title="Avoid" items={skill.avoid} muted />

        {skill.source ? (
          <section id="source" className="min-w-0 scroll-mt-20">
            <SectionTitle
              title="Source"
              description="Imported as local Control UI skill guidance, with this repo owning the final wording."
            />
            <div className="rounded-xl border bg-background p-5 text-body leading-6 text-muted-foreground">
              <div className="font-medium text-foreground">{skill.source.label}</div>
              <code className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap text-label">{skill.source.path}</code>
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
          <Card key={item} className="flex-row gap-3 px-4 py-3 text-body leading-6">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border bg-background text-caption font-medium text-muted-foreground">
              {index + 1}
            </span>
            <span className={muted ? "text-muted-foreground" : "text-foreground"}>{item}</span>
          </Card>
        ))}
      </div>
    </section>
  );
}
