import { expect, test } from "@playwright/test";
import { skinPackIds } from "../app/(features)/catalog/skins";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

for (const deviceScaleFactor of [1, 2]) {
  test.describe(`${deviceScaleFactor}x display`, () => {
    test.use({ deviceScaleFactor });

    test("surface button rims follow fractional widths without resizing", async ({ page }) => {
      await page.addInitScript(
        ({ skinKey, modeKey }) => {
          localStorage.setItem(skinKey, JSON.stringify({ skin: "none", reduceMotion: true }));
          localStorage.setItem(modeKey, "light");
        },
        { skinKey: THEME_EDITOR_STORAGE_KEY, modeKey: THEME_STORAGE_KEY },
      );
      await page.goto("/components/button-group");
      const group = page.getByRole("group", { name: "Text alignment" });
      const left = group.getByRole("button", { name: "Left", exact: true });
      const center = group.getByRole("button", { name: "Center", exact: true });
      await waitForReactHydration(group);
      const initialBounds = await center.boundingBox();

      for (const width of [0.5, 3, 0]) {
        await group.evaluate((element, rimWidth) => element.style.setProperty("--control-rim-width", `${rimWidth}px`), width);
        for (const button of [left, center]) {
          await expect(button).toHaveCSS("border-top-width", "0px");
          await expect(button).toHaveCSS("box-shadow", new RegExp(`0px 0px 0px ${width}px inset`));
        }
        expect(await center.boundingBox()).toEqual(initialBounds);
      }

      await group.evaluate((element) => element.style.setProperty("--control-rim-width", "0.5px"));
      await center.click();
      await page.keyboard.press("Shift+Tab");
      await expect(left).toBeFocused();
      await expect(left).toHaveCSS("outline-style", "solid");
      await page.keyboard.press("Enter");
      await expect(left).toHaveAttribute("data-active", "true");
      await expect(center).not.toHaveAttribute("data-active", "true");
      await expect(left).toHaveCSS("box-shadow", /0px 0px 0px 0\.5px inset/);
    });
  });
}

for (const skin of ["none", ...skinPackIds]) {
  test(`${skin}: shadow buttons retain boundaries and keyboard focus in forced colors`, async ({ page }, testInfo) => {
    await page.addInitScript(
      ({ skinKey, modeKey, selectedSkin }) => {
        localStorage.setItem(skinKey, JSON.stringify({ skin: selectedSkin, reduceMotion: true }));
        localStorage.setItem(modeKey, "light");
      },
      { skinKey: THEME_EDITOR_STORAGE_KEY, modeKey: THEME_STORAGE_KEY, selectedSkin: skin },
    );
    await page.goto("/components/button");
    const preview = page.getByRole("tabpanel", { name: "Preview", exact: true }).first();
    const surface = preview.getByRole("button", { name: "Surface", exact: true });
    const ghost = preview.getByRole("button", { name: "Ghost", exact: true });
    const disabled = preview.getByRole("button", { name: "Disabled", exact: true });
    const link = preview.getByRole("link", { name: "Render as link" });
    await waitForReactHydration(surface);
    const initialSize = await surface.evaluate((element) => ({ width: element.clientWidth, height: element.clientHeight }));
    await page.emulateMedia({ forcedColors: "active" });
    await surface.locator("../..").screenshot({ path: testInfo.outputPath("forced-colors.png") });

    for (const button of [surface, ghost, disabled, link]) {
      await expect(button).toHaveCSS("box-shadow", "none");
      await expect(button).toHaveCSS("outline-style", "solid");
      await expect(button).toHaveCSS("outline-width", "1px");
      await expect(button).toHaveCSS("outline-offset", "-1px");
    }
    expect(await surface.evaluate((element) => ({ width: element.clientWidth, height: element.clientHeight }))).toEqual(initialSize);
    await expect(disabled).toBeDisabled();

    await surface.click();
    await page.keyboard.press("Tab");
    await expect(ghost).toBeFocused();
    expect(await ghost.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    const focusRing = await ghost.evaluate((element) => {
      const style = getComputedStyle(element);
      return { width: Number.parseFloat(style.outlineWidth), offset: style.outlineOffset };
    });
    expect(focusRing.width).toBeGreaterThan(0);
    if (skin === "none") expect(focusRing.offset).toBe("2px");
    await page.keyboard.press("Shift+Tab");
    await expect(surface).toBeFocused();
    await expect(ghost).toHaveCSS("outline-offset", "-1px");
  });
}
