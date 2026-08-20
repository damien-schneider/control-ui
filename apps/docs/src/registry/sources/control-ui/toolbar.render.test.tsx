import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";

import { Button } from "@/components/control-ui/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/control-ui/ui/dropdown-menu";
import { Toolbar, ToolbarButton, ToolbarInput } from "@/components/control-ui/ui/toolbar";

const RECIPE = readFileSync(new URL("./recipes/toolbar.css", import.meta.url), "utf8");

describe("Toolbar contracts", () => {
  test("derives the shell radius from the fitted item radius and padding", () => {
    expect(RECIPE).toContain("--_toolbar-item-radius: var(--radius-sm);");
    expect(RECIPE).toContain("--_toolbar-item-radius: min(var(--radius-sm), calc(var(--control-h-sm) / 2));");
    expect(RECIPE).toContain(
      "clamp(0px, calc(min(var(--_toolbar-item-radius), calc(var(--control-h-sm) / 2)) * 1000), var(--toolbar-padding))",
    );
    expect(RECIPE).toContain("--toolbar-padding: 0.25rem;");
  });

  test("keeps menu semantics when a button renders a DropdownMenu trigger", () => {
    const html = renderToString(
      <Toolbar>
        <DropdownMenu>
          <ToolbarButton iconOnly render={<DropdownMenuTrigger aria-label="More tools" variant="ghost" iconOnly />}>
            More
          </ToolbarButton>
        </DropdownMenu>
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
