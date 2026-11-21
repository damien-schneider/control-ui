"use client";

import {
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListChecksIcon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  QuoteIcon,
  SquareCodeIcon,
  TableIcon,
  TextIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useEffectEvent, useMemo } from "react";
import { isComposingKey, type TriggerMenuItemData, useTriggerMenu } from "@/components/control-ui/hooks/use-trigger-menu";
import { detectTrigger } from "@/components/control-ui/lib/trigger-detect";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import { TriggerMenu, TriggerMenuEmpty, TriggerMenuIcon, TriggerMenuItem, TriggerMenuList } from "@/components/control-ui/ui/trigger-menu";
import { type MarkdownEditorLabels, useMarkdownEditor } from "./context";
import type { MarkdownBlockCommand, MarkdownEditorEngine } from "./engine";

export type MarkdownEditorMention = TriggerMenuItemData & { href: string };
type EditorSuggestion = TriggerMenuItemData & { href?: string; block?: MarkdownBlockCommand };

function blockCommands(labels: MarkdownEditorLabels): readonly EditorSuggestion[] {
  return [
    {
      id: "paragraph",
      label: labels.text,
      keywords: ["paragraph"],
      icon: <TextIcon />,
      block: { type: "paragraph" },
    },
    {
      id: "heading-1",
      label: labels.heading(1),
      keywords: ["h1", "title"],
      icon: <Heading1Icon />,
      block: { type: "heading", level: 1 },
    },
    {
      id: "heading-2",
      label: labels.heading(2),
      keywords: ["h2", "subtitle"],
      icon: <Heading2Icon />,
      block: { type: "heading", level: 2 },
    },
    {
      id: "heading-3",
      label: labels.heading(3),
      keywords: ["h3"],
      icon: <Heading3Icon />,
      block: { type: "heading", level: 3 },
    },
    { id: "bullet-list", label: labels.bulletList, icon: <ListIcon />, block: { type: "bulletList" } },
    {
      id: "ordered-list",
      label: labels.orderedList,
      keywords: ["ordered"],
      icon: <ListOrderedIcon />,
      block: { type: "orderedList" },
    },
    {
      id: "task-list",
      label: labels.taskList,
      keywords: ["todo", "checklist"],
      icon: <ListChecksIcon />,
      block: { type: "taskList" },
    },
    {
      id: "quote",
      label: labels.quote,
      keywords: ["blockquote"],
      icon: <QuoteIcon />,
      block: { type: "blockquote" },
    },
    { id: "code-block", label: labels.codeBlock, icon: <SquareCodeIcon />, block: { type: "codeBlock" } },
    {
      id: "divider",
      label: labels.divider,
      keywords: ["rule", "separator"],
      icon: <MinusIcon />,
      block: { type: "horizontalRule" },
    },
    {
      id: "table",
      label: labels.table,
      keywords: ["grid", "columns"],
      icon: <TableIcon />,
      block: { type: "table" },
    },
  ];
}

function readTrigger(engine: MarkdownEditorEngine) {
  const before = engine.textBeforeCaret();
  const match = before ? detectTrigger(before.text, ["/", "@"]) : null;
  const blockCommandBlocked = match?.char === "/" && (match.start !== 0 || engine.getSnapshot().inlineOnly);
  if (!before || !match || blockCommandBlocked) return null;
  return { ...match, start: before.from + match.start, end: before.to };
}

export type MarkdownEditorSuggestionsProps = {
  /** The application supplies people and their persistent profile URLs. */
  mentions?: readonly MarkdownEditorMention[] | ((query: string) => readonly MarkdownEditorMention[]);
  onMentionSelect?: (mention: MarkdownEditorMention) => void;
};

