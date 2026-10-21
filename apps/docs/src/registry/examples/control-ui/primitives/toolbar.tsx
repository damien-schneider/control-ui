"use client";

import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/control-ui/ui/toolbar";

type Mark = "bold" | "italic" | "underline";
type Alignment = "left" | "center" | "right";

const MARKS: readonly { mark: Mark; label: string; icon: ReactNode }[] = [
  { mark: "bold", label: "Bold", icon: <BoldIcon /> },
  { mark: "italic", label: "Italic", icon: <ItalicIcon /> },
  { mark: "underline", label: "Underline", icon: <UnderlineIcon /> },
];

const ALIGNMENTS: readonly { alignment: Alignment; label: string; icon: ReactNode }[] = [
  { alignment: "left", label: "Align left", icon: <AlignLeftIcon /> },
  { alignment: "center", label: "Align center", icon: <AlignCenterIcon /> },
  { alignment: "right", label: "Align right", icon: <AlignRightIcon /> },
];

export function PrimitiveToolbarExample() {
  const [marks, setMarks] = useState<Record<Mark, boolean>>({ bold: true, italic: false, underline: false });
  const [alignment, setAlignment] = useState<Alignment>("left");

  return (
    <Toolbar aria-label="Text formatting">
      <ToolbarGroup aria-label="Text style">
        {MARKS.map((entry) => (
          <ToolbarButton
            key={entry.mark}
            aria-label={entry.label}
            iconOnly
            aria-pressed={marks[entry.mark]}
            onClick={() => setMarks((current) => ({ ...current, [entry.mark]: !current[entry.mark] }))}
          >
            {entry.icon}
          </ToolbarButton>
        ))}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup aria-label="Alignment">
        {ALIGNMENTS.map((entry) => (
          <ToolbarButton
            key={entry.alignment}
            aria-label={entry.label}
            iconOnly
            aria-pressed={alignment === entry.alignment}
            onClick={() => setAlignment(entry.alignment)}
          >
            {entry.icon}
          </ToolbarButton>
        ))}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarButton onClick={() => setMarks({ bold: false, italic: false, underline: false })}>Clear</ToolbarButton>
    </Toolbar>
  );
}
