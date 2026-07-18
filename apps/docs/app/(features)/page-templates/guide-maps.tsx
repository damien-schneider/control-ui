import { DiagramNode, FlowArrow, GuideVisual } from "./guide-visual";

export function CssFirstDecisionMap() {
  return (
    <GuideVisual title="Interaction decision" description="The platform is the first runtime">
      <div className="grid gap-3">
        <div className="rounded-lg bg-foreground px-4 py-3 text-center font-medium text-background text-label">
          Can CSS or a native element express the behavior?
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-primary/8 p-3 ring-1 ring-primary/20">
            <div className="font-medium text-label">Yes → keep it declarative</div>
            <div className="mt-2 text-caption text-muted-foreground">
              :has() · container queries · field-sizing · popover · dialog · details
            </div>
          </div>
          <div className="rounded-lg border border-border/80 p-3">
            <div className="font-medium text-label">No → use scoped JavaScript</div>
            <div className="mt-2 text-caption text-muted-foreground">stateful or async logic · measured fallback behind @supports</div>
          </div>
        </div>
        <div className="text-center font-mono text-micro text-primary">
          token-driven transitions + expressive motion → reduced-motion kill switch
        </div>
      </div>
    </GuideVisual>
  );
}

export function GettingStartedMap() {
  const steps = [
    { title: "Choose", note: "skin + UI surface" },
    { title: "Install skin", note: "complete token owner" },
    { title: "Install UI", note: "component or block" },
    { title: "Wire CSS", note: "core + active skin" },
    { title: "Map data", note: "plain props + children" },
    { title: "Own it", note: "edit local source" },
  ];

  return (
    <GuideVisual title="From registry to product code" description="Runner and skin are independent choices">
      <ol className="grid gap-2 md:grid-cols-6">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="group relative rounded-lg border border-border/80 bg-background/70 p-3 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:border-primary/40"
          >
            <div className="font-mono text-micro text-primary">{index + 1}</div>
            <div className="mt-2 font-medium text-label">{step.title}</div>
            <div className="mt-0.5 text-caption text-muted-foreground">{step.note}</div>
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 bg-card px-1 text-muted-foreground md:block"
              >
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </GuideVisual>
  );
}

export function CompatibilityBridge() {
  return (
    <GuideVisual title="Compatible by contract" description="Shared language; separate owned source trees">
      <div className="grid items-stretch gap-3 md:grid-cols-[1fr_1.2fr_1fr]">
        <div className="rounded-lg border border-border/80 p-3">
          <div className="font-medium text-label">components/ui/*</div>
          <div className="mt-1 text-caption text-muted-foreground">your existing shadcn source</div>
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
          <div className="font-medium text-label">components/control-ui/*</div>
          <div className="mt-1 text-caption text-muted-foreground">installed Control UI source</div>
        </div>
      </div>
      <div className="mt-3 text-center font-mono text-micro text-primary">Control UI never writes to components/ui/*</div>
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
          <div className="font-medium text-label">Registry catalog</div>
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
