import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  InlineCitation,
  InlineCitationNavigation,
  InlineCitationPosition,
  InlineCitationSource,
  InlineCitationTrigger,
} from "./inline-citation";

const sources = [
  {
    href: "https://www.example.com/guide",
    title: "Example guide",
    description: "An implementation guide.",
  },
  {
    href: "https://docs.example.org/reference",
    title: "API reference",
  },
];

describe("InlineCitation", () => {
  test("the trigger's accessible name starts with its visible label", () => {
    const html = renderToStaticMarkup(<InlineCitation sources={sources} />);

    const name = html.match(/aria-label="([^"]+)"/)?.[1] ?? "";
    expect(name.startsWith("example.com +1")).toBe(true);
    expect(html).toContain("example.com +1");
    expect(html.match(/data-slot="favicon"/g)).toHaveLength(2);
  });

  test("renders the selected source metadata and an outbound source link", () => {
    const html = renderToStaticMarkup(
      <InlineCitation sources={sources}>
        <InlineCitationTrigger />
        <InlineCitationPosition />
        <InlineCitationSource />
      </InlineCitation>,
    );

    expect(html).toContain("1/2");
    expect(html).toContain("Example guide");
    expect(html).toContain("An implementation guide.");
    expect(html).toContain('href="https://www.example.com/guide"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer noopener"');
  });
  test("forwards retained knob styles to their painted compound parts", () => {
    const html = renderToStaticMarkup(
      <InlineCitation sources={sources}>
        <InlineCitationTrigger style={{ "--cui-inline-citation-trigger-radius": "3px" }} />
        <InlineCitationNavigation style={{ "--cui-inline-citation-navigation-background": "oklch(0.9 0.02 250)" }}>
          <InlineCitationPosition />
        </InlineCitationNavigation>
      </InlineCitation>,
    );

    expect(html).toContain("--cui-inline-citation-trigger-radius:3px");
    expect(html).toContain("--cui-inline-citation-navigation-background:oklch(0.9 0.02 250)");
  });

  test("disables the disclosure trigger when no sources are available", () => {
    const html = renderToStaticMarkup(<InlineCitation sources={[]} />);

    expect(html.match(/aria-label="([^"]+)"/)?.[1]?.startsWith("No sources")).toBe(true);
    expect(html).toContain("disabled");
    expect(html).toContain("No sources");
  });
});
