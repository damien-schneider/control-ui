"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import type { ComponentProps, CSSProperties } from "react";
import type { ColorPickerKnobStyle } from "@/components/control-ui/knob-contracts/color-picker-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { formatColor, type Hsva } from "@/components/control-ui/lib/color";
import { useColorPicker } from "@/components/control-ui/ui/color-picker-context";

export type ColorPickerSliderProps = Pick<ComponentProps<"div">, "className" | "aria-label" | "aria-labelledby"> & {
  style?: CSSProperties & ColorPickerKnobStyle;
};

export type ColorPickerHueProps = ColorPickerSliderProps;
export type ColorPickerSaturationProps = ColorPickerSliderProps;
export type ColorPickerBrightnessProps = ColorPickerSliderProps;
export type ColorPickerAlphaProps = ColorPickerSliderProps;

type SliderAxis = "h" | "s" | "v" | "a";

type SliderAxisSpec = {
  label: string;
  max: number;
  step: number;
  format: Intl.NumberFormatOptions;
  trackStops: (hsva: Hsva) => readonly [string, string, ...string[]];
};

type SliderTrackStyle = CSSProperties & Record<"--_color-picker-slider-track-image", string>;

const THUMB_HALF_SIZE = "calc(var(--_color-picker-thumb-size) / 2)";

const HUE_TRACK_STOPS = [
  "hsl(0 100% 50%)",
  "hsl(60 100% 50%)",
  "hsl(120 100% 50%)",
  "hsl(180 100% 50%)",
  "hsl(240 100% 50%)",
  "hsl(300 100% 50%)",
  "hsl(360 100% 50%)",
] as const;

const opaqueHex = (hsva: Hsva) => formatColor({ ...hsva, a: 1 }, "hex");

const SLIDER_AXES: Record<SliderAxis, SliderAxisSpec> = {
  h: { label: "Hue", max: 360, step: 1, format: { style: "unit", unit: "degree" }, trackStops: () => HUE_TRACK_STOPS },
  s: {
    label: "Saturation",
    max: 100,
    step: 1,
    format: { style: "unit", unit: "percent" },
    trackStops: (hsva) => [opaqueHex({ ...hsva, s: 0 }), opaqueHex({ ...hsva, s: 100 })],
  },
  v: {
    label: "Brightness",
    max: 100,
    step: 1,
    format: { style: "unit", unit: "percent" },
    trackStops: (hsva) => [opaqueHex({ ...hsva, v: 0 }), opaqueHex({ ...hsva, v: 100 })],
  },
  a: {
    label: "Opacity",
    max: 1,
    step: 0.01,
    format: { style: "percent" },
    trackStops: (hsva) => ["transparent", opaqueHex(hsva)],
  },
};

function edgeAlignedTrackStyle(stops: readonly [string, string, ...string[]]): SliderTrackStyle {
  const lastIndex = stops.length - 1;
  const positionedStops = stops.map((stop, index) => {
    if (index === 0) return `${stop} ${THUMB_HALF_SIZE}`;
    if (index === lastIndex) return `${stop} calc(100% - ${THUMB_HALF_SIZE})`;
    return stop;
  });
  return { "--_color-picker-slider-track-image": `linear-gradient(to right, ${positionedStops.join(", ")})` };
}

function ColorPickerSlider({
  axis,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: ColorPickerSliderProps & { axis: SliderAxis }) {
  const { hsva, setHsva, disabled } = useColorPicker();
  const { label, max, step, format, trackStops } = SLIDER_AXES[axis];
  return (
    <SliderPrimitive.Root<number>
      data-control-ui="color-picker"
      data-control-family="color-picker"
      data-slot="slider"
      format={format}
      aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? label) : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      value={hsva[axis]}
      min={0}
      max={max}
      step={step}
      disabled={disabled}
      thumbAlignment="edge"
      onValueChange={(next) => setHsva({ [axis]: next })}
      className={cn(
        "relative flex w-full cursor-pointer touch-pan-y select-none items-center data-[disabled]:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Control className="flex h-full w-full items-center">
        <SliderPrimitive.Track
          data-control-ui="color-picker"
          data-control-family="color-picker"
          data-slot="slider-track"
          className="relative w-full"
          style={edgeAlignedTrackStyle(trackStops(hsva))}
        >
          <SliderPrimitive.Thumb
            data-control-ui="color-picker"
            data-control-family="color-picker"
            data-slot="slider-thumb"
            data-focus-ring="within"
            className="block"
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export function ColorPickerHue(props: ColorPickerHueProps) {
  return <ColorPickerSlider axis="h" {...props} />;
}

export function ColorPickerSaturation(props: ColorPickerSaturationProps) {
  return <ColorPickerSlider axis="s" {...props} />;
}

export function ColorPickerBrightness(props: ColorPickerBrightnessProps) {
  return <ColorPickerSlider axis="v" {...props} />;
}

export function ColorPickerAlpha(props: ColorPickerAlphaProps) {
  const { alpha } = useColorPicker();
  if (!alpha) return null;
  return <ColorPickerSlider axis="a" {...props} />;
}
