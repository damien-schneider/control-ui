import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { SourceBadge, SourceFavicon } from "./source-badge";

describe("SourceBadge", () => {
  test("derives a readable hostname and keeps the source link accessible", () => {
    const html = renderToString(<SourceBadge href="https://www.example.com/docs/activity" />);

    expect(html).toContain('data-control-ui="source-badge"');
    expect(html).toContain('href="https://www.example.com/docs/activity"');
    expect(html).toContain("example.com");
    expect(html).toContain('data-source-badge-favicon=""');
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
  test("keeps source and badge knob styles on the painted root without child transport", () => {
    const badge = renderToString(
      <SourceBadge
        href="https://example.com"
        style={{ "--cui-source-badge-background": "oklch(0.8 0.1 150)", "--cui-badge-radius": "2px" }}
      />,
    );
    const favicon = renderToString(
      <SourceFavicon href="https://example.com" faviconSrc={false} style={{ "--cui-source-badge-favicon-radius": "2px" }} />,
    );

    expect(badge).toContain("--cui-source-badge-background:oklch(0.8 0.1 150)");
    expect(badge).toContain("--cui-badge-radius:2px");
    expect(badge.match(/--cui-source-badge-background/g)).toHaveLength(1);
    expect(favicon).toContain("--cui-source-badge-favicon-radius:2px");
  });
});
