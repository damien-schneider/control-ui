"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { OpenChangeEventDetails } from "@/components/control-ui/control-props";
import type { ColorPickerKnobStyle } from "@/components/control-ui/knob-contracts/color-picker-knobs";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { controlEffectsAttribute } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { ColorPickerArea } from "@/components/control-ui/ui/color-picker-area";
import {
  ColorPickerContext,
  type ColorPickerStateProps,
  useColorPicker,
  useColorState,
} from "@/components/control-ui/ui/color-picker-context";
import { ColorPickerAlpha, ColorPickerHue } from "@/components/control-ui/ui/color-picker-sliders";
import { ColorPickerFormatSelect, ColorPickerInput } from "@/components/control-ui/ui/color-picker-values";
import { useGradientEditor } from "@/components/control-ui/ui/gradient-editor";

export type { ColorFormat } from "@/components/control-ui/lib/color";
// biome-ignore lint/performance/noBarrelFile: Preserve the color picker install-facing API.
export {
  ColorPickerArea,
  type ColorPickerAreaProps,
  ColorPickerAreaThumb,
  type ColorPickerAreaThumbProps,
  ColorPickerWheel,
  type ColorPickerWheelProps,
} from "@/components/control-ui/ui/color-picker-area";
export {
  ColorPickerAreaContrast,
  type ColorPickerAreaContrastProps,
  ColorPickerContrast,
  type ColorPickerContrastProps,
} from "@/components/control-ui/ui/color-picker-contrast";
export {
  ColorPickerAlpha,
  type ColorPickerAlphaProps,
  ColorPickerBrightness,
  type ColorPickerBrightnessProps,
  ColorPickerHue,
  type ColorPickerHueProps,
  ColorPickerSaturation,
  type ColorPickerSaturationProps,
} from "@/components/control-ui/ui/color-picker-sliders";
export {
  ColorPickerSwatch,
  ColorPickerSwatchAdd,
  type ColorPickerSwatchAddProps,
  ColorPickerSwatches,
  type ColorPickerSwatchesProps,
  type ColorPickerSwatchProps,
} from "@/components/control-ui/ui/color-picker-swatches";
export {
  ColorPickerChannel,
  type ColorPickerChannelProps,
  ColorPickerChannels,
  type ColorPickerChannelsProps,
  ColorPickerEyeDropper,
  type ColorPickerEyeDropperProps,
  ColorPickerFormatSelect,
  type ColorPickerFormatSelectProps,
  ColorPickerInput,
  type ColorPickerInputProps,
  ColorPickerOutput,
  type ColorPickerOutputProps,
} from "@/components/control-ui/ui/color-picker-values";
export {
  GradientEditor,
  GradientEditorPreview,
  type GradientEditorPreviewProps,
  type GradientEditorProps,
  GradientEditorStop,
  GradientEditorStopAdd,
  type GradientEditorStopAddProps,
  type GradientEditorStopProps,
  GradientEditorTrack,
  type GradientEditorTrackProps,
  type GradientInterpolation,
  type GradientStop,
  type GradientType,
  type GradientValue,
} from "@/components/control-ui/ui/gradient-editor";
export {
  GradientEditorAngle,
  type GradientEditorAngleProps,
  GradientEditorInterpolationSelect,
  type GradientEditorInterpolationSelectProps,
  GradientEditorTypeSelect,
  type GradientEditorTypeSelectProps,
} from "@/components/control-ui/ui/gradient-editor-controls";

export type ColorPickerProps = ColorPickerStateProps & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  children?: ReactNode;
};

export type ColorPickerTriggerProps = Omit<ComponentProps<"button">, "style"> & { style?: CSSProperties & ColorPickerKnobStyle };

export type ColorPickerContentProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle } & {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
};

export type ColorPickerPanelProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle };

export type GradientEditorStopColorProps = { children?: ReactNode };

export function ColorPicker({ open, defaultOpen, onOpenChange, children, ...state }: ColorPickerProps) {
  const ctx = useColorState(state);
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
      data-control-family="color-picker"
      data-slot="trigger"
      data-disabled={disabled ? "true" : undefined}
      disabled={disabled}
      aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? `Choose color (${valueString})`) : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn("relative inline-flex shrink-0 cursor-pointer overflow-hidden disabled:cursor-not-allowed", className)}
      {...props}
    >
      <span
        data-control-ui="color-picker"
        data-control-family="color-picker"
        data-slot="trigger-checker"
        aria-hidden
        className="absolute inset-0"
      />
      <span
        data-control-ui="color-picker"
        data-control-family="color-picker"
        data-slot="trigger-color"
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: valueString }}
      />
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
  const skin = useSkin();
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        data-control-ui="color-picker"
        data-popup-kind="color-picker"
        data-control-family="popup"
        data-slot="positioner"
        data-skin={skin.id}
        data-effects={controlEffectsAttribute(skin.effects)}
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-(--z-popup)"
      >
        <PopoverPrimitive.Popup
          data-control-ui="color-picker"
          data-popup-kind="color-picker"
          data-control-family="popup"
          data-slot="content"
          data-surface="floating"
          data-popup-part="surface"
          className={cn("grid", className)}
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
      data-popup-kind="color-picker"
      data-control-family="popup"
      data-slot="panel"
      data-surface="floating"
      data-popup-part="surface"
      data-popup-static=""
      className={cn("grid", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function GradientEditorStopColor({ children }: GradientEditorStopColorProps) {
  const { selectedStop, setStopColor } = useGradientEditor();
  if (!selectedStop) return null;
  return (
    <ColorPicker value={selectedStop.color} onValueChange={(color) => setStopColor(selectedStop.id, color)} defaultFormat="hex">
      {children ?? (
        <>
          <ColorPickerTrigger />
          <ColorPickerContent>
            <ColorPickerArea />
            <ColorPickerHue />
            <ColorPickerAlpha />
            <div data-control-ui="gradient-editor" data-control-family="gradient-editor" data-slot="value-row" className="flex">
              <ColorPickerFormatSelect />
              <ColorPickerInput className="flex-1" />
            </div>
          </ColorPickerContent>
        </>
      )}
    </ColorPicker>
  );
}
