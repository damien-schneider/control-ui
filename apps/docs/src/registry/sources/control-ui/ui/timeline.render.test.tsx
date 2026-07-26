import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineMeta,
  TimelineSeparator,
  TimelineTitle,
} from "./timeline";

describe("Timeline", () => {
  test("renders chronological list semantics with independent event states", () => {
    const html = renderToStaticMarkup(
      <Timeline aria-label="Agent activity">
        <TimelineItem state="success">
          <TimelineIndicator>1</TimelineIndicator>
          <TimelineSeparator />
          <TimelineContent>
            <TimelineTitle>Searched documentation</TimelineTitle>
            <TimelineDescription>Found two relevant sources.</TimelineDescription>
            <TimelineMeta>2 sources</TimelineMeta>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem state="running">
          <TimelineIndicator>2</TimelineIndicator>
          <TimelineSeparator />
          <TimelineContent>
            <TimelineTitle>Reading source files</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem state="error">
          <TimelineIndicator>3</TimelineIndicator>
          <TimelineContent>
            <TimelineTitle>Preview failed</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>,
    );

    expect(html).toMatch(/^<ol\b/);
    expect(html.match(/<li\b/g)).toHaveLength(3);
    expect(html).toContain('aria-label="Agent activity"');
    expect(html).toMatch(/<li\b[^>]*data-state="success"/);
    expect(html).toMatch(/<li\b[^>]*data-state="running"/);
    expect(html).toMatch(/<li\b[^>]*data-state="error"/);
    expect(html).toContain("Searched documentation");
    expect(html).toContain("Found two relevant sources.");
    expect(html).toContain("2 sources");
  });
});
