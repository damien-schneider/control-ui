import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

for (const skin of ["refined", "xp"]) {
  test(`${skin}: toast buttons inherit button styling and preserve keyboard actions`, async ({ page }, testInfo) => {
    await page.addInitScript(({ storageKey, activeSkin }) => localStorage.setItem(storageKey, JSON.stringify({ skin: activeSkin })), {
      storageKey: THEME_EDITOR_STORAGE_KEY,
      activeSkin: skin,
    });
    await page.goto("/primitives/toast");
    const trigger = page.getByRole("button", { name: "With action", exact: true });
    await waitForReactHydration(trigger);
    await trigger.press("Enter");

    const archivedToast = page.locator('[data-control-ui="toast"][data-slot="root"]').filter({ hasText: "Message archived" });
    const undo = archivedToast.getByRole("button", { name: "Undo", exact: true });
    await expect(undo).toBeVisible();
    await archivedToast.screenshot({ path: testInfo.outputPath("toast.png") });
    await page.keyboard.press("F6");
    await page.keyboard.press("Tab");
    await expect(archivedToast).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(undo).toBeFocused();

    const close = archivedToast.getByRole("button", { name: "Close", exact: true });
    for (const button of [undo, close]) {
      await button.evaluate((element) => element.style.setProperty("--cui-button-radius", "9px"));
      await expect(button).toHaveCSS("border-radius", "9px");
    }

    await page.keyboard.press("Enter");
    const restoredToast = page.locator('[data-control-ui="toast"][data-slot="root"]').filter({ hasText: "Restored" });
    await expect(restoredToast).toHaveCount(1);
    await expect(archivedToast).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(archivedToast).toHaveCount(0);
    await expect(restoredToast).toBeVisible();
  });
}
