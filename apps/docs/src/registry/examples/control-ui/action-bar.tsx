"use client";

import { useState } from "react";

import { ActionBar, ActionBarCopy, ActionBarEdit, ActionBarItem } from "@/components/control-ui/action-bar";
import { assistantCopy, userPrompt } from "../shared";

export function ActionBarExample() {
  const [draft, setDraft] = useState(userPrompt);
  const [isEditing, setIsEditing] = useState(false);

  function startEditing(value: string) {
    setDraft(value);
    setIsEditing(true);
  }

  return (
    <div className="p-6">
      <ActionBar label="Response actions" copyValue={assistantCopy}>
        <ActionBarCopy />
        <ActionBarItem>Share</ActionBarItem>
        <ActionBarItem>More</ActionBarItem>
      </ActionBar>
      <div className="mt-8 flex justify-end">
        <ActionBar align="end" label="Your message actions" copyValue={draft} editValue={draft} onEdit={startEditing}>
          <ActionBarCopy />
          <ActionBarEdit />
        </ActionBar>
      </div>
      {isEditing ? (
        <textarea
          aria-label="Editable message"
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          className="mt-3 min-h-16 w-full resize-none rounded-[18px] border bg-white/80 p-3 text-sm outline-none"
        />
      ) : null}
    </div>
  );
}
