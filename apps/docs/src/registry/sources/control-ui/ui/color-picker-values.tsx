"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { useId, useState, useSyncExternalStore } from "react";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { ButtonKnobStyle } from "@/components/control-ui/knob-contracts/button-knobs";
import type { ColorPickerKnobStyle } from "@/components/control-ui/knob-contracts/color-picker-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { type ChannelId, type ColorFormat, getChannels } from "@/components/control-ui/lib/color";
import { Button } from "@/components/control-ui/ui/button";
import { useColorPicker } from "@/components/control-ui/ui/color-picker-context";
import { Input } from "@/components/control-ui/ui/input";
import { NumberField, NumberFieldGroup, NumberFieldInput } from "@/components/control-ui/ui/number-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";

export type ColorPickerEyeDropperProps = Omit<Omit<ComponentProps<"button">, "onError">, "style"> & {
  style?: CSSProperties & ButtonKnobStyle;
};

export type ColorPickerInputProps = Omit<Omit<ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "size">, "style"> & {
  style?: CSSProperties & ColorPickerKnobStyle;
} & {
  size?: ControlSize;
  invalidLabel?: string;
};

export type ColorPickerFormatSelectProps = {
  formats?: ColorFormat[];
  size?: ControlSize;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  style?: CSSProperties & ButtonKnobStyle;
};

export type ColorPickerChannelsProps = ComponentProps<"div"> & { style?: CSSProperties & ColorPickerKnobStyle };

export type ColorPickerChannelProps = Omit<Omit<ComponentProps<"div">, "children" | "aria-label">, "style"> & {
  style?: CSSProperties & ColorPickerKnobStyle;
} & {
  channel: ChannelId;
  label?: ReactNode;
  "aria-label"?: string;
};

export type ColorPickerOutputProps = Omit<Omit<ComponentProps<"div">, "children">, "style"> & {
  style?: CSSProperties & ColorPickerKnobStyle;
} & {
  children?: ReactNode;
  renderValue?: (state: { value: string }) => ReactNode;
};

const isColorFormat = (v: string): v is ColorFormat => v === "hex" || v === "rgb" || v === "hsl" || v === "oklch";
const CHANNEL_NAMES: Record<ChannelId, string> = {
  r: "Red",
  g: "Green",
  b: "Blue",
  h: "Hue",
  s: "Saturation",
  l: "Lightness",
  okl: "OKLCH lightness",
  okc: "OKLCH chroma",
  okh: "OKLCH hue",
  a: "Opacity",
};

function subscribeEyeDropper() {
  return () => {};
}

function getEyeDropperSnapshot() {
  return typeof window !== "undefined" && Boolean(window.EyeDropper);
}

function getEyeDropperServerSnapshot() {
  return false;
}

export function ColorPickerInput({
  size = "sm",
  className,
  invalidLabel = "Enter a hex, rgb(), hsl() or oklch() color.",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: ColorPickerInputProps) {
  const { valueString, setFromString, disabled } = useColorPicker();
  const invalidMessageId = useId();
  const [draft, setDraft] = useState(valueString);
  const [editing, setEditing] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const describedBy = [ariaDescribedBy, invalid ? invalidMessageId : undefined].filter(Boolean).join(" ") || undefined;
  const shown = editing ? draft : valueString;
  const commit = () => {
    const accepted = setFromString(draft);
    setInvalid(!accepted);
    if (accepted) setEditing(false);
  };
  const revert = () => {
    setInvalid(false);
    setEditing(false);
  };
  return (
    <span data-control-ui="color-picker" data-control-family="color-picker" data-slot="input" className="contents">
      <Input
        {...props}
        size={size}
        value={shown}
        disabled={disabled}
        spellCheck={false}
        autoComplete="off"
        aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? "Color value") : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={className}
        onFocus={(event) => {
          onFocus?.(event);
          if (editing) return;
          setDraft(valueString);
          setEditing(true);
        }}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => {
          onBlur?.(event);
          commit();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "Enter") commit();
          else if (event.key === "Escape") revert();
        }}
      />
      {invalid ? (
        <span id={invalidMessageId} className="sr-only">
          {invalidLabel}
        </span>
      ) : null}
    </span>
  );
}

