import { expect, type Locator, test } from "@playwright/test";
import { skinPackIds } from "../app/(features)/catalog/skins";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

const buttonSize = (button: Locator) => button.evaluate((element) => ({ width: element.clientWidth, height: element.clientHeight }));

test("shadow buttons retain boundaries and keyboard focus in forced colors under every skin", async ({ page }) => {
  await page.addInitScript(
    ({ skinKey, modeKey }) => {
      localStorage.setItem(skinKey, JSON.stringify({ skin: "none", reduceMotion: true }));
      localStorage.setItem(modeKey, "light");
    },
    { skinKey: THEME_EDITOR_STORAGE_KEY, modeKey: THEME_STORAGE_KEY },
  );
  await page.goto("/components/button");
  const preview = page.getByRole("tabpanel", { name: "Preview", exact: true }).first();
  const surface = preview.getByRole("button", { name: "Surface", exact: true });
  const ghost = preview.getByRole("button", { name: "Ghost", exact: true });
  const disabled = preview.getByRole("button", { name: "Disabled", exact: true });
  const link = preview.getByRole("link", { name: "Render as link" });
  await waitForReactHydration(surface);

  for (const skin of ["none", ...skinPackIds]) {
    await test.step(skin, async () => {
      await page.emulateMedia({ forcedColors: "none" });
      await page.evaluate((activeSkin) => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        for (const scope of document.querySelectorAll("[data-skin]")) scope.setAttribute("data-skin", activeSkin);
      }, skin);
      await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
      const initialSize = await buttonSize(surface);
      await page.emulateMedia({ forcedColors: "active" });

      for (const button of [surface, ghost, disabled, link]) {
        await expect(button).toHaveCSS("outline-style", "solid");
        expect(await button.evaluate((element) => Number.parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThan(0);
      }
      expect(await buttonSize(surface)).toEqual(initialSize);
      await expect(disabled).toBeDisabled();
      const restingGhostBoundary = await ghost.evaluate((element) => {
        const style = getComputedStyle(element);
        return { style: style.outlineStyle, width: style.outlineWidth, offset: style.outlineOffset };
      });

      await surface.click();
      await page.keyboard.press("Tab");
      await expect(ghost).toBeFocused();
      expect(await ghost.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
      const focusRing = await ghost.evaluate((element) => {
        const style = getComputedStyle(element);
        return { width: Number.parseFloat(style.outlineWidth), offset: style.outlineOffset };
      });
      expect(focusRing.width).toBeGreaterThan(0);
      expect(focusRing.offset).not.toBe(restingGhostBoundary.offset);
      await page.keyboard.press("Shift+Tab");
      await expect(surface).toBeFocused();
      await expect
        .poll(() =>
          ghost.evaluate((element) => {
            const style = getComputedStyle(element);
            return { style: style.outlineStyle, width: style.outlineWidth, offset: style.outlineOffset };
          }),
        )
        .toEqual(restingGhostBoundary);
    });
  }
});
