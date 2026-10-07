"use client";

import { useState } from "react";
import {
  ColorPicker,
  ColorPickerBrightness,
  ColorPickerInput,
  ColorPickerPanel,
  ColorPickerWheel,
} from "@/components/control-ui/ui/color-picker";

export function PrimitiveColorPickerWheelExample() {
  const [color, setColor] = useState("#3b82f6");

  return (
    <ColorPicker value={color} onValueChange={setColor} alpha={false}>
      <ColorPickerPanel className="w-60">
        <ColorPickerWheel />
        <ColorPickerBrightness />
        <ColorPickerInput />
      </ColorPickerPanel>
    </ColorPicker>
  );
}
