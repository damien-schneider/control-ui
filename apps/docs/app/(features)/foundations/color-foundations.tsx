"use client";

import { BADGE_COLORS, Badge } from "@/components/control-ui/ui/badge";
import { COLOR_RAMPS, RAMP_STEP_COUNT } from "@/src/registry/lib/theme-contract";
import { contractDescription, contractTokensNamed, Specimen, SpecimenGroup, TokenValueList } from "./specimen/specimen";

const SURFACE_ROLES = [
  "--canvas",
  "--background",
  "--card",
  "--popover",
  "--muted",
  "--secondary",
  "--accent",
  "--primary",
  "--destructive",
];
const TEXT_ROLES = [
  "--foreground",
  "--muted-foreground",
  "--primary-text",
  "--destructive-text",
  "--success-text",
  "--warning-text",
  "--info-text",
];
const LINE_ROLES = ["--border", "--input", "--control-rim", "--ring", "--focus-ring"];
const CONTROL_FILL_ROLES = ["--control-fill", "--hover-fill", "--active-fill"];
const RAMP_SEEDS = COLOR_RAMPS.map((ramp) => `--scale-${ramp}-seed`);

const RAMP_STEPS = Array.from({ length: RAMP_STEP_COUNT }, (_, index) => index + 1);
const STEP_PURPOSES = [
  { span: 2, purpose: "Backgrounds" },
  { span: 3, purpose: "Component fills" },
  { span: 3, purpose: "Borders" },
  { span: 2, purpose: "Solid fills" },
  { span: 2, purpose: "Text" },
];
const RAMP_GRID_COLUMNS = "grid grid-cols-[4.5rem_repeat(12,minmax(0,1fr))] gap-1";

function SurfaceSwatch({ role }: { role: string }) {
  const pairedForegrounds = contractTokensNamed([`${role}-foreground`]);
  const foreground = pairedForegrounds[0] ?? "--foreground";
  return (
    <Specimen token={role} companionTokens={pairedForegrounds} description={contractDescription(role)}>
      <div
        className="grid h-20 place-items-center rounded-[var(--radius-panel)] text-heading-3 font-display ring-1 ring-inset ring-border"
        style={{ background: `var(${role})`, color: `var(${foreground})` }}
      >
        Aa
      </div>
    </Specimen>
  );
}

function TextSwatch({ role }: { role: string }) {
  return (
    <Specimen token={role} description={contractDescription(role)}>
      <p
        className="rounded-[var(--radius-panel)] bg-background px-4 py-3 text-body-lg ring-1 ring-inset ring-border"
        style={{ color: `var(${role})` }}
      >
        The quick brown fox
      </p>
    </Specimen>
  );
}

function LineSwatch({ role }: { role: string }) {
  return (
    <Specimen token={role} description={contractDescription(role)}>
      <div className="h-12 rounded-[var(--radius-control)] border-2 bg-background" style={{ borderColor: `var(${role})` }} />
    </Specimen>
  );
}

function RampTable() {
  return (
    <div className="grid min-w-0 gap-1 overflow-x-auto">
      <div className={RAMP_GRID_COLUMNS}>
        <span />
        {STEP_PURPOSES.map(({ span, purpose }) => (
          <span
            key={purpose}
            className="truncate border-b border-border pb-1 text-center text-micro text-muted-foreground"
            style={{ gridColumn: `span ${span}` }}
          >
            {purpose}
          </span>
        ))}
        <span />
        {RAMP_STEPS.map((step) => (
          <span key={step} className="text-center font-mono text-micro tabular-nums text-muted-foreground">
            {step}
          </span>
        ))}
      </div>
      {COLOR_RAMPS.map((ramp) => (
        <div key={ramp} className={RAMP_GRID_COLUMNS}>
          <span className="self-center truncate font-mono text-micro text-foreground">{ramp}</span>
          {RAMP_STEPS.map((step) => (
            <div
              key={step}
              className="h-9 rounded-[var(--radius-sm)] ring-1 ring-inset ring-border"
              style={{ background: `var(--scale-${ramp}-${step})` }}
              title={`--scale-${ramp}-${step}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ColorFoundations() {
  return (
    <div className="grid min-w-0">
      <SpecimenGroup title="Ramps">
        <RampTable />
        <TokenValueList names={RAMP_SEEDS} />
      </SpecimenGroup>
      <SpecimenGroup title="Surfaces">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SURFACE_ROLES.map((role) => (
            <SurfaceSwatch key={role} role={role} />
          ))}
        </div>
      </SpecimenGroup>
      <SpecimenGroup title="Text">
        <div className="grid gap-4 sm:grid-cols-2">
          {TEXT_ROLES.map((role) => (
            <TextSwatch key={role} role={role} />
          ))}
        </div>
      </SpecimenGroup>
      <SpecimenGroup title="Lines">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LINE_ROLES.map((role) => (
            <LineSwatch key={role} role={role} />
          ))}
        </div>
      </SpecimenGroup>
      <SpecimenGroup title="Control fills">
        <div className="grid gap-4 sm:grid-cols-3">
          {CONTROL_FILL_ROLES.map((role) => (
            <SurfaceSwatch key={role} role={role} />
          ))}
        </div>
      </SpecimenGroup>
      <SpecimenGroup title="Badge colors">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BADGE_COLORS.map((color) => (
            <Specimen
              key={color}
              token={`--badge-${color}`}
              companionTokens={[`--badge-${color}-foreground`, `--badge-${color}-border`, `--badge-${color}-hover`]}
            >
              <div className="flex flex-wrap gap-2">
                <Badge color={color}>{color}</Badge>
                <Badge color={color} variant="outline">
                  {color}
                </Badge>
              </div>
            </Specimen>
          ))}
        </div>
      </SpecimenGroup>
    </div>
  );
}
