import { expect, test } from "@playwright/test";

test("vertical slider previews pointer changes and commits once on release", async ({ page }) => {
  await page.goto("/primitives/slider");
  const slider = page.getByRole("slider", { name: "Volume", exact: true });
  const root = page.locator('[data-control-ui="slider"][data-slot="root"]').filter({ has: slider });
  const track = root.locator('[data-slot="track"]');
  await track.scrollIntoViewIfNeeded();
  const bounds = await track.boundingBox();
  if (!bounds) throw new Error("Volume track is not measurable");
  expect(bounds.height).toBeGreaterThan(bounds.width * 2);
  await expect(slider).toHaveAttribute("aria-orientation", "vertical");
  await expect(page.getByRole("status", { name: "Saved volume" })).toHaveText("40% (0 changes)");

  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height * 0.6);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height * 0.2, { steps: 5 });
  await expect.poll(async () => Number(await slider.getAttribute("aria-valuenow"))).toBeGreaterThan(60);
  await expect(page.getByRole("status", { name: "Saved volume" })).toHaveText("40% (0 changes)");
  await page.mouse.up();
  const volume = await slider.getAttribute("aria-valuenow");
  await expect(page.getByRole("status", { name: "Saved volume" })).toHaveText(`${volume}% (1 changes)`);
});

test("vertical slider supports keyboard increments and limits", async ({ page }) => {
  await page.goto("/primitives/slider");
  const slider = page.getByRole("slider", { name: "Volume", exact: true });
  await slider.focus();
  await page.keyboard.press("ArrowUp");
  await expect(slider).toHaveAttribute("aria-valuenow", "50");
  await page.keyboard.press("Home");
  await expect(slider).toHaveAttribute("aria-valuenow", "0");
  await page.keyboard.press("End");
  await expect(slider).toHaveAttribute("aria-valuenow", "100");
});
