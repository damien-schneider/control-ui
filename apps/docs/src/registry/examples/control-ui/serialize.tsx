"use client";

import { useState } from "react";

import { ChatComposer, ChatComposerShell, ChatComposerSubmit, ChatComposerToolbar } from "@/components/control-ui/chat-composer";
import { ChatComposerEditor } from "@/components/control-ui/chat-composer-editor";
import { mentionExtension } from "@/components/control-ui/chat-composer-editor/extensions/mention";
import type { ChatComposerSubmitPayload, MentionItem, TriggerConfig, TriggerMenuItemData } from "@/components/control-ui/contracts";

// Preview for `serializeDoc`: editor pushes serialized plain-text to ChatComposer value live; pressing
// Send surfaces the full payload (text + structured `mentions[]` from the mention extension).

const mentionSources: TriggerMenuItemData[] = [
  { id: "notion", label: "Notion", kind: "connector", description: "Connector", icon: "◈", keywords: ["docs", "wiki"] },
  { id: "sam", label: "Sam", kind: "user", description: "Teammate", icon: "🧑" },
  { id: "spec", label: "spec.md", kind: "file", description: "File", icon: "📄", keywords: ["doc"] },
];

const triggers: TriggerConfig[] = [{ char: "@", items: mentionSources }];

export function SerializeExample() {
  const [value, setValue] = useState("Draft the launch plan with the team");
  const [submitted, setSubmitted] = useState<{ text: string; mentions: MentionItem[] } | null>(null);
  const extensions = [mentionExtension({ triggers, side: "top" })];

  function handleSubmit({ value: text, mentions, clear }: ChatComposerSubmitPayload) {
    setSubmitted({ text, mentions: mentions ?? [] });
    clear();
  }

  return (
    <div className="grid gap-4 p-5">
      <ChatComposer value={value} onValueChange={setValue} onSubmit={handleSubmit}>
        <ChatComposerShell>
          <ChatComposerEditor placeholder="Type a message, then @mention someone…" extensions={extensions} />
          <ChatComposerToolbar>
            <span className="text-micro text-muted-foreground">Rich editor doc → plain text</span>
            <ChatComposerSubmit>Serialize</ChatComposerSubmit>
          </ChatComposerToolbar>
        </ChatComposerShell>
      </ChatComposer>

      <div className="grid gap-3 sm:grid-cols-2">
        <figure className="grid gap-1">
          <figcaption className="text-micro text-muted-foreground">Live serialized text (editor value)</figcaption>
          <pre className="min-h-16 overflow-x-auto rounded-lg border bg-muted/40 p-3 text-xs leading-5">{value || "…"}</pre>
        </figure>
        <figure className="grid gap-1">
          <figcaption className="text-micro text-muted-foreground">Last submitted payload</figcaption>
          <pre className="min-h-16 overflow-x-auto rounded-lg border bg-muted/40 p-3 text-xs leading-5">
            {submitted ? JSON.stringify(submitted, null, 2) : "Press Serialize to capture { text, mentions }"}
          </pre>
        </figure>
      </div>
    </div>
  );
}
