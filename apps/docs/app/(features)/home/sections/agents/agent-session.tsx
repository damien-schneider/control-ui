import "./agents.css";
import { CircleCheckIcon, TerminalIcon } from "lucide-react";
import { Fragment } from "react";
import { RevealOnView } from "@/app/(features)/home/shared/reveal-on-view";
import { DarkScope } from "@/app/(features)/home/shared/skin-scope";
import { Badge } from "@/components/control-ui/ui/badge";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import type { AgentSessionScript, SessionStep } from "./session-data";

function SessionStepItem({ step, number, last }: { step: SessionStep; number: number; last: boolean }) {
  return (
    <li className="home-agents-reveal relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2.5 gap-y-2.5 pb-6 last:pb-0 @md/session:gap-x-4 @md/session:gap-y-2.25">
      <span aria-hidden="true" className="grid size-5.5 place-items-center rounded-full outline outline-foreground/20 -outline-offset-1">
        <Text size="micro" mono>
          {number}
        </Text>
      </span>
      {last ? null : (
        <span aria-hidden="true" className="absolute top-7 bottom-1.5 left-2.75 hidden w-px bg-foreground/12 @md/session:block" />
      )}
      <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
        <Heading level={3} size="body" weight="medium">
          {step.title}
        </Heading>
        <Badge size="sm" color="blue">
          {step.surface}
        </Badge>
      </div>
      <div className="col-span-2 max-w-full justify-self-start rounded-md bg-foreground/5 px-2.5 py-1.75 @md/session:col-span-1 @md/session:col-start-2">
        <Text as="code" size="label" mono className="block">
          {step.call.map((segment) => (
            <Fragment key={segment}>
              <span className="inline-block max-w-full wrap-anywhere">{segment}</span>{" "}
            </Fragment>
          ))}
        </Text>
      </div>
      <Text as="p" size="label" tone="muted" className="col-span-2 text-pretty @md/session:col-span-1 @md/session:col-start-2">
        {step.result}
      </Text>
    </li>
  );
}

export function AgentSession({ script }: { script: AgentSessionScript }) {
  return (
    <DarkScope className="@container/session min-w-0">
      <RevealOnView className="home-agents-session">
        <figure className="grid min-w-0 gap-5.5 rounded-[calc(var(--radius)*2)] border bg-background px-4 py-5 @md/session:gap-6 @md/session:px-7 @md/session:pt-6.5 @md/session:pb-6">
          <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-muted-foreground">
            <span className="flex items-center gap-2">
              <TerminalIcon aria-hidden="true" className="size-3.5" />
              <Text size="label" mono>
                example agent session
              </Text>
            </span>
            <Text size="label" mono>
              {script.steps.length} steps<span className="hidden @md/session:inline"> · 0 guesses</span>
            </Text>
          </figcaption>
          <div className="home-agents-reveal flex justify-end">
            <div className="rounded-2xl bg-muted px-3.5 py-2.5">
              <Text as="p">
                <span className="sr-only">Prompt: </span>
                {script.prompt}
              </Text>
            </div>
          </div>
          <ol className="grid min-w-0">
            {script.steps.map((step, index) => (
              <SessionStepItem key={step.title} step={step} number={index + 1} last={index === script.steps.length - 1} />
            ))}
          </ol>
          <div className="home-agents-reveal home-agents-reveal-last flex gap-2.25 border-t border-foreground/12 pt-5.5 @md/session:pt-6">
            <span className="flex h-lh items-center text-success">
              <CircleCheckIcon aria-hidden="true" className="size-3.75" />
            </span>
            <Text as="p" className="min-w-0 flex-1">
              {script.outcome}
            </Text>
          </div>
        </figure>
      </RevealOnView>
    </DarkScope>
  );
}
