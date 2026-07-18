import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { SourceBadge } from "./source-badge";

describe("SourceBadge", () => {
  test("derives a readable hostname and keeps the source link accessible", () => {
    const html = renderToString(<SourceBadge href="https://www.example.com/docs/activity" />);

    expect(html).toContain('data-control-ui="source-badge"');
    expect(html).toContain('href="https://www.example.com/docs/activity"');
    expect(html).toContain("example.com");
    expect(html).toContain('data-slot="favicon"');
    expect(html).toContain('data-control-ui="avatar"');
    expect(html).toContain('data-slot="fallback"');
  });

  test("allows automatic favicon requests to be disabled", () => {
    const html = renderToString(<SourceBadge href="https://example.com/docs" faviconSrc={false} />);

    expect(html).not.toContain("<img");
    expect(html).toContain('data-slot="fallback"');
  });

  test("renders a provider favicon and secures links opened in a new tab", () => {
    const html = renderToString(
      <SourceBadge href="https://example.com" faviconSrc="https://example.com/favicon.ico" target="_blank">
        Example docs
      </SourceBadge>,
    );

    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer noopener"');
    expect(html).toContain("Example docs");
  });
});
