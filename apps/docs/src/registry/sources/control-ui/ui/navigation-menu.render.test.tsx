import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "./navigation-menu";

const PAINT_STAMPS = ["data-control-family", "data-control", "data-size", "data-variant", "data-tone", "data-shape"];

function openingTag(html: string, slot: string): string {
  const tag = html.match(new RegExp(`<[a-z]+[^>]*data-slot="${slot}"[^>]*>`))?.[0];
  if (!tag) throw new Error(`no element stamped data-slot="${slot}"`);
  return tag;
}

function stamp(tag: string, attribute: string): string | undefined {
  return tag.match(new RegExp(`${attribute}="([^"]*)"`))?.[1];
}

describe("NavigationMenuLink", () => {
  test("a link placed directly in the list carries the trigger's paint stamps", () => {
    const html = renderToString(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Overview</NavigationMenuTrigger>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Changelog</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const trigger = openingTag(html, "trigger");
    const link = openingTag(html, "list-link");

    expect(stamp(link, "data-control-family")).toBe("button");
    for (const attribute of PAINT_STAMPS) expect(stamp(link, attribute)).toBe(stamp(trigger, attribute));
  });

  test("the current page link is marked for assistive tech and for the button active paint", () => {
    const html = renderToString(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" active>
              Docs
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const link = openingTag(html, "list-link");

    expect(stamp(link, "aria-current")).toBe("page");
    expect(stamp(link, "data-active")).toBe("true");
  });
});
