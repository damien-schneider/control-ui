import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Button, ButtonLabel, ButtonLink } from "@/components/control-ui/ui/button";
import { TableOfContents } from "@/components/control-ui/ui/table-of-contents";
import { Toggle } from "@/components/control-ui/ui/toggle";

describe("custom highlight composition", () => {
  test.each([
    { name: "Button", control: <Button data-track-item="">Overview</Button> },
    {
      name: "ButtonLink",
      control: (
        <ButtonLink data-track-item="" href="#overview">
          Overview
        </ButtonLink>
      ),
    },
    {
      name: "ButtonLabel",
      control: (
        <ButtonLabel data-track-item="" htmlFor="overview">
          Overview
        </ButtonLabel>
      ),
    },
    { name: "Toggle", control: <Toggle data-track-item="">Overview</Toggle> },
  ])("$name retains the caller's track marker outside a built-in group", ({ control }) => {
    expect(renderToStaticMarkup(control)).toContain('data-track-item=""');
  });

  test("TableOfContents applies layout styles to its outer surface only", () => {
    const html = renderToStaticMarkup(
      <TableOfContents
        items={[{ href: "#overview", label: "Overview" }]}
        style={{ width: 280, padding: 24, "--cui-table-of-contents-highlight-radius": "12px" }}
      />,
    );

    expect(html.match(/width:280px/g)).toHaveLength(1);
    expect(html.match(/padding:24px/g)).toHaveLength(1);
    expect(html).toContain("--cui-table-of-contents-highlight-radius:12px");
  });
});
