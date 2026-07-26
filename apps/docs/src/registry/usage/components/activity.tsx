import { BookOpen, Search, SquareTerminal } from "lucide-react";

import { Activity, ActivityContent, ActivityIcon, ActivityStatus, ActivityTitle, ActivityTrigger } from "@/components/control-ui/activity";
import {
  Timeline,
  TimelineContent,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/control-ui/ui/timeline";

export function Example() {
  return (
    <Activity state="running" defaultOpen>
      <ActivityTrigger>
        <ActivityIcon>
          <BookOpen />
        </ActivityIcon>
        <ActivityTitle>Thinking</ActivityTitle>
        <ActivityStatus className="sr-only" />
      </ActivityTrigger>
      <ActivityContent>
        <Timeline>
          <TimelineItem state="success">
            <TimelineIndicator>
              <SquareTerminal />
            </TimelineIndicator>
            <TimelineSeparator />
            <TimelineContent>
              <TimelineTitle>Ran the validation command</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem state="success">
            <TimelineIndicator>
              <Search />
            </TimelineIndicator>
            <TimelineSeparator />
            <TimelineContent>
              <TimelineTitle>Searched for affected components</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem state="running">
            <TimelineIndicator>
              <BookOpen />
            </TimelineIndicator>
            <TimelineSeparator />
            <TimelineContent>
              <TimelineTitle>Reading the component contract</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </ActivityContent>
    </Activity>
  );
}
