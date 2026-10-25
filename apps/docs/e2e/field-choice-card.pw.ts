import { expect, type Locator, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

const outlinedParts = (card: Locator) =>
  card.evaluate(
    (element) =>
      [element, ...element.querySelectorAll("*")].filter((part) => {
        const style = getComputedStyle(part);
        return style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0;
      }).length,
  );

for (const skin of ["refined", "linear"]) {
  test(`choice cards select, focus, and disable as one tile in ${skin}`, async ({ page }) => {
    await page.addInitScript(
      ({ storageKey, activeSkin }) => localStorage.setItem(storageKey, JSON.stringify({ skin: activeSkin, reduceMotion: true })),
      { storageKey: THEME_EDITOR_STORAGE_KEY, activeSkin: skin },
    );
    await page.goto("/components/field");
    const generated = page.getByRole("radio", { name: /^Generated notes/ });
    const imported = page.getByRole("radio", { name: /^Imported releases/ });
    const scheduled = page.getByRole("radio", { name: /^Scheduled/ });
    const generatedCard = page.locator("label").filter({ has: generated });
    const importedCard = page.locator("label").filter({ has: imported });
    const scheduledCard = page.locator("label").filter({ has: scheduled });
    await waitForReactHydration(generated);
    await expect(page.locator("html")).toHaveAttribute("data-skin", skin);

    const [generatedBox, importedBox] = await Promise.all([generatedCard.boundingBox(), importedCard.boundingBox()]);
    expect(importedBox?.y).toBe(generatedBox?.y);
    expect(importedBox?.height).toBe(generatedBox?.height);

    await expect(generated).toHaveAttribute("aria-checked", "true");
    const checkedBorder = await generatedCard.evaluate((element) => getComputedStyle(element).borderTopColor);
    const idleBorder = await importedCard.evaluate((element) => getComputedStyle(element).borderTopColor);
    expect(checkedBorder).not.toBe(idleBorder);

    await importedCard.getByText("Imports releases published by your CI tooling.").click();
    await expect(imported).toHaveAttribute("aria-checked", "true");
    await expect(importedCard).toHaveCSS("border-top-color", checkedBorder);
    await expect(generatedCard).toHaveCSS("border-top-color", idleBorder);

    await scheduledCard.click({ force: true });
    await expect(scheduled).toHaveAttribute("aria-checked", "false");
    await expect(imported).toHaveAttribute("aria-checked", "true");
    await expect(scheduledCard).toHaveCSS("cursor", "not-allowed");
    expect(Number(await scheduledCard.evaluate((element) => getComputedStyle(element).opacity))).toBeLessThan(1);

    await imported.focus();
    await page.keyboard.press("ArrowUp");
    await expect(generated).toBeFocused();
    await expect(generated).toHaveAttribute("aria-checked", "true");
    await expect(generatedCard).toHaveCSS("outline-style", "solid");
    expect(await outlinedParts(generatedCard)).toBe(1);
    await expect(importedCard).toHaveCSS("outline-style", "none");
  });
}
