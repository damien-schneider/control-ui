import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const DIALOG = readFileSync(new URL("./ui/dialog.tsx", import.meta.url), "utf8");
const ALERT_DIALOG = readFileSync(new URL("./ui/alert-dialog.tsx", import.meta.url), "utf8");
const DIALOG_EXAMPLE = readFileSync(new URL("../../examples/control-ui/primitives/dialog.tsx", import.meta.url), "utf8");
const ALERT_DIALOG_EXAMPLE = readFileSync(new URL("../../examples/control-ui/primitives/alert-dialog.tsx", import.meta.url), "utf8");

describe("dialog close actions", () => {
  test("dialog close composes the shared Button primitive", () => {
    expect(DIALOG).toContain('import { Button } from "@/components/control-ui/ui/button";');
    expect(DIALOG).toContain("type DialogCloseProps");
    expect(DIALOG).toContain("<Button");
    expect(DIALOG).toContain("<DialogClose");
    expect(DIALOG).toContain('variant="ghost"');
    expect(DIALOG).toContain('size="xs"');
  });

  test("alert dialog close composes the shared Button primitive", () => {
    expect(ALERT_DIALOG).toContain('import { Button } from "@/components/control-ui/ui/button";');
    expect(ALERT_DIALOG).toContain("type AlertDialogCloseProps");
    expect(ALERT_DIALOG).toContain("<Button");
    expect(ALERT_DIALOG).not.toContain("does not compose the control-ui Button");
  });

  test("dialog examples use Button variants instead of custom button class recipes", () => {
    expect(DIALOG_EXAMPLE).toContain('import { Button } from "@/components/control-ui/ui/button";');
    expect(DIALOG_EXAMPLE).toContain('<DialogTrigger render={<Button variant="surface">Edit profile</Button>} />');
    expect(DIALOG_EXAMPLE).toContain('<DialogClose variant="solid" tone="primary">');
    expect(DIALOG_EXAMPLE).not.toContain("triggerClass");

    expect(ALERT_DIALOG_EXAMPLE).toContain('import { Button } from "@/components/control-ui/ui/button";');
    expect(ALERT_DIALOG_EXAMPLE).toContain('<Button variant="surface" tone="danger">');
    expect(ALERT_DIALOG_EXAMPLE).toContain('<AlertDialogClose variant="solid" tone="danger">');
    expect(ALERT_DIALOG_EXAMPLE).not.toContain("buttonClass");
  });
});
