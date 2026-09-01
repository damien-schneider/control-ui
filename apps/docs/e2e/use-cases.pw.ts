import { expect, test } from "@playwright/test";

test("Blocks owns block browsing and canonical detail routes", async ({ page }) => {
  await page.goto("/ai");
  await page.waitForLoadState("networkidle");

  const catalogs = page.getByRole("navigation", { name: "Catalogs" });
  await expect(catalogs.getByRole("link", { name: "Components" })).toHaveAttribute("aria-current", "true");
  await expect(page.getByText("Agents", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Templates", { exact: true })).toHaveCount(0);

  await catalogs.getByRole("link", { name: "Blocks" }).click();
  await expect(page).toHaveURL("/use-cases");
  await expect(page.getByRole("heading", { name: "Blocks", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Templates", level: 2 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Patterns", level: 2 })).toBeVisible();
  await expect(page.locator('[data-use-case-kind="template"]')).toHaveCount(4);
  await expect(page.locator('[data-use-case-kind="pattern"]')).toHaveCount(1);

  const codingAgentLink = page.locator('[data-use-case-card="coding-agent"] a');
  await codingAgentLink.focus();
  await codingAgentLink.press("Enter");
  await expect(page).toHaveURL("/use-cases/coding-agent");
  await expect(page.getByText("Template", { exact: true })).toBeVisible();

  await page.goto("/blocks/coding-agent");
  await expect(page).toHaveURL("/use-cases/coding-agent");
});

test("Blocks stays single-column and toolbar-safe on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/use-cases");

  const sidebarTrigger = page.getByRole("button", { name: "Toggle Sidebar" });
  await expect(sidebarTrigger).toBeVisible();
  await sidebarTrigger.click();

  const catalogs = page.getByRole("navigation", { name: "Catalogs" });
  await expect(catalogs).toBeVisible();
  for (const name of ["Components", "Blocks", "Primitives", "Practices"]) {
    await expect(catalogs.getByRole("link", { name })).toHaveCount(1);
  }

  await page.keyboard.press("Escape");
  await expect(catalogs).toBeHidden();

  const toolbar = page.locator("[data-docs-floating-toolbar]");
  await expect(toolbar).toBeVisible();
  await expect(toolbar.getByRole("navigation")).toHaveCount(0);
  const toolbarBox = await toolbar.boundingBox();
  expect(toolbarBox).not.toBeNull();
  expect(toolbarBox?.x ?? -1).toBeGreaterThanOrEqual(0);
  expect((toolbarBox?.x ?? 0) + (toolbarBox?.width ?? 391)).toBeLessThanOrEqual(390);

  const templateCards = page.locator('[data-use-case-kind="template"]');
  const firstTwoBoxes = await Promise.all([templateCards.nth(0).boundingBox(), templateCards.nth(1).boundingBox()]);
  expect(firstTwoBoxes.every(Boolean)).toBe(true);
  expect(Math.round(firstTwoBoxes[0]?.x ?? 0)).toBe(Math.round(firstTwoBoxes[1]?.x ?? 0));
  expect(firstTwoBoxes[1]?.y ?? 0).toBeGreaterThan(firstTwoBoxes[0]?.y ?? 0);

  const pageWidth = await page.evaluate(() => ({ viewport: window.innerWidth, content: document.documentElement.scrollWidth }));
  expect(pageWidth.content).toBeLessThanOrEqual(pageWidth.viewport);
});
