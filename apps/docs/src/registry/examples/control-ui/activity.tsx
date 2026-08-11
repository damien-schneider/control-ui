import { BookOpen, Globe, LoaderCircle, Radio, Search, SquareTerminal } from "lucide-react";

import type { ReactNode } from "react";

import {
  Activity,
  ActivityContent,
  ActivityDetail,
  ActivityDetailContent,
  ActivityDetailLabel,
  ActivityIcon,
  ActivityRow,
  ActivityStatus,
  ActivityTitle,
  ActivityTrigger,
} from "@/components/control-ui/activity";
import type { TimelineState } from "@/components/control-ui/contracts";
import { SourceBadge } from "@/components/control-ui/source-badge";
import {
  Timeline,
  TimelineContent,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/control-ui/ui/timeline";

const thinkingTrace = [
  { icon: <SquareTerminal />, label: "Ran the registry validation command", state: "success" },
  { icon: <Search />, label: "Searched for the current skin slot contract", state: "success" },
  { icon: <BookOpen />, label: "Read activity.tsx", state: "success" },
  { icon: <BookOpen />, label: "Read chat-layout.tsx", state: "success" },
  { icon: <Search />, label: "Compared disclosure behavior across agent surfaces", state: "success" },
  { icon: <Globe />, label: "Searched the web for Base UI accessibility guidance", state: "success" },
  { icon: <LoaderCircle className="motion-safe:animate-spin" />, label: "Reading the ScrollArea overflow contract", state: "running" },
  { icon: <SquareTerminal />, label: "Run the focused render tests", state: "pending" },
] satisfies Array<{ icon: ReactNode; label: string; state: TimelineState }>;

export function ActivityExample() {
  return (
    <div className="mx-auto grid w-full max-w-xl gap-5 p-6">
      <Activity state="success">
        <ActivityRow>
          <ActivityIcon>
            <Search />
          </ActivityIcon>
          <ActivityTitle>Read files, searched the web</ActivityTitle>
          <ActivityStatus className="sr-only" />
        </ActivityRow>
      </Activity>

      <Activity kind="signal" state="success">
        <ActivityRow>
          <ActivityIcon>
            <Radio />
          </ActivityIcon>
          <ActivityTitle>CI signal — build failed on PR #42</ActivityTitle>
          <ActivityStatus>Delivered</ActivityStatus>
        </ActivityRow>
      </Activity>

      <Activity kind="reasoning" state="running" defaultOpen className="[--activity-content-max-height:12rem]">
        <ActivityTrigger>
          <ActivityIcon>
            <BookOpen />
          </ActivityIcon>
          <ActivityTitle>Thinking</ActivityTitle>
          <ActivityStatus className="sr-only" />
        </ActivityTrigger>
        <ActivityContent>
          <Timeline>
            {thinkingTrace.map((item) => (
              <TimelineItem key={item.label} state={item.state}>
                <TimelineIndicator>{item.icon}</TimelineIndicator>
                <TimelineSeparator />
                <TimelineContent>
                  <TimelineTitle>{item.label}</TimelineTitle>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </ActivityContent>
      </Activity>

      <Activity state="success" defaultOpen>
        <ActivityTrigger>
          <ActivityIcon>
            <Search />
          </ActivityIcon>
          <ActivityTitle>Searched the web for Base UI disclosure patterns</ActivityTitle>
          <ActivityStatus className="sr-only" />
        </ActivityTrigger>
        <ActivityContent>
          <div className="flex flex-wrap gap-1.5">
            <SourceBadge href="https://ui.shadcn.com/docs/components/base/marker" faviconSrc="https://ui.shadcn.com/favicon.ico">
              shadcn/ui
            </SourceBadge>
            <SourceBadge href="https://base-ui.com/react/components/collapsible" faviconSrc="https://base-ui.com/favicon.ico">
              Base UI
            </SourceBadge>
            <SourceBadge href="https://developer.mozilla.org/en-US/docs/Web/Accessibility" faviconSrc="/missing-favicon.ico">
              MDN
            </SourceBadge>
          </div>
          <p className="text-label leading-5 text-muted-foreground">
            The shared activity anatomy owns disclosure and overflow. Source links stay inside the expanded content, never inside its
            button.
          </p>
        </ActivityContent>
      </Activity>

      <Activity kind="tool" name="read_registry" state="success" defaultOpen>
        <ActivityTrigger>
          <ActivityIcon>
            <BookOpen />
          </ActivityIcon>
          <ActivityTitle>Read registry files</ActivityTitle>
          <ActivityStatus className="sr-only" />
        </ActivityTrigger>
        <ActivityContent>
          <ActivityDetail>
            <ActivityDetailLabel>Input</ActivityDetailLabel>
            <ActivityDetailContent format="code">{`{ "path": "chat.json" }`}</ActivityDetailContent>
          </ActivityDetail>
          <ActivityDetail>
            <ActivityDetailLabel>Output</ActivityDetailLabel>
            <ActivityDetailContent>Loaded the registry definition.</ActivityDetailContent>
          </ActivityDetail>
        </ActivityContent>
      </Activity>
    </div>
  );
}
