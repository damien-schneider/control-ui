import { expect, type Page, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

const EXPECTED_DISPLAY = {
  resizable: { group: "flex", panel: "flex", panelInner: "block", handle: "flex" },
  static: { group: "flex", panel: "contents", panelInner: "contents", handle: "none" },
  contents: { group: "contents", panel: "contents", panelInner: "contents", handle: "none" },
} as const;

function layoutExample(page: Page) {
  const cameraNote = page.getByRole("textbox", { name: "Camera note", exact: true });
  const group = page.locator('[data-slot="panel-group"]').filter({ has: cameraNote });
  return {
    cameraNote,
    screenNote: page.getByRole("textbox", { name: "Screen note", exact: true }),
    toggles: page.getByRole("group", { name: "Panel layout", exact: true }),
    group,
    panel: group.locator(':scope > [data-slot="panel"]').first(),
    panelInner: group.locator(':scope > [data-slot="panel"] > div').first(),
    handle: group.locator(':scope > [data-slot="handle"]').first(),
  };
}

test("panel group layouts drop panel and handle boxes without remounting panel children", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/components/resizable");
  const example = layoutExample(page);
  await waitForReactHydration(example.cameraNote);
  await example.cameraNote.scrollIntoViewIfNeeded();
  await example.cameraNote.fill("Live preview stays mounted");
  const initialSize = await example.handle.getAttribute("aria-valuenow");

  for (const layout of ["resizable", "static", "contents", "static", "resizable"] as const) {
    await example.toggles.getByRole("button", { name: layout }).click();
    await expect(example.group).toHaveAttribute("data-layout", layout);
    for (const part of ["group", "panel", "panelInner", "handle"] as const) {
      await expect(example[part]).toHaveCSS("display", EXPECTED_DISPLAY[layout][part]);
    }
    await expect(example.cameraNote).toHaveValue("Live preview stays mounted");
  }

  await expect(example.handle).toHaveAttribute("aria-valuenow", initialSize ?? "");
});

test("static layout takes handles out of the tab order", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/components/resizable");
  const example = layoutExample(page);
  await waitForReactHydration(example.cameraNote);

  await example.cameraNote.focus();
  await page.keyboard.press("Tab");
  await expect(example.handle).toBeFocused();

  await example.toggles.getByRole("button", { name: "Static", exact: true }).click();
  await example.cameraNote.focus();
  await page.keyboard.press("Tab");
  await expect(example.screenNote).toBeFocused();
  await expect(example.handle).toBeHidden();
});
