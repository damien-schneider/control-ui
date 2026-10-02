"use client";

import { useState } from "react";
import { IconPicker, IconPickerColors, IconPickerContent, IconPickerSearch } from "@/components/control-ui/ui/icon-picker";
import { pickerColors, pickerIcons } from "./picker-data";

export function PrimitiveIconPickerExample() {
  const [selectedIcon, setSelectedIcon] = useState("folder");
  const [colorValue, setColorValue] = useState("default");
  const color = pickerColors.find((swatch) => swatch.value === colorValue);
  if (!color) throw new Error(`Unknown icon color: ${colorValue}`);

  return (
    <IconPicker
      items={pickerIcons}
      value={selectedIcon}
      onValueChange={setSelectedIcon}
      style={{ "--cui-icon-picker-foreground": color.color }}
    >
      <IconPickerSearch />
      <IconPickerColors colors={pickerColors} value={colorValue} onValueChange={setColorValue} />
      <IconPickerContent />
    </IconPicker>
  );
}
