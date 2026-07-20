import { expect, test } from "@playwright/test";

test("Use cases owns block browsing and canonical detail routes", async ({ page }) => {
  await page.goto("/ai");

  const sectionNavigation = page.getByRole("navigation", { name: "Documentation sections" });
  const useCasesMode = sectionNavigation.getByRole("link", { name: "Use cases" });
  await expect(useCasesMode).toBeVisible();
  await expect(page.getByText("Agents", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Blocks", { exact: true })).toHaveCount(0);

  await useCasesMode.focus();
  await useCasesMode.press("Enter");
  await expect(page).toHaveURL("/use-cases");
  await expect(page.getByRole("heading", { name: "Use cases", level: 1 })).toBeVisible();
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

test("Use cases stays single-column and toolbar-safe on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/use-cases");

  const sectionNavigation = page.getByRole("navigation", { name: "Documentation sections" });
  for (const name of ["Primitives", "AI", "Use cases", "Skills"]) {
    await expect(sectionNavigation.getByRole("link", { name })).toHaveCount(1);
  }

  const toolbar = page.locator("[data-docs-floating-toolbar]");
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
