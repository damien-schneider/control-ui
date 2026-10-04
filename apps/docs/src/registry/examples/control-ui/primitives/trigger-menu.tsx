"use client";

import { useRef, useState } from "react";
import { useTextareaTriggerMenu } from "@/components/control-ui/hooks/use-textarea-trigger-menu";
import type { TriggerConfig, TriggerMenuItemData } from "@/components/control-ui/hooks/use-trigger-menu";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import { Textarea } from "@/components/control-ui/ui/textarea";
import { TriggerMenu, TriggerMenuEmpty, TriggerMenuIcon, TriggerMenuItem, TriggerMenuList } from "@/components/control-ui/ui/trigger-menu";
import { Text } from "@/components/control-ui/ui/typography";

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
  const isEmpty = menu.open && menu.items.length === 0;
  let status = "";
  if (isEmpty) status = "No matches";
  else if (menu.open) status = `${menu.items.length} suggestions`;

  return (
    <div className="w-full max-w-md">
      <Textarea
        ref={ref}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        rows={4}
        aria-label="Trigger menu demo"
        {...menu.inputAria}
        className="min-h-24 leading-6"
        placeholder="Type / or @"
      />
      <LiveStatus message={status} />
      <TriggerMenu open={menu.open} onOpenChange={menu.setOpen} anchorRect={menu.anchorRect}>
        {isEmpty ? <TriggerMenuEmpty aria-hidden="true">No matches</TriggerMenuEmpty> : null}
        <TriggerMenuList id={menu.listId}>
          {menu.items.map((item, index) => (
            <TriggerMenuItem
              key={item.id}
              id={menu.optionId(index)}
              active={index === menu.activeIndex}
              disabled={item.disabled}
              onPointerMove={() => menu.setActiveIndex(index)}
              onClick={() => menu.select(item)}
            >
              {item.icon ? <TriggerMenuIcon>{item.icon}</TriggerMenuIcon> : null}
              <span className="flex-1 truncate">{item.label}</span>
              {item.description ? (
                <Text size="micro" tone="muted" className="truncate">
                  {item.description}
                </Text>
              ) : null}
            </TriggerMenuItem>
          ))}
        </TriggerMenuList>
      </TriggerMenu>
    </div>
  );
}
