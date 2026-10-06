"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  type ChannelId,
  type ColorFormat,
  formatColor,
  type Hsva,
  parseColor,
  preserveAchromatic,
  setChannel,
} from "@/components/control-ui/lib/color";

export type ColorPickerStateProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  format?: ColorFormat;
  defaultFormat?: ColorFormat;
  onFormatChange?: (format: ColorFormat) => void;
  alpha?: boolean;
  disabled?: boolean;
};

type ColorPickerContextValue = {
  hsva: Hsva;
  format: ColorFormat;
  alpha: boolean;
  disabled: boolean;
  valueString: string;
  setHsva: (partial: Partial<Hsva>) => void;
  setChannelValue: (id: ChannelId, value: number) => void;
  setFromString: (raw: string) => boolean;
  setFormat: (format: ColorFormat) => void;
};

export const ColorPickerContext = createContext<ColorPickerContextValue | null>(null);

export function useColorPicker(): ColorPickerContextValue {
  const ctx = useContext(ColorPickerContext);
  if (!ctx) throw new Error("ColorPicker parts must be rendered inside <ColorPicker>.");
  return ctx;
}

export function useColorState(props: ColorPickerStateProps): ColorPickerContextValue {
  const {
    value,
    defaultValue = "#000000",
    onValueChange,
    format: formatProp,
    defaultFormat = "hex",
    onFormatChange,
    alpha = true,
    disabled = false,
  } = props;

  const [hsva, setHsvaState] = useState<Hsva>(() => parseColor(value ?? defaultValue) ?? { h: 0, s: 0, v: 0, a: 1 });
  const [formatState, setFormatState] = useState<ColorFormat>(defaultFormat);
  const format = formatProp ?? formatState;

  const hsvaRef = useRef(hsva);
  const formatRef = useRef(format);
  const alphaRef = useRef(alpha);
  const onValueChangeRef = useRef(onValueChange);
  const lastEmitted = useRef<string | null>(null);

  useEffect(() => {
    hsvaRef.current = hsva;
    formatRef.current = format;
    alphaRef.current = alpha;
    onValueChangeRef.current = onValueChange;
  }, [hsva, format, alpha, onValueChange]);

  const emit = (next: Hsva, fmt: ColorFormat) => {
    const str = formatColor(next, fmt, { alpha: alphaRef.current });
    lastEmitted.current = str;
    onValueChangeRef.current?.(str);
  };
  const commit = (next: Hsva) => {
    hsvaRef.current = next;
    setHsvaState(next);
    emit(next, formatRef.current);
  };

  useEffect(() => {
    if (lastEmitted.current === null) lastEmitted.current = formatColor(hsvaRef.current, formatRef.current, { alpha: alphaRef.current });
    if (value === undefined || value === lastEmitted.current) return;
    const parsed = parseColor(value);
    if (!parsed) return;
    const reconciled = preserveAchromatic(parsed, hsvaRef.current);
    hsvaRef.current = reconciled;
    lastEmitted.current = value;
    setHsvaState(reconciled);
  }, [value]);

  const setHsva = (partial: Partial<Hsva>) => commit({ ...hsvaRef.current, ...partial });
  const setChannelValue = (id: ChannelId, next: number) => commit(setChannel(hsvaRef.current, id, next));
  const setFromString = (raw: string) => {
    const parsed = parseColor(raw);
    if (!parsed) return false;
    commit(preserveAchromatic(parsed, hsvaRef.current));
    return true;
  };
  const setFormat = (next: ColorFormat) => {
    if (formatProp === undefined) setFormatState(next);
    formatRef.current = next;
    onFormatChange?.(next);
    emit(hsvaRef.current, next);
  };

  return {
    hsva,
    format,
    alpha,
    disabled,
    valueString: formatColor(hsva, format, { alpha }),
    setHsva,
    setChannelValue,
    setFromString,
    setFormat,
  };
}
