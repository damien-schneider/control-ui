import { Badge } from "@/components/control-ui/ui/badge";
import { Button } from "@/components/control-ui/ui/button";
import { Input } from "@/components/control-ui/ui/input";
import { SKIN_CONFIGS } from "@/components/skin-registry";
import { VarTag } from "./controls";
import { SKIN_META_BY_ID } from "./presets";
import type { SkinId } from "./types";

function nestedEntryCount(value: object | undefined): number {
  if (!value) return 0;
  return Object.values(value).reduce((count, entries) => count + (entries ? Object.keys(entries).length : 0), 0);
}

function SectionHeading({ id, number, title, description }: { id: string; number: string; title: string; description: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[2rem_minmax(0,1fr)]">
      <span className="font-mono text-[10px] text-primary-text">{number}</span>
      <div className="min-w-0">
        <h3 id={id} className="text-[14px] font-semibold text-foreground">
          {title}
        </h3>
        <p className="mt-1 max-w-2xl text-[11px] leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function SkinFileStack({ skin }: { skin: SkinId }) {
  const files = SKIN_META_BY_ID[skin].paths?.filter((file) => file.slot === "theme" || file.slot === "skin" || file.slot === "config");

  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h4 className="text-[11px] font-semibold text-foreground">Pack files</h4>
        <span className="text-[9px] text-muted-foreground">installed together</span>
      </div>
      <ol className="divide-y divide-border/70 border-y border-border/70">
        {files?.map((file, index) => {
          const [name, detail] = file.label.split(" — ");
          return (
            <li key={file.path} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 py-3">
              <span className="font-mono text-[9px] text-muted-foreground">0{index + 1}</span>
              <span className="min-w-0">
                <code className="block font-mono text-[10px] font-medium text-foreground">{name}</code>
                <span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">{detail}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ResolutionOrder() {
  const layers = [
    { name: "Component recipe", detail: "Baseline variants, state, and anatomy" },
    { name: "Skin knobs", detail: "Registered custom properties re-valued in skin.css" },
    { name: "Skin CSS", detail: "Pseudo-elements, relational selectors, and shared families" },
    { name: "Caller className", detail: "Per-instance utilities merged last" },
  ];

  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h4 className="text-[11px] font-semibold text-foreground">Class resolution</h4>
        <span className="text-[9px] text-muted-foreground">later layers win</span>
      </div>
      <ol className="grid gap-1.5">
        {layers.map((layer, index) => (
          <li
            key={layer.name}
            className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 rounded-[var(--radius-control)] bg-foreground/4 px-2.5 py-2"
          >
            <span className="grid size-5 place-items-center rounded-[var(--radius-sm)] bg-foreground text-[9px] font-semibold text-background">
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold text-foreground">{layer.name}</span>
              <span className="block text-[9px] leading-4 text-muted-foreground">{layer.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ComponentAnatomyPreview() {
  return (
    <div className="grid overflow-hidden rounded-[var(--radius-panel)] border border-border/70 lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)]">
      <div className="grid min-h-64 place-items-center bg-canvas p-5 sm:p-7">
        <div className="w-full max-w-md rounded-[var(--radius-panel)] bg-card p-4 shadow-panel ring-1 ring-border">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold text-foreground">Live component tree</div>
              <div className="mt-0.5 text-[9px] text-muted-foreground">Rendered by the active skin</div>
            </div>
            <Badge variant="outline" size="sm">
              preview
            </Badge>
          </div>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <VarTag>input / root</VarTag>
              <Input aria-label="Preview field" placeholder="Component anatomy" />
            </div>
            <div className="grid gap-1.5">
              <VarTag>button / root + content</VarTag>
              <div className="flex flex-wrap gap-2">
                <Button variant="solid" tone="primary" size="sm">
                  Primary action
                </Button>
                <Button variant="surface" size="sm">
                  Surface action
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <VarTag>badge / root</VarTag>
              <Badge>Active</Badge>
              <Badge variant="outline">Neutral</Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-4 border-border/70 border-t bg-background p-5 lg:border-t-0 lg:border-l">
        <div>
          <h4 className="text-[11px] font-semibold text-foreground">Anatomy is the contract</h4>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
            Components emit scope, part, and semantic state. Recipes paint that stable anatomy without forking component source.
          </p>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 border-border/70 border-b pb-2">
            <span className="text-[10px] text-muted-foreground">Scope</span>
            <VarTag>data-control-ui=&quot;button&quot;</VarTag>
          </div>
          <div className="flex items-center justify-between gap-3 border-border/70 border-b pb-2">
            <span className="text-[10px] text-muted-foreground">Part</span>
            <VarTag>data-slot=&quot;root&quot;</VarTag>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] text-muted-foreground">Knob</span>
            <VarTag>--button-bg</VarTag>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThemeArchitecture({ skin }: { skin: SkinId }) {
  const config = SKIN_CONFIGS[skin];
  const meta = SKIN_META_BY_ID[skin];
  const adornmentCount = nestedEntryCount(config.adornments);
  const effectCount = config.effects?.length ?? 0;
  const hasSystemChoice = Boolean(config.motion || config.colorScheme || config.sidebarLayout || config.sidebarWidth || config.indicators);
  const configuredCount = adornmentCount + effectCount + (hasSystemChoice ? 1 : 0);

  return (
    <section id="theme-architecture" aria-labelledby="theme-architecture-title" className="scroll-mt-6 border-border border-t pt-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <SectionHeading
            id="theme-architecture-title"
            number="02"
            title="Understand the skin stack"
            description="Tokens feed shared CSS recipes. Typed config remains only for behavior and optional adornments."
          />
          <div className="mt-5 pl-0 sm:pl-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge size="sm">{meta.kind === "theme" ? "Theme pack" : "Advanced pack"}</Badge>
              <span className="text-[10px] text-muted-foreground">
                {configuredCount === 0 ? "CSS and tokens only" : `${configuredCount} configured skin hooks`}
              </span>
            </div>
            <p className="mt-3 max-w-lg text-[10px] leading-4 text-muted-foreground">{meta.description}</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <SkinFileStack skin={skin} />
          <ResolutionOrder />
        </div>
      </div>
      <div className="mt-6">
        <ComponentAnatomyPreview />
      </div>
    </section>
  );
}
