import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SkinProvider } from "@/components/control-ui/skin-provider";
import { ScrollArea } from "./scroll-area";

test("scrollbar behavior uses neutral defaults without a skin", () => {
  const html = renderToStaticMarkup(<ScrollArea>Content</ScrollArea>);
  expect(html).toContain('data-scrollbar-gutter="auto"');
  expect(html).not.toContain('data-slot="scrollbar"');
});

test("skins can reserve visible tracks and instances can override either default", () => {
  const skin = { scrollAreaScrollbarGutter: "stable", scrollAreaScrollbarVisibility: "always" } as const;
  const html = renderToStaticMarkup(
    <SkinProvider skin={skin}>
      <ScrollArea lockAxis="x">Content</ScrollArea>
    </SkinProvider>,
  );
  expect(html).toContain('data-scrollbar-gutter="stable"');
  expect(html).toContain('data-visibility="always"');
  expect(html).not.toContain('data-orientation="horizontal"');

  const overrideVisibility = renderToStaticMarkup(
    <SkinProvider skin={skin}>
      <ScrollArea scrollbarVisibility="hover">Content</ScrollArea>
    </SkinProvider>,
  );
  expect(overrideVisibility).toContain('data-scrollbar-gutter="stable"');
  expect(overrideVisibility).toContain('data-visibility="hover"');
  expect(overrideVisibility).not.toContain('data-visibility="always"');

  const overrideGutter = renderToStaticMarkup(
    <SkinProvider skin={skin}>
      <ScrollArea scrollbarGutter="auto">Content</ScrollArea>
    </SkinProvider>,
  );
  expect(overrideGutter).toContain('data-scrollbar-gutter="auto"');
  expect(overrideGutter).not.toContain('data-slot="scrollbar"');
});
