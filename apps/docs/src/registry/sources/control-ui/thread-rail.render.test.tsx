import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ThreadRail,
  ThreadRailFile,
  ThreadRailFooter,
  ThreadRailItem,
  ThreadRailLine,
  ThreadRailPopover,
  ThreadRailSummary,
  ThreadRailTitle,
} from "./thread-rail";

function lineTags(html: string) {
  return html.match(/<button[^>]*data-slot="line"[^>]*>/g) ?? [];
}

describe("thread rail", () => {
  test("a line is described only by a summary its popover actually renders", () => {
    const html = renderToStaticMarkup(
      <ThreadRail>
        <ThreadRailItem>
          <ThreadRailLine />
          <ThreadRailPopover>
            <ThreadRailTitle>Rename the hook</ThreadRailTitle>
            <ThreadRailFooter>
              <ThreadRailSummary>Renamed in four files.</ThreadRailSummary>
            </ThreadRailFooter>
          </ThreadRailPopover>
        </ThreadRailItem>
        <ThreadRailItem>
          <ThreadRailLine />
          <ThreadRailPopover>
            <ThreadRailTitle>Run the tests</ThreadRailTitle>
          </ThreadRailPopover>
        </ThreadRailItem>
      </ThreadRail>,
    );
    const [described, bare] = lineTags(html);

    const summaryId = /aria-describedby="([^"]+)"/.exec(described ?? "")?.[1];
    expect(summaryId).toBeDefined();
    expect(html).toContain(`id="${summaryId}"`);
    expect(bare).not.toContain("aria-describedby");
  });

  test("data-active marks the active turn, not the turn in view", () => {
    const html = renderToStaticMarkup(
      <ThreadRail>
        <ThreadRailItem inView>
          <ThreadRailLine aria-label="First turn" />
        </ThreadRailItem>
        <ThreadRailItem active>
          <ThreadRailLine aria-label="Second turn" />
        </ThreadRailItem>
      </ThreadRail>,
    );
    const [inView, active] = html.match(/<div[^>]*data-slot="item"[^>]*>/g) ?? [];

    expect(inView).toContain('data-in-view="true"');
    expect(inView).not.toContain("data-active");
    expect(active).toContain('data-active="true"');
  });

  test("a caller's aria-label replaces the default rail name", () => {
    expect(renderToStaticMarkup(<ThreadRail />)).toContain('aria-label="Conversation timeline"');
    const named = renderToStaticMarkup(<ThreadRail aria-label="Fil de la conversation" />);
    expect(named).toContain('aria-label="Fil de la conversation"');
    expect(named).not.toContain("Conversation timeline");
  });

  test("a file name is its own shrinkable box, so a long path ends in an ellipsis", () => {
    const html = renderToStaticMarkup(<ThreadRailFile>packages/registry/src/sources/thread-rail.tsx</ThreadRailFile>);
    expect(html).toMatch(/data-slot="file"[^>]*><span class="[^"]*truncate[^"]*">packages\/registry/);
  });
});
