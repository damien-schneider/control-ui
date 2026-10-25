import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Button } from "@/components/control-ui/ui/button";
import {
  createDropdownMenuHandle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  type DropdownMenuTriggerProps,
} from "@/components/control-ui/ui/dropdown-menu";

describe("DropdownMenu trigger composition", () => {
  test("the public props support a composed button without nesting buttons", () => {
    const triggerProps: DropdownMenuTriggerProps = {
      render: <Button />,
      size: "md",
      variant: "ghost",
    };
    const html = renderToString(
      <DropdownMenu>
        <DropdownMenuTrigger {...triggerProps}>Choose workspace</DropdownMenuTrigger>
      </DropdownMenu>,
    );

    expect(html.match(/<button\b/g)).toHaveLength(1);
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('data-size="md"');
    expect(html).toContain('data-variant="ghost"');
  });

  test("a composed component keeps its own size and variant", () => {
    const html = renderToString(
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="xs" iconOnly aria-label="More actions" />} />
      </DropdownMenu>,
    );

    expect(html).toContain('data-size="xs"');
    expect(html).toContain('data-variant="ghost"');
    expect(html).toContain('data-icon-only="true"');
    expect(html).not.toContain('data-variant="surface"');
  });

  test("the public props support non-native triggers with button semantics", () => {
    const triggerProps: DropdownMenuTriggerProps = {
      nativeButton: false,
      render: <span />,
    };
    const html = renderToString(
      <DropdownMenu>
        <DropdownMenuTrigger {...triggerProps}>Choose workspace</DropdownMenuTrigger>
      </DropdownMenu>,
    );

    expect(html).not.toContain("<button");
    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('aria-haspopup="menu"');
  });

  test("detached triggers open one shared menu through a handle", () => {
    const clipMenu = createDropdownMenuHandle<string>();
    const html = renderToString(
      <>
        <DropdownMenuTrigger handle={clipMenu} payload="Intro">
          Intro
        </DropdownMenuTrigger>
        <DropdownMenuTrigger handle={clipMenu} payload="Outro">
          Outro
        </DropdownMenuTrigger>
        <DropdownMenu handle={clipMenu}>
          {({ payload }) => (
            <DropdownMenuContent>
              <DropdownMenuItem>{payload}</DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </>,
    );

    expect(html.match(/aria-haspopup="menu"/g)).toHaveLength(2);
  });
});
