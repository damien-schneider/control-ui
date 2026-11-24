import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

function backgroundPaint(element: Element) {
  const style = getComputedStyle(element);
  return `${style.backgroundColor} ${style.backgroundImage}`;
}

for (const skin of ["refined", "xp", "linear"]) {
  test(`audio device selector hover paints the trigger once and preserves keyboard selection in ${skin}`, async ({ page }) => {
    await page.addInitScript(
      ({ storageKey, activeSkin }) => localStorage.setItem(storageKey, JSON.stringify({ skin: activeSkin, mode: "light" })),
      { storageKey: THEME_EDITOR_STORAGE_KEY, activeSkin: skin },
    );
    await page.goto("/kits/audio-recorder");
    const input = page.getByRole("combobox", { name: "Microphone", exact: true });
    await waitForReactHydration(input);
    await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
    const trigger = input;
    const icon = trigger.locator('[data-slot="icon"]');
    await page.mouse.move(0, 0);
    const idlePaint = await trigger.evaluate(backgroundPaint);
    const idleColor = await trigger.evaluate((element) => getComputedStyle(element).color);

    await trigger.hover({ position: await trigger.evaluate((element) => ({ x: 2, y: element.clientHeight / 2 })) });
    await expect.poll(() => trigger.evaluate(backgroundPaint)).not.toBe(idlePaint);
    await expect(trigger).toHaveCSS("color", idleColor);
    await expect(trigger).toHaveCSS("color", await input.evaluate((element) => getComputedStyle(element).color));
    await trigger.evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)));
    const hoverPaint = await trigger.evaluate(backgroundPaint);
    await icon.hover();
    await expect(icon).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect.poll(() => trigger.evaluate(backgroundPaint)).toBe(hoverPaint);

    await trigger.click();
    await expect(page.getByRole("option", { name: "System default Default", exact: true })).toBeVisible();
    await expect(icon).toHaveCSS("rotate", skin === "xp" ? "none" : "180deg");
    await input.press("Escape");
    await expect(input).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await input.press("ArrowDown");
    await input.press("Enter");
    await expect(input).toContainText("System default");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(input).toBeFocused();
  });
}
