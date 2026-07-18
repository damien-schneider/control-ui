import { DiagramNode, FlowArrow, GuideVisual } from "./guide-visual";

const customizationRungs = [
  { name: "Token", file: "theme.css", note: "Change a named value" },
  { name: "Variant", file: "prop", note: "Two values coexist in one app" },
  { name: "DS choice", file: "ControlUiSkin", note: "One decision for the design system" },
  { name: "Slot", file: "skin.config", note: "React to existing variants" },
  { name: "Pack CSS", file: "skin.css", note: "Pseudo-elements, keyframes, families" },
  { name: "Global utility", file: "effects.css", note: "Reusable token-driven effect" },
  { name: "Extension", file: "optional item", note: "Installable behavior or anchored effect" },
  { name: "Edit source", file: "owned file", note: "Restructure the installed anatomy" },
];

export function ArchitectureLayers() {
  return (
    <GuideVisual title="Ownership map" description="Runtime outside; installable source inside">
      <div className="grid items-stretch gap-3 md:grid-cols-[minmax(0,0.8fr)_auto_minmax(0,1.2fr)]">
        <div className="flex min-w-0 flex-col justify-center">
          <DiagramNode className="border-dashed bg-muted/35">
            <div className="font-medium">Host app runtime</div>
            <div className="mt-0.5 text-caption text-muted-foreground">streaming · transport · persistence · tools</div>
          </DiagramNode>
          <FlowArrow direction="down" />
          <DiagramNode>
            <div className="font-medium">Usage composition</div>
            <div className="mt-0.5 text-caption text-muted-foreground">native provider parts rendered directly</div>
          </DiagramNode>
        </div>

        <FlowArrow className="hidden md:grid" />
        <FlowArrow direction="down" className="md:hidden" />

        <div className="min-w-0 border-primary/20 border-l-2 pl-3">
          <div className="mb-2 font-mono text-micro text-primary">installed source</div>
          <div className="grid gap-2">
            <DiagramNode className="bg-primary/8">
              <div className="font-medium">Blocks</div>
              <div className="text-caption text-muted-foreground">complete recipes composed from public surfaces</div>
            </DiagramNode>
            <div className="grid gap-2 sm:grid-cols-[1.35fr_0.65fr]">
              <DiagramNode>
                <div className="font-medium">Components</div>
                <div className="text-caption text-muted-foreground">behavior · markup · stable anatomy</div>
              </DiagramNode>
              <DiagramNode>
                <div className="font-medium">Hooks</div>
                <div className="text-caption text-muted-foreground">reusable local UI behavior</div>
              </DiagramNode>
            </div>
            <DiagramNode className="border-primary/30 bg-primary/5">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span className="font-medium">Skin data</span>
                <span className="font-mono text-micro text-primary">theme.css · skin.css · skin.config.tsx</span>
              </div>
            </DiagramNode>
          </div>
        </div>
      </div>
    </GuideVisual>
  );
}

export function SkinFileStack() {
  return (
    <GuideVisual title="One skin pack" description="Same three files; advanced packs use more of them">
      <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,0.7fr)]">
        <ol className="relative grid gap-2 pl-4">
          <li className="relative z-30 translate-x-0 rounded-lg border border-primary/35 bg-background px-4 py-3 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:translate-x-1">
            <div className="font-mono text-label">skin.config.tsx</div>
            <div className="mt-0.5 text-caption text-muted-foreground">typed slots · DS choices · adornments</div>
          </li>
          <li className="relative z-20 ml-2 rounded-lg border border-border bg-muted/65 px-4 py-3 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:translate-x-1">
            <div className="font-mono text-label">skin.css</div>
            <div className="mt-0.5 text-caption text-muted-foreground">pseudo-elements · keyframes · descendant families</div>
          </li>
          <li className="relative z-10 ml-4 rounded-lg border border-border bg-muted/35 px-4 py-3 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:translate-x-1">
            <div className="font-mono text-label">theme.css</div>
            <div className="mt-0.5 text-caption text-muted-foreground">token values scoped by data-skin</div>
          </li>
        </ol>
        <FlowArrow className="hidden md:grid" />
        <FlowArrow direction="down" className="md:hidden" />
        <div className="grid place-items-center rounded-lg bg-primary/8 p-5 text-center ring-1 ring-primary/20">
          <div className="grid size-16 place-items-center rounded-lg bg-background font-display text-heading-3 ring-1 ring-border">UI</div>
          <div className="mt-3 font-medium text-label">One component tree</div>
          <div className="mt-1 text-caption text-muted-foreground">never a skin-specific fork</div>
        </div>
      </div>
    </GuideVisual>
  );
}

