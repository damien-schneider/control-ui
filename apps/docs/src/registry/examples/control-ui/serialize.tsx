"use client";

import { useState } from "react";

import { ChatComposer, ChatComposerShell, ChatComposerSubmit, ChatComposerToolbar } from "@/components/control-ui/chat-composer";
import { ChatComposerEditor } from "@/components/control-ui/chat-composer-editor";
import { mentionExtension } from "@/components/control-ui/chat-composer-editor/extensions/mention";
import type { ChatComposerSubmitPayload, MentionItem } from "@/components/control-ui/hooks/use-chat-composer";
import type { TriggerConfig, TriggerMenuItemData } from "@/components/control-ui/hooks/use-trigger-menu";
import { Code, CodeContent } from "@/components/control-ui/ui/code";
import { Text } from "@/components/control-ui/ui/typography";

// Preview for `serializeDoc`: editor pushes serialized plain-text to ChatComposer value live; pressing
// Send surfaces full payload (text + structured `mentions[]` from mention extension).

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
    <div className="grid gap-4">
      <ChatComposer value={value} onValueChange={setValue} onSubmit={handleSubmit}>
        <ChatComposerShell>
          <ChatComposerEditor placeholder="Type a message, then @mention someone…" extensions={extensions} />
          <ChatComposerToolbar>
            <Text size="micro" tone="muted">
              Rich editor doc → plain text
            </Text>
            <ChatComposerSubmit>Serialize</ChatComposerSubmit>
          </ChatComposerToolbar>
        </ChatComposerShell>
      </ChatComposer>

      <div className="grid gap-3 sm:grid-cols-2">
        <figure className="grid gap-1">
          <Text as="figcaption" size="micro" tone="muted">
            Live serialized text (editor value)
          </Text>
          <Code overflow="wrap">
            <CodeContent code={value || "…"} />
          </Code>
        </figure>
        <figure className="grid gap-1">
          <Text as="figcaption" size="micro" tone="muted">
            Last submitted payload
          </Text>
          <Code overflow="wrap">
            <CodeContent
              code={submitted ? JSON.stringify(submitted, null, 2) : "Press Serialize to capture { text, mentions }"}
              lang={submitted ? "json" : undefined}
            />
          </Code>
        </figure>
      </div>
    </div>
  );
}
