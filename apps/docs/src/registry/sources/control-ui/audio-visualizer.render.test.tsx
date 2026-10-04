import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { AudioVisualizer as BarAudioVisualizer } from "./audio-visualizer";
import { AudioVisualizer as FrequencyAudioVisualizer } from "./audio-visualizer-bar";
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

  test("exposes labelled visualizations and keeps decorative ones hidden", () => {
    const labelled = renderToString(<FrequencyAudioVisualizer levels={[0.2, 0.8]} aria-label="Voice activity" align="end" mirrored />);
    expect(labelled).toContain('role="img"');
    expect(labelled).toContain('aria-label="Voice activity"');
    expect(labelled).not.toContain('aria-hidden="true"');
    expect(labelled).toContain('data-align="end"');
    expect(labelled).toContain('data-mirrored="true"');
    expect(renderToString(<FrequencyAudioVisualizer levels={[]} />)).toContain('aria-hidden="true"');
  });

  test("draws a one-point line across the full width and clears an inactive envelope", () => {
    const single = renderToString(<LineAudioVisualizer levels={[0.8]} points={1} />);
    expect(single).toContain("100.00");
    expect(single).not.toContain("NaN");
    const inactive = renderToString(<LineAudioVisualizer levels={[1]} points={1} active={false} />);
    expect(inactive).toContain("M 0.00 16.00");
    expect(inactive).not.toContain('data-active="true"');
  });

  test("loading bars expose a busy state without stale signal", () => {
    const html = renderToString(<FrequencyAudioVisualizer levels={[1]} points={1} loading idle="wave" />);
    expect(html).toContain('data-loading="true"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("height:8%");
  });
});
