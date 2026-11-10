import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Button } from "./button";
import { Popover, PopoverAnchor, PopoverClose } from "./popover";
import { Sheet, SheetClose, SheetTrigger } from "./sheet";

describe("popup close parts", () => {
  test("a control composed into SheetClose keeps its own family", () => {
    const html = renderToString(
      <Sheet>
        <SheetClose render={<Button variant="surface" />}>Done</SheetClose>
      </Sheet>,
    );

    expect(html).toContain('data-control-family="button"');
    expect(html).toContain('data-control-ui="sheet"');
    expect(html).toContain('data-slot="close"');
  });

  test("a control composed into PopoverClose keeps its own family", () => {
    const html = renderToString(
      <Popover>
        <PopoverClose render={<Button variant="surface" />}>Done</PopoverClose>
      </Popover>,
    );

    expect(html).toContain('data-control-family="button"');
    expect(html).toContain('data-control-ui="popover"');
    expect(html).toContain('data-slot="close"');
  });

  test("bare close parts carry no popup paint", () => {
    const html = renderToString(
      <>
        <Sheet>
          <SheetClose>Done</SheetClose>
        </Sheet>
        <Popover>
          <PopoverClose>Done</PopoverClose>
        </Popover>
      </>,
    );

    expect(html.match(/data-slot="close"/g)).toHaveLength(2);
    expect(html).not.toContain("data-control-family");
  });
});

describe("popup trigger and anchor parts", () => {
  test("SheetTrigger opens the sheet from a composed control", () => {
    const html = renderToString(
      <Sheet>
        <SheetTrigger render={<Button variant="surface" />}>Filters</SheetTrigger>
      </Sheet>,
    );

    expect(html).toContain('data-control-family="button"');
    expect(html).toContain('data-control-ui="sheet"');
    expect(html).toContain('data-slot="trigger"');
    expect(html).toContain('aria-haspopup="dialog"');
  });

  test("PopoverAnchor is a plain element, not a second trigger", () => {
    const html = renderToString(
      <Popover>
        <PopoverAnchor className="row">Row</PopoverAnchor>
      </Popover>,
    );

    expect(html).toContain("<div");
    expect(html).toContain('data-slot="anchor"');
    expect(html).toContain("row");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("aria-haspopup");
  });

  test("PopoverAnchor outside a Popover is a usage error", () => {
    expect(() => renderToString(<PopoverAnchor />)).toThrow("PopoverAnchor must be used within Popover.");
  });
});
