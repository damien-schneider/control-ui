import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Reveal, RevealScope } from "./reveal";

describe("Reveal anatomy", () => {
  test("renders a div scope around a span content by default", () => {
    const html = renderToStaticMarkup(
      <RevealScope>
        Row
        <Reveal>Action</Reveal>
      </RevealScope>,
    );

    expect(html).toMatch(/^<div[^>]*data-slot="scope"[^>]*>Row<span[^>]*data-slot="content"[^>]*>Action<\/span><\/div>$/);
  });

  test("keeps the consumer's elements through render", () => {
    const html = renderToStaticMarkup(
      <ul>
        <RevealScope render={<li />} className="flex">
          <Reveal render={<div />} style={{ "--cui-reveal-hidden-opacity": "0.4" }}>
            <button type="button">Rename</button>
          </Reveal>
        </RevealScope>
      </ul>,
    );

    expect(html).toMatch(
      /^<ul><li class="flex"[^>]*data-slot="scope"[^>]*><div style="--cui-reveal-hidden-opacity:0.4"[^>]*data-slot="content"/,
    );
    expect(html).toContain('<button type="button">Rename</button>');
  });
});
