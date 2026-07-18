import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Search, SquareTerminal } from "lucide-react";
import { renderToString } from "react-dom/server";
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
} from "./activity";

describe("Activity", () => {
  test("formats machine activity names as readable titles", () => {
    const html = renderToString(
      <Activity kind="tool" name="read_registry-files">
        <ActivityTitle />
      </Activity>,
    );

    expect(html).toContain("Read registry files");
    expect(readFileSync(path.join(import.meta.dir, "activity.tsx"), "utf8")).not.toContain("export function formatActivityTitle");
  });

  test("renders an explicit static row without disclosure affordances", () => {
    const html = renderToString(
      <Activity state="success">
        <ActivityRow>
          <ActivityIcon>
            <Search />
          </ActivityIcon>
          <ActivityTitle>Read files, searched the web</ActivityTitle>
          <ActivityStatus className="sr-only" />
        </ActivityRow>
      </Activity>,
    );

    expect(html).toContain('data-control-ui="activity"');
    expect(html).toContain('data-activity-state="success"');
    expect(html).toContain('data-slot="row"');
    expect(html).toContain("Read files, searched the web");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("aria-expanded=");
  });

  test("renders an accessible disclosure with a bounded scroll area", () => {
    const html = renderToString(
      <Activity state="running" defaultOpen>
        <ActivityTrigger>
          <ActivityIcon />
          <ActivityTitle>Thinking</ActivityTitle>
          <ActivityStatus className="sr-only" />
        </ActivityTrigger>
        <ActivityContent>
          <ActivityList>
            <ActivityItem icon={<SquareTerminal />}>Ran the validation command</ActivityItem>
          </ActivityList>
        </ActivityContent>
      </Activity>,
    );

    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('data-slot="announcement"');
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('data-slot="content"');
    expect(html).toContain('data-control-ui="scroll-area"');
    expect(html).toContain('data-slot="content-viewport"');
    expect(html).toContain("--activity-content-max-height");
    expect(html).toContain('data-slot="item"');
    expect(html).toContain("Ran the validation command");
  });

  test("announces failures outside the disclosure trigger", () => {
    const html = renderToString(
      <Activity state="error" statusLabel="Search failed">
        <ActivityRow>
          <ActivityTitle>Search</ActivityTitle>
        </ActivityRow>
      </Activity>,
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-live="assertive"');
    expect(html).toContain("Search failed");
  });

  test("allows the content height cap to be disabled explicitly", () => {
    const html = renderToString(
      <Activity defaultOpen>
        <ActivityTrigger>
          <ActivityTitle>Details</ActivityTitle>
        </ActivityTrigger>
        <ActivityContent maxHeight={false}>Unbounded content</ActivityContent>
      </Activity>,
    );

    expect(html).not.toContain("--activity-content-max-height");
    expect(html).toContain("Unbounded content");
  });

  test("renders structured tool details without a separate tool-call anatomy", () => {
    const html = renderToString(
      <Activity state="success" kind="tool" name="read_file" defaultOpen>
        <ActivityTrigger>
          <ActivityIcon />
          <ActivityTitle />
          <ActivityStatus className="sr-only" />
        </ActivityTrigger>
        <ActivityContent>
          <ActivityDetail>
            <ActivityDetailLabel>Input</ActivityDetailLabel>
            <ActivityDetailContent>src/app.tsx</ActivityDetailContent>
          </ActivityDetail>
        </ActivityContent>
      </Activity>,
    );

    expect(html).toContain('data-activity-kind="tool"');
    expect(html).toContain('data-activity-name="read_file"');
    expect(html).toContain('data-surface="panel"');
    expect(html).toContain('data-slot="detail"');
    expect(html).toContain('data-slot="detail-label"');
    expect(html).toContain('data-slot="detail-content"');
    expect(html).not.toContain('data-control-ui="tool-call"');
  });
});
