"use client";

import { useState } from "react";

import { Textarea } from "@/components/control-ui/ui/textarea";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveTextareaExample() {
  const [value, setValue] = useState("Summarize the thread, then draft a reply.");

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <label htmlFor="ta-prompt" className="text-caption font-medium text-muted-foreground">
        System prompt
      </label>
      <Textarea
        id="ta-prompt"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Describe how the agent should behave…"
      />
      <Text size="caption" tone="muted">
        The box grows as you type — try adding a few lines.
      </Text>
    </div>
  );
}
