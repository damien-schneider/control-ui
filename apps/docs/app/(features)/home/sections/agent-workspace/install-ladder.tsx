import { ArrowUpIcon } from "lucide-react";
import { blockEntries } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { kitEntries } from "@/app/(features)/catalog/kits";
import { CodeSnippet } from "@/app/(features)/components/source";
import { componentCount, kitCount, templateCount } from "@/app/(features)/home/home-content";
import { registryInstallCommand } from "@/app/(features)/model/registry";
import type { BlockId, ComponentId, KitId } from "@/app/(features)/model/types";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import type { InstallLevel } from "./level-mark";

const templatesOnScreen: readonly BlockId[] = ["coding-agent"];
const kitsOnScreen: readonly KitId[] = [
  "chat-layout",
  "chat-message",
  "chat-composer",
  "activity",
  "tool-approval",
  "task-list",
  "context",
];
const componentsOnScreen: readonly ComponentId[] = ["button", "kbd", "badge", "sidebar", "avatar", "spinner", "popover", "live-status"];

type Named = { id: string; name: string };
type LadderName = Named & { onScreen: boolean };

function onScreenFirst(entries: readonly Named[], onScreenIds: readonly string[]): LadderName[] {
  const named = entries.map(({ id, name }) => ({ id, name, onScreen: onScreenIds.includes(id) }));
  return [...named.filter((entry) => entry.onScreen), ...named.filter((entry) => !entry.onScreen)];
}

const onScreenComponents = onScreenFirst(componentEntries, componentsOnScreen).filter((entry) => entry.onScreen);

type Rung = {
  level: InstallLevel;
  name: string;
  scope: string;
  count: string;
  command: string;
  names: readonly LadderName[];
  moreCount?: number;
};

const rungs: readonly Rung[] = [
  {
    level: 1,
    name: "Template",
    scope: "the whole screen",
    count: `${templateCount} templates`,
    command: registryInstallCommand("coding-agent-block"),
    names: onScreenFirst(blockEntries, templatesOnScreen),
  },
  {
    level: 2,
    name: "Kit",
    scope: "one part of it",
    count: `${kitCount} kits`,
    command: registryInstallCommand("tool-approval"),
    names: onScreenFirst(kitEntries, kitsOnScreen),
  },
  {
    level: 3,
    name: "Component",
    scope: "one primitive",
    count: `${componentCount} components`,
    command: registryInstallCommand("button"),
    names: onScreenComponents,
    moreCount: componentCount - onScreenComponents.length,
  },
];

function OnScreenDot() {
  return <span aria-hidden="true" className="size-1.25 shrink-0 rounded-full bg-info" />;
}

function LadderRung({ rung }: { rung: Rung }) {
  return (
    <li
      data-rung={rung.level}
      className="grid min-w-0 gap-3.5 border-t py-5.5 @4xl/home:grid-cols-[10.625rem_minmax(0,1fr)] @4xl/home:gap-0 @4xl/home:pb-6"
    >
      <div className="flex min-w-0 items-baseline gap-2.5 @4xl/home:items-start">
        <span className="home-agent-workspace-rung-badge inline-flex size-4.5 shrink-0 items-center justify-center self-center rounded-sm bg-info text-white transition-shadow duration-(--duration-fast) ease-(--ease-standard) @4xl/home:self-start">
          <Text size="caption" weight="bold" mono>
            {rung.level}
          </Text>
        </span>
        <div className="flex min-w-0 flex-1 items-baseline gap-2 @4xl/home:flex-col @4xl/home:gap-1">
          <Heading level={3} size="body" weight="medium" tone="foreground">
            {rung.name}
          </Heading>
          <Text size="caption" tone="muted">
            {rung.scope}
          </Text>
        </div>
        <Text size="caption" tone="muted" mono numeric className="whitespace-nowrap @4xl/home:hidden">
          {rung.count}
        </Text>
      </div>
      <div className="grid min-w-0 gap-3.5">
        <div className="flex min-w-0 items-start gap-6">
          <div className="min-w-0 flex-1">
            <CodeSnippet code={rung.command} highlight="none" />
          </div>
          <Text size="caption" tone="muted" mono numeric className="mt-3 hidden w-28 text-end whitespace-nowrap @4xl/home:block">
            {rung.count}
          </Text>
        </div>
        <ul aria-label={`${rung.name}s`} className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          {rung.names.map((entry) => (
            <li key={entry.id} className="flex items-center gap-1.5">
              <span className={entry.onScreen ? "text-foreground" : "text-muted-foreground"}>
                <Text size="caption" weight={entry.onScreen ? "medium" : "normal"} className="whitespace-nowrap">
                  {entry.name}
                </Text>
              </span>
              {entry.onScreen ? (
                <>
                  <OnScreenDot />
                  <span className="sr-only">on the screen above</span>
                </>
              ) : null}
            </li>
          ))}
          {rung.moreCount ? (
            <li>
              <a
                href="#catalog-atlas"
                className="inline-flex items-center gap-1 rounded-sm text-muted-foreground outline-none transition-colors duration-(--duration-fast) ease-(--ease-standard) hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Text size="caption">and {rung.moreCount} more, in the index above</Text>
                <ArrowUpIcon aria-hidden="true" className="size-3" />
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    </li>
  );
}

export function InstallLadder() {
  return (
    <div className="grid min-w-0">
      <ol className="grid min-w-0">
        {rungs.map((rung) => (
          <LadderRung key={rung.level} rung={rung} />
        ))}
      </ol>
      <div className="flex min-w-0 flex-col gap-2.5 border-t pt-4.5 @4xl/home:flex-row @4xl/home:items-center @4xl/home:justify-between">
        <Text as="p" tone="muted">
          All three levels install as source and read the same skin.
        </Text>
        <span aria-hidden="true" className="flex items-center gap-1.75 text-muted-foreground">
          <OnScreenDot />
          <Text size="caption">on the screen above</Text>
        </span>
      </div>
    </div>
  );
}
