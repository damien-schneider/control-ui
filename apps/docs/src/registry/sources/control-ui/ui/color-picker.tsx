"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type {
  ColorFormat,
  ColorPickerAlphaProps,
  ColorPickerAreaProps,
  ColorPickerAreaThumbProps,
  ColorPickerChannelProps,
  ColorPickerChannelsProps,
  ColorPickerContentProps,
  ColorPickerContrastProps,
  ColorPickerEyeDropperProps,
  ColorPickerFormatSelectProps,
  ColorPickerHueProps,
  ColorPickerInputProps,
  ColorPickerOutputProps,
  ColorPickerPanelProps,
  ColorPickerProps,
  ColorPickerSwatchAddProps,
  ColorPickerSwatchesProps,
  ColorPickerSwatchProps,
  ColorPickerTriggerProps,
  ColorPickerWheelProps,
} from "@/components/control-ui/contracts";
import { useColorArea } from "@/components/control-ui/hooks/use-color-area";
import { cn } from "@/components/control-ui/lib/cn";
import {
  type ChannelId,
  formatColor,
  getChannels,
  type Hsva,
  hsvaToRgba,
  parseColor,
  pointToHueSat,
  pointToSaturationValue,
  setChannel,
} from "@/components/control-ui/lib/color";
import { contrastOf, fixColorForContrast, nextFixLevel, TARGET_RATIO, wcagLevels } from "@/components/control-ui/lib/contrast";
import { skinEffects, skinId, skinSlot } from "@/components/control-ui/skin";
import { floatingContentClasses, floatingSurfaceClasses } from "@/components/control-ui/surface-variants";
import { Button } from "@/components/control-ui/ui/button";
import { Input } from "@/components/control-ui/ui/input";
import { NumberField, NumberFieldGroup, NumberFieldInput } from "@/components/control-ui/ui/number-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";

// ─── shared paint constants (gradient DATA, not tokens — see the design contract) ────────────────
const HUE_GRADIENT =
  "linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))";
// Neutral checkerboard that adapts to light/dark via the border token.
const CHECKER = "repeating-conic-gradient(oklch(from var(--border) l c h) 0 25%, transparent 0 50%)";
const CHECKER_SIZE = "10px 10px";
const RING_THUMB =
  "block size-4 -translate-x-1/2 rounded-full border-2 border-white bg-transparent shadow-[0_0_0_1px_oklch(from_var(--foreground)_l_c_h_/_0.35)] outline-none transition-transform duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-foreground/40 data-[dragging]:scale-110";

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

// Keep hue (and sat at true black) when a color arrives achromatic, so the thumbs don't jump to red.
function reconcileAchromatic(prev: Hsva, next: Hsva): Hsva {
  if (next.v === 0) return { ...next, h: prev.h, s: prev.s };
  if (next.s === 0) return { ...next, h: prev.h };
  return next;
}

function subscribeEyeDropper() {
  return () => {};
}

function getEyeDropperSnapshot() {
  return typeof window !== "undefined" && Boolean(window.EyeDropper);
}

function getEyeDropperServerSnapshot() {
  return false;
}

// ─── State + context ─────────────────────────────────────────────────────────

type ColorPickerContextValue = {
  hsva: Hsva;
  format: ColorFormat;
  alpha: boolean;
  disabled: boolean;
  valueString: string;
  setHsva: (partial: Partial<Hsva>) => void;
  setChannelValue: (id: ChannelId, value: number) => void;
  setFromString: (raw: string) => void;
  setFormat: (format: ColorFormat) => void;
};

const ColorPickerContext = createContext<ColorPickerContextValue | null>(null);

function useColorPicker(): ColorPickerContextValue {
  const ctx = useContext(ColorPickerContext);
  if (!ctx) throw new Error("ColorPicker parts must be rendered inside <ColorPicker>.");
  return ctx;
}

