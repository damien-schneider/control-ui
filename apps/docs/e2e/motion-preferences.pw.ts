import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

for (const preference of ["system", "manual"]) {
  test(`${preference} reduced motion overrides skin tokens and inline control durations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript((storageKey) => {
      localStorage.setItem(storageKey, JSON.stringify({ skin: "refined", reduceMotion: false }));
    }, THEME_EDITOR_STORAGE_KEY);
    await page.goto("/primitives/button");
    const button = page.getByRole("tabpanel", { name: "Preview", exact: true }).getByRole("button", { name: "Solid", exact: true });
    await waitForReactHydration(button);
    await button.evaluate((element) => {
      document.documentElement.style.setProperty("--duration-fast", "12s");
      element.style.transitionDuration = "12s";
    });
    await expect(button).toHaveCSS("transition-duration", "12s");

    if (preference === "system") await page.emulateMedia({ reducedMotion: "reduce" });
    else
      await page.locator("html").evaluate((element) => {
        element.dataset.motion = "reduced";
      });

    await expect(button).toHaveCSS("transition-duration", "0s");
    expect(
      await page.locator("html").evaluate((element) => Number.parseFloat(getComputedStyle(element).getPropertyValue("--duration-fast"))),
    ).toBe(0);
    await button.evaluate((element) => {
      element.style.scale = "0.9";
    });
    expect(
      await button.evaluate((element) => element.getAnimations().filter((animation) => animation.playState === "running").length),
    ).toBe(0);
  });
}
