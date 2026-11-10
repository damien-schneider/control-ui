"use client";

import {
  BlendIcon,
  EyeIcon,
  EyeOffIcon,
  Link2Icon,
  MinusIcon,
  PlusIcon,
  RotateCwIcon,
  SquareRoundCornerIcon,
  Unlink2Icon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerHue,
  ColorPickerInput,
  ColorPickerTrigger,
} from "@/components/control-ui/ui/color-picker";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/control-ui/ui/empty";
import { InputGroup, InputGroupAddon } from "@/components/control-ui/ui/input-group";
import { NumberField, NumberFieldGroup, NumberFieldInput, NumberFieldScrubArea } from "@/components/control-ui/ui/number-field";
import { Separator } from "@/components/control-ui/ui/separator";
import { Toggle } from "@/components/control-ui/ui/toggle";
import { Heading } from "@/components/control-ui/ui/typography";
import { type DesignCanvasFill, type DesignCanvasLayer, resizeDesignCanvasLayer } from "./design-canvas-data";

const WHOLE_NUMBER_FORMAT: Intl.NumberFormatOptions = { useGrouping: false, maximumFractionDigits: 0 };
const DEFAULT_FILL: DesignCanvasFill = { color: "#D9D9D9", opacity: 100, visible: true };

export type DesignCanvasInspectorLabels = {
  emptyTitle: string;
  emptyDescription: string;
  position: string;
  x: string;
  y: string;
  rotation: string;
  layout: string;
  width: string;
  height: string;
  lockAspectRatio: string;
  appearance: string;
  opacity: string;
  cornerRadius: string;
  fill: string;
  addFill: string;
  removeFill: string;
  showFill: string;
  chooseFillColor: string;
  fillColor: string;
  fillOpacity: string;
};

export const designCanvasInspectorLabels: DesignCanvasInspectorLabels = {
  emptyTitle: "Nothing selected",
  emptyDescription: "Select a layer to edit its position, size, and fill.",
  position: "Position",
  x: "X position",
  y: "Y position",
  rotation: "Rotation",
  layout: "Layout",
  width: "Width",
  height: "Height",
  lockAspectRatio: "Lock aspect ratio",
  appearance: "Appearance",
  opacity: "Layer opacity",
  cornerRadius: "Corner radius",
  fill: "Fill",
  addFill: "Add fill",
  removeFill: "Remove fill",
  showFill: "Show fill",
  chooseFillColor: "Choose fill color",
  fillColor: "Fill color",
  fillOpacity: "Fill opacity",
};

export type DesignCanvasInspectorProps = {
  layer: DesignCanvasLayer | undefined;
  onLayerChange: (layer: DesignCanvasLayer) => void;
  labels?: Partial<DesignCanvasInspectorLabels>;
};

export function DesignCanvasInspector({ layer, onLayerChange, labels: labelOverrides }: DesignCanvasInspectorProps) {
  const labels = { ...designCanvasInspectorLabels, ...labelOverrides };
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false);

  if (!layer) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyTitle>{labels.emptyTitle}</EmptyTitle>
          <EmptyDescription>{labels.emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const update = (patch: Partial<DesignCanvasLayer>) => onLayerChange({ ...layer, ...patch });
  const hasCornerRadius = layer.kind === "frame" || layer.kind === "rectangle";

  return (
    <div className="flex flex-col">
      <InspectorSection title={labels.position}>
        <ScrubField label={labels.x} prefix="X" value={layer.x} onValueChange={(x) => update({ x })} />
        <ScrubField label={labels.y} prefix="Y" value={layer.y} onValueChange={(y) => update({ y })} />
        <ScrubField
          label={labels.rotation}
          className="col-start-1"
          prefix={<RotateCwIcon />}
          value={layer.rotation}
          min={-360}
          max={360}
          format={{ ...WHOLE_NUMBER_FORMAT, style: "unit", unit: "degree", unitDisplay: "narrow" }}
          onValueChange={(rotation) => update({ rotation })}
        />
      </InspectorSection>

      <InspectorSection title={labels.layout}>
        <ScrubField
          label={labels.width}
          prefix="W"
          value={layer.width}
          min={1}
          onValueChange={(width) => onLayerChange(resizeDesignCanvasLayer(layer, { width }, aspectRatioLocked))}
        />
        <ScrubField
          label={labels.height}
          prefix="H"
          value={layer.height}
          min={1}
          onValueChange={(height) => onLayerChange(resizeDesignCanvasLayer(layer, { height }, aspectRatioLocked))}
        />
        <Toggle
          size="sm"
          variant="ghost"
          iconOnly
          aria-label={labels.lockAspectRatio}
          pressed={aspectRatioLocked}
          onPressedChange={setAspectRatioLocked}
        >
          {aspectRatioLocked ? <Link2Icon /> : <Unlink2Icon />}
        </Toggle>
      </InspectorSection>

      <InspectorSection title={labels.appearance}>
        <ScrubField
          label={labels.opacity}
          prefix={<BlendIcon />}
          suffix="%"
          value={layer.opacity}
          min={0}
          max={100}
          onValueChange={(opacity) => update({ opacity })}
        />
        {hasCornerRadius ? (
          <ScrubField
            label={labels.cornerRadius}
            prefix={<SquareRoundCornerIcon />}
            value={layer.cornerRadius}
            min={0}
            onValueChange={(cornerRadius) => update({ cornerRadius })}
          />
        ) : null}
      </InspectorSection>

      <InspectorSection
        title={labels.fill}
        action={
          layer.fill ? null : (
            <Button size="xs" variant="ghost" iconOnly aria-label={labels.addFill} onClick={() => update({ fill: DEFAULT_FILL })}>
              <PlusIcon />
            </Button>
          )
        }
      >
        {layer.fill ? (
          <FillRow labels={labels} fill={layer.fill} onFillChange={(fill) => update({ fill })} onRemove={() => update({ fill: null })} />
        ) : null}
      </InspectorSection>
    </div>
  );
}

function InspectorSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-2 border-b px-3 py-3">
      <header className="flex h-6 items-center justify-between">
        <Heading level={3} size="caption" weight="medium">
          {title}
        </Heading>
        {action}
      </header>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2 empty:hidden">{children}</div>
    </section>
  );
}

type ScrubFieldProps = {
  label: string;
  className?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  format?: Intl.NumberFormatOptions;
};

function ScrubField({ label, className, prefix, suffix, value, onValueChange, min, max, format = WHOLE_NUMBER_FORMAT }: ScrubFieldProps) {
  return (
    <NumberField
      size="sm"
      className={className}
      value={value}
      min={min}
      max={max}
      format={format}
      onValueChange={(next) => {
        if (next !== null) onValueChange(next);
      }}
    >
      <NumberFieldGroup className="w-full">
        {prefix ? <NumberFieldScrubArea>{prefix}</NumberFieldScrubArea> : null}
        <NumberFieldInput aria-label={label} />
        {suffix ? <NumberFieldScrubArea>{suffix}</NumberFieldScrubArea> : null}
      </NumberFieldGroup>
    </NumberField>
  );
}

type FillRowProps = {
  labels: DesignCanvasInspectorLabels;
  fill: DesignCanvasFill;
  onFillChange: (fill: DesignCanvasFill) => void;
  onRemove: () => void;
};

function FillRow({ labels, fill, onFillChange, onRemove }: FillRowProps) {
  return (
    <>
      <ColorPicker value={fill.color} alpha={false} onValueChange={(color) => onFillChange({ ...fill, color })}>
        <InputGroup size="sm" className="col-span-2">
          <InputGroupAddon>
            <ColorPickerTrigger aria-label={labels.chooseFillColor} />
          </InputGroupAddon>
          <ColorPickerInput aria-label={labels.fillColor} />
          <Separator orientation="vertical" className="h-4" />
          <NumberField
            value={fill.opacity}
            min={0}
            max={100}
            format={WHOLE_NUMBER_FORMAT}
            className="shrink-0"
            onValueChange={(opacity) => {
              if (opacity !== null) onFillChange({ ...fill, opacity });
            }}
          >
            <NumberFieldGroup className="w-full">
              <NumberFieldInput aria-label={labels.fillOpacity} />
              <NumberFieldScrubArea>%</NumberFieldScrubArea>
            </NumberFieldGroup>
          </NumberField>
        </InputGroup>
        <ColorPickerContent side="left" align="start">
          <ColorPickerArea />
          <div className="flex items-center gap-2">
            <ColorPickerEyeDropper />
            <ColorPickerHue className="flex-1" />
          </div>
        </ColorPickerContent>
      </ColorPicker>
      <div className="flex">
        <Toggle
          size="sm"
          variant="ghost"
          iconOnly
          aria-label={labels.showFill}
          pressed={fill.visible}
          onPressedChange={(visible) => onFillChange({ ...fill, visible })}
        >
          {fill.visible ? <EyeIcon /> : <EyeOffIcon />}
        </Toggle>
        <Button size="sm" variant="ghost" iconOnly aria-label={labels.removeFill} onClick={onRemove}>
          <MinusIcon />
        </Button>
      </div>
    </>
  );
}
