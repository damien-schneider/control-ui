"use client";

import { useState } from "react";
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerArea,
  ColorPickerAreaContrast,
  ColorPickerAreaThumb,
  ColorPickerChannels,
  ColorPickerContent,
  ColorPickerContrast,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHue,
  ColorPickerInput,
  ColorPickerOutput,
  ColorPickerSwatchAdd,
  ColorPickerSwatches,
  ColorPickerTrigger,
} from "@/components/control-ui/ui/color-picker";

const DOC_COLORS = ["#7038f4", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#ffffff"];
const PAGE_BACKGROUND = "#ffffff";

export function PrimitiveColorPickerExample() {
  const [color, setColor] = useState("#7038f4");
  const [palette, setPalette] = useState(DOC_COLORS);

  return (
    <ColorPicker value={color} onValueChange={setColor} defaultFormat="hex">
      <div className="flex items-center gap-2">
        <ColorPickerTrigger />
        <ColorPickerOutput />
      </div>
      <ColorPickerContent className="w-72">
        <ColorPickerArea>
          <ColorPickerAreaContrast background={PAGE_BACKGROUND} />
          <ColorPickerAreaThumb />
        </ColorPickerArea>
        <div className="flex items-center gap-2">
          <ColorPickerEyeDropper />
          <div className="flex flex-1 flex-col gap-2">
            <ColorPickerHue />
            <ColorPickerAlpha />
          </div>
        </div>
        <div className="flex gap-2">
          <ColorPickerFormatSelect />
          <ColorPickerInput className="flex-1" />
        </div>
        <ColorPickerChannels />
        <ColorPickerContrast background={PAGE_BACKGROUND} />
        <ColorPickerSwatches label="Document colors" colors={palette}>
          <ColorPickerSwatchAdd onAdd={(value) => setPalette((prev) => [...prev, value])} />
        </ColorPickerSwatches>
      </ColorPickerContent>
    </ColorPicker>
  );
}