export function MarkdownEditorSuggestions({ mentions = [], onMentionSelect }: MarkdownEditorSuggestionsProps) {
  const { engine, editable: enabled, labels, isUrlAllowed } = useMarkdownEditor();
  const commands = useMemo(() => blockCommands(labels), [labels]);
  const controller = useTriggerMenu<EditorSuggestion>({
    triggers: [
      { char: "/", items: commands },
      { char: "@", items: mentions },
    ],
    onCommit: (item) => {
      if (!engine || !enabled || item.disabled) return;
      const match = readTrigger(engine);
      if (!match) return;
      const range = { from: match.start, to: match.end };
      if (match.char === "/" && item.block) engine.replaceWithBlock(range, item.block);
      if (match.char === "@" && item.href && isUrlAllowed(item.href, "link")) {
        engine.replaceWithMention(range, { label: item.label, href: item.href });
        onMentionSelect?.({ ...item, href: item.href });
      }
    },
  });
  const report = useEffectEvent(() => {
    if (!engine) return;
    const match = enabled ? readTrigger(engine) : null;
    controller.report(match, match ? engine.caretRect() : null);
  });
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!engine || !enabled || isComposingKey(event) || event.metaKey || event.ctrlKey || event.altKey || !readTrigger(engine)) return;
    if (controller.handleKeyDown(event.key)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
  useEffect(() => {
    if (!engine || !enabled) return;
    const element = engine.element;
    const unsubscribe = engine.subscribe(report);
    element.addEventListener("keydown", handleKeyDown, true);
    return () => {
      unsubscribe();
      element.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [engine, enabled]);

  const open = enabled && controller.open;
  useEffect(() => {
    if (!engine || !open) return;
    const owner = engine.element.ownerDocument;
    owner.addEventListener("scroll", report, { capture: true, passive: true });
    owner.defaultView?.addEventListener("resize", report);
    return () => {
      owner.removeEventListener("scroll", report, true);
      owner.defaultView?.removeEventListener("resize", report);
    };
  }, [engine, open]);
  const { "aria-controls": controls, "aria-activedescendant": activeDescendant } = controller.inputAria;
  useEffect(() => {
    if (!engine || !enabled) return;
    const element = engine.element;
    const attributes = {
      "aria-autocomplete": "list",
      "aria-haspopup": "listbox",
      "aria-controls": controls,
      "aria-activedescendant": activeDescendant,
    };
    for (const [name, value] of Object.entries(attributes)) {
      if (value) element.setAttribute(name, value);
      else element.removeAttribute(name);
    }
    return () => {
      for (const name of Object.keys(attributes)) element.removeAttribute(name);
    };
  }, [engine, enabled, controls, activeDescendant]);

  const label = controller.activeChar === "@" ? labels.mentions : labels.commands;
  const emptyLabel = controller.activeChar === "@" ? labels.noMentions : labels.noCommands;
  return (
    <>
      <LiveStatus message={open ? labels.suggestionCount(controller.items.length, label) : ""} />
      <TriggerMenu open={open} onOpenChange={controller.setOpen} anchorRect={controller.anchorRect} side="bottom">
        {controller.items.length === 0 ? <TriggerMenuEmpty>{emptyLabel}</TriggerMenuEmpty> : null}
        <TriggerMenuList id={controller.listId} aria-label={label}>
          {controller.items.map((item, index) => (
            <TriggerMenuItem
              key={item.id}
              id={controller.optionId(index)}
              active={index === controller.activeIndex}
              disabled={item.disabled || (item.href !== undefined && !isUrlAllowed(item.href, "link"))}
              onPointerMove={() => controller.setActiveIndex(index)}
              onClick={() => controller.select(item)}
            >
              <TriggerMenuIcon>{item.icon ?? <UserIcon />}</TriggerMenuIcon>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.description ? (
                <span
                  data-control-ui="markdown-editor"
                  data-control-family="markdown-editor"
                  data-slot="suggestion-description"
                  className="truncate"
                >
                  {item.description}
                </span>
              ) : null}
            </TriggerMenuItem>
          ))}
        </TriggerMenuList>
      </TriggerMenu>
    </>
  );
}
