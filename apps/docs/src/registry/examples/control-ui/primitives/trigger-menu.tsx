"use client";

import { useRef, useState } from "react";

import type { TriggerConfig, TriggerMenuItemData } from "@/components/control-ui/contracts";
import { useTextareaTriggerMenu } from "@/components/control-ui/hooks/use-textarea-trigger-menu";
import { TriggerMenu, TriggerMenuEmpty, TriggerMenuIcon, TriggerMenuItem, TriggerMenuList } from "@/components/control-ui/ui/trigger-menu";

// Standalone: trigger-menu driving a plain <textarea>, no editor/chat-input; one `triggers` config
// powers both "/" and "@".
const commands: TriggerMenuItemData[] = [
  { id: "summarize", label: "Summarize", description: "Condense the thread", icon: "✦" },
  { id: "translate", label: "Translate", description: "To another language", icon: "🌐" },
  { id: "rewrite", label: "Rewrite", description: "Improve the tone", icon: "✎" },
  { id: "code", label: "Explain code", description: "Walk through a snippet", icon: "{}" },
];

const people: TriggerMenuItemData[] = [
  { id: "notion", label: "Notion", description: "Connector", icon: "◈", keywords: ["docs", "wiki"] },
  { id: "sam", label: "Sam", description: "Teammate", icon: "🧑" },
  { id: "spec", label: "spec.md", description: "File", icon: "📄", keywords: ["doc"] },
];

export function PrimitiveTriggerMenuExample() {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("Type / for a command or @ to mention…\n");

  const triggers: TriggerConfig[] = [
    { char: "/", items: commands, insertText: (item) => `${item.label} ` },
    { char: "@", items: people },
  ];
  const menu = useTextareaTriggerMenu(ref, { triggers });

  return (
    <div className="w-full max-w-md">
      <textarea
        ref={ref}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        rows={4}
        aria-label="Trigger menu demo"
        className="field-sizing-content min-h-24 w-full resize-none rounded-field border bg-card/78 px-3 py-2 text-sm leading-6 shadow-sm outline-none ring-1 ring-inset ring-border transition placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground/20"
        placeholder="Type / or @"
      />
      <TriggerMenu open={menu.open} onOpenChange={menu.setOpen} anchorRect={menu.anchorRect}>
        <TriggerMenuList>
          {menu.items.length === 0 ? (
            <TriggerMenuEmpty>No matches</TriggerMenuEmpty>
          ) : (
            menu.items.map((item, index) => (
              <TriggerMenuItem
                key={item.id}
                active={index === menu.activeIndex}
                disabled={item.disabled}
                onPointerMove={() => menu.setActiveIndex(index)}
                onClick={() => menu.select(item)}
              >
                {item.icon ? <TriggerMenuIcon>{item.icon}</TriggerMenuIcon> : null}
                <span className="flex-1 truncate">{item.label}</span>
                {item.description ? <span className="truncate text-micro text-muted-foreground">{item.description}</span> : null}
              </TriggerMenuItem>
            ))
          )}
        </TriggerMenuList>
      </TriggerMenu>
    </div>
  );
}
