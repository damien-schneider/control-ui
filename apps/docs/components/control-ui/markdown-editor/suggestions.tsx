"use client";

import type { ChainedCommands, Editor } from "@tiptap/core";
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
  TextIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useEffectEvent, useMemo } from "react";
import { isComposingKey, type TriggerMenuItemData, useTriggerMenu } from "@/components/control-ui/hooks/use-trigger-menu";
import { detectTrigger } from "@/components/control-ui/lib/trigger-detect";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import { TriggerMenu, TriggerMenuEmpty, TriggerMenuIcon, TriggerMenuItem, TriggerMenuList } from "@/components/control-ui/ui/trigger-menu";
import { type MarkdownEditorLabels, useMarkdownEditor } from "./context";

export type MarkdownEditorMention = TriggerMenuItemData & { href: string };
type EditorSuggestion = TriggerMenuItemData & { href?: string; command?: (chain: ChainedCommands) => ChainedCommands };

function blockCommands(labels: MarkdownEditorLabels): readonly EditorSuggestion[] {
  return [
    {
      id: "paragraph",
      label: labels.text,
      keywords: ["paragraph"],
      icon: <TextIcon />,
      command: (chain) => chain.clearNodes().setParagraph(),
    },
    {
      id: "heading-1",
      label: labels.heading(1),
      keywords: ["h1", "title"],
      icon: <Heading1Icon />,
      command: (chain) => chain.clearNodes().setHeading({ level: 1 }),
    },
    {
      id: "heading-2",
      label: labels.heading(2),
      keywords: ["h2", "subtitle"],
      icon: <Heading2Icon />,
      command: (chain) => chain.clearNodes().setHeading({ level: 2 }),
    },
    {
      id: "heading-3",
      label: labels.heading(3),
      keywords: ["h3"],
      icon: <Heading3Icon />,
      command: (chain) => chain.clearNodes().setHeading({ level: 3 }),
    },
    { id: "bullet-list", label: labels.bulletList, icon: <ListIcon />, command: (chain) => chain.clearNodes().toggleBulletList() },
    {
      id: "ordered-list",
      label: labels.orderedList,
      keywords: ["ordered"],
      icon: <ListOrderedIcon />,
      command: (chain) => chain.clearNodes().toggleOrderedList(),
    },
    {
      id: "task-list",
      label: labels.taskList,
      keywords: ["todo", "checklist"],
      icon: <ListChecksIcon />,
      command: (chain) => chain.clearNodes().toggleTaskList(),
    },
    {
      id: "quote",
      label: labels.quote,
      keywords: ["blockquote"],
      icon: <QuoteIcon />,
      command: (chain) => chain.clearNodes().toggleBlockquote(),
    },
    { id: "code-block", label: labels.codeBlock, icon: <SquareCodeIcon />, command: (chain) => chain.clearNodes().setCodeBlock() },
    {
      id: "divider",
      label: labels.divider,
      keywords: ["rule", "separator"],
      icon: <MinusIcon />,
      command: (chain) => chain.setHorizontalRule(),
    },
  ];
}

function readTrigger(editor: Editor) {
  const { selection } = editor.state;
  const { $from } = selection;
  if (
    !editor.isFocused ||
    !selection.empty ||
    !$from.parent.isTextblock ||
    $from.parent.type.spec.code ||
    editor.isActive("code") ||
    editor.isActive("link")
  )
    return null;
  const text = $from.parent.textBetween(0, $from.parentOffset, undefined, "\ufffc");
  const match = detectTrigger(text, ["/", "@"]);
  if (!match || (match.char === "/" && match.start !== 0)) return null;
  return { ...match, start: $from.start() + match.start, end: $from.pos };
}

export type MarkdownEditorSuggestionsProps = {
  /** The application supplies people and their persistent profile URLs. */
  mentions?: readonly MarkdownEditorMention[] | ((query: string) => readonly MarkdownEditorMention[]);
  onMentionSelect?: (mention: MarkdownEditorMention) => void;
};

export function MarkdownEditorSuggestions({ mentions = [], onMentionSelect }: MarkdownEditorSuggestionsProps) {
  const { editor, editable: enabled, labels, isUrlAllowed } = useMarkdownEditor();
  const commands = useMemo(() => blockCommands(labels), [labels]);
  const controller = useTriggerMenu<EditorSuggestion>({
    triggers: [
      { char: "/", items: commands },
      { char: "@", items: mentions },
    ],
    onCommit: (item) => {
      if (!editor || !enabled || item.disabled) return;
      const match = readTrigger(editor);
      if (!match) return;
      const range = { from: match.start, to: match.end };
      if (match.char === "/" && item.command) item.command(editor.chain().focus().deleteRange(range)).run();
      if (match.char === "@" && item.href && isUrlAllowed(item.href, "link")) {
        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            { type: "text", text: `@${item.label}`, marks: [{ type: "link", attrs: { href: item.href } }] },
            { type: "text", text: " " },
          ])
          .run();
        onMentionSelect?.({ ...item, href: item.href });
      }
    },
  });
  const report = useEffectEvent(() => {
    if (!editor || editor.isDestroyed) return;
    const match = enabled ? readTrigger(editor) : null;
    const coords = match ? editor.view.coordsAtPos(match.end) : null;
    controller.report(match, coords ? new DOMRect(coords.left, coords.top, 1, coords.bottom - coords.top) : null);
  });
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (
      !editor ||
      editor.isDestroyed ||
      !enabled ||
      isComposingKey(event) ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      !readTrigger(editor)
    )
      return;
    if (controller.handleKeyDown(event.key)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
  useEffect(() => {
    if (!editor || editor.isDestroyed || !enabled) return;
    const dom = editor.view.dom;
    editor.on("transaction", report).on("focus", report).on("blur", report);
    dom.addEventListener("keydown", handleKeyDown, true);
    return () => {
      editor.off("transaction", report).off("focus", report).off("blur", report);
      dom.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [editor, enabled]);

  const open = enabled && controller.open;
  useEffect(() => {
    if (!editor || editor.isDestroyed || !open) return;
    const owner = editor.view.dom.ownerDocument;
    owner.addEventListener("scroll", report, { capture: true, passive: true });
    owner.defaultView?.addEventListener("resize", report);
    return () => {
      owner.removeEventListener("scroll", report, true);
      owner.defaultView?.removeEventListener("resize", report);
    };
  }, [editor, open]);
  const { "aria-controls": controls, "aria-activedescendant": activeDescendant } = controller.inputAria;
  useEffect(() => {
    if (!editor || editor.isDestroyed || !enabled) return;
    const dom = editor.view.dom;
    const attributes = {
      "aria-autocomplete": "list",
      "aria-haspopup": "listbox",
      "aria-controls": controls,
      "aria-activedescendant": activeDescendant,
    };
    for (const [name, value] of Object.entries(attributes)) {
      if (value) dom.setAttribute(name, value);
      else dom.removeAttribute(name);
    }
    return () => {
      for (const name of Object.keys(attributes)) dom.removeAttribute(name);
    };
  }, [editor, enabled, controls, activeDescendant]);

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
