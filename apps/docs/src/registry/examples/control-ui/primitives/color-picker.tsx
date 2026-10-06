"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerArea,
  ColorPickerAreaContrast,
  ColorPickerAreaThumb,
  ColorPickerBrightness,
  ColorPickerChannels,
  ColorPickerContent,
  ColorPickerContrast,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHue,
  ColorPickerInput,
  ColorPickerOutput,
  ColorPickerPanel,
  ColorPickerSaturation,
  ColorPickerSwatch,
  ColorPickerSwatchAdd,
  ColorPickerSwatches,
  ColorPickerTrigger,
  ColorPickerWheel,
} from "@/components/control-ui/ui/color-picker";
import { Text } from "@/components/control-ui/ui/typography";

function Row({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Text size="caption" weight="medium" tone="muted">
        {label}
      </Text>
      {children}
    </div>
  );
}

const DOC_COLORS = ["#7038f4", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#ffffff"];
const BRUSH_COLORS = ["#111827", "#ef4444", "#f97316", "#22c55e", "#3b82f6"];
const PAGE_BACKGROUND = "#ffffff";

export function PrimitiveColorPickerExample() {
  const [color, setColor] = useState("#7038f4");
  const [palette, setPalette] = useState(DOC_COLORS);
  const [inline, setInline] = useState("#22c55e");
  const [brush, setBrush] = useState("#3b82f6");

  return (
    <div className="flex w-full max-w-2xl flex-wrap items-start gap-8">
      <Row label="Full panel (popover)">
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

      <Row label="Inline strips" className="w-full">
        <ColorPicker value={brush} onValueChange={setBrush} alpha={false}>
          <div className="flex flex-wrap items-center gap-3">
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
      </Row>
    </div>
  );
}
