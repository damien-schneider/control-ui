import { expect, test } from "@playwright/test";

test("Blocks owns block browsing and canonical detail routes", async ({ page }) => {
  await page.goto("/components");
  await page.waitForLoadState("networkidle");

  const sidebar = page.locator("[data-docs-sidebar-navigation]");
  await expect(sidebar.getByText("Chat", { exact: true })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Chat Message", exact: true })).toBeVisible();
  await expect(page.getByText("Templates", { exact: true })).toHaveCount(0);

  await sidebar.getByRole("link", { name: "Templates & patterns" }).click();
  await expect(page).toHaveURL("/use-cases");
  await expect(page.getByRole("heading", { name: "Templates & patterns", level: 1 })).toBeVisible();
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

test("Blocks stays single-column on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/use-cases");

  const sidebarTrigger = page.getByRole("button", { name: "Toggle Sidebar" });
  await expect(sidebarTrigger).toBeVisible();
  await sidebarTrigger.click();

  const sidebar = page.locator("[data-docs-sidebar-navigation]");
  await expect(sidebar.getByRole("link", { name: "Overview", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sidebar).toBeHidden();

  const templateCards = page.locator('[data-use-case-kind="template"]');
  const firstTwoBoxes = await Promise.all([templateCards.nth(0).boundingBox(), templateCards.nth(1).boundingBox()]);
  expect(firstTwoBoxes.every(Boolean)).toBe(true);
  expect(Math.round(firstTwoBoxes[0]?.x ?? 0)).toBe(Math.round(firstTwoBoxes[1]?.x ?? 0));
  expect(firstTwoBoxes[1]?.y ?? 0).toBeGreaterThan(firstTwoBoxes[0]?.y ?? 0);

  const pageWidth = await page.evaluate(() => ({ viewport: window.innerWidth, content: document.documentElement.scrollWidth }));
  expect(pageWidth.content).toBeLessThanOrEqual(pageWidth.viewport);
});
