import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("hover-revealed item actions show on hover, keyboard focus, and while their menu is open", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/primitives/item");
  const row = page.locator("main [data-control-family='item'][data-slot='root']").filter({ hasText: "Nightly evaluation" });
  const actions = row.locator("[data-slot='actions'][data-show-on-hover]");
  await waitForReactHydration(row);
  await page.mouse.move(0, 0);
  await expect(actions).toHaveCSS("opacity", "0");

  await row.hover();
  await expect(actions).toHaveCSS("opacity", "1");
  await page.mouse.move(0, 0);
  await expect(actions).toHaveCSS("opacity", "0");

  await page.getByRole("link", { name: /Workspace settings/ }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Rerun nightly evaluation" })).toBeFocused();
  await expect(actions).toHaveCSS("opacity", "1");

  await page.getByRole("button", { name: "Nightly evaluation actions" }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(actions).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
});