function useColorState(props: ColorPickerProps): ColorPickerContextValue {
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

  // Refs mirror latest values so setters read fresh state (fast pointer drags) without side effects in a state updater.
  const hsvaRef = useRef(hsva);
  const formatRef = useRef(format);
  const alphaRef = useRef(alpha);
  const onValueChangeRef = useRef(onValueChange);
  const lastEmitted = useRef<string | null>(null);
  if (lastEmitted.current === null) lastEmitted.current = formatColor(hsva, format, { alpha });

  useEffect(() => {
    hsvaRef.current = hsva;
    formatRef.current = format;
    alphaRef.current = alpha;
    onValueChangeRef.current = onValueChange;
  }, [hsva, format, alpha, onValueChange]);

  // Plain closures over refs: context value rebuilds every render anyway, memoized handler identity buys nothing.
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

  // Reconcile an externally-controlled value. Skip our own echoed emit to avoid thumb jitter.
  useEffect(() => {
    if (value === undefined || value === lastEmitted.current) return;
    const parsed = parseColor(value);
    if (!parsed) return;
    const reconciled = reconcileAchromatic(hsvaRef.current, parsed);
    hsvaRef.current = reconciled;
    lastEmitted.current = value;
    setHsvaState(reconciled);
  }, [value]);

  const setHsva = (partial: Partial<Hsva>) => commit({ ...hsvaRef.current, ...partial });
  const setChannelValue = (id: ChannelId, next: number) => commit(setChannel(hsvaRef.current, id, next));
  const setFromString = (raw: string) => {
    const parsed = parseColor(raw);
    if (!parsed) return;
    commit(reconcileAchromatic(hsvaRef.current, parsed));
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

// ─── Root + popover shell ──────────────────────────────────────────────────────

export function ColorPicker({ open, defaultOpen, onOpenChange, children, ...state }: ColorPickerProps) {
  const ctx = useColorState({ ...state, children });
  return (
    <ColorPickerContext.Provider value={ctx}>
      <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        {children}
      </PopoverPrimitive.Root>
    </ColorPickerContext.Provider>
  );
}

export function ColorPickerTrigger({
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: ColorPickerTriggerProps) {
  const { valueString, disabled } = useColorPicker();
  return (
    <PopoverPrimitive.Trigger
      data-control-ui="color-picker"
      data-slot="trigger"
      data-disabled={disabled ? "true" : undefined}
      disabled={disabled}
      aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? `Choose color (${valueString})`) : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "relative inline-flex size-8 shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-control)] ring-1 ring-inset ring-border outline-none transition focus-visible:ring-2 focus-visible:ring-foreground/40 disabled:cursor-not-allowed disabled:opacity-50",
        skinSlot("color-picker", "trigger", { disabled }),
        className,
      )}
      {...props}
    >
      <span aria-hidden className="absolute inset-0" style={{ backgroundImage: CHECKER, backgroundSize: CHECKER_SIZE }} />
      <span aria-hidden className="absolute inset-0 rounded-[inherit]" style={{ backgroundColor: valueString }} />
    </PopoverPrimitive.Trigger>
  );
}

