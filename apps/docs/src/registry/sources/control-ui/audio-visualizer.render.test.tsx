import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { AudioVisualizer as BarAudioVisualizer } from "./audio-visualizer";
import { AudioVisualizer as LineAudioVisualizer } from "./audio-visualizer-line";

describe("AudioVisualizer", () => {
  test("renders a stable inactive bar window with sanitized levels", () => {
    const html = renderToString(<BarAudioVisualizer levels={[Number.NaN, -1, 0.75, 2]} points={4} active={false} />);

    expect(html).toContain('data-variant="bars"');
    expect(html).not.toContain("data-active=");
    expect(html.match(/data-slot="bar"/g)).toHaveLength(4);
    expect(html).not.toContain("NaN");
    expect(html).not.toContain("Infinity");
  });

  test("renders the line version as a smooth mirrored envelope path", () => {
    const html = renderToString(<LineAudioVisualizer levels={[0.2, 0.8]} points={4} />);

    expect(html).toContain('data-variant="line"');
    expect(html).toContain('data-control-ui="audio-visualizer-line"');
    expect(html).toContain('data-slot="root"');
    expect(html).toContain(" C ");
    expect(html).not.toContain("<polyline");
  });
});
