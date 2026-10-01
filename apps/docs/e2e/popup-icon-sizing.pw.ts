import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const popupRecipe = new URL("../src/registry/sources/control-ui/recipes/popup.css", import.meta.url);

for (const popupKind of ["dropdown-menu", "context-menu", "menubar", "command", "select", "combobox"]) {
  test(`${popupKind} sizes item icons without resizing nested content or indicators`, async ({ page }) => {
    const stylesheet = await readFile(popupRecipe, "utf8");
    await page.setContent(`
      <style>${stylesheet}
      @layer utilities { .size-3 { width: 12px; height: 12px; } .size-5 { width: 20px; height: 20px; } }
      </style>
      <div data-control-family="popup" data-popup-part="list-surface">
      <div data-control-family="popup" data-popup-kind="${popupKind}" data-popup-part="item" style="display:flex;width:100px">
        <svg id="default-icon" width="24" height="24"></svg>
        <span>Long item label</span>
        <svg id="custom-icon" class="size-5" width="24" height="24"></svg>
        <svg id="indicator" class="size-3" width="24" height="24"></svg>
        <span><svg id="nested-image" width="32" height="32"></svg></span>
      </div></div>
    `);
    await expect(page.locator("#default-icon")).toHaveCSS("width", "16px");
    await expect(page.locator("#default-icon")).toHaveCSS("height", "16px");
    await expect(page.locator("#default-icon")).toHaveCSS("flex-shrink", "0");
    await expect(page.locator("#custom-icon")).toHaveCSS("width", "20px");
    await expect(page.locator("#indicator")).toHaveCSS("width", "12px");
    await expect(page.locator("#nested-image")).toHaveCSS("width", "32px");
    await page.addStyleTag({ content: '[data-popup-part="item"] { --cui-popup-item-icon-size: 18px; }' });
    await expect(page.locator("#default-icon")).toHaveCSS("width", "18px");
  });
}
