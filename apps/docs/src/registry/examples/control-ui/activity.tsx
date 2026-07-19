import { BookOpen, Globe, Search, SquareTerminal } from "lucide-react";

import {
  Activity,
  ActivityContent,
  ActivityDetail,
  ActivityDetailContent,
  ActivityDetailLabel,
  ActivityIcon,
  ActivityItem,
  ActivityList,
  ActivityRow,
  ActivityStatus,
  ActivityTitle,
  ActivityTrigger,
} from "@/components/control-ui/activity";
import { SourceBadge } from "@/components/control-ui/source-badge";

const thinkingTrace = [
  { icon: <SquareTerminal />, label: "Ran the registry validation command" },
  { icon: <Search />, label: "Searched for the current skin slot contract" },
  { icon: <BookOpen />, label: "Read activity.tsx" },
  { icon: <BookOpen />, label: "Read chat-layout.tsx" },
  { icon: <Search />, label: "Compared disclosure behavior across agent surfaces" },
  { icon: <Globe />, label: "Searched the web for Base UI accessibility guidance" },
  { icon: <BookOpen />, label: "Read the ScrollArea overflow contract" },
  { icon: <SquareTerminal />, label: "Ran the focused render tests" },
];

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

      <Activity state="running" defaultOpen className="[--activity-content-max-height:12rem]">
        <ActivityTrigger>
          <ActivityIcon>
            <BookOpen />
          </ActivityIcon>
          <ActivityTitle>Thinking</ActivityTitle>
          <ActivityStatus className="sr-only" />
        </ActivityTrigger>
        <ActivityContent>
          <ActivityList>
            {thinkingTrace.map((item) => (
              <ActivityItem key={item.label} icon={item.icon}>
                {item.label}
              </ActivityItem>
            ))}
          </ActivityList>
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
            <ActivityDetailContent className="font-mono text-caption">{`{ "path": "chat.json" }`}</ActivityDetailContent>
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