export function ColorPickerContent({
  className,
  children,
  side = "bottom",
  align = "center",
  sideOffset = 6,
  ...props
}: ColorPickerContentProps) {
  return (
    <PopoverPrimitive.Portal>
      {/* Portals land outside the token-scoped tree, so re-assert the active skin's scope here. */}
      <PopoverPrimitive.Positioner
        data-skin={skinId()}
        data-effects={skinEffects()}
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-[80] outline-none"
      >
        <PopoverPrimitive.Popup
          data-control-ui="color-picker"
          data-slot="content"
          data-surface="floating"
          className={cn("grid w-64 gap-3 p-3", floatingContentClasses, skinSlot("color-picker", "content", {}), className)}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export function ColorPickerPanel({ className, children, ...props }: ColorPickerPanelProps) {
  return (
    <div
      data-control-ui="color-picker"
      data-slot="panel"
      data-surface="floating"
      className={cn("grid w-64 gap-3 p-3", floatingSurfaceClasses, skinSlot("color-picker", "panel", {}), className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Saturation / value area ───────────────────────────────────────────────────

export function ColorPickerArea({ className, ...props }: ColorPickerAreaProps) {
  const { hsva, setHsva, disabled } = useColorPicker();
  const { areaRef, onPointerDown, dragging } = useColorArea((offset, rect) => {
    if (disabled) return;
    const { s, v } = pointToSaturationValue(rect, offset.x, offset.y);
    setHsva({ s, v });
  });

  function axisKey(axis: "s" | "v", event: ReactKeyboardEvent) {
    if (!event.shiftKey) return; // native step (1) handles the un-shifted arrows
    const cur = axis === "s" ? hsva.s : hsva.v;
    let delta = 0;
    if (event.key === "ArrowUp" || event.key === "ArrowRight") delta = 10;
    else if (event.key === "ArrowDown" || event.key === "ArrowLeft") delta = -10;
    if (delta === 0) return;
    event.preventDefault();
    const next = Math.min(100, Math.max(0, cur + delta));
    setHsva(axis === "s" ? { s: next } : { v: next });
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: a 2D color surface is a labelled slider group, not a fieldset form group.
    <div
      ref={areaRef}
      data-control-ui="color-picker"
      data-slot="area"
      data-dragging={dragging ? "true" : undefined}
      role="group"
      aria-label="Saturation and brightness"
      onPointerDown={disabled ? undefined : onPointerDown}
      className={cn(
        "group relative h-40 w-full touch-none select-none overflow-hidden rounded-[var(--radius-field)] ring-1 ring-inset ring-border/60",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-crosshair",
        skinSlot("color-picker", "area", {}),
        className,
      )}
      style={{ backgroundColor: `hsl(${hsva.h} 100% 50%)` }}
      {...props}
    >
      <span aria-hidden className="absolute inset-0 bg-linear-to-r/srgb from-white to-transparent" />
      <span aria-hidden className="absolute inset-0 bg-linear-to-t/srgb from-black to-transparent" />
      <input
        type="range"
        aria-label="Saturation"
        className="sr-only"
        min={0}
        max={100}
        step={1}
        value={Math.round(hsva.s)}
        disabled={disabled}
        onChange={(event) => setHsva({ s: Number(event.target.value) })}
        onKeyDown={(event) => axisKey("s", event)}
      />
      <input
        type="range"
        aria-label="Brightness"
        className="sr-only"
        min={0}
        max={100}
        step={1}
        value={Math.round(hsva.v)}
        disabled={disabled}
        onChange={(event) => setHsva({ v: Number(event.target.value) })}
        onKeyDown={(event) => axisKey("v", event)}
      />
      <ColorPickerAreaThumb style={{ left: `${hsva.s}%`, top: `${100 - hsva.v}%` }} />
    </div>
  );
}

export function ColorPickerAreaThumb({ className, ...props }: ColorPickerAreaThumbProps) {
  return (
    <div
      data-control-ui="color-picker"
      data-slot="area-thumb"
      aria-hidden
      className={cn(
        "pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_oklch(from_var(--foreground)_l_c_h_/_0.4)] transition-[box-shadow] duration-[var(--duration-fast)] group-has-[input:focus-visible]:ring-2 group-has-[input:focus-visible]:ring-foreground/50 group-data-[dragging]:scale-110",
        skinSlot("color-picker", "area-thumb", {}),
        className,
      )}
      {...props}
    />
  );
}

// ─── Hue / alpha sliders (Base UI Slider directly, custom track paint) ─────────

export function ColorPickerHue({ className, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy }: ColorPickerHueProps) {
  const { hsva, setHsva, disabled } = useColorPicker();
  return (
    <SliderPrimitive.Root
      data-control-ui="color-picker"
      data-slot="hue"
      aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? "Hue") : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      value={hsva.h}
      min={0}
      max={360}
      step={1}
      disabled={disabled}
      onValueChange={(next) => setHsva({ h: Array.isArray(next) ? next[0] : next })}
      className={cn("relative flex h-4 w-full touch-none select-none items-center", skinSlot("color-picker", "hue", {}), className)}
    >
      <SliderPrimitive.Control className="flex h-4 w-full items-center">
        <SliderPrimitive.Track
          className="relative h-3 w-full rounded-full ring-1 ring-inset ring-border/50"
          style={{ backgroundImage: HUE_GRADIENT }}
        >
          <SliderPrimitive.Thumb
            data-control-ui="color-picker"
            data-slot="hue-thumb"
            className={cn(RING_THUMB, skinSlot("color-picker", "hue-thumb", {}))}
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export function ColorPickerAlpha({ className, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy }: ColorPickerAlphaProps) {
  const { hsva, setHsva, alpha, disabled } = useColorPicker();
  if (!alpha) return null;
  const opaque = formatColor({ ...hsva, a: 1 }, "hex");
  return (
    <SliderPrimitive.Root
      data-control-ui="color-picker"
      data-slot="alpha"
      aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? "Opacity") : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      value={hsva.a}
      min={0}
      max={1}
      step={0.01}
      disabled={disabled}
      onValueChange={(next) => setHsva({ a: Array.isArray(next) ? next[0] : next })}
      className={cn("relative flex h-4 w-full touch-none select-none items-center", skinSlot("color-picker", "alpha", {}), className)}
    >
      <SliderPrimitive.Control className="flex h-4 w-full items-center">
        <SliderPrimitive.Track
          className="relative h-3 w-full rounded-full ring-1 ring-inset ring-border/50"
          style={{
            backgroundImage: `linear-gradient(to right, transparent, ${opaque}), ${CHECKER}`,
            backgroundSize: `auto, ${CHECKER_SIZE}`,
          }}
        >
          <SliderPrimitive.Thumb
            data-control-ui="color-picker"
            data-slot="alpha-thumb"
            className={cn(RING_THUMB, skinSlot("color-picker", "alpha-thumb", {}))}
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

// ─── Hue/sat wheel (alternate to Area + Hue) ───────────────────────────────────

const WHEEL_HUE =
  "conic-gradient(from 90deg, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))";

export function ColorPickerWheel({ className, ...props }: ColorPickerWheelProps) {
  const { hsva, setHsva, disabled } = useColorPicker();
  const { areaRef, onPointerDown, dragging } = useColorArea((offset, rect) => {
    if (disabled) return;
    const { h, s } = pointToHueSat(rect, offset.x, offset.y);
    setHsva({ h, s });
  });
  const radius = (hsva.s / 100) * 50;
  const rad = (hsva.h * Math.PI) / 180;
  const left = 50 + radius * Math.cos(rad);
  const top = 50 + radius * Math.sin(rad);
  return (
    // biome-ignore lint/a11y/useSemanticElements: a 2D color surface is a labelled slider group, not a fieldset form group.
    <div
      ref={areaRef}
      data-control-ui="color-picker"
      data-slot="wheel"
      data-dragging={dragging ? "true" : undefined}
      role="group"
      aria-label="Color wheel"
      onPointerDown={disabled ? undefined : onPointerDown}
      className={cn(
        "group relative aspect-square w-full touch-none select-none rounded-full ring-1 ring-inset ring-border/60",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-crosshair",
        skinSlot("color-picker", "wheel", {}),
        className,
      )}
      style={{ backgroundImage: `radial-gradient(circle at center, #fff, transparent 70%), ${WHEEL_HUE}` }}
      {...props}
    >
      <div
        data-control-ui="color-picker"
        data-slot="wheel-thumb"
        aria-hidden
        className={cn(
          "pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_oklch(from_var(--foreground)_l_c_h_/_0.4)] group-has-[input:focus-visible]:ring-2 group-has-[input:focus-visible]:ring-foreground/50 group-data-[dragging]:scale-110",
          skinSlot("color-picker", "wheel-thumb", {}),
        )}
        style={{ left: `${left}%`, top: `${top}%` }}
      />
      <input
        type="range"
        aria-label="Wheel hue"
        className="sr-only"
        min={0}
        max={360}
        step={1}
        value={Math.round(hsva.h)}
        disabled={disabled}
        onChange={(event) => setHsva({ h: Number(event.target.value) })}
      />
      <input
        type="range"
        aria-label="Wheel saturation"
        className="sr-only"
        min={0}
        max={100}
        step={1}
        value={Math.round(hsva.s)}
        disabled={disabled}
        onChange={(event) => setHsva({ s: Number(event.target.value) })}
      />
    </div>
  );
}

// ─── Text input + format select ───────────────────────────────────────────────

export function ColorPickerInput({
  size = "sm",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: ColorPickerInputProps) {
  const { valueString, setFromString, disabled } = useColorPicker();
  const [draft, setDraft] = useState(valueString);
  const [editing, setEditing] = useState(false);
  const shown = editing ? draft : valueString;
  const commit = () => {
    setFromString(draft);
    setEditing(false);
  };
  return (
    <Input
      size={size}
      value={shown}
      disabled={disabled}
      data-control-ui="color-picker"
      data-slot="input"
      spellCheck={false}
      autoComplete="off"
      aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? "Color value") : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn("font-mono text-meta", className)}
      onFocus={() => {
        setDraft(valueString);
        setEditing(true);
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit();
        else if (event.key === "Escape") setEditing(false);
      }}
      {...props}
    />
  );
}

export function ColorPickerFormatSelect({
  formats = ["hex", "rgb", "hsl", "oklch"],
  size = "sm",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
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

// ─── Numeric channels ──────────────────────────────────────────────────────────

export function ColorPickerChannels({ className, children, ...props }: ColorPickerChannelsProps) {
  const { hsva, format, alpha } = useColorPicker();
  const specs = getChannels(hsva, format).filter((spec) => alpha || spec.id !== "a");
  return (
    <div
      data-control-ui="color-picker"
      data-slot="channels"
      className={cn("grid grid-flow-col auto-cols-fr gap-1.5", skinSlot("color-picker", "channels", {}), className)}
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
    <div className={cn("grid gap-1 text-center", className)} {...props}>
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
        <NumberFieldGroup data-control-ui="color-picker" data-slot="channel" className="w-full">
          <NumberFieldInput aria-label={ariaLabel ?? `${CHANNEL_NAMES[channel]} channel`} className="px-1" />
        </NumberFieldGroup>
      </NumberField>
      <span className="text-micro text-muted-foreground">{label ?? spec.label}</span>
    </div>
  );
}

// ─── Eyedropper ────────────────────────────────────────────────────────────────

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
    } catch {
      // user cancelled — ignore
    }
  };
  return (
    <Button
      variant="surface"
      size="sm"
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

// ─── Swatches ──────────────────────────────────────────────────────────────────

export function ColorPickerSwatches({ colors, label, className, children, ...props }: ColorPickerSwatchesProps) {
  return (
    <div className="grid gap-1.5">
      {label ? <span className="text-micro text-muted-foreground">{label}</span> : null}
      <div
        data-control-ui="color-picker"
        data-slot="swatches"
        className={cn("flex flex-wrap gap-1.5", skinSlot("color-picker", "swatches", {}), className)}
        {...props}
      >
        {colors?.map((color) => (
          <ColorPickerSwatch key={color} color={color} />
        ))}
        {children}
      </div>
    </div>
  );
}

export function ColorPickerSwatch({ color, className, "aria-label": ariaLabel, ...props }: ColorPickerSwatchProps) {
  const { setFromString, valueString } = useColorPicker();
  const selected = sameColor(valueString, color);
  return (
    <button
      type="button"
      data-control-ui="color-picker"
      data-slot="swatch"
      data-selected={selected ? "true" : undefined}
      aria-pressed={selected}
      aria-label={ariaLabel ?? `Set color ${color}`}
      title={color}
      onClick={() => setFromString(color)}
      className={cn(
        "relative size-6 shrink-0 cursor-pointer overflow-hidden rounded-md ring-1 ring-inset ring-border/60 outline-none transition focus-visible:ring-2 focus-visible:ring-foreground/40 data-[selected=true]:ring-2 data-[selected=true]:ring-foreground",
        skinSlot("color-picker", "swatch", { selected }),
        className,
      )}
      {...props}
    >
      <span aria-hidden className="absolute inset-0" style={{ backgroundImage: CHECKER, backgroundSize: CHECKER_SIZE }} />
      <span aria-hidden className="absolute inset-0" style={{ backgroundColor: color }} />
    </button>
  );
}

export function ColorPickerSwatchAdd({ onAdd, className, children, ...props }: ColorPickerSwatchAddProps) {
  const { valueString } = useColorPicker();
  return (
    <button
      type="button"
      data-control-ui="color-picker"
      data-slot="swatch-add"
      aria-label="Add current color"
      onClick={() => onAdd?.(valueString)}
      className={cn(
        "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-muted-foreground outline-none transition hover:border-foreground/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/40",
        skinSlot("color-picker", "swatch-add", {}),
        className,
      )}
      {...props}
    >
      {children ?? <PlusIcon />}
    </button>
  );
}

// ─── Accessibility advice ──────────────────────────────────────────────────────

export function ColorPickerContrast({ background = "#ffffff", className, ...props }: ColorPickerContrastProps) {
  const { hsva, setFromString } = useColorPicker();
  const bg = parseColor(background);
  if (!bg) return null;
  const bgRgba = hsvaToRgba(bg);
  const ratio = contrastOf(hsva, bgRgba);
  const levels = wcagLevels(ratio);
  const target = nextFixLevel(levels);

  const applyFix = () => {
    if (!target) return;
    const fixed = fixColorForContrast(hsva, bgRgba, TARGET_RATIO[target]);
    if (fixed) setFromString(formatColor(fixed, "hex"));
  };

  return (
    <div
      data-control-ui="color-picker"
      data-slot="contrast"
      className={cn("flex items-center gap-1.5 text-meta", skinSlot("color-picker", "contrast", {}), className)}
      {...props}
    >
      <span className="tabular-nums text-muted-foreground">{ratio.toFixed(2)}:1</span>
      <WcagPill ok={levels.AA}>AA</WcagPill>
      <WcagPill ok={levels.AAA}>AAA</WcagPill>
      {target ? (
        <button
          type="button"
          onClick={applyFix}
          className="ml-auto cursor-pointer rounded-[var(--radius-sm)] px-1.5 py-0.5 font-medium text-foreground underline decoration-dotted underline-offset-2 hover:bg-foreground/6"
        >
          Fix → {target}
        </button>
      ) : null}
    </div>
  );
}

function WcagPill({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-0.5 font-medium",
        ok ? "bg-foreground/6 text-foreground" : "text-muted-foreground line-through decoration-1",
      )}
    >
      {ok ? "✓" : "✕"} {children}
    </span>
  );
}

// ─── Output preview ─────────────────────────────────────────────────────────────

export function ColorPickerOutput({ className, children, renderValue, ...props }: ColorPickerOutputProps) {
  const { valueString } = useColorPicker();
  return (
    <div
      data-control-ui="color-picker"
      data-slot="output"
      className={cn("flex items-center gap-2", skinSlot("color-picker", "output", {}), className)}
      {...props}
    >
      {renderValue
        ? renderValue({ value: valueString })
        : (children ?? (
            <>
              <span className="relative size-6 shrink-0 overflow-hidden rounded-md ring-1 ring-inset ring-border/60">
                <span aria-hidden className="absolute inset-0" style={{ backgroundImage: CHECKER, backgroundSize: CHECKER_SIZE }} />
                <span aria-hidden className="absolute inset-0" style={{ backgroundColor: valueString }} />
              </span>
              <span className="font-mono text-meta text-muted-foreground">{valueString}</span>
            </>
          ))}
    </div>
  );
}

// ─── Equality + local glyphs ─────────────────────────────────────────────────────

function sameColor(a: string, b: string): boolean {
  const pa = parseColor(a);
  const pb = parseColor(b);
  if (!pa || !pb) return false;
  return formatColor(pa, "hex", { alpha: true }) === formatColor(pb, "hex", { alpha: true });
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

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}
