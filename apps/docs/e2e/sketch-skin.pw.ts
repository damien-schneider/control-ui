import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

test.setTimeout(60_000);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ skinKey, modeKey }) => {
      localStorage.setItem(skinKey, JSON.stringify({ skin: "sketch", reduceMotion: true }));
      localStorage.setItem(modeKey, "light");
    },
    { skinKey: THEME_EDITOR_STORAGE_KEY, modeKey: THEME_STORAGE_KEY },
  );
});

test("native input outlines follow resizing, color overrides, and dark mode", async ({ page }) => {
  await page.goto("/primitives/popover", { waitUntil: "domcontentloaded" });
  const trigger = page.getByRole("button", { name: "Dimensions", exact: true });
  await waitForReactHydration(trigger);
  await trigger.click();
  const width = page.getByRole("textbox", { name: "Width", exact: true });
  await expect(width).toHaveCSS("filter", "none");
  await expect
    .poll(() => width.evaluate((input) => input.style.getPropertyValue("--sketch-outline-image")))
    .toContain("data:image/svg+xml");
  await width.fill("480px");
  await expect(width).toHaveValue("480px");
  await width.evaluate((input) => {
    input.style.width = "180px";
    input.style.setProperty("--cui-field-border-color", "oklch(0.4 0 0)");
  });
  await page.keyboard.press("Tab");
  await expect
    .poll(() =>
      width.evaluate((input) => {
        const stroke = decodeURIComponent(input.style.getPropertyValue("--sketch-outline-image"));
        const color = getComputedStyle(input).getPropertyValue("--cui-field-border-color").trim();
        return stroke.includes('width="180"') && stroke.includes(`stroke="${color}"`);
      }),
    )
    .toBe(true);
  const height = page.getByRole("textbox", { name: "Height", exact: true });
  const lightStroke = await height.evaluate((input) => input.style.getPropertyValue("--sketch-outline-image"));
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.getByRole("radio", { name: "Dark", exact: true }).press("Space");
  await trigger.click();
  await expect.poll(() => height.evaluate((input) => input.style.getPropertyValue("--sketch-outline-image"))).not.toBe(lightStroke);
  await expect(height).toHaveCSS("filter", "none");
});

test("changing skins removes vector styles and preserves checkbox interaction", async ({ page }) => {
  await page.goto("/primitives/checkbox", { waitUntil: "domcontentloaded" });
  const checkbox = page.getByRole("checkbox", { name: "Email me product news", exact: true });
  await waitForReactHydration(checkbox);
  await expect
    .poll(() => checkbox.evaluate((control) => control.style.getPropertyValue("--sketch-outline-image")))
    .toContain("data:image/svg+xml");
  await checkbox.click();
  await expect(checkbox).toHaveAttribute("aria-checked", "false");
  await checkbox.press("Space");
  await expect(checkbox).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("checkbox", { name: "Checked, disabled", exact: true })).toBeDisabled();
  const sketchControl = await checkbox.elementHandle();
  if (!sketchControl) throw new Error("Checkbox did not mount");
  const picker = page.getByRole("combobox", { name: "Skin", exact: true });
  await picker.click();
  await page.getByRole("option", { name: "Linear", exact: true }).click();
  await expect(picker).toContainText("Linear");
  await expect.poll(() => sketchControl.evaluate((control) => control.style.getPropertyValue("--sketch-outline-image"))).toBe("");
  await expect(checkbox).toHaveCSS("border-image-source", "none");
  await expect(checkbox).toHaveAttribute("aria-checked", "true");
});
