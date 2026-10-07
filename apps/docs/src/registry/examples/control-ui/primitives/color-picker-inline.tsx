"use client";

import { useState } from "react";
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerArea,
  ColorPickerHue,
  ColorPickerInput,
  ColorPickerPanel,
} from "@/components/control-ui/ui/color-picker";

export function PrimitiveColorPickerInlineExample() {
  const [color, setColor] = useState("#22c55e");

  return (
    <ColorPicker value={color} onValueChange={setColor}>
      <ColorPickerPanel className="w-64">
        <ColorPickerArea />
        <ColorPickerHue />
        <ColorPickerAlpha />
        <ColorPickerInput />
      </ColorPickerPanel>
    </ColorPicker>
  );
}
