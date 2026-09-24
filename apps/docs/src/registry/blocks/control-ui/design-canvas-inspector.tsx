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
import { type DesignCanvasFill, type DesignCanvasLayer, resizeDesignCanvasLayer } from "./design-canvas-data";

const WHOLE_NUMBER_FORMAT: Intl.NumberFormatOptions = { useGrouping: false, maximumFractionDigits: 0 };
const DEFAULT_FILL: DesignCanvasFill = { color: "#D9D9D9", opacity: 100, visible: true };

export type DesignCanvasInspectorProps = {
  layer: DesignCanvasLayer | undefined;
  onLayerChange: (layer: DesignCanvasLayer) => void;
};

export function DesignCanvasInspector({ layer, onLayerChange }: DesignCanvasInspectorProps) {
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false);

  if (!layer) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyTitle>Nothing selected</EmptyTitle>
          <EmptyDescription>Select a layer to edit its position, size, and fill.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const update = (patch: Partial<DesignCanvasLayer>) => onLayerChange({ ...layer, ...patch });

  return (
    <div className="flex flex-col">
      <InspectorSection title="Position">
        <ScrubField label="X position" prefix="X" value={layer.x} onValueChange={(x) => update({ x })} />
        <ScrubField label="Y position" prefix="Y" value={layer.y} onValueChange={(y) => update({ y })} />
        <ScrubField
          label="Rotation"
          className="col-start-1"
          prefix={<RotateCwIcon />}
          value={layer.rotation}
          min={-360}
          max={360}
          format={{ ...WHOLE_NUMBER_FORMAT, style: "unit", unit: "degree", unitDisplay: "narrow" }}
          onValueChange={(rotation) => update({ rotation })}
        />
      </InspectorSection>

      <InspectorSection title="Layout">
        <ScrubField
          label="Width"
          prefix="W"
          value={layer.width}
          min={1}
          onValueChange={(width) => onLayerChange(resizeDesignCanvasLayer(layer, { width }, aspectRatioLocked))}
        />
        <ScrubField
          label="Height"
          prefix="H"
          value={layer.height}
          min={1}
          onValueChange={(height) => onLayerChange(resizeDesignCanvasLayer(layer, { height }, aspectRatioLocked))}
        />
        <Toggle
          size="sm"
          variant="ghost"
          iconOnly
          aria-label="Lock aspect ratio"
          pressed={aspectRatioLocked}
          onPressedChange={setAspectRatioLocked}
        >
          {aspectRatioLocked ? <Link2Icon /> : <Unlink2Icon />}
        </Toggle>
      </InspectorSection>

      <InspectorSection title="Appearance">
        <ScrubField
          label="Layer opacity"
          prefix={<BlendIcon />}
          suffix="%"
          value={layer.opacity}
          min={0}
          max={100}
          onValueChange={(opacity) => update({ opacity })}
        />
        <ScrubField
          label="Corner radius"
          prefix={<SquareRoundCornerIcon />}
          value={layer.cornerRadius}
          min={0}
          onValueChange={(cornerRadius) => update({ cornerRadius })}
        />
      </InspectorSection>

      <InspectorSection
        title="Fill"
        action={
          layer.fill ? null : (
            <Button size="xs" variant="ghost" iconOnly aria-label="Add fill" onClick={() => update({ fill: DEFAULT_FILL })}>
              <PlusIcon />
            </Button>
          )
        }
      >
        {layer.fill ? (
          <FillRow fill={layer.fill} onFillChange={(fill) => update({ fill })} onRemove={() => update({ fill: null })} />
        ) : null}
      </InspectorSection>
    </div>
  );
}

function InspectorSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-2 border-b px-3 py-3">
      <header className="flex h-6 items-center justify-between">
        <h3 className="text-caption font-medium">{title}</h3>
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
  fill: DesignCanvasFill;
  onFillChange: (fill: DesignCanvasFill) => void;
  onRemove: () => void;
};

function FillRow({ fill, onFillChange, onRemove }: FillRowProps) {
  return (
    <>
      <ColorPicker value={fill.color} alpha={false} onValueChange={(color) => onFillChange({ ...fill, color })}>
        <InputGroup size="sm" className="col-span-2">
          <InputGroupAddon>
            <ColorPickerTrigger aria-label="Choose fill color" />
          </InputGroupAddon>
          <ColorPickerInput aria-label="Fill color" />
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
              <NumberFieldInput aria-label="Fill opacity" />
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
          aria-label="Show fill"
          pressed={fill.visible}
          onPressedChange={(visible) => onFillChange({ ...fill, visible })}
        >
          {fill.visible ? <EyeIcon /> : <EyeOffIcon />}
        </Toggle>
        <Button size="sm" variant="ghost" iconOnly aria-label="Remove fill" onClick={onRemove}>
          <MinusIcon />
        </Button>
      </div>
    </>
  );
}
