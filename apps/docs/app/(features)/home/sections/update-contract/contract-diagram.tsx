import { FileCodeIcon, LockIcon, type LucideIcon, PackageIcon, PaletteIcon, SlidersHorizontalIcon, StethoscopeIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DarkScope } from "@/app/(features)/home/shared/skin-scope";
import { cn } from "@/components/control-ui/lib/cn";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { exampleKnob, exampleKnobSliceHref, knobCountLabel, knobFamilyCountLabel, updateSession } from "./update-contract-data";

const skinFiles = [
  { name: "skin-theme.css", role: "tokens" },
  { name: "skin.config.tsx", role: "behavior" },
  { name: "skin.css", role: "component knobs" },
] as const;

const roleTones = {
  yours: "bg-info text-white",
  shared: "border border-b-0 bg-card text-foreground",
  ours: "bg-foreground text-background",
} as const;

function ContractNode({
  owner,
  tone,
  icon: Icon,
  title,
  description,
  relation,
  className,
  children,
}: {
  owner: string;
  tone: keyof typeof roleTones;
  icon: LucideIcon;
  title: string;
  description: readonly [string, string];
  relation: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <li className={cn("flex min-w-0 flex-col items-start @5xl/home:mx-0 @5xl/home:self-start", className)}>
      <span className={cn("inline-flex h-5.5 items-center rounded-t-sm px-2", roleTones[tone])}>
        <Text size="caption" weight="medium" mono className="whitespace-nowrap">
          {owner}
        </Text>
      </span>
      <div className="flex w-full min-w-0 flex-col gap-3 rounded-2xl rounded-tl-none border bg-card p-2 shadow-sm">
        <div className="grid gap-1.5 px-3 pt-2">
          <div className="flex items-center gap-2">
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <Heading level={3} size="heading-2" weight="semibold" tone="foreground">
              {title}
            </Heading>
          </div>
          <Text as="p" tone="muted">
            <span className="block">{description[0]}</span>
            <span className="block">{description[1]}</span>
            <span className="sr-only"> {relation}</span>
          </Text>
        </div>
        {children}
      </div>
    </li>
  );
}

