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
import { useEffect, useEffectEvent, useRef } from "react";
import { isComposingKey, type TriggerMenuItemData, useTriggerMenu } from "@/components/control-ui/hooks/use-trigger-menu";
import { detectTrigger } from "@/components/control-ui/lib/trigger-detect";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import { TriggerMenu, TriggerMenuEmpty, TriggerMenuIcon, TriggerMenuItem, TriggerMenuList } from "@/components/control-ui/ui/trigger-menu";
import { useMarkdownEditor } from "./context";
import { isEditorUrl } from "./extensions";

export type MarkdownEditorMention = TriggerMenuItemData & { href: string };
type EditorSuggestion = TriggerMenuItemData & { href?: string; command?: (chain: ChainedCommands) => ChainedCommands };

const blockCommands: readonly EditorSuggestion[] = [
  { id: "paragraph", label: "Text", keywords: ["paragraph"], icon: <TextIcon />, command: (chain) => chain.clearNodes().setParagraph() },
  {
    id: "heading-1",
    label: "Heading 1",
    keywords: ["h1", "title"],
    icon: <Heading1Icon />,
    command: (chain) => chain.clearNodes().setHeading({ level: 1 }),
  },
  {
    id: "heading-2",
    label: "Heading 2",
    keywords: ["h2", "subtitle"],
    icon: <Heading2Icon />,
    command: (chain) => chain.clearNodes().setHeading({ level: 2 }),
  },
  {
    id: "heading-3",
    label: "Heading 3",
    keywords: ["h3"],
    icon: <Heading3Icon />,
    command: (chain) => chain.clearNodes().setHeading({ level: 3 }),
  },
  { id: "bullet-list", label: "Bullet list", icon: <ListIcon />, command: (chain) => chain.clearNodes().toggleBulletList() },
  {
    id: "ordered-list",
    label: "Numbered list",
    keywords: ["ordered"],
    icon: <ListOrderedIcon />,
    command: (chain) => chain.clearNodes().toggleOrderedList(),
  },
  {
    id: "task-list",
    label: "Task list",
    keywords: ["todo", "checklist"],
    icon: <ListChecksIcon />,
    command: (chain) => chain.clearNodes().toggleTaskList(),
  },
  { id: "quote", label: "Quote", keywords: ["blockquote"], icon: <QuoteIcon />, command: (chain) => chain.clearNodes().toggleBlockquote() },
  { id: "code-block", label: "Code block", icon: <SquareCodeIcon />, command: (chain) => chain.clearNodes().setCodeBlock() },
  { id: "divider", label: "Divider", keywords: ["rule", "separator"], icon: <MinusIcon />, command: (chain) => chain.setHorizontalRule() },
];

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
  const activeItem = useRef<HTMLDivElement>(null);
  const { editor, disabled, source } = useMarkdownEditor();
  const enabled = Boolean(editor) && !disabled && !source;
  const controller = useTriggerMenu<EditorSuggestion>({
    triggers: [
      { char: "/", items: blockCommands },
      { char: "@", items: mentions },
    ],
    onCommit: (item) => {
      if (!editor || !enabled || item.disabled) return;
      const match = readTrigger(editor);
      if (!match) return;
      const range = { from: match.start, to: match.end };
      if (match.char === "/" && item.command) item.command(editor.chain().focus().deleteRange(range)).run();
      if (match.char === "@" && item.href && isEditorUrl(item.href)) {
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
    if (!editor) return;
    const match = enabled ? readTrigger(editor) : null;
    const coords = match ? editor.view.coordsAtPos(match.end) : null;
    controller.report(match, coords ? new DOMRect(coords.left, coords.top, 1, coords.bottom - coords.top) : null);
  });
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!editor || !enabled || isComposingKey(event) || event.metaKey || event.ctrlKey || event.altKey || !readTrigger(editor)) return;
    if (controller.handleKeyDown(event.key)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
  useEffect(() => {
    if (!editor || !enabled) return;
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
    if (!editor || !open) return;
    const owner = editor.view.dom.ownerDocument;
    owner.addEventListener("scroll", report, { capture: true, passive: true });
    owner.defaultView?.addEventListener("resize", report);
    return () => {
      owner.removeEventListener("scroll", report, true);
      owner.defaultView?.removeEventListener("resize", report);
    };
  }, [editor, open]);
  const { activeIndex, activeChar, query } = controller;
  // biome-ignore lint/correctness/useExhaustiveDependencies: changing the active result or query must reveal the current option.
  useEffect(() => {
    if (open) activeItem.current?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, activeChar, query]);
  const { "aria-controls": controls, "aria-activedescendant": activeDescendant } = controller.inputAria;
  useEffect(() => {
    if (!editor || !enabled) return;
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

  const label = controller.activeChar === "@" ? "Mention people" : "Insert block";
  const emptyLabel = controller.activeChar === "@" ? "No people found" : "No commands found";
  return (
    <>
      <LiveStatus message={open ? `${controller.items.length} ${label.toLowerCase()} suggestions` : ""} />
      <TriggerMenu open={open} onOpenChange={controller.setOpen} anchorRect={controller.anchorRect} side="bottom">
        {controller.items.length === 0 ? <TriggerMenuEmpty>{emptyLabel}</TriggerMenuEmpty> : null}
        <TriggerMenuList id={controller.listId} aria-label={label}>
          {controller.items.map((item, index) => (
            <TriggerMenuItem
              key={item.id}
              id={controller.optionId(index)}
              active={index === controller.activeIndex}
              disabled={item.disabled || (item.href !== undefined && !isEditorUrl(item.href))}
              ref={index === controller.activeIndex ? activeItem : undefined}
              onPointerMove={() => controller.setActiveIndex(index)}
              onClick={() => controller.select(item)}
            >
              <TriggerMenuIcon>{item.icon ?? <UserIcon />}</TriggerMenuIcon>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.description ? <span className="truncate text-muted-foreground">{item.description}</span> : null}
            </TriggerMenuItem>
          ))}
        </TriggerMenuList>
      </TriggerMenu>
    </>
  );
}