export function ColorPickerFormatSelect({
  formats = ["hex", "rgb", "hsl", "oklch"],
  size = "sm",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  style,
}: ColorPickerFormatSelectProps) {
  const { format, setFormat, disabled } = useColorPicker();
  return (
    <Select
      value={format}
      disabled={disabled}
      onValueChange={(value) => {
        if (isColorFormat(value)) setFormat(value);
      }}
    >
      <SelectTrigger
        size={size}
        data-control-ui="color-picker"
        data-slot="format"
        aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? "Color format") : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={className}
        style={style}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {formats.map((f) => (
          <SelectItem key={f} value={f}>
            {f.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ColorPickerChannels({ className, children, ...props }: ColorPickerChannelsProps) {
  const { hsva, format, alpha } = useColorPicker();
  const specs = getChannels(hsva, format).filter((spec) => alpha || spec.id !== "a");
  return (
    <div
      data-control-ui="color-picker"
      data-control-family="color-picker"
      data-slot="channels"
      className={cn("grid grid-flow-col auto-cols-fr", className)}
      {...props}
    >
      {children ?? specs.map((spec) => <ColorPickerChannel key={spec.id} channel={spec.id} label={spec.label} />)}
    </div>
  );
}

export function ColorPickerChannel({ channel, label, className, "aria-label": ariaLabel, ...props }: ColorPickerChannelProps) {
  const { hsva, format, setChannelValue, disabled } = useColorPicker();
  const spec = getChannels(hsva, format).find((s) => s.id === channel);
  if (!spec) return null;
  return (
    <div
      data-control-ui="color-picker"
      data-control-family="color-picker"
      data-slot="channel"
      className={cn("grid grid-cols-1", className)}
      {...props}
    >
      <NumberField
        size="sm"
        value={spec.value}
        min={spec.min}
        max={spec.max}
        step={spec.step}
        disabled={disabled}
        onValueChange={(value) => {
          if (value !== null) setChannelValue(channel, value);
        }}
      >
        <NumberFieldGroup className="w-full">
          <NumberFieldInput aria-label={ariaLabel ?? `${CHANNEL_NAMES[channel]} channel`} className="px-1 text-center" />
        </NumberFieldGroup>
      </NumberField>
      <span data-control-ui="color-picker" data-control-family="color-picker" data-slot="channel-label">
        {label ?? spec.label}
      </span>
    </div>
  );
}

declare global {
  interface Window {
    EyeDropper?: { new (): { open: () => Promise<{ sRGBHex: string }> } };
  }
}

export function ColorPickerEyeDropper({ className, children, ...props }: ColorPickerEyeDropperProps) {
  const { setFromString, disabled } = useColorPicker();
  const supported = useSyncExternalStore(subscribeEyeDropper, getEyeDropperSnapshot, getEyeDropperServerSnapshot);
  if (!supported) return null;
  const pick = async () => {
    const Ctor = window.EyeDropper;
    if (!Ctor) return;
    try {
      const result = await new Ctor().open();
      setFromString(result.sRGBHex);
    } catch {}
  };
  return (
    <Button
      variant="surface"
      size="sm"
      iconOnly
      disabled={disabled}
      aria-label="Pick a color from the screen"
      data-control-ui="color-picker"
      data-slot="eye-dropper"
      className={className}
      onClick={pick}
      {...props}
    >
      {children ?? <EyeDropperIcon />}
    </Button>
  );
}

export function ColorPickerOutput({ className, children, renderValue, ...props }: ColorPickerOutputProps) {
  const { valueString } = useColorPicker();
  return (
    <div
      data-control-ui="color-picker"
      data-control-family="color-picker"
      data-slot="output"
      className={cn("flex items-center", className)}
      {...props}
    >
      {renderValue
        ? renderValue({ value: valueString })
        : (children ?? (
            <>
              <span
                data-control-ui="color-picker"
                data-control-family="color-picker"
                data-slot="output-swatch"
                className="relative shrink-0 overflow-hidden"
              >
                <span
                  data-control-ui="color-picker"
                  data-control-family="color-picker"
                  data-slot="output-checker"
                  aria-hidden
                  className="absolute inset-0"
                />
                <span
                  data-control-ui="color-picker"
                  data-control-family="color-picker"
                  data-slot="output-color"
                  aria-hidden
                  className="absolute inset-0"
                  style={{ backgroundColor: valueString }}
                />
              </span>
              <span data-control-ui="color-picker" data-control-family="color-picker" data-slot="output-value">
                {valueString}
              </span>
            </>
          ))}
    </div>
  );
}

function EyeDropperIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.5 2.5a1.8 1.8 0 0 1 2.5 2.5l-1.3 1.3.9.9-1.1 1.1-.9-.9-4.4 4.4-2.2.6.6-2.2 4.4-4.4-.9-.9 1.1-1.1.9.9 1.3-1.3Z" />
    </svg>
  );
}
