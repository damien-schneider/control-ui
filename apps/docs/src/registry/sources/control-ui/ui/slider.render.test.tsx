import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Slider } from "./slider";

function part(html: string, slot: string): string {
  return html.match(new RegExp(`<[a-z]+[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? "";
}

describe("Slider", () => {
  test("keeps layout styles on the root and forwards only knobs to the inner parts", () => {
    const html = renderToStaticMarkup(<Slider aria-label="Volume" style={{ width: 240, "--cui-range-track-background": "red" }} />);

    expect(part(html, "root")).toContain("width:240px");
    for (const slot of ["track", "indicator", "thumb"]) {
      expect(part(html, slot)).toContain("--cui-range-track-background:red");
      expect(part(html, slot)).not.toContain("width:240px");
    }
  });

  test("draws ticks on the values the thumb snaps to", () => {
    const html = renderToStaticMarkup(<Slider variant="plain" label="Zoom" min={0} max={100} step={30} />);
    const ticks = html.match(/data-slot="tick"[^>]*style="[^"]*"/g) ?? [];

    expect(ticks).toHaveLength(3);
    expect(ticks[0]).toContain("inset-inline-start:30%");
    expect(ticks[1]).toContain("inset-inline-start:60%");
    expect(ticks[2]).toContain("inset-inline-start:90%");
  });

  test("omits the tick that would sit on the maximum", () => {
    const html = renderToStaticMarkup(<Slider variant="plain" label="Opacity" min={0} max={1} step={0.1} />);

    expect(html.match(/data-slot="tick"/g)).toHaveLength(9);
  });

  test("stacks the label and value around a vertical track instead of overlaying it", () => {
    const vertical = renderToStaticMarkup(<Slider variant="plain" orientation="vertical" label="Volume" />);
    const horizontal = renderToStaticMarkup(<Slider variant="plain" label="Volume" />);

    expect(part(vertical, "root")).toContain("flex-col");
    expect(part(vertical, "label-overlay")).toContain('class="contents"');
    expect(part(vertical, "label")).toContain("order-first");
    expect(part(horizontal, "label-overlay")).toContain("absolute inset-0");
  });

  test("describes the thumb input and names it from an external label", () => {
    const html = renderToStaticMarkup(<Slider aria-labelledby="volume-label" aria-describedby="volume-hint" name="volume" />);
    const input = html.match(/<input[^>]*>/)?.[0] ?? "";

    expect(input).toContain('aria-labelledby="volume-label"');
    expect(input).toContain('aria-describedby="volume-hint"');
    expect(input).toContain('name="volume"');
  });

  test("renders one named thumb per value of a range", () => {
    const html = renderToStaticMarkup(
      <Slider defaultValue={[20, 80]} thumbLabels={["Minimum price", "Maximum price"]} formatValue={(value) => `$${value}`} />,
    );
    const inputs = html.match(/<input[^>]*>/g) ?? [];

    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toContain('aria-label="Minimum price"');
    expect(inputs[0]).toContain('aria-valuetext="$20"');
    expect(inputs[1]).toContain('aria-label="Maximum price"');
    expect(inputs[1]).toContain('aria-valuetext="$80"');
  });

  test("shows both ends of a range in the value readout", () => {
    const html = renderToStaticMarkup(
      <Slider variant="plain" label="Price" defaultValue={[20, 80]} formatValue={(value) => `$${value}`} />,
    );

    expect(html).toContain("$20 – $80");
  });
});
