import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

for (const skin of ["refined", "xp", "linear"]) {
  test(`combobox hover paints the button once and preserves keyboard selection in ${skin}`, async ({ page }) => {
    await page.addInitScript(
      ({ storageKey, activeSkin }) => localStorage.setItem(storageKey, JSON.stringify({ skin: activeSkin, mode: "light" })),
      { storageKey: THEME_EDITOR_STORAGE_KEY, activeSkin: skin },
    );
    await page.goto("/ai/audio-recorder");
    const input = page.getByRole("combobox", { name: "Microphone", exact: true });
    await waitForReactHydration(input);
    await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
    const trigger = input.locator("..").getByRole("button", { name: "Toggle suggestions", includeHidden: true });
    const icon = trigger.locator('[data-slot="icon"]');
    await page.mouse.move(0, 0);
    const idleBackground = await trigger.evaluate((element) => getComputedStyle(element).backgroundColor);
    const idleColor = await trigger.evaluate((element) => getComputedStyle(element).color);

    await trigger.hover({ position: await trigger.evaluate((element) => ({ x: 2, y: element.clientHeight / 2 })) });
    await expect(trigger).not.toHaveCSS("background-color", idleBackground);
    await expect(trigger).not.toHaveCSS("color", idleColor);
    await expect(trigger).toHaveCSS("color", await input.evaluate((element) => getComputedStyle(element).color));
    const hoverBackground = await trigger.evaluate((element) => getComputedStyle(element).backgroundColor);
    await icon.hover();
    await expect(icon).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(trigger).toHaveCSS("background-color", hoverBackground);

    await trigger.click();
    await expect(page.getByRole("option", { name: "System default", exact: true })).toBeVisible();
    await expect(icon).toHaveCSS("rotate", "180deg");
    await input.press("Escape");
    await expect(input).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await input.press("ArrowDown");
    await input.press("Enter");
    await expect(input).toHaveValue("System default");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(input).toBeFocused();
  });
}
