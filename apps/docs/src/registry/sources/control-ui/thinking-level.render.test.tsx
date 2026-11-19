import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ThinkingLevelRamp } from "./thinking-level";

const levels = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

describe("thinking level ramp", () => {
  test("a range slider carries the level for keyboards and screen readers", () => {
    const html = renderToStaticMarkup(<ThinkingLevelRamp levels={levels} value="medium" onValueChange={() => {}} />);
    const slider = /<input[^>]*type="range"[^>]*>/.exec(html)?.[0];

    expect(slider).toContain('aria-label="Thinking"');
    expect(slider).toContain('min="0"');
    expect(slider).toContain('max="2"');
    expect(slider).toContain('value="1"');
    expect(slider).toContain('aria-valuetext="Medium"');
  });

  test("one cell per level, only the picked one marked", () => {
    const html = renderToStaticMarkup(<ThinkingLevelRamp levels={levels} value="high" onValueChange={() => {}} />);

    const stops = html.match(/<span[^>]*data-slot="stop"[^>]*>/g) ?? [];

    expect(stops).toHaveLength(3);
    expect(stops.map((stop) => stop.includes('data-picked=""'))).toEqual([false, false, true]);
  });

  test("a custom label names the slider and heads the ramp", () => {
    const html = renderToStaticMarkup(<ThinkingLevelRamp label="Effort" levels={levels} value="low" onValueChange={() => {}} />);

    expect(html).toContain('aria-label="Effort"');
    expect(html.replace(/<[^>]+>/g, " ")).toMatch(/Effort/);
  });
});
