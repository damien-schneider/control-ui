import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PROVIDER_MARKS } from "../../lib/provider-marks";
import { ModelSwitcher } from "./model-switcher";

const models = [
  { value: "fast", label: "Fast" },
  { value: "deep", label: "Deep" },
] as const;

describe("model switcher", () => {
  test("trigger props reach the trigger, so a visible label can name it", () => {
    const html = renderToStaticMarkup(<ModelSwitcher models={models} id="model" aria-labelledby="model-label" data-testid="switcher" />);
    const trigger = /<button[^>]*id="model"[^>]*>/.exec(html)?.[0];

    expect(trigger).toContain('aria-labelledby="model-label"');
    expect(trigger).toContain('data-testid="switcher"');
    expect(trigger).not.toContain("aria-label=");
  });

  test("an unlabelled trigger is named by its label and the current model", () => {
    expect(renderToStaticMarkup(<ModelSwitcher models={models} />)).toMatch(/<button[^>]*aria-label="Model: Fast"/);
  });

  test("a name submits the selected model with the form", () => {
    const html = renderToStaticMarkup(<ModelSwitcher models={models} name="model" defaultValue="deep" />);
    expect(html).toMatch(/<input[^>]*name="model"[^>]*value="deep"|<input[^>]*value="deep"[^>]*name="model"/);
  });

  describe("with model ids", () => {
    const ids = [
      { value: "claude-opus-4-5-20251101" },
      { value: "house-model", label: "House", provider: "acme" },
      { value: "gpt-5", label: "Plain", icon: null },
    ];

    test("an id without a label reads as its model name, next to its maker's logo", () => {
      const html = renderToStaticMarkup(<ModelSwitcher models={ids} />);

      expect(html).toContain("Claude Opus 4.5");
      expect(html).toContain('data-control-ui="provider-logo"');
      expect(html).toContain(`d="${PROVIDER_MARKS.anthropic.paths[0]}"`);
    });

    test("an unknown maker gets its initial, and icon null opts out of a logo", () => {
      expect(renderToStaticMarkup(<ModelSwitcher models={ids} defaultValue="house-model" />)).toMatch(
        /data-control-ui="provider-logo".*>A<\/text>/,
      );
      expect(renderToStaticMarkup(<ModelSwitcher models={ids} defaultValue="gpt-5" />)).not.toContain("provider-logo");
    });
  });

  describe("with a thinking level", () => {
    const levels = [
      { value: "low", label: "Low" },
      { value: "high", label: "High" },
    ] as const;

    test("model and level share one trigger that names both", () => {
      const html = renderToStaticMarkup(<ModelSwitcher models={models} defaultValue="deep" thinking={{ levels, defaultValue: "high" }} />);

      expect(html.match(/<button/g)).toHaveLength(1);
      expect(html).toContain('aria-haspopup="dialog"');
      expect(html).toContain('aria-label="Model: Deep, Thinking: High"');
      expect(html.replace(/<[^>]+>/g, "")).toBe("DeepHigh");
    });

    test("the trigger shows how deep it thinks: a brain filled to the level", () => {
      const fillLine = (value: string) =>
        /data-slot="brain".*?<rect y="([\d.]+)"/.exec(
          renderToStaticMarkup(<ModelSwitcher models={models} thinking={{ levels, defaultValue: value }} />),
        )?.[1];

      expect(fillLine("low")).toBe("13.7");
      expect(fillLine("high")).toBe("1.9");
    });

    test("names submit the model and the level with the form", () => {
      const html = renderToStaticMarkup(
        <ModelSwitcher models={models} name="model" defaultValue="deep" thinking={{ levels, name: "thinking", defaultValue: "low" }} />,
      );

      expect(html).toContain('<input type="hidden" name="model" value="deep"/>');
      expect(html).toContain('<input type="hidden" name="thinking" value="low"/>');
    });
  });
});
