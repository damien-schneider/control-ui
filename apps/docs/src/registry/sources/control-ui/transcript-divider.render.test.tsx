import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { TranscriptDivider, TranscriptDividerLabel } from "./transcript-divider";

describe("TranscriptDivider", () => {
  test("renders an unlabeled rule as a separator without an empty label slot", () => {
    const html = renderToString(<TranscriptDivider />);

    expect(html).toContain('role="separator"');
    expect(html).not.toContain('data-slot="label"');
  });

  test("wraps bare content in one label and leaves a composed label alone", () => {
    const bare = renderToString(<TranscriptDivider>Today</TranscriptDivider>);
    const composed = renderToString(
      <TranscriptDivider>
        <TranscriptDividerLabel id="day">Today</TranscriptDividerLabel>
      </TranscriptDivider>,
    );

    expect(bare.match(/data-slot="label"/g)).toHaveLength(1);
    expect(composed.match(/data-slot="label"/g)).toHaveLength(1);
    expect(composed).toContain('id="day"');
  });
});
