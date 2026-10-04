"use client";

import { useId } from "react";
import type { DocsComponentChoice } from "@/app/(features)/model/types";
import { Radio, RadioGroup, RadioGroupItem } from "@/components/control-ui/ui/radio-group";
import { Heading, Text } from "@/components/control-ui/ui/typography";

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
  return (
    <section id={kind === "alternative" ? "alternatives" : "variants"} aria-labelledby={`${id}-title`} className="mb-6 scroll-mt-20">
      <Heading level={2} id={`${id}-title`} className="mb-3">
        {title}
      </Heading>
      <RadioGroup
        value={activeId}
        onValueChange={onPick}
        disabled={!onPick}
        orientation="horizontal"
        aria-labelledby={`${id}-title`}
        className="flex-wrap"
      >
        {choices.map((choice) => (
          <RadioGroupItem key={choice.id}>
            <Radio value={choice.id} aria-labelledby={`${id}-${choice.id}-label`} />
            <Text id={`${id}-${choice.id}-label`}>{choice.label}</Text>
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </section>
  );
}
