import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { TranscriptDivider } from "./transcript-divider";

describe("TranscriptDivider", () => {
  test("renders a labeled separator with its tone exposed as state", () => {
    const html = renderToString(<TranscriptDivider tone="warning">Run interrupted</TranscriptDivider>);

    expect(html).toContain('data-control-ui="transcript-divider"');
    expect(html).toContain('data-tone="warning"');
    expect(html).toContain('data-slot="label"');
    expect(html).toContain("Run interrupted");
  });

  test("renders an unlabeled rule without an empty label slot", () => {
    const html = renderToString(<TranscriptDivider />);

    expect(html).toContain('data-tone="neutral"');
    expect(html).not.toContain('data-slot="label"');
  });
});
