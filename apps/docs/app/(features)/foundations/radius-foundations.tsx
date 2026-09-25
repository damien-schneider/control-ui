"use client";

import { contractDescription, Specimen, SpecimenGroup, TokenValueList } from "./specimen/specimen";
import { formatPx, useComputedReadout } from "./specimen/theme-readouts";

const RADIUS_SCALE = ["--radius-sm", "--radius-md", "--radius-lg", "--radius-xl", "--radius-2xl"];
const RADIUS_ROLES = ["--radius-popup-item", "--radius-control", "--radius-field", "--radius-popover", "--radius-panel", "--radius-scene"];

function readCornerRadius(style: CSSStyleDeclaration) {
  return formatPx(style.borderTopLeftRadius);
}

function RadiusTile({ token, withDescription }: { token: string; withDescription?: boolean }) {
  const [ref, radius] = useComputedReadout<HTMLDivElement>(readCornerRadius);
  return (
    <Specimen token={token} readout={radius} description={withDescription ? contractDescription(token) : undefined}>
      <div
        ref={ref}
        className="h-20 bg-muted ring-1 ring-inset ring-border [corner-shape:var(--corner-shape)]"
        style={{ borderRadius: `var(${token})` }}
      />
    </Specimen>
  );
}

export function RadiusFoundations() {
  return (
    <div className="grid min-w-0">
      <SpecimenGroup title="Scale">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {RADIUS_SCALE.map((token) => (
            <RadiusTile key={token} token={token} />
          ))}
        </div>
      </SpecimenGroup>
      <SpecimenGroup title="Roles">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RADIUS_ROLES.map((token) => (
            <RadiusTile key={token} token={token} withDescription />
          ))}
        </div>
      </SpecimenGroup>
      <SpecimenGroup title="Knobs">
        <TokenValueList names={["--radius", "--corner-shape", "--corner-radius-fit"]} />
      </SpecimenGroup>
    </div>
  );
}
