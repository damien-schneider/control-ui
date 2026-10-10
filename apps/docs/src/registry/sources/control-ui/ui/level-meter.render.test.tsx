import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { LevelMeter, LevelMeterBar, LevelMeterPeak, LevelMeterTrack } from "./level-meter";

describe("LevelMeter", () => {
  test("a labelled meter exposes its decibel range, an unlabelled one stays hidden", () => {
    const labelled = renderToString(<LevelMeter aria-label="Microphone level" minDb={-48} maxDb={6} value={-12} />);
    expect(labelled).toContain('role="meter"');
    expect(labelled).toContain('aria-valuemin="-48"');
    expect(labelled).toContain('aria-valuemax="6"');
    expect(labelled).not.toContain("aria-hidden");

    const decorative = renderToString(<LevelMeter value={-12} />);
    expect(decorative).toContain('aria-hidden="true"');
    expect(decorative).not.toContain('role="meter"');
  });

  test("places the warning and clip zones on the decibel scale", () => {
    const html = renderToString(<LevelMeter minDb={-60} maxDb={0} warningDb={-30} clipDb={-6} />);
    expect(html).toContain("--_range-level-warning-start:0.5");
    expect(html).toContain("--_range-level-clip-start:0.9");
  });

  test("renders a track and indicator by default and the composed parts when given", () => {
    const defaults = renderToString(<LevelMeter />);
    expect(defaults).toContain('data-slot="track"');
    expect(defaults).toContain('data-slot="bar"');
    expect(defaults).not.toContain('data-slot="peak"');

    const composed = renderToString(
      <LevelMeter orientation="vertical">
        <LevelMeterTrack>
          <LevelMeterBar />
          <LevelMeterPeak />
        </LevelMeterTrack>
      </LevelMeter>,
    );
    expect(composed).toContain('data-orientation="vertical"');
    expect(composed).toContain('data-slot="peak"');
  });
});
