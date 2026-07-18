import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Toggle, ToggleGroup } from "./toggle";

describe("Toggle anatomy", () => {
  test("keeps Toggle identity while sharing the Button recipe", () => {
    const html = renderToStaticMarkup(<Toggle defaultPressed>Bold</Toggle>);

    expect(html).toContain('data-control-ui="toggle"');
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-slot="content"');
    expect(html).toContain('data-active="true"');
    expect(html).not.toContain('data-control-ui="button"');
  });

  test("emits group anatomy independently from its children", () => {
    const html = renderToStaticMarkup(
      <ToggleGroup>
        <Toggle value="bold">Bold</Toggle>
      </ToggleGroup>,
    );

    expect(html).toContain('data-control-ui="toggle"');
    expect(html).toContain('data-slot="group"');
    expect(html).toContain('data-slot="root"');
  });
});
