import { expect, type Page, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

async function applyMastraSkin(page: Page, mode: "light" | "dark") {
  await page.addInitScript(
    ({ skinKey, modeKey, mode: colorScheme }) => {
      localStorage.setItem(skinKey, JSON.stringify({ skin: "mastra", reduceMotion: false }));
      localStorage.setItem(modeKey, colorScheme);
    },
    { skinKey: THEME_EDITOR_STORAGE_KEY, modeKey: THEME_STORAGE_KEY, mode },
  );
}

for (const mode of ["light", "dark"] as const) {
  test(`Mastra ${mode} restores its fonts, pill controls, and compact size ramp`, async ({ page }, testInfo) => {
    await applyMastraSkin(page, mode);
    await page.goto("/primitives/button");
    const skinPicker = page.getByRole("combobox", { name: "Skin", exact: true });
    await waitForReactHydration(skinPicker);
    await expect(skinPicker).toContainText("Mastra");
    await expect(page.locator("html")).toHaveAttribute("data-skin", "mastra");
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.fonts.check('500 13px "Mona Sans"'))).toBe(true);

    const medium = page.getByRole("button", { name: "Medium", exact: true }).first();
    await expect(medium).toHaveCSS("height", "30px");
    await expect(medium).toHaveCSS("font-size", "13px");
    await expect(medium).toHaveCSS("font-family", /"Mona Sans"/);
    await expect(medium).toHaveCSS("border-radius", "9999px");
    await expect(page.getByRole("button", { name: "Small", exact: true }).first()).toHaveCSS("height", "28px");
    await expect(page.getByRole("button", { name: "Large", exact: true }).first()).toHaveCSS("height", "32px");
    const disabled = page.getByRole("button", { name: "Disabled", exact: true }).first();
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveCSS("opacity", "1");

    const primary = page.locator('[data-control-ui="button"][data-variant="solid"][data-tone="primary"]').first();
    const primaryPaint = await primary.evaluate((button) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas color inspection is unavailable");
      context.fillStyle = getComputedStyle(button).backgroundColor;
      context.fillRect(0, 0, 1, 1);
      const background = [...context.getImageData(0, 0, 1, 1).data];
      context.fillStyle = getComputedStyle(button).color;
      context.fillRect(0, 0, 1, 1);
      return { background, foreground: [...context.getImageData(0, 0, 1, 1).data] };
    });
    expect(primaryPaint.background).toEqual(mode === "dark" ? [250, 250, 250, 255] : [7, 7, 7, 255]);
    expect(primaryPaint.foreground).toEqual(mode === "dark" ? [13, 13, 13, 255] : [250, 250, 250, 255]);
    await page.screenshot({ path: testInfo.outputPath(`mastra-${mode}.png`) });

    await skinPicker.click();
    await page.getByRole("option", { name: "No skin", exact: true }).click();
    await expect(skinPicker).toContainText("No skin");
    await expect(medium).not.toHaveCSS("border-radius", "9999px");
  });

  test(`Mastra ${mode} reaches portalled fields and retains keyboard focus`, async ({ page }, testInfo) => {
    await applyMastraSkin(page, mode);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/primitives/popover");
    const trigger = page.getByRole("button", { name: "Dimensions", exact: true });
    await waitForReactHydration(trigger);
    await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toContainText("Mastra");
    await trigger.focus();
    await trigger.press("Enter");
    const width = page.getByRole("textbox", { name: "Width", exact: true });
    await expect(width).toBeVisible();
    await expect(width).toHaveCSS("font-family", /"Mona Sans"/);
    await expect(width).toHaveCSS("height", "30px");
    await expect(width).toHaveCSS("border-radius", "9999px");
    await expect(width).toHaveCSS("font-weight", "500");
    await expect(width).toHaveCSS("padding-left", "9.75px");
    await expect(width).toHaveCSS("border-width", "0px");
    await width.fill("480px");
    await expect(width).toHaveValue("480px");
    await expect(width).toHaveCSS("transition-duration", "0s");
    await page.screenshot({ path: testInfo.outputPath(`mastra-${mode}-popover.png`) });
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();

    await page.setViewportSize({ width: 390, height: 844 });
    await trigger.press("Enter");
    await expect(width).toBeVisible();
    const popup = page.locator('[data-control-family="popup"][data-popup-part="surface"]').filter({ has: width });
    const popupBounds = await popup.boundingBox();
    if (!popupBounds) throw new Error("Popover did not lay out");
    expect(popupBounds.x).toBeGreaterThanOrEqual(0);
    expect(popupBounds.x + popupBounds.width).toBeLessThanOrEqual(390);
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
}
