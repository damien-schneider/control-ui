import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

for (const skin of ["linear", "xp", "windows-98"]) {
  for (const mode of ["light", "dark"]) {
    test(`${skin} ${mode}: composed drawer close keeps its button surface`, async ({ page }) => {
      await page.addInitScript(
        (theme) => {
          localStorage.setItem(
            "control-ui:theme-editor:v2",
            JSON.stringify({ skin: theme.skin, overrides: {}, light: {}, dark: {}, textFixes: {} }),
          );
          localStorage.setItem("control-ui:theme:v1", theme.mode);
        },
        { skin, mode },
      );
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/primitives/drawer");
      const trigger = page.locator("main").getByRole("button", { name: "Open drawer", exact: true });
      await waitForReactHydration(trigger);
      await trigger.press("Enter");

      const drawer = page.getByRole("dialog");
      const closeButton = drawer.getByRole("button", { name: "Cancel", exact: true });
      await expect(closeButton).toBeVisible();
      await expect.poll(() => closeButton.evaluate((button) => button.getBoundingClientRect().height)).toBeGreaterThanOrEqual(23);
      await closeButton.press("Enter");
      await expect(drawer).toBeHidden();
      await expect(trigger).toBeFocused();
    });
  }
}
