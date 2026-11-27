"use client";

import { useState } from "react";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerFormatSelect,
  ColorPickerHue,
  ColorPickerInput,
  ColorPickerPanel,
  ColorPickerSwatches,
} from "@/components/control-ui/ui/color-picker";
import { EmojiPicker, EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch } from "@/components/control-ui/ui/emoji-picker";
import { InputOTP } from "@/components/control-ui/ui/input-otp";
import { PreviewPanel } from "./preview-panel";

const INITIAL_COLOR = "rgb(91 82 234)";

const presetColors = [
  "rgb(23 23 23)",
  "rgb(239 68 68)",
  "rgb(245 158 11)",
  "rgb(34 197 94)",
  "rgb(6 182 212)",
  INITIAL_COLOR,
  "rgb(217 70 239)",
  "rgb(244 244 245)",
];

export function ColorPickerPreview() {
  const [color, setColor] = useState(INITIAL_COLOR);

  return (
    <ColorPicker value={color} onValueChange={setColor} defaultFormat="hex">
      <ColorPickerPanel className="w-full">
        <ColorPickerArea />
        <ColorPickerHue />
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="size-7 shrink-0 rounded-lg border border-border" style={{ backgroundColor: color }} />
          <ColorPickerInput className="min-w-0 flex-1" />
          <ColorPickerFormatSelect />
        </div>
        <ColorPickerSwatches colors={presetColors} className="justify-between" />
      </ColorPickerPanel>
    </ColorPicker>
  );
}

export function EmojiPickerPreview() {
  return (
    <PreviewPanel>
      <EmojiPicker columns={7} className="h-52 w-full">
        <EmojiPickerSearch />
        <EmojiPickerContent />
        <EmojiPickerFooter />
      </EmojiPicker>
    </PreviewPanel>
  );
}

export function InputOtpPreview() {
  const [code, setCode] = useState("417");

  return <InputOTP length={6} separator value={code} onValueChange={setCode} aria-label="Verification code" />;
}