export function SkinResolutionMap() {
  return (
    <GuideVisual title="Render-time resolution" description="Static config, plain functions, caller last">
      <div className="grid gap-4">
        <div className="grid items-center gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <DiagramNode className="font-mono">skin.config.tsx</DiagramNode>
          <FlowArrow className="hidden md:grid" />
          <DiagramNode className="font-mono">skin.ts resolver</DiagramNode>
          <FlowArrow className="hidden md:grid" />
          <DiagramNode className="border-primary/30 bg-primary/8 font-mono">component render</DiagramNode>
        </div>
        <div className="rounded-lg bg-foreground p-3 text-background">
          <div className="grid items-center gap-2 font-mono text-caption sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <span className="rounded-md bg-background/10 px-2 py-1.5">library recipe</span>
            <span aria-hidden="true" className="text-center opacity-60">
              +
            </span>
            <span className="rounded-md bg-background/10 px-2 py-1.5">skin slot override</span>
            <span aria-hidden="true" className="text-center opacity-60">
              +
            </span>
            <span className="rounded-md bg-primary px-2 py-1.5 text-primary-foreground">caller className wins</span>
          </div>
        </div>
        <div className="text-caption text-muted-foreground">
          Refined config: <code className="font-mono text-foreground">{`{ id: "refined" }`}</code>. Every installed pack supplies this file;
          no provider or wrapper is required.
        </div>
      </div>
    </GuideVisual>
  );
}

export function CustomizationLadder() {
  return (
    <GuideVisual title="Escalation ladder" description="Start at 1. Stop as soon as the change fits.">
      <div className="grid gap-3 md:grid-cols-[auto_1fr]">
        <div className="hidden items-center text-micro text-muted-foreground md:flex [writing-mode:vertical-rl]">
          cheaper and easier to undo → deeper ownership
        </div>
        <ol className="grid gap-1.5">
          {customizationRungs.map((rung, index) => (
            <li
              key={rung.name}
              className="group grid grid-cols-[1.5rem_minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-2 rounded-lg px-2 py-2 transition-[background-color,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:translate-x-1 hover:bg-primary/7"
            >
              <span className="grid size-6 place-items-center rounded-md bg-foreground font-mono text-background text-micro">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-label">{rung.name}</span>
                <span className="block truncate font-mono text-micro text-primary">{rung.file}</span>
              </span>
              <span className="text-caption text-muted-foreground">{rung.note}</span>
            </li>
          ))}
        </ol>
      </div>
    </GuideVisual>
  );
}

export function RegistryPipeline() {
  const outputs = ["source manifests", "public payloads", "live previews", "API + index", "agent docs"];

  return (
    <GuideVisual title="Derived registry pipeline" description="Validation rejects every drifted view">
      <div className="grid items-center gap-3 md:grid-cols-[0.8fr_auto_1fr_auto_1.2fr]">
        <div className="grid gap-2">
          <DiagramNode className="font-mono">docs catalog</DiagramNode>
          <DiagramNode className="font-mono">real import graph</DiagramNode>
        </div>
        <FlowArrow className="hidden md:grid" />
        <div className="rounded-lg bg-primary px-4 py-4 text-center text-primary-foreground">
          <div className="font-medium text-label">Registry model</div>
          <div className="mt-1 text-caption opacity-80">ownership · deps · install closure</div>
        </div>
        <FlowArrow className="hidden md:grid" />
        <div className="flex flex-wrap gap-1.5">
          {outputs.map((output) => (
            <span key={output} className="rounded-md border border-border/70 bg-background px-2 py-1.5 text-caption">
              {output}
            </span>
          ))}
        </div>
      </div>
    </GuideVisual>
  );
}
