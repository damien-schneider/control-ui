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
  trackImage: (hsva: Hsva) => string;
};

const HUE_TRACK_IMAGE =
  "linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))";

const opaqueHex = (hsva: Hsva) => formatColor({ ...hsva, a: 1 }, "hex");

// each axis is one coordinate of the HSVA state, so a strip never loses hue or saturation at its ends
const SLIDER_AXES: Record<SliderAxis, SliderAxisSpec> = {
  h: { label: "Hue", max: 360, step: 1, format: { style: "unit", unit: "degree" }, trackImage: () => HUE_TRACK_IMAGE },
  s: {
    label: "Saturation",
    max: 100,
    step: 1,
    format: { style: "unit", unit: "percent" },
    trackImage: (hsva) => `linear-gradient(to right, ${opaqueHex({ ...hsva, s: 0 })}, ${opaqueHex({ ...hsva, s: 100 })})`,
  },
  v: {
    label: "Brightness",
    max: 100,
    step: 1,
    format: { style: "unit", unit: "percent" },
    trackImage: (hsva) => `linear-gradient(to right, ${opaqueHex({ ...hsva, v: 0 })}, ${opaqueHex({ ...hsva, v: 100 })})`,
  },
  a: {
    label: "Opacity",
    max: 1,
    step: 0.01,
    format: { style: "percent" },
    trackImage: (hsva) => `linear-gradient(to right, transparent, ${opaqueHex(hsva)})`,
  },
};

function ColorPickerSlider({
  axis,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: ColorPickerSliderProps & { axis: SliderAxis }) {
  const { hsva, setHsva, disabled } = useColorPicker();
  const { label, max, step, format, trackImage } = SLIDER_AXES[axis];
  const trackStyle: CSSProperties & Record<"--_color-picker-slider-track-image", string> = {
    "--_color-picker-slider-track-image": trackImage(hsva),
  };
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
      onValueChange={(next) => setHsva({ [axis]: next })}
      className={cn("relative flex w-full touch-pan-y select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Control className="flex h-full w-full items-center">
        <SliderPrimitive.Track
          data-control-ui="color-picker"
          data-control-family="color-picker"
          data-slot="slider-track"
          className="relative w-full"
          style={trackStyle}
        >
          <SliderPrimitive.Thumb
            data-control-ui="color-picker"
            data-control-family="color-picker"
            data-slot="slider-thumb"
            data-focus-ring="within"
            className="block -translate-x-1/2"
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
