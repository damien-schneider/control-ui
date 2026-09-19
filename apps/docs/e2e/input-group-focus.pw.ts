import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

for (const skin of ["none", "refined", "modern-apple", "rig"]) {
  test(`input groups keep one focus indicator and coherent corners with ${skin}`, async ({ page }, testInfo) => {
    await page.addInitScript(
      ({ storageKey, skin: initialSkin }) => localStorage.setItem(storageKey, JSON.stringify({ skin: initialSkin, reduceMotion: true })),
      {
        storageKey: THEME_EDITOR_STORAGE_KEY,
        skin,
      },
    );
    await page.goto("/primitives/input-group");
    const url = page.getByRole("textbox", { name: "URL", exact: true });
    const group = url.locator("..");
    const search = page.getByRole("textbox", { name: "Search documentation...", exact: true });
    const searchButton = page
      .getByRole("tabpanel", { name: "Preview", exact: true })
      .getByRole("button", { name: "Search documentation", exact: true });
    await waitForReactHydration(url);

    await searchButton.click();
    await expect(searchButton).toBeFocused();
    expect(await searchButton.evaluate((element) => element.matches(":focus-visible"))).toBe(false);
    await expect(searchButton).toHaveCSS("outline-style", "none");
    await page.keyboard.press("Shift+Tab");
    await expect(search).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(searchButton).toBeFocused();
    expect(await searchButton.evaluate((element) => Number.parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThan(0);
    await expect(searchButton).toHaveCSS("outline-style", "solid");

    await url.click();
    await expect(url).toBeFocused();
    await expect(url).toHaveAccessibleDescription("Lowercase letters, numbers, and hyphens");
    await expect(url).toHaveCSS("outline-width", "0px");
    await expect(url).toHaveCSS("border-radius", "0px");
    await expect(group).toHaveCSS("outline-style", "solid");
    await expect(group).toHaveCSS("overflow", "hidden");
    const outlinedElements = await group.evaluate(
      (element) =>
        [element, ...element.querySelectorAll("*")].filter((part) => {
          const style = getComputedStyle(part);
          return style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0;
        }).length,
    );
    expect(outlinedElements).toBe(1);

    await page.keyboard.press("Tab");
    await expect(search).toBeFocused();
    await expect(group).toHaveCSS("outline-style", "none");
    await page.keyboard.press("Shift+Tab");
    await expect(url).toBeFocused();
    await expect(group).toHaveCSS("outline-style", "solid");
    await expect(url).toHaveCSS("outline-width", "0px");

    for (const radius of ["0px", "16px"]) {
      await group.evaluate((element, value) => element.style.setProperty("--cui-field-radius", value), radius);
      await expect(group).toHaveCSS("border-radius", radius);
      await expect(url).toHaveCSS("border-radius", "0px");
      await group.locator("..").screenshot({ path: testInfo.outputPath(`url-${radius}.png`) });
    }

    await page.setViewportSize({ width: 390, height: 844 });
    const longSlug = "a-long-organization-name-".repeat(10);
    await url.fill(longSlug);
    await expect(url).toHaveValue(longSlug);
    const bounds = await group.boundingBox();
    if (!bounds) throw new Error("URL input group is not laid out");
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
    await group.locator("..").screenshot({ path: testInfo.outputPath("url-mobile.png") });
  });
}
