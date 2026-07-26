import { Check, CircleAlert, LoaderCircle, Search } from "lucide-react";

import { SourceBadge } from "@/components/control-ui/source-badge";
import {
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineMeta,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/control-ui/ui/timeline";

export function PrimitiveTimelineExample() {
  return (
    <Timeline className="mx-auto w-full max-w-lg p-6">
      <TimelineItem state="success">
        <TimelineIndicator>
          <Check />
        </TimelineIndicator>
        <TimelineSeparator />
        <TimelineContent>
          <TimelineTitle>Searched product documentation</TimelineTitle>
          <TimelineDescription>Found the interaction and accessibility guidance needed for the implementation.</TimelineDescription>
          <TimelineMeta>
            <SourceBadge href="https://base-ui.com/react/components/popover" faviconSrc="https://base-ui.com/favicon.ico">
              Base UI
            </SourceBadge>
            <SourceBadge href="https://developer.mozilla.org/en-US/docs/Web/API/Popover_API">MDN</SourceBadge>
          </TimelineMeta>
        </TimelineContent>
      </TimelineItem>

      <TimelineItem state="success">
        <TimelineIndicator>
          <Search />
        </TimelineIndicator>
        <TimelineSeparator />
        <TimelineContent>
          <TimelineTitle>Compared source preview patterns</TimelineTitle>
          <TimelineDescription>Separated one-source links from multi-source disclosure.</TimelineDescription>
        </TimelineContent>
      </TimelineItem>

      <TimelineItem state="running">
        <TimelineIndicator>
          <LoaderCircle className="motion-safe:animate-spin" />
        </TimelineIndicator>
        <TimelineSeparator />
        <TimelineContent>
          <TimelineTitle>Validating the rendered activity view</TimelineTitle>
          <TimelineDescription>Checking keyboard navigation, wrapping, and narrow viewports.</TimelineDescription>
        </TimelineContent>
      </TimelineItem>

      <TimelineItem state="error">
        <TimelineIndicator>
          <CircleAlert />
        </TimelineIndicator>
        <TimelineSeparator />
        <TimelineContent>
          <TimelineTitle>Preview deployment failed</TimelineTitle>
          <TimelineDescription>The build exited before the preview became available.</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
