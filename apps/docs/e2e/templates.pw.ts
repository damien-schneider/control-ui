import { expect, test } from "@playwright/test";

test("Templates owns template browsing and canonical detail routes", async ({ page }) => {
  await page.goto("/kits");
  await page.waitForLoadState("networkidle");

  const sidebar = page.locator("[data-docs-sidebar-navigation]");
  await expect(sidebar.getByText("Chat", { exact: true })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Chat Message", exact: true })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Coding agent", exact: true })).toHaveCount(0);

  await sidebar.getByRole("link", { name: "Templates", exact: true }).click();
  await expect(page).toHaveURL("/templates");
  await expect(sidebar.getByRole("link", { name: "Coding agent", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Templates", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Screens", level: 2 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Patterns", level: 2 })).toBeVisible();
  await expect(page.locator('[data-template-kind="screen"]')).toHaveCount(5);
  await expect(page.locator('[data-template-kind="pattern"]')).toHaveCount(1);

  const codingAgentLink = page.locator('[data-template-card="coding-agent"] a');
  await codingAgentLink.focus();
  await codingAgentLink.press("Enter");
  await expect(page).toHaveURL("/templates/coding-agent");
  await expect(page.getByText("Screen", { exact: true })).toBeVisible();
});

test("Templates stays single-column on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/templates");

  const sidebarTrigger = page.getByRole("button", { name: "Toggle Sidebar" });
  await expect(sidebarTrigger).toBeVisible();
  await sidebarTrigger.click();

  const sidebar = page.locator("[data-docs-sidebar-navigation]");
  await expect(sidebar.getByRole("link", { name: "Overview", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sidebar).toBeHidden();

  const screenCards = page.locator('[data-template-kind="screen"]');
  const firstTwoBoxes = await Promise.all([screenCards.nth(0).boundingBox(), screenCards.nth(1).boundingBox()]);
  expect(firstTwoBoxes.every(Boolean)).toBe(true);
  expect(Math.round(firstTwoBoxes[0]?.x ?? 0)).toBe(Math.round(firstTwoBoxes[1]?.x ?? 0));
  expect(firstTwoBoxes[1]?.y ?? 0).toBeGreaterThan(firstTwoBoxes[0]?.y ?? 0);

  const pageWidth = await page.evaluate(() => ({ viewport: window.innerWidth, content: document.documentElement.scrollWidth }));
  expect(pageWidth.content).toBeLessThanOrEqual(pageWidth.viewport);
});
