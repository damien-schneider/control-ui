"use client";

import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";
import { useState } from "react";

import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/control-ui/ui/toolbar";

type Mark = "bold" | "italic" | "underline";
type Alignment = "left" | "center" | "right";

export function PrimitiveToolbarExample() {
  const [marks, setMarks] = useState<Record<Mark, boolean>>({ bold: true, italic: false, underline: false });
  const [alignment, setAlignment] = useState<Alignment>("left");

  function toggleMark(mark: Mark) {
    setMarks((current) => ({ ...current, [mark]: !current[mark] }));
  }

  return (
    <Toolbar aria-label="Text formatting">
      <ToolbarGroup aria-label="Text style">
        <ToolbarButton
          aria-label="Bold"
          iconOnly
          aria-pressed={marks.bold}
          data-pressed={marks.bold ? "" : undefined}
          onClick={() => toggleMark("bold")}
        >
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton
          aria-label="Italic"
          iconOnly
          aria-pressed={marks.italic}
          data-pressed={marks.italic ? "" : undefined}
          onClick={() => toggleMark("italic")}
        >
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton
          aria-label="Underline"
          iconOnly
          aria-pressed={marks.underline}
          data-pressed={marks.underline ? "" : undefined}
          onClick={() => toggleMark("underline")}
        >
          <UnderlineIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup aria-label="Alignment">
        <ToolbarButton
          aria-label="Align left"
          iconOnly
          aria-pressed={alignment === "left"}
          data-pressed={alignment === "left" ? "" : undefined}
          onClick={() => setAlignment("left")}
        >
          <AlignLeftIcon />
        </ToolbarButton>
        <ToolbarButton
          aria-label="Align center"
          iconOnly
          aria-pressed={alignment === "center"}
          data-pressed={alignment === "center" ? "" : undefined}
          onClick={() => setAlignment("center")}
        >
          <AlignCenterIcon />
        </ToolbarButton>
        <ToolbarButton
          aria-label="Align right"
          iconOnly
          aria-pressed={alignment === "right"}
          data-pressed={alignment === "right" ? "" : undefined}
          onClick={() => setAlignment("right")}
        >
          <AlignRightIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarButton onClick={() => setMarks({ bold: false, italic: false, underline: false })}>Clear</ToolbarButton>
    </Toolbar>
  );
}