function NodeFoot({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 px-3 pb-2">{children}</div>;
}

const horizontalWires = { up: "M0 100 C 50 100 50 0 100 0", down: "M0 0 C 50 0 50 100 100 100" } as const;
const verticalWires = { right: "M1 0 C 1 38 79 38 79 76", left: "M79 0 C 79 38 1 38 1 76" } as const;
const portClassName = "absolute size-3 rounded-full border-[2.5px] border-foreground bg-card";
const wireClassName = "absolute inset-0 size-full overflow-visible fill-none stroke-foreground";

function WireLabel({ children }: { children: string }) {
  return (
    <span className="absolute top-1/2 left-1/2 inline-flex h-5 -translate-1/2 items-center rounded-sm border bg-card px-1.5 text-foreground">
      <Text size="micro" weight="medium" mono className="whitespace-nowrap">
        {children}
      </Text>
    </span>
  );
}

function Connector({ label, flow, span }: { label: string; flow: "toContract" | "toSource"; span: string }) {
  const toContract = flow === "toContract";

  return (
    <li aria-hidden="true" className="pointer-events-none relative z-10 h-13.5 @5xl/home:h-auto">
      <span className="absolute top-0 right-17 block h-19 w-20 @5xl/home:hidden">
        <svg viewBox="0 0 80 76" className={wireClassName} strokeWidth={2}>
          <title>{label}</title>
          <path d={toContract ? verticalWires.right : verticalWires.left} />
        </svg>
        <span className={cn(portClassName, "-top-1.5", toContract ? "-left-1.25" : "-right-1.25")} />
        <span className={cn(portClassName, "-bottom-1.5", toContract ? "-right-1.25" : "-left-1.25")} />
        <WireLabel>{label}</WireLabel>
      </span>
      <span className={cn("absolute inset-x-0 hidden @5xl/home:block", span)}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={wireClassName} strokeWidth={2}>
          <title>{label}</title>
          <path d={toContract ? horizontalWires.up : horizontalWires.down} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className={cn(portClassName, "-left-1.5", toContract ? "-bottom-1.5" : "-top-1.5")} />
        <span className={cn(portClassName, "-right-1.5", toContract ? "-top-1.5" : "-bottom-1.5")} />
        <WireLabel>{label}</WireLabel>
      </span>
    </li>
  );
}

function SkinFiles() {
  return (
    <>
      <ul className="divide-y rounded-lg bg-muted px-3 py-0.5">
        {skinFiles.map((file) => (
          <li key={file.name} className="flex h-10 min-w-0 items-center gap-2.5">
            <FileCodeIcon aria-hidden="true" className="size-3.75 shrink-0 text-muted-foreground" />
            <Text size="label" mono tone="foreground" className="whitespace-nowrap">
              {file.name}
            </Text>
            <Text size="label" tone="muted" className="min-w-0 flex-1 truncate">
              {file.role}
            </Text>
            <LockIcon aria-hidden="true" className="size-3.25 shrink-0 text-muted-foreground" />
            <span className="sr-only">never overwritten</span>
          </li>
        ))}
      </ul>
      <NodeFoot>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="size-1.75 shrink-0 rounded-full bg-success" />
          <Text size="label" tone="foreground">
            0 lines in any update diff
          </Text>
        </span>
      </NodeFoot>
    </>
  );
}

const knobRowClassName = "flex min-w-0";
const knobTermClassName = "w-16.5 shrink-0";
const knobValueClassName = "min-w-0 flex-1 wrap-anywhere";

function KnobRecord() {
  if (!exampleKnob) return null;

  return (
    <>
      <dl className="grid gap-2.5 rounded-lg bg-muted p-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2">
          <Text as="dt" size="label" mono tone="muted">
            @property
          </Text>
          <Text as="dd" size="label" weight="medium" mono tone="foreground" className="min-w-0 wrap-anywhere">
            {exampleKnob.name}
          </Text>
        </div>
        <div className={knobRowClassName}>
          <Text as="dt" size="caption" mono tone="muted" className={knobTermClassName}>
            syntax
          </Text>
          <Text as="dd" size="caption" mono tone="foreground" className={knobValueClassName}>
            {exampleKnob.syntax}
          </Text>
        </div>
        <div className={knobRowClassName}>
          <Text as="dt" size="caption" mono tone="muted" className={knobTermClassName}>
            initial
          </Text>
          <Text as="dd" size="caption" mono tone="foreground" className={knobValueClassName}>
            {exampleKnob.initialValue}
          </Text>
        </div>
        <div className={knobRowClassName}>
          <Text as="dt" size="caption" mono tone="muted" className={knobTermClassName}>
            default
          </Text>
          <Text as="dd" size="caption" mono tone="foreground" className={knobValueClassName}>
            {exampleKnob.defaultValue.split(/(?<=,) /).map((segment) => (
              <span key={segment} className="mr-[1ch] inline-block last:mr-0">
                {segment}
              </span>
            ))}
          </Text>
        </div>
      </dl>
      <NodeFoot>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 @5xl/home:flex-row @5xl/home:flex-wrap @5xl/home:items-center @5xl/home:justify-between">
          <Text size="label" tone="foreground" numeric className="whitespace-nowrap">
            {knobCountLabel} knobs · {knobFamilyCountLabel} families
          </Text>
          <a
            href={exampleKnobSliceHref}
            title="Open the published contract slice"
            className="rounded-sm text-muted-foreground outline-none transition-colors duration-(--duration-fast) ease-(--ease-standard) hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Text size="micro" mono className="whitespace-nowrap">
              {exampleKnobSliceHref}
            </Text>
          </a>
        </div>
      </NodeFoot>
    </>
  );
}

function TerminalCommand({ script, runs }: { script: string; runs: string | undefined }) {
  return (
    <div title={runs} className="flex min-w-0 gap-2">
      <Text size="caption" mono tone="muted" aria-hidden="true">
        $
      </Text>
      <Text size="caption" mono tone="foreground" className="min-w-0 wrap-anywhere">
        {script}
      </Text>
    </div>
  );
}

function UpdateTerminal() {
  return (
    <>
      <DarkScope className="grid gap-2.25 rounded-lg bg-background p-3">
        <TerminalCommand {...updateSession.diff} />
        <span className="flex text-muted-foreground/70">
          <Text size="caption" mono>
            {updateSession.installDir}
          </Text>
        </span>
        <ul className="grid gap-2.25">
          {updateSession.changedFiles.map((file) => (
            <li key={file.path} className="flex min-w-0 items-center gap-2">
              <Text size="caption" mono tone="warning" aria-hidden="true">
                M
              </Text>
              <span className="sr-only">modified</span>
              <Text size="caption" mono tone="muted" className="min-w-0 flex-1 truncate">
                {file.path}
              </Text>
              <Text size="caption" mono tone="success" numeric>
                +{file.added}
              </Text>
              <Text size="caption" mono tone="danger" numeric>
                −{file.removed}
              </Text>
            </li>
          ))}
        </ul>
        <TerminalCommand {...updateSession.update} />
      </DarkScope>
      <NodeFoot>
        <span className="flex min-w-0 items-start gap-2">
          <StethoscopeIcon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <Text size="label" tone="foreground">
            Then control-ui:doctor, a read-only audit.
          </Text>
        </span>
      </NodeFoot>
    </>
  );
}

export function ContractDiagram() {
  return (
    <figure className="home-update-contract-boundary min-w-0 rounded-2xl border bg-muted">
      <figcaption className="sr-only">
        How an update stays out of your files: your skin sets the contract, and the installed source reads it.
      </figcaption>
      <ol className="mx-auto flex w-full max-w-104 flex-col px-3 pt-4.5 pb-6 @5xl/home:grid @5xl/home:max-w-none @5xl/home:grid-cols-[268px_minmax(3.5rem,1fr)_minmax(0,340px)_minmax(3.5rem,1fr)_minmax(0,300px)] @5xl/home:px-6 @5xl/home:pt-0 @5xl/home:pb-7.5">
        <ContractNode
          owner="you write"
          tone="yours"
          icon={PaletteIcon}
          title="Your skin"
          description={["Three files.", "No update ever lists them."]}
          relation="It sets the contract."
          className="mr-6 @5xl/home:mt-12.5"
        >
          <SkinFiles />
        </ContractNode>
        <Connector label="sets" flow="toContract" span="top-40.5 h-27" />
        <ContractNode
          owner="both sides agree on"
          tone="shared"
          icon={SlidersHorizontalIcon}
          title="The contract"
          description={["Every knob is a typed CSS property", "with a declared default."]}
          relation="Set by your skin, read by the installed source."
          className="ml-6 @5xl/home:mt-6.5"
        >
          <KnobRecord />
        </ContractNode>
        <Connector label="read by" flow="toSource" span="top-40.5 h-20" />
        <ContractNode
          owner="we overwrite"
          tone="ours"
          icon={PackageIcon}
          title="Installed source"
          description={["You read it and never edit it,", "so an update can replace it."]}
          relation="It reads the contract."
          className="mr-6 @5xl/home:mt-14.5"
        >
          <UpdateTerminal />
        </ContractNode>
      </ol>
    </figure>
  );
}
