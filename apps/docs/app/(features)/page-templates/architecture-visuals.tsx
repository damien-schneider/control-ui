import { Text } from "@/components/control-ui/ui/typography";
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
            <Text as="div" size="label" weight="medium">
              Host app runtime
            </Text>
            <Text as="div" size="caption" tone="muted" className="mt-0.5">
              streaming · transport · persistence · tools
            </Text>
          </DiagramNode>
          <FlowArrow direction="down" />
          <DiagramNode>
            <Text as="div" size="label" weight="medium">
              Usage composition
            </Text>
            <Text as="div" size="caption" tone="muted" className="mt-0.5">
              native provider parts rendered directly
            </Text>
          </DiagramNode>
        </div>

        <FlowArrow className="hidden md:grid" />
        <FlowArrow direction="down" className="md:hidden" />

        <div className="min-w-0 border-primary/20 border-l-2 pl-3">
          <Text as="div" size="micro" tone="primary" className="mb-2 font-mono">
            installed source
          </Text>
          <div className="grid gap-2">
            <DiagramNode className="border-primary/30">
              <Text as="div" size="label" weight="medium">
                Blocks
              </Text>
              <Text as="div" size="caption" tone="muted">
                complete recipes composed from public surfaces
              </Text>
            </DiagramNode>
            <div className="grid gap-2 sm:grid-cols-[1.35fr_0.65fr]">
              <DiagramNode>
                <Text as="div" size="label" weight="medium">
                  Components
                </Text>
                <Text as="div" size="caption" tone="muted">
                  behavior · markup · stable anatomy
                </Text>
              </DiagramNode>
              <DiagramNode>
                <Text as="div" size="label" weight="medium">
                  Hooks
                </Text>
                <Text as="div" size="caption" tone="muted">
                  reusable local UI behavior
                </Text>
              </DiagramNode>
            </div>
            <DiagramNode className="border-primary/30 bg-primary/5">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <Text size="label" weight="medium">
                  Skin data
                </Text>
                <Text size="micro" tone="primary" className="font-mono">
                  theme.css · skin.css · skin.config.tsx
                </Text>
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
          <li className="relative z-30 translate-x-0 rounded-lg border border-primary/35 bg-background px-4 py-3 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:translate-x-1 motion-reduce:transition-none">
            <Text as="div" size="label" className="font-mono">
              skin.config.tsx
            </Text>
            <Text as="div" size="caption" tone="muted" className="mt-0.5">
              typed slots · DS choices · adornments
            </Text>
          </li>
          <li className="relative z-20 ml-2 rounded-lg border border-border bg-muted/65 px-4 py-3 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:translate-x-1 motion-reduce:transition-none">
            <Text as="div" size="label" className="font-mono">
              skin.css
            </Text>
            <Text as="div" size="caption" tone="muted" className="mt-0.5">
              pseudo-elements · keyframes · descendant families
            </Text>
          </li>
          <li className="relative z-10 ml-4 rounded-lg border border-border bg-muted/35 px-4 py-3 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:translate-x-1 motion-reduce:transition-none">
            <Text as="div" size="label" className="font-mono">
              theme.css
            </Text>
            <Text as="div" size="caption" tone="muted" className="mt-0.5">
              token values scoped by data-skin
            </Text>
          </li>
        </ol>
        <FlowArrow className="hidden md:grid" />
        <FlowArrow direction="down" className="md:hidden" />
        <div className="grid place-items-center rounded-lg bg-primary/8 p-5 text-center ring-1 ring-primary/20">
          <Text
            as="div"
            size="heading-3"
            className="grid size-16 place-items-center rounded-[max(0px,calc(var(--radius-lg)-1.25rem))] bg-background ring-1 ring-border"
          >
            UI
          </Text>
          <Text as="div" size="label" weight="medium" className="mt-3">
            One component tree
          </Text>
          <Text as="div" size="caption" tone="muted" className="mt-1">
            never a skin-specific fork
          </Text>
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
          <Text as="div" size="caption" className="grid items-center gap-2 font-mono sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <span className="rounded-md bg-background/10 px-2 py-1.5">library recipe</span>
            <span aria-hidden="true" className="text-center opacity-60">
              +
            </span>
            <span className="rounded-md bg-background/10 px-2 py-1.5">skin slot override</span>
            <span aria-hidden="true" className="text-center opacity-60">
              +
            </span>
            <span className="rounded-md bg-primary px-2 py-1.5 text-primary-foreground">caller className wins</span>
          </Text>
        </div>
        <Text as="div" size="caption" tone="muted">
          Refined config: <Text as="code" size="caption" tone="foreground" className="font-mono">{`{ id: "refined" }`}</Text>. Every
          installed pack supplies this file; no provider or wrapper is required.
        </Text>
      </div>
    </GuideVisual>
  );
}

export function CustomizationLadder() {
  return (
    <GuideVisual title="Escalation ladder" description="Start at 1. Stop as soon as the change fits.">
      <div className="grid gap-3 md:grid-cols-[auto_1fr]">
        <Text as="div" size="micro" tone="muted" className="hidden items-center md:flex [writing-mode:vertical-rl]">
          cheaper and easier to undo → deeper ownership
        </Text>
        <ol className="grid gap-1.5">
          {customizationRungs.map((rung, index) => (
            <li
              key={rung.name}
              className="group grid grid-cols-[1.5rem_minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-2 rounded-lg px-2 py-2 transition-[background-color,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:translate-x-1 hover:bg-primary/7 motion-reduce:transition-none"
            >
              <Text size="micro" className="grid size-6 place-items-center rounded-md bg-foreground font-mono text-background">
                {index + 1}
              </Text>
              <span className="min-w-0">
                <Text size="label" weight="medium" className="block">
                  {rung.name}
                </Text>
                <Text size="micro" tone="primary" className="block truncate font-mono">
                  {rung.file}
                </Text>
              </span>
              <Text size="caption" tone="muted">
                {rung.note}
              </Text>
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
          <Text as="div" size="label" weight="medium">
            Registry model
          </Text>
          <Text as="div" size="caption" className="mt-1 opacity-80">
            ownership · deps · install closure
          </Text>
        </div>
        <FlowArrow className="hidden md:grid" />
        <div className="flex flex-wrap gap-1.5">
          {outputs.map((output) => (
            <Text key={output} size="caption" className="rounded-md border border-border/70 bg-background px-2 py-1.5">
              {output}
            </Text>
          ))}
        </div>
      </div>
    </GuideVisual>
  );
}
