import { FileCodeIcon, LockIcon, type LucideIcon, PackageIcon, PaletteIcon, SlidersHorizontalIcon, StethoscopeIcon } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { Badge } from "@/components/control-ui/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { Code, CodeContent } from "@/components/control-ui/ui/code";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/control-ui/ui/item";
import { Heading, Text, TextLink } from "@/components/control-ui/ui/typography";
import { exampleKnob, exampleKnobSliceHref, knobCountLabel, knobFamilyCountLabel, updateSessionOutput } from "./update-contract-data";

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
      <span className={cn("ms-4 inline-flex h-5.5 items-center rounded-t-sm px-2", roleTones[tone])}>
        <Text size="caption" weight="medium" mono className="whitespace-nowrap">
          {owner}
        </Text>
      </span>
      <Card size="sm" className="w-full min-w-0">
        <CardHeader>
          <CardTitle render={<Heading level={3} size="heading-2" weight="semibold" tone="foreground" />}>
            <span className="flex items-center gap-2">
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              {title}
            </span>
          </CardTitle>
          <CardDescription>
            <span className="block">{description[0]}</span>
            <span className="block">{description[1]}</span>
            <span className="sr-only"> {relation}</span>
          </CardDescription>
        </CardHeader>
        {children}
      </Card>
    </li>
  );
}

const horizontalWires = { up: "M0 100 C 50 100 50 0 100 0", down: "M0 0 C 50 0 50 100 100 100" } as const;
const verticalWires = { right: "M1 0 C 1 38 79 38 79 76", left: "M79 0 C 79 38 1 38 1 76" } as const;
const portClassName = "absolute size-3 rounded-full border-[2.5px] border-foreground bg-card";
const wireClassName = "absolute inset-0 size-full overflow-visible fill-none stroke-foreground";

function WireLabel({ children }: { children: string }) {
  return (
    <Badge size="sm" variant="outline" className="absolute top-1/2 left-1/2 -translate-1/2">
      {children}
    </Badge>
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
      <CardContent>
        <ItemGroup>
          {skinFiles.map((file, index) => (
            <Fragment key={file.name}>
              {index > 0 ? <ItemSeparator /> : null}
              <Item>
                <ItemMedia>
                  <FileCodeIcon aria-hidden="true" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    <Text size="label" mono>
                      {file.name}
                    </Text>
                  </ItemTitle>
                  <ItemDescription>{file.role}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <LockIcon aria-hidden="true" />
                  <span className="sr-only">never overwritten</span>
                </ItemActions>
              </Item>
            </Fragment>
          ))}
        </ItemGroup>
      </CardContent>
      <CardFooter className="gap-2">
        <span aria-hidden="true" className="size-1.75 shrink-0 rounded-full bg-success" />
        <Text size="label" tone="foreground">
          0 lines in any update diff
        </Text>
      </CardFooter>
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
      <CardContent>
        <dl className="grid gap-2.5">
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
      </CardContent>
      <CardFooter className="flex-col items-start gap-1.5 @5xl/home:flex-row @5xl/home:flex-wrap @5xl/home:items-center @5xl/home:justify-between">
        <Text size="label" tone="foreground" numeric className="whitespace-nowrap">
          {knobCountLabel} knobs · {knobFamilyCountLabel} families
        </Text>
        <TextLink href={exampleKnobSliceHref} title="Open the published contract slice">
          <Text size="micro" mono className="whitespace-nowrap">
            {exampleKnobSliceHref}
          </Text>
        </TextLink>
      </CardFooter>
    </>
  );
}

function UpdateSession() {
  return (
    <>
      <CardContent>
        <Code copy={false}>
          <CodeContent code={updateSessionOutput} lang="bash" highlight="none" aria-label="Update session" />
        </Code>
      </CardContent>
      <CardFooter>
        <span className="flex min-w-0 items-start gap-2">
          <StethoscopeIcon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <Text size="label" tone="foreground">
            Then control-ui:doctor, a read-only audit.
          </Text>
        </span>
      </CardFooter>
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
          <UpdateSession />
        </ContractNode>
      </ol>
    </figure>
  );
}
