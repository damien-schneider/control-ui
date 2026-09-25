"use client";

import { cn } from "@/components/control-ui/lib/cn";
import { contractTokenNames, Specimen, SpecimenGroup, TokenValueList } from "./specimen/specimen";
import { useContractTokens } from "./specimen/theme-readouts";

const ELEVATION_TIERS = [
  { label: "Hairline", shadowClass: "shadow-xs", knob: "--shadow-control-multiplier" },
  { label: "Control", shadowClass: "shadow-sm", knob: "--shadow-control-multiplier" },
  { label: "Panel", shadowClass: "shadow-md", knob: "--shadow-panel-multiplier" },
  { label: "Popover", shadowClass: "shadow-pop", knob: "--shadow-popover-multiplier" },
  { label: "Modal", shadowClass: "shadow-modal", knob: "--shadow-modal-multiplier" },
  { label: "Ambient", shadowClass: "shadow-soft", knob: "--shadow-ambient-multiplier" },
  { label: "Overlay", shadowClass: "shadow-overlay", knob: "--shadow-opacity" },
  { label: "Inset", shadowClass: "shadow-inset", knob: "--shadow-control-multiplier" },
];

const SHADOW_KNOBS = contractTokenNames("shadow").filter((name) => !name.endsWith("-multiplier"));

export function ElevationFoundations() {
  const tokens = useContractTokens();
  return (
    <div className="grid min-w-0">
      <SpecimenGroup title="Tiers">
        <div className="grid gap-6 rounded-[var(--radius-scene)] bg-canvas p-6 ring-1 ring-inset ring-border sm:grid-cols-2 lg:grid-cols-4">
          {ELEVATION_TIERS.map((tier) => (
            <Specimen key={tier.label} token={tier.knob} readout={tokens[tier.knob]}>
              <div
                className={cn(
                  "grid h-20 place-items-center rounded-[var(--radius-panel)] bg-card text-label font-medium text-card-foreground",
                  tier.shadowClass,
                )}
              >
                {tier.label}
              </div>
            </Specimen>
          ))}
        </div>
      </SpecimenGroup>
      <SpecimenGroup title="Global shadow knobs">
        <TokenValueList names={SHADOW_KNOBS} />
      </SpecimenGroup>
    </div>
  );
}
