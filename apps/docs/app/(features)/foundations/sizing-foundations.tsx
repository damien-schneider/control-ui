"use client";

import type { ControlSize } from "@/components/control-ui/control-variants";
import { Button } from "@/components/control-ui/ui/button";
import { contractTokenNames, Specimen, SpecimenGroup, TokenValueList } from "./specimen/specimen";
import { formatPx, useComputedReadout } from "./specimen/theme-readouts";

const CONTROL_SIZES: readonly ControlSize[] = ["xs", "sm", "md", "lg"];

const LAYOUT_KNOBS = contractTokenNames("layout").filter((name) => !name.startsWith("--focus-ring"));

function readHeight(style: CSSStyleDeclaration) {
  return formatPx(style.height);
}

function ControlHeight({ size }: { size: ControlSize }) {
  const [ref, height] = useComputedReadout<HTMLSpanElement>(readHeight);
  return (
    <Specimen token={`--control-h-${size}`} readout={height}>
      <span ref={ref} className="inline-flex w-fit">
        <Button size={size}>Button {size}</Button>
      </span>
    </Specimen>
  );
}

export function SizingFoundations() {
  return (
    <div className="grid min-w-0">
      <SpecimenGroup title="Control heights">
        <div className="grid grid-cols-2 items-end gap-4 sm:grid-cols-4">
          {CONTROL_SIZES.map((size) => (
            <ControlHeight key={size} size={size} />
          ))}
        </div>
      </SpecimenGroup>
      <SpecimenGroup title="Density knobs">
        <TokenValueList names={LAYOUT_KNOBS} />
      </SpecimenGroup>
    </div>
  );
}
