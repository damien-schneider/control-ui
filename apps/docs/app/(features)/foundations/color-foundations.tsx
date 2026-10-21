"use client";

import { BADGE_COLORS, Badge } from "@/components/control-ui/ui/badge";
import { CHART_COLORS } from "@/components/control-ui/ui/chart-colors";
import { Text } from "@/components/control-ui/ui/typography";
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
const STATUS_ROLES = ["--success", "--warning", "--info"];
const TEXT_ROLES = ["--foreground", "--muted-foreground", "--primary-text", "--destructive-text"];
const LINE_ROLES = ["--border", "--input", "--control-rim", "--control-boundary", "--image-outline", "--ring", "--focus-ring"];
const CONTROL_FILL_ROLES = ["--control-fill", "--hover-fill", "--active-fill"];
const SIDEBAR_SURFACE_ROLES = ["--sidebar", "--sidebar-accent"];
const SIDEBAR_LINE_ROLES = ["--sidebar-primary", "--sidebar-border"];
const BADGE_ALPHAS = ["--badge-fill-alpha", "--badge-border-alpha", "--badge-hover-alpha"];
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
      <Text
        as="div"
        size="heading-3"
        className="grid h-20 place-items-center rounded-[var(--radius-panel)] ring-1 ring-inset ring-border"
        style={{ background: `var(${role})`, color: `var(${foreground})` }}
      >
        Aa
      </Text>
    </Specimen>
  );
}

function TextSwatch({ role }: { role: string }) {
  return (
    <Specimen token={role} description={contractDescription(role)}>
      <Text
        as="p"
        size="body-lg"
        className="rounded-[var(--radius-panel)] bg-background px-4 py-3 ring-1 ring-inset ring-border"
        style={{ color: `var(${role})` }}
      >
        The quick brown fox
      </Text>
    </Specimen>
  );
}

function StatusSwatch({ role }: { role: string }) {
  const textRole = `${role}-text`;
  return (
    <Specimen token={role} companionTokens={[textRole]} description={contractDescription(role)}>
      <div className="grid gap-3 rounded-[var(--radius-panel)] bg-background p-3 ring-1 ring-inset ring-border">
        <span className="block h-6 rounded-[var(--radius-sm)]" style={{ background: `var(${role})` }} />
        <Text as="p" size="body-lg" style={{ color: `var(${textRole})` }}>
          The quick brown fox
        </Text>
      </div>
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

function CanvasGridDotSwatch() {
  return (
    <Specimen token="--canvas-grid-dot" description={contractDescription("--canvas-grid-dot")}>
      <div
        className="h-12 rounded-[var(--radius-control)] ring-1 ring-inset ring-border"
        style={{
          backgroundColor: "var(--canvas)",
          backgroundImage: "radial-gradient(circle at center, var(--canvas-grid-dot) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
      />
    </Specimen>
  );
}

function RampTable() {
  return (
    <div className="grid min-w-0 gap-1 overflow-x-auto">
      <div className={RAMP_GRID_COLUMNS}>
        <span />
        {STEP_PURPOSES.map(({ span, purpose }) => (
          <Text
            key={purpose}
            size="micro"
            tone="muted"
            className="truncate border-b border-border pb-1 text-center"
            style={{ gridColumn: `span ${span}` }}
          >
            {purpose}
          </Text>
        ))}
        <span />
        {RAMP_STEPS.map((step) => (
          <Text key={step} size="micro" tone="muted" className="text-center font-mono tabular-nums">
            {step}
          </Text>
        ))}
      </div>
      {COLOR_RAMPS.map((ramp) => (
        <div key={ramp} className={RAMP_GRID_COLUMNS}>
          <Text size="micro" tone="foreground" className="self-center truncate font-mono">
            {ramp}
          </Text>
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
      <SpecimenGroup title="Status">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATUS_ROLES.map((role) => (
            <StatusSwatch key={role} role={role} />
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
          <CanvasGridDotSwatch />
        </div>
      </SpecimenGroup>
      <SpecimenGroup title="Control fills">
        <div className="grid gap-4 sm:grid-cols-3">
          {CONTROL_FILL_ROLES.map((role) => (
            <SurfaceSwatch key={role} role={role} />
          ))}
        </div>
      </SpecimenGroup>
      <SpecimenGroup title="Sidebar">
        <div className="grid gap-4 sm:grid-cols-2">
          {SIDEBAR_SURFACE_ROLES.map((role) => (
            <SurfaceSwatch key={role} role={role} />
          ))}
          {SIDEBAR_LINE_ROLES.map((role) => (
            <LineSwatch key={role} role={role} />
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
        <TokenValueList names={BADGE_ALPHAS} />
      </SpecimenGroup>
      <SpecimenGroup title="Chart colors">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHART_COLORS.map((color) => (
            <Specimen key={color} token={`--chart-${color}`}>
              <span className="block h-6 rounded-sm" style={{ background: `var(--chart-${color})` }} />
            </Specimen>
          ))}
        </div>
      </SpecimenGroup>
    </div>
  );
}
