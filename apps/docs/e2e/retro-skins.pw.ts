import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

for (const skin of ["xp", "windows-98"]) {
  test(`${skin}: window title and close control stay aligned and keyboard operable`, async ({ page }) => {
    await page.addInitScript((skinId) => {
      localStorage.setItem(
        "control-ui:theme-editor:v2",
        JSON.stringify({ skin: skinId, overrides: {}, light: {}, dark: {}, textFixes: {} }),
      );
      localStorage.setItem("control-ui:theme:v1", "light");
    }, skin);
    await page.goto("/primitives/dialog");
    const trigger = page.locator("main").getByRole("button", { name: "Edit profile", exact: true });
    await waitForReactHydration(trigger);
    await trigger.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Edit profile" });
    const title = dialog.getByRole("heading", { name: "Edit profile" });
    const close = dialog.getByRole("button", { name: "Close", exact: true });
    await expect(dialog).toBeVisible();
    const titleBox = await title.boundingBox();
    const closeBox = await close.boundingBox();
    if (!titleBox || !closeBox) throw new Error("Window title or close control has no rendered box");
    expect(closeBox.y).toBeGreaterThanOrEqual(titleBox.y);
    expect(closeBox.y + closeBox.height).toBeLessThanOrEqual(titleBox.y + titleBox.height);
    const input = dialog.getByRole("textbox", { name: "Display name" });
    await input.fill("Grace Hopper");
    await expect(input).toHaveValue("Grace Hopper");
    await close.press("Enter");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}

test("Windows 98 applies its palette before paint and restores the preferred mode when leaving", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "control-ui:theme-editor:v2",
      JSON.stringify({ skin: "windows-98", overrides: {}, light: {}, dark: {}, textFixes: {} }),
    );
    localStorage.setItem("control-ui:theme:v1", "dark");
  });
  await page.goto("/primitives/button");
  await expect(page.locator("html")).toHaveAttribute("data-skin", "windows-98");
  await expect(page.locator("html")).toHaveAttribute("data-color-scheme-lock", "light");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  expect(await page.evaluate(() => localStorage.getItem("control-ui:theme:v1"))).toBe("dark");
  const skinPicker = page.getByRole("group", { name: "Documentation controls" }).getByRole("combobox", { name: "Skin", exact: true });
  await waitForReactHydration(skinPicker);
  await skinPicker.click();
  await page.getByRole("option", { name: "Linear", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-skin", "linear");
  await expect(page.locator("html")).toHaveClass(/dark/);
});

for (const skin of ["xp", "windows-98", "linear"]) {
  test(`${skin}: slider handles can be dragged from outside the narrow track`, async ({ page }) => {
    await page.addInitScript((skinId) => {
      localStorage.setItem(
        "control-ui:theme-editor:v2",
        JSON.stringify({ skin: skinId, overrides: {}, light: {}, dark: {}, textFixes: {} }),
      );
      localStorage.setItem("control-ui:theme:v1", "light");
    }, skin);
    await page.goto("/primitives/slider");
    const slider = page.getByRole("slider", { name: "Default slider" }).first();
    await waitForReactHydration(slider);
    const thumb = page.locator('[data-range-kind="slider"][data-slot="thumb"]').first();
    await thumb.scrollIntoViewIfNeeded();
    const thumbBox = await thumb.boundingBox();
    if (!thumbBox) throw new Error("Slider handle has no rendered box");
    const valueBeforeDrag = Number(await slider.getAttribute("aria-valuenow"));
    await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + 2);
    await page.mouse.down();
    await page.mouse.move(thumbBox.x + thumbBox.width / 2 + 50, thumbBox.y + 2, { steps: 10 });
    await page.mouse.up();
    await expect.poll(async () => Number(await slider.getAttribute("aria-valuenow"))).toBeGreaterThan(valueBeforeDrag);
    const valueBeforeKey = Number(await slider.getAttribute("aria-valuenow"));
    await slider.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuenow", String(valueBeforeKey + 1));
  });
}

for (const skin of ["xp", "windows-98"]) {
  test(`${skin}: attachment close control stays compact and removes its file`, async ({ page }) => {
    await page.addInitScript((skinId) => {
      localStorage.setItem(
        "control-ui:theme-editor:v2",
        JSON.stringify({ skin: skinId, overrides: {}, light: {}, dark: {}, textFixes: {} }),
      );
      localStorage.setItem("control-ui:theme:v1", "light");
    }, skin);
    await page.goto("/components/chat-composer-attachment");
    const remove = page
      .locator("main")
      .getByRole("button", { name: /^Remove / })
      .first();
    await waitForReactHydration(remove);
    const removeLabel = await remove.getAttribute("aria-label");
    const removeBox = await remove.boundingBox();
    if (!removeBox || !removeLabel) throw new Error("Attachment close control is missing");
    expect(removeBox.width).toBeLessThanOrEqual(removeBox.height + 1);
    await remove.click();
    await expect(page.locator("main").getByRole("button", { name: removeLabel, exact: true })).toHaveCount(0);
  });
}
