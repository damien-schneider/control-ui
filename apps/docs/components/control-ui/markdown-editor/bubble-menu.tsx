"use client";

import { NodeSelection } from "@tiptap/pm/state";
import { BubbleMenu, type BubbleMenuProps } from "@tiptap/react/menus";
import type { ReactNode } from "react";
import { Toolbar, ToolbarSeparator } from "@/components/control-ui/ui/toolbar";
import { TooltipProvider } from "@/components/control-ui/ui/tooltip";
import { useMarkdownEditor } from "./context";
import { MarkdownEditorFormatButton, MarkdownEditorHeading, MarkdownEditorLink, useMarkdownEditorFormatActions } from "./toolbar";

const showForFormattableText: NonNullable<BubbleMenuProps["shouldShow"]> = ({ editor, view, state, element }) => {
  const { selection } = state;
  const formattableText =
    !(selection instanceof NodeSelection) &&
    !selection.empty &&
    state.doc.textBetween(selection.from, selection.to).trim() !== "" &&
    !editor.isActive("codeBlock");
  return formattableText && editor.isEditable && (view.hasFocus() || element.contains(document.activeElement));
};

const floatingOptions: BubbleMenuProps["options"] = { placement: "top", offset: 8, flip: { padding: 8 }, shift: { padding: 8 } };

export function MarkdownEditorBubbleMenu({ children }: { children?: ReactNode }) {
  const { editor, disabled, source } = useMarkdownEditor();
  const { marks } = useMarkdownEditorFormatActions();
  if (!editor || disabled || source) return null;
  return (
    <BubbleMenu
      editor={editor}
      shouldShow={showForFormattableText}
      options={floatingOptions}
      data-control-ui="markdown-editor"
      data-control-family="markdown-editor"
      data-slot="bubble-menu"
    >
      <TooltipProvider>
        <Toolbar aria-label="Selection formatting" variant="floating">
          <MarkdownEditorHeading />
          <ToolbarSeparator />
          {marks.map((action) => (
            <MarkdownEditorFormatButton key={action.label} action={action} />
          ))}
          <MarkdownEditorLink />
          {children}
        </Toolbar>
      </TooltipProvider>
    </BubbleMenu>
  );
}
