"use client";

import { useState } from "react";
import {
  ColorPicker,
  ColorPickerBrightness,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSaturation,
  ColorPickerSwatch,
} from "@/components/control-ui/ui/color-picker";

const BRUSH_COLORS = ["#111827", "#ef4444", "#f97316", "#22c55e", "#3b82f6"];

export function PrimitiveColorPickerStripsExample() {
  const [brush, setBrush] = useState("#3b82f6");

  return (
    <ColorPicker value={brush} onValueChange={setBrush} alpha={false}>
      <div className="flex w-full max-w-2xl flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {BRUSH_COLORS.map((brushColor) => (
            <ColorPickerSwatch key={brushColor} color={brushColor} />
          ))}
        </div>
        <ColorPickerHue className="flex-1" />
        <ColorPickerSaturation className="flex-1" />
        <ColorPickerBrightness className="flex-1" />
        <ColorPickerOutput />
      </div>
    </ColorPicker>
  );
}
