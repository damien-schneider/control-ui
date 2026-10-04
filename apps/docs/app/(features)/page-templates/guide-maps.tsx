import { Text } from "@/components/control-ui/ui/typography";
import { DiagramNode, FlowArrow, GuideVisual } from "./guide-visual";

export function CssFirstDecisionMap() {
  return (
    <GuideVisual title="Interaction decision" description="The platform is the first runtime">
      <div className="grid gap-3">
        <Text as="div" size="label" weight="medium" className="rounded-lg bg-foreground px-4 py-3 text-center text-background">
          Can CSS or a native element express the behavior?
        </Text>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-primary/8 p-3 ring-1 ring-primary/20">
            <Text as="div" size="label" weight="medium">
              Yes → keep it declarative
            </Text>
            <Text as="div" size="caption" tone="muted" className="mt-2">
              :has() · container queries · field-sizing · popover · dialog · details
            </Text>
          </div>
          <div className="rounded-lg border border-border/80 p-3">
            <Text as="div" size="label" weight="medium">
              No → use scoped JavaScript
            </Text>
            <Text as="div" size="caption" tone="muted" className="mt-2">
              stateful or async logic · measured fallback behind @supports
            </Text>
          </div>
        </div>
        <Text as="div" size="micro" tone="primary" className="text-center font-mono">
          token-driven transitions + expressive motion → reduced-motion kill switch
        </Text>
      </div>
    </GuideVisual>
  );
}

export function CompatibilityBridge() {
  return (
    <GuideVisual title="Compatible by contract" description="Shared language; separate owned source trees">
      <div className="grid items-stretch gap-3 md:grid-cols-[1fr_1.2fr_1fr]">
        <div className="rounded-lg border border-border/80 p-3">
          <Text as="div" size="label" weight="medium">
            components/ui/*
          </Text>
          <Text as="div" size="caption" tone="muted" className="mt-1">
            your existing shadcn source
          </Text>
        </div>
        <div className="grid gap-1.5 rounded-lg bg-primary/8 p-3 ring-1 ring-primary/20">
          {["shadcn registry manifests", "shared core token names"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-caption">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
              {item}
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border/80 p-3">
          <Text as="div" size="label" weight="medium">
            components/control-ui/*
          </Text>
          <Text as="div" size="caption" tone="muted" className="mt-1">
            installed Control UI source
          </Text>
        </div>
      </div>
      <Text as="div" size="micro" tone="primary" className="mt-3 text-center font-mono">
        Control UI never writes to components/ui/*
      </Text>
    </GuideVisual>
  );
}

export function AgentSurfaceMap() {
  const surfaces = ["API envelope", "registry.json", "item manifests", "agent-index.json", "llms.txt", "llms-full.txt"];

  return (
    <GuideVisual title="One registry, multiple interfaces" description="Choose the surface that fits the agent">
      <div className="grid items-center gap-3 md:grid-cols-[0.8fr_auto_1fr_auto_1.2fr]">
        <div className="grid gap-2">
          <DiagramNode className="font-mono">catalog</DiagramNode>
          <DiagramNode className="font-mono">on-disk source</DiagramNode>
        </div>
        <FlowArrow className="hidden md:grid" />
        <div className="rounded-lg bg-foreground p-4 text-center text-background">
          <Text as="div" size="label" weight="medium">
            Registry catalog
          </Text>
          <div className="mt-1 text-caption opacity-70">format-specific outputs</div>
        </div>
        <FlowArrow className="hidden md:grid" />
        <div className="flex flex-wrap gap-1.5">
          {surfaces.map((surface) => (
            <span key={surface} className="rounded-md border border-border/70 bg-background px-2 py-1.5 font-mono text-micro">
              {surface}
            </span>
          ))}
        </div>
      </div>
    </GuideVisual>
  );
}
