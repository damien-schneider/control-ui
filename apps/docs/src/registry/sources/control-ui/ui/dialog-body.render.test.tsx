import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AlertDialogBody } from "./alert-dialog";
import { DialogBody } from "./dialog";

describe("dialog body anatomy", () => {
  test("DialogBody exposes the padded body slot between header and footer", () => {
    const html = renderToStaticMarkup(<DialogBody className="custom">Fields</DialogBody>);

    expect(html).toContain('data-control-family="popup"');
    expect(html).toContain('data-popup-kind="dialog"');
    expect(html).toContain('data-slot="body"');
    expect(html).toContain("custom");
  });

  test("AlertDialogBody exposes the same slot for alert dialogs", () => {
    const html = renderToStaticMarkup(<AlertDialogBody>Checks</AlertDialogBody>);

    expect(html).toContain('data-popup-kind="alert-dialog"');
    expect(html).toContain('data-slot="body"');
  });
});
