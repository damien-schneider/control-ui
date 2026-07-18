"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerArea,
  ColorPickerChannels,
  ColorPickerContent,
  ColorPickerContrast,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHue,
  ColorPickerInput,
  ColorPickerOutput,
  ColorPickerPanel,
  ColorPickerSwatchAdd,
  ColorPickerSwatches,
  ColorPickerTrigger,
  ColorPickerWheel,
} from "@/components/control-ui/ui/color-picker";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

const DOC_COLORS = ["#7038f4", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#ffffff"];

export function PrimitiveColorPickerExample() {
  const [color, setColor] = useState("#7038f4");
  const [palette, setPalette] = useState(DOC_COLORS);
  const [inline, setInline] = useState("#22c55e");

  return (
    <div className="flex w-full max-w-2xl flex-wrap items-start gap-8">
      <Row label="Full panel (popover)">
        <ColorPicker value={color} onValueChange={setColor} defaultFormat="hex">
          <div className="flex items-center gap-2">
            <ColorPickerTrigger />
            <ColorPickerOutput />
          </div>
          <ColorPickerContent className="w-72">
            <ColorPickerArea />
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
            <ColorPickerContrast background="#ffffff" />
            <ColorPickerSwatches label="Document colors" colors={palette}>
              <ColorPickerSwatchAdd onAdd={(value) => setPalette((prev) => [...prev, value])} />
            </ColorPickerSwatches>
          </ColorPickerContent>
        </ColorPicker>
      </Row>

      <Row label="Inline panel">
        <ColorPicker value={inline} onValueChange={setInline}>
          <ColorPickerPanel>
            <ColorPickerArea />
            <ColorPickerHue />
            <ColorPickerAlpha />
            <ColorPickerInput />
          </ColorPickerPanel>
        </ColorPicker>
      </Row>

      <Row label="Wheel">
        <ColorPicker defaultValue="#3b82f6">
          <ColorPickerPanel className="w-52">
            <ColorPickerWheel />
            <ColorPickerHue />
            <ColorPickerInput />
          </ColorPickerPanel>
        </ColorPicker>
      </Row>
    </div>
  );
}
