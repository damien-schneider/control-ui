import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { TranscriptDivider } from "./transcript-divider";

describe("TranscriptDivider", () => {
  test("renders an unlabeled rule as a separator without an empty label slot", () => {
    const html = renderToString(<TranscriptDivider />);

    expect(html).toContain('role="separator"');
    expect(html).not.toContain('data-slot="label"');
  });
});
