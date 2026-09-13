import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

test("No skin is the default and portals follow preset changes", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/primitives/popover");
  const picker = page.getByRole("combobox", { name: "Skin", exact: true });
  await waitForReactHydration(picker);
  await expect(picker).toContainText("No skin");
  const trigger = page.getByRole("button", { name: "Dimensions", exact: true });
  await expect(trigger).toHaveCSS("border-radius", "0px");
  await picker.click();
  await expect(page.getByRole("option", { name: "Flat", exact: true })).toHaveCount(0);
  await page.getByRole("option", { name: "Refined", exact: true }).click();
  await trigger.click();
  const popup = page.locator('[data-control-ui="popover"][data-slot="content"]');
  await expect(popup).toBeVisible();
  await expect(popup.locator("..")).toHaveAttribute("data-skin", "refined");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await picker.focus();
  await picker.press("Enter");
  await page.keyboard.press("Home");
  await page.keyboard.press("Enter");
  await expect(picker).toContainText("No skin");
  await expect(picker).toBeFocused();
  await trigger.click();
  await expect(popup).toBeVisible();
  await expect(popup.locator("..")).toHaveAttribute("data-skin", "none");
  await expect(popup).toHaveCSS("border-radius", "0px");
  await page.screenshot({ path: testInfo.outputPath("no-skin-popover.png") });
  await page.reload();
  await expect(picker).toContainText("No skin");
  expect(errors).toEqual([]);
});

test("saved Flat themes retain their overrides as No skin", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(
    (key) => localStorage.setItem(key, JSON.stringify({ skin: "flat", overrides: { "--radius-control": "7px" } })),
    THEME_EDITOR_STORAGE_KEY,
  );
  await page.goto("/primitives/popover");
  await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toContainText("No skin");
  await expect(page.getByRole("button", { name: "Dimensions", exact: true })).toHaveCSS("border-radius", "7px");
  await page.goto("/theme-editor");
  await page.getByRole("button", { name: "Copy CSS variables", exact: true }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(":root {");
  const css = await page.evaluate(() => navigator.clipboard.readText());
  expect(css).toContain("--radius-control: 7px");
  expect(css).not.toContain("[data-skin");
});
