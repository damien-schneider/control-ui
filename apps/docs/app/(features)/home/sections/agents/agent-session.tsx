import "./agents.css";
import { CircleCheckIcon, TerminalIcon } from "lucide-react";
import { RevealOnView } from "@/app/(features)/home/shared/reveal-on-view";
import { DarkScope } from "@/app/(features)/home/shared/skin-scope";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import { Badge } from "@/components/control-ui/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/control-ui/ui/card";
import { Code, CodeContent } from "@/components/control-ui/ui/code";
import {
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/control-ui/ui/timeline";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import type { AgentSessionScript, SessionStep } from "./session-data";

function SessionStepItem({ step, number }: { step: SessionStep; number: number }) {
  return (
    <TimelineItem className="home-agents-reveal">
      <TimelineIndicator>
        <Text size="micro" mono>
          {number}
        </Text>
      </TimelineIndicator>
      <TimelineSeparator />
      <TimelineContent className="gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
          <TimelineTitle render={<Heading level={3} size="body" weight="medium" />}>{step.title}</TimelineTitle>
          <Badge size="sm" color="blue">
            {step.surface}
          </Badge>
        </div>
        <Code density="compact" overflow="wrap" copy={false} className="max-w-full justify-self-start">
          <CodeContent code={step.call.join(" ")} highlight="none" />
        </Code>
        <TimelineDescription>{step.result}</TimelineDescription>
      </TimelineContent>
    </TimelineItem>
  );
}

export function AgentSession({ script }: { script: AgentSessionScript }) {
  return (
    <DarkScope className="@container/session min-w-0">
      <RevealOnView className="home-agents-session">
        <figure aria-label="Example agent session" className="min-w-0">
          <Card variant="sectioned">
            <CardHeader>
              <CardDescription>
                <span className="flex items-center gap-2">
                  <TerminalIcon aria-hidden="true" className="size-3.5" />
                  <Text size="label" mono>
                    example agent session
                  </Text>
                </span>
              </CardDescription>
              <CardAction>
                <Text size="label" mono tone="muted">
                  {script.steps.length} steps<span className="hidden @md/session:inline"> · 0 guesses</span>
                </Text>
              </CardAction>
            </CardHeader>
            <CardContent className="grid min-w-0 gap-6">
              <ChatMessage from="user" className="home-agents-reveal">
                <ChatMessageRow>
                  <ChatMessageBody>
                    <ChatMessageContent>{script.prompt}</ChatMessageContent>
                  </ChatMessageBody>
                </ChatMessageRow>
              </ChatMessage>
              <Timeline>
                {script.steps.map((step, index) => (
                  <SessionStepItem key={step.title} step={step} number={index + 1} />
                ))}
              </Timeline>
            </CardContent>
            <CardFooter className="home-agents-reveal home-agents-reveal-last items-start gap-2.25">
              <span className="flex h-lh items-center text-success">
                <CircleCheckIcon aria-hidden="true" className="size-3.75" />
              </span>
              <Text as="p" className="min-w-0 flex-1">
                {script.outcome}
              </Text>
            </CardFooter>
          </Card>
        </figure>
      </RevealOnView>
    </DarkScope>
  );
}
