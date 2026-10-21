import { expect, type Locator, type Page, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

async function applyMastraSkin(page: Page) {
  await page.addInitScript(
    ({ skinKey, modeKey }) => {
      localStorage.setItem(skinKey, JSON.stringify({ skin: "mastra", reduceMotion: false }));
      localStorage.setItem(modeKey, "light");
    },
    { skinKey: THEME_EDITOR_STORAGE_KEY, modeKey: THEME_STORAGE_KEY },
  );
}

function primaryContrastRatio(button: Locator) {
  return button.evaluate((element) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas color inspection is unavailable");
    const luminance = (color: string) => {
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [red, green, blue] = [...context.getImageData(0, 0, 1, 1).data].map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };
    const style = getComputedStyle(element);
    const [lighter, darker] = [luminance(style.backgroundColor), luminance(style.color)].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
  });
}

test("Mastra restores its fonts and pill controls with readable primary buttons in both modes", async ({ page }) => {
  await applyMastraSkin(page);
  await page.goto("/components/button");
  const skinPicker = page.getByRole("combobox", { name: "Skin", exact: true });
  await waitForReactHydration(skinPicker);
  await expect(skinPicker).toContainText("Mastra");
  await expect(page.locator("html")).toHaveAttribute("data-skin", "mastra");
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('500 13px "Mona Sans"'))).toBe(true);

  const medium = page.getByRole("button", { name: "Medium", exact: true }).first();
  await expect(medium).toHaveCSS("font-family", /"Mona Sans"/);
  await expect(page.getByRole("button", { name: "Disabled", exact: true }).first()).toBeDisabled();

  const primary = page.locator('[data-control-ui="button"][data-variant="solid"][data-tone="primary"]').first();
  for (const dark of [false, true]) {
    await page.evaluate((isDark) => document.documentElement.classList.toggle("dark", isDark), dark);
    expect(await primaryContrastRatio(primary)).toBeGreaterThanOrEqual(4.5);
  }
  await page.evaluate(() => document.documentElement.classList.remove("dark"));

  const mastraRadius = await medium.evaluate((element) => getComputedStyle(element).borderRadius);
  await skinPicker.click();
  await page.getByRole("option", { name: "No skin", exact: true }).click();
  await expect(skinPicker).toContainText("No skin");
  await expect(medium).not.toHaveCSS("border-radius", mastraRadius);
});

test("Mastra reaches portalled fields and retains keyboard focus", async ({ page }) => {
  await applyMastraSkin(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/popover");
  const trigger = page.getByRole("button", { name: "Dimensions", exact: true });
  await waitForReactHydration(trigger);
  await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toContainText("Mastra");
  await trigger.focus();
  await trigger.press("Enter");
  const width = page.getByRole("textbox", { name: "Width", exact: true });
  await expect(width).toBeVisible();
  await expect(width).toHaveCSS("font-family", /"Mona Sans"/);
  await width.fill("480px");
  await expect(width).toHaveValue("480px");
  await expect(width).toHaveCSS("transition-duration", "0s");
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
