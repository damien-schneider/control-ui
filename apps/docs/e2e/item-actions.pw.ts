import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("hover-revealed item actions show on hover, keyboard focus, and while their menu is open", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/item");
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

test("selectable rows paint hover, selection, dragging and drop-target states", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/item");
  const layers = page.getByRole("listbox", { name: "Layers" });
  const title = layers.getByRole("option", { name: "Title card" });
  const camera = layers.getByRole("option", { name: "Camera" });
  const background = layers.getByRole("option", { name: "Background" });
  await waitForReactHydration(layers);
  await page.mouse.move(0, 0);

  const transparent = "rgba(0, 0, 0, 0)";
  await expect(title).toHaveCSS("background-color", transparent);
  await expect(camera).not.toHaveCSS("background-color", transparent);
  await title.hover();
  await expect(title).not.toHaveCSS("background-color", transparent);

  await title.click();
  await expect(title).toHaveAttribute("aria-selected", "true");
  await expect(camera).toHaveAttribute("aria-selected", "false");
  await page.keyboard.press("ArrowDown");
  await expect(camera).toBeFocused();
  await expect(camera).toHaveAttribute("aria-selected", "true");

  await camera.evaluate((row) => row.setAttribute("data-dragging", ""));
  await background.evaluate((row) => row.setAttribute("data-drop-target", ""));
  await expect(camera).toHaveCSS("opacity", "0.5");
  await expect(background).toHaveCSS("box-shadow", /inset/);
  await camera.evaluate((row) => row.removeAttribute("data-dragging"));
  await background.evaluate((row) => row.removeAttribute("data-drop-target"));

  await background.dragTo(title);
  await expect(layers.getByRole("option")).toHaveText(["Background", "Title card", "Camera"]);
});
