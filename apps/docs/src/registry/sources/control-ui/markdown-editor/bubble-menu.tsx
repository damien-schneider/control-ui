"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Popover, PopoverContent } from "@/components/control-ui/ui/popover";
import { Toolbar, ToolbarSeparator } from "@/components/control-ui/ui/toolbar";
import { TooltipProvider } from "@/components/control-ui/ui/tooltip";
import { useMarkdownEditor, useMarkdownEditorSnapshot } from "./context";
import { MarkdownEditorFormatButton, MarkdownEditorHeading, MarkdownEditorLink, useMarkdownEditorFormatActions } from "./toolbar";

const sameRect = (a: DOMRect | null, b: DOMRect | null) =>
  a === b || (a !== null && b !== null && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height);

export function MarkdownEditorBubbleMenu({ children }: { children?: ReactNode }) {
  const { engine, editable, labels } = useMarkdownEditor();
  const { formattable, focused } = useMarkdownEditorSnapshot();
  const { marks } = useMarkdownEditorFormatActions();
  const [focusWithin, setFocusWithin] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  if (dismissed && !formattable) setDismissed(false);
  const visible = editable && formattable && (focused || focusWithin) && !dismissed;

  useEffect(() => {
    if (!engine || !visible) return;
    const measure = () => {
      const next = engine.selectionRect();
      setSelectionRect((current) => (sameRect(current, next) ? current : next));
    };
    measure();
    const owner = engine.element.ownerDocument;
    owner.addEventListener("scroll", measure, { capture: true, passive: true });
    owner.defaultView?.addEventListener("resize", measure);
    const unsubscribe = engine.subscribe(measure);
    return () => {
      unsubscribe();
      owner.removeEventListener("scroll", measure, true);
      owner.defaultView?.removeEventListener("resize", measure);
    };
  }, [engine, visible]);

  if (!engine || !editable) return null;
  const rect = selectionRect;
  return (
    <Popover
      open={visible && rect !== null}
      onOpenChange={(open, details) => {
        if (!open && details.reason === "escape-key") setDismissed(true);
      }}
    >
      <PopoverContent
        anchor={rect ? { getBoundingClientRect: () => rect } : undefined}
        side="top"
        sideOffset={8}
        collisionPadding={8}
        padding="none"
        initialFocus={false}
        finalFocus={false}
        className="w-max"
        onFocus={() => setFocusWithin(true)}
        onBlur={(event) => {
          if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) setFocusWithin(false);
        }}
      >
        <div data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="bubble-menu">
          <TooltipProvider>
            <Toolbar aria-label={labels.selectionToolbar} chrome="embedded">
              <MarkdownEditorHeading />
              <ToolbarSeparator />
              {marks.map((action) => (
                <MarkdownEditorFormatButton key={action.label} action={action} />
              ))}
              <MarkdownEditorLink />
              {children}
            </Toolbar>
          </TooltipProvider>
        </div>
      </PopoverContent>
    </Popover>
  );
}
