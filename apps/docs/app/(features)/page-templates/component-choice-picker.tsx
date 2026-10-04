"use client";

import Link from "next/link";
import { useId } from "react";
import type { DocsComponentChoice } from "@/app/(features)/model/types";
import { Radio, RadioGroup, RadioGroupItem } from "@/components/control-ui/ui/radio-group";
import { Text } from "@/components/control-ui/ui/typography";

export function ComponentChoicePicker({
  kind,
  choices,
  activeId,
  onPick,
}: {
  kind: "alternative" | "variant";
  choices: DocsComponentChoice[];
  activeId: string;
  onPick?: (id: string) => void;
}) {
  const id = useId();
  const title = kind === "alternative" ? "Alternatives" : "Variants";
  const description =
    kind === "alternative"
      ? "Choose an implementation for your project. The install command and import follow your selection."
      : "Choose an appearance per instance using the variant prop. All variants share one installation.";

  return (
    <section id={kind === "alternative" ? "alternatives" : "variants"} aria-labelledby={`${id}-title`} className="mb-6 scroll-mt-20">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={`${id}-title`} className="text-body font-medium">
          {title}
        </h2>
        <Link href="/architecture#component-choices" className="text-caption text-muted-foreground underline underline-offset-4">
          How choices differ
        </Link>
        <Text as="p" id={`${id}-description`} size="caption" tone="muted" className="w-full">
          {description}
        </Text>
      </div>
      <RadioGroup
        value={activeId}
        onValueChange={onPick}
        disabled={!onPick}
        orientation="horizontal"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        className="flex-wrap gap-2"
      >
        {choices.map((choice, index) => (
          <RadioGroupItem
            key={choice.id}
            className="min-w-0 basis-full rounded-(--radius-panel) border border-border p-3 has-[[data-checked]]:border-foreground/40 has-[[data-checked]]:bg-muted/50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring sm:basis-0 sm:flex-1"
          >
            <Radio value={choice.id} aria-labelledby={`${id}-${choice.id}-label`} aria-describedby={`${id}-${choice.id}-description`} />
            <span className="grid min-w-0 gap-1">
              <Text id={`${id}-${choice.id}-label`} size="label" weight="medium" className="flex flex-wrap items-baseline gap-x-2">
                {choice.label}
                {index === 0 ? (
                  <Text aria-hidden="true" size="micro" weight="normal" tone="muted">
                    Default
                  </Text>
                ) : null}
              </Text>
              <Text id={`${id}-${choice.id}-description`} size="caption" tone="muted">
                {choice.description}
              </Text>
            </span>
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </section>
  );
}
