import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const popupControlsRecipe = new URL("../src/registry/sources/control-ui/recipes/popup-controls.css", import.meta.url);

for (const popupKind of ["dialog", "alert-dialog"]) {
  test(`${popupKind} body lines up with the header and closes the popup when no footer follows`, async ({ page }) => {
    const stylesheet = await readFile(popupControlsRecipe, "utf8");
    await page.setContent(`
      <style>:root { --spacing: 4px; } ${stylesheet}</style>
      <div data-control-family="popup" data-popup-kind="${popupKind}" data-slot="content" style="display:grid">
        <div id="header" data-control-family="popup" data-popup-kind="${popupKind}" data-slot="header">Title</div>
        <div id="body-with-footer" data-control-family="popup" data-popup-kind="${popupKind}" data-slot="body">Fields</div>
        <div data-control-family="popup" data-popup-kind="${popupKind}" data-slot="footer">Actions</div>
      </div>
      <div data-control-family="popup" data-popup-kind="${popupKind}" data-slot="content" style="display:grid">
        <div data-control-family="popup" data-popup-kind="${popupKind}" data-slot="header">Title</div>
        <div id="last-body" data-control-family="popup" data-popup-kind="${popupKind}" data-slot="body">Fields</div>
        <button type="button">Close</button>
      </div>
    `);
    const header = page.locator("#header");
    const bodyWithFooter = page.locator("#body-with-footer");
    await expect(bodyWithFooter).toHaveCSS("padding-left", await header.evaluate((element) => getComputedStyle(element).paddingLeft));
    await expect(bodyWithFooter).toHaveCSS("padding-right", "16px");
    await expect(bodyWithFooter).toHaveCSS("padding-bottom", "0px");
    await expect(page.locator("#last-body")).toHaveCSS("padding-bottom", "16px");
  });
}
