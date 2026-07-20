import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { InfiniteCanvas, InfiniteCanvasContent, InfiniteCanvasControls } from "./ui/infinite-canvas";

describe("InfiniteCanvas", () => {
  test("projects controlled pan and zoom state into its content", () => {
    const html = renderToString(
      <InfiniteCanvas aria-label="Planning space" transform={{ x: 120, y: 72, scale: 1.25 }}>
        <InfiniteCanvasContent>
          <article>Spatial node</article>
        </InfiniteCanvasContent>
        <InfiniteCanvasControls />
      </InfiniteCanvas>,
    );

    expect(html).toContain('aria-label="Planning space"');
    expect(html).toContain('data-slot="content"');
    expect(html).toContain('data-scale="1.25"');
    expect(html).toContain("translate3d(120px, 72px, 0) scale(1.25)");
    expect(html).toContain('aria-label="Zoom out"');
    expect(html).toContain('aria-label="Zoom in"');
    expect(html).toContain("125%");
    expect(html).toContain("Spatial node");
  });
});
