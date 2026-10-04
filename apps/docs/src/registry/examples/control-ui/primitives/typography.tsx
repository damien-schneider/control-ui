"use client";

import { Heading, Text } from "@/components/control-ui/ui/typography";

export function TypographyTokensExample() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <Text as="p" size="display">
        Display — page titles &amp; heroes
      </Text>
      <Heading level={1}>Heading 1 — content h1</Heading>
      <Heading level={2}>One rung per size, named by role</Heading>
      <Heading level={3}>Level picks the tag, size defaults to the matching rung</Heading>
      <Heading level={4}>One class per heading: face, weight, and balance ride along</Heading>
      <Heading level={3} size="heading-2" tone="muted">
        An h3 wearing heading-2: level is the outline, size is the look
      </Heading>
      <Text as="p" size="body-lg">
        Body large sets the emphasized reading size — intros, lead paragraphs, and anywhere copy needs a little more presence than the
        default.
      </Text>
      <Text as="p">
        Body is the default for paragraphs, controls, and most of the interface. The five boxing wizards jump quickly, and the quick brown
        fox jumps over the lazy dog.
      </Text>
      <Text as="p" size="label" tone="muted">
        Label — form labels and small chrome.
      </Text>
      <Text as="p" size="caption" tone="muted">
        Caption — overlines, timestamps, and group labels.
      </Text>
      <Text as="p" size="micro" tone="muted">
        Micro — keycaps, badge counters, and dense metadata.
      </Text>
      <p className="text-body">A native tag may still wear one rung directly when no component is wanted.</p>
    </div>
  );
}
