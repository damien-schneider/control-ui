import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";

import { Button } from "@/components/control-ui/ui/button";
import { Menu, MenuTrigger } from "@/components/control-ui/ui/menu";
import { Toolbar, ToolbarButton, ToolbarInput } from "@/components/control-ui/ui/toolbar";

const THEME = readFileSync(new URL("./theme.css", import.meta.url), "utf8");

describe("Toolbar contracts", () => {
  test("derives the shell radius from the fitted item radius and padding", () => {
    expect(THEME).toContain("--toolbar-item-radius: var(--radius-sm);");
    expect(THEME).toContain("--toolbar-item-radius-fit: min(var(--toolbar-item-radius), calc(var(--control-h-sm) / 2));");
    expect(THEME).toContain("--toolbar-radius-offset: clamp(0px, calc(var(--toolbar-item-radius-fit) * 1000), var(--toolbar-padding));");
    expect(THEME).toContain("--toolbar-radius: calc(var(--toolbar-item-radius-fit) + var(--toolbar-radius-offset));");
  });

  test("keeps menu semantics when a button renders a Menu trigger", () => {
    const html = renderToString(
      <Toolbar>
        <Menu>
          <ToolbarButton iconOnly render={<MenuTrigger aria-label="More tools" variant="ghost" iconOnly />}>
            More
          </ToolbarButton>
        </Menu>
      </Toolbar>,
    );

    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('data-icon-only="true"');
    expect(html).toContain('data-variant="ghost"');
    expect(html.match(/<button/g)).toHaveLength(1);
  });

  test("exposes inverse toolbar and icon button variants as data state", () => {
    const html = renderToString(
      <Toolbar variant="inverse">
        <Button iconOnly shape="circle" aria-label="Theme">
          Theme
        </Button>
      </Toolbar>,
    );

    expect(html).toContain('data-variant="inverse"');
    expect(html).toContain('data-icon-only="true"');
    expect(html).toContain('data-shape="circle"');
  });

  test("keeps toolbar input behavior when composing another input", () => {
    const html = renderToString(
      <Toolbar>
        <ToolbarInput render={<input data-composed-input="" />} aria-label="Search documentation" />
      </Toolbar>,
    );

    expect(html).toContain('data-control-ui="toolbar"');
    expect(html).toContain('data-slot="input"');
    expect(html).toContain('data-composed-input=""');
    expect(html).toContain('aria-label="Search documentation"');
  });

  test("lets a Control UI button render as one toolbar button", () => {
    const html = renderToString(
      <Toolbar>
        <Button render={<ToolbarButton />} aria-label="Edit theme">
          Edit theme
        </Button>
      </Toolbar>,
    );

    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html).toContain('data-orientation="horizontal"');
    expect(html).toContain('aria-label="Edit theme"');
  });
});
