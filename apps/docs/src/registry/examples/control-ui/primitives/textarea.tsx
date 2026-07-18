"use client";

import { useState } from "react";

import { Textarea } from "@/components/control-ui/ui/textarea";

export function PrimitiveTextareaExample() {
  const [value, setValue] = useState("Summarize the thread, then draft a reply.");

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <label htmlFor="ta-prompt" className="text-[11px] font-medium text-muted-foreground">
        System prompt
      </label>
      <Textarea
        id="ta-prompt"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Describe how the agent should behave…"
      />
      <span className="text-[11px] text-muted-foreground">The box grows as you type — try adding a few lines.</span>
    </div>
  );
}
