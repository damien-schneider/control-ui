import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
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

  test("the default label still names an unlabelled trigger", () => {
    expect(renderToStaticMarkup(<ModelSwitcher models={models} />)).toMatch(/<button[^>]*aria-label="Model"/);
  });

  test("a name submits the selected model with the form", () => {
    const html = renderToStaticMarkup(<ModelSwitcher models={models} name="model" defaultValue="deep" />);
    expect(html).toMatch(/<input[^>]*name="model"[^>]*value="deep"|<input[^>]*value="deep"[^>]*name="model"/);
  });
});
