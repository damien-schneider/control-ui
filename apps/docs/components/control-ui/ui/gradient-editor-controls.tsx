"use client";

import type { ControlSize } from "@/components/control-ui/control-variants";
import type { GradientInterpolation, GradientType } from "@/components/control-ui/lib/gradient";
import { useGradientEditor } from "@/components/control-ui/ui/gradient-editor";
import { NumberField, NumberFieldGroup, NumberFieldInput, NumberFieldScrubArea } from "@/components/control-ui/ui/number-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";

type GradientEditorSelectProps = {
  size?: ControlSize;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export type GradientEditorTypeSelectProps = GradientEditorSelectProps;
export type GradientEditorInterpolationSelectProps = GradientEditorSelectProps;

export type GradientEditorAngleProps = { size?: ControlSize; className?: string; "aria-label"?: string };

const GRADIENT_TYPE_LABELS: Record<GradientType, string> = { linear: "Linear", radial: "Radial", conic: "Conic" };
const GRADIENT_INTERPOLATION_LABELS: Record<GradientInterpolation, string> = { srgb: "sRGB", oklab: "OKLab", oklch: "OKLCH" };
const WHOLE_DEGREES: Intl.NumberFormatOptions = { maximumFractionDigits: 0 };

function GradientEditorSelect<TValue extends string>({
  value,
  onValueChange,
  labels,
  defaultLabel,
  size = "sm",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: GradientEditorSelectProps & {
  value: TValue;
  onValueChange: (value: TValue) => void;
  labels: Record<TValue, string>;
  defaultLabel: string;
}) {
  return (
    <Select<TValue> value={value} onValueChange={onValueChange} items={labels}>
      <SelectTrigger
        size={size}
        aria-label={ariaLabelledBy === undefined ? (ariaLabel ?? defaultLabel) : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={className}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries<string>(labels).map(([option, label]) => (
          <SelectItem key={option} value={option}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function GradientEditorTypeSelect(props: GradientEditorTypeSelectProps) {
  const { type, setType } = useGradientEditor();
  return (
    <GradientEditorSelect value={type} onValueChange={setType} labels={GRADIENT_TYPE_LABELS} defaultLabel="Gradient type" {...props} />
  );
}

export function GradientEditorInterpolationSelect(props: GradientEditorInterpolationSelectProps) {
  const { interpolation, setInterpolation } = useGradientEditor();
  return (
    <GradientEditorSelect
      value={interpolation}
      onValueChange={setInterpolation}
      labels={GRADIENT_INTERPOLATION_LABELS}
      defaultLabel="Gradient color space"
      {...props}
    />
  );
}

export function GradientEditorAngle({ size = "sm", className, "aria-label": ariaLabel = "Gradient angle" }: GradientEditorAngleProps) {
  const { type, angle, setAngle } = useGradientEditor();
  if (type === "radial") return null;
  return (
    <NumberField
      size={size}
      className={className}
      value={angle}
      min={0}
      max={360}
      format={WHOLE_DEGREES}
      onValueChange={(next) => {
        if (next !== null) setAngle(next);
      }}
    >
      <NumberFieldGroup className="w-full">
        <NumberFieldInput aria-label={ariaLabel} />
        <NumberFieldScrubArea>°</NumberFieldScrubArea>
      </NumberFieldGroup>
    </NumberField>
  );
}
