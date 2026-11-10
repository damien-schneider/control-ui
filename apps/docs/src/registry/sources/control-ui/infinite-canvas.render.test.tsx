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
    expect(html).toContain("translate(120px, 72px) scale(1.25)");
    expect(html).toContain('aria-label="Zoom out"');
    expect(html).toContain('aria-label="Zoom in"');
    expect(html).toContain("125%");
    expect(html).toContain("Spatial node");
  });

  test("zooms below ten percent when minScale allows it", () => {
    const html = renderToString(
      <InfiniteCanvas transform={{ x: 0, y: 0, scale: 0.05 }} minScale={0.01}>
        <InfiniteCanvasControls />
      </InfiniteCanvas>,
    );
    const zoomOutButton = html.match(/<button[^>]*aria-label="Zoom out"[^>]*>/)?.[0];

    expect(html).toContain("5%");
    expect(zoomOutButton).toContain('aria-disabled="false"');
    expect(zoomOutButton).not.toContain("data-disabled");
  });

  test("starts inside the zoom range when the initial transform is out of range or unusable", () => {
    const zoomedPastMax = renderToString(
      <InfiniteCanvas defaultTransform={{ x: 10, y: 20, scale: 8 }}>
        <InfiniteCanvasContent />
        <InfiniteCanvasControls />
      </InfiniteCanvas>,
    );
    const zeroScale = renderToString(
      <InfiniteCanvas defaultTransform={{ x: 10, y: 20, scale: 0 }}>
        <InfiniteCanvasContent />
      </InfiniteCanvas>,
    );

    expect(zoomedPastMax).toContain('data-scale="2.5"');
    expect(zoomedPastMax).toContain("250%");
    expect(zeroScale).toContain('data-scale="1"');
    expect(zeroScale).toContain("translate(0px, 0px) scale(1)");
  });

  test("announces the zoom-in shortcut with a key name assistive technology can parse", () => {
    const html = renderToString(<InfiniteCanvas />);

    expect(html).toContain('aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Plus - 0 1"');
  });

  test("names every control from its label props", () => {
    const html = renderToString(
      <InfiniteCanvas transform={{ x: 0, y: 0, scale: 1.5 }}>
        <InfiniteCanvasControls
          toolbarLabel="Vue du canevas"
          zoomOutLabel="Dézoomer"
          zoomInLabel="Zoomer"
          fitViewLabel="Ajuster"
          getResetLabel={(percentage) => `Réinitialiser le zoom, ${percentage} %`}
        />
      </InfiniteCanvas>,
    );

    for (const label of ["Vue du canevas", "Dézoomer", "Zoomer", "Ajuster", "Réinitialiser le zoom, 150 %"]) {
      expect(html).toContain(`aria-label="${label}"`);
    }
  });
});
