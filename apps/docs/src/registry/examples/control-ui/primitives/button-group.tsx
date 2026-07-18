"use client";

import { useState } from "react";

import { Button } from "@/components/control-ui/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/control-ui/ui/button-group";

export function PrimitiveButtonGroupExample() {
  const [alignment, setAlignment] = useState<"left" | "center" | "right">("center");

  return (
    <div className="flex flex-col items-start gap-4">
      <ButtonGroup aria-label="Text alignment">
        <Button variant="surface" active={alignment === "left"} onClick={() => setAlignment("left")}>
          Left
        </Button>
        <Button variant="surface" active={alignment === "center"} onClick={() => setAlignment("center")}>
          Center
        </Button>
        <Button variant="surface" active={alignment === "right"} onClick={() => setAlignment("right")}>
          Right
        </Button>
      </ButtonGroup>

      <ButtonGroup aria-label="Share link">
        <ButtonGroupText>https://</ButtonGroupText>
        <Button variant="surface">control-ui.dev/r</Button>
        <ButtonGroupSeparator />
        <Button variant="surface">Copy</Button>
      </ButtonGroup>
    </div>
  );
}
