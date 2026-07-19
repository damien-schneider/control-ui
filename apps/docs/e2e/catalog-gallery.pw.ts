import { expect, test } from "@playwright/test";
import { componentEntries } from "../app/(features)/catalog/components";
import { primitiveCategories, primitiveEntries } from "../app/(features)/catalog/primitives";

test("catalog overviews render every live preview as one browse-only card", async ({ page }) => {
  await page.goto("/primitives");

  const primitiveCards = page.locator('[data-gallery-card="primitive"]');
  await expect(primitiveCards).toHaveCount(primitiveEntries.length);
  for (const category of primitiveCategories) {
    await expect(page.getByRole("heading", { name: category.label, exact: true, level: 2 })).toBeVisible();
  }

  const firstPrimitiveCard = primitiveCards.first();
  const firstPrimitivePreview = firstPrimitiveCard.locator("[data-gallery-preview]");
  const firstPrimitiveLink = firstPrimitiveCard.locator("a");
  await expect(firstPrimitivePreview).toHaveAttribute("inert", "");
  await expect(firstPrimitivePreview).toHaveAttribute("aria-hidden", "true");
  await expect(firstPrimitiveLink).toHaveCount(1);
  await firstPrimitiveLink.focus();
  await expect(firstPrimitiveLink).toBeFocused();

  await page.goto("/ai");
  await expect(page.getByRole("heading", { name: "AI components", level: 1 })).toBeVisible();
  await expect(page.locator('[data-gallery-card="agent"]')).toHaveCount(componentEntries.length);
});

test("gallery columns respond to their available width", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/primitives");

  const cards = page.locator('[data-gallery-card="primitive"]');
  const desktopBoxes = await Promise.all([cards.nth(0).boundingBox(), cards.nth(1).boundingBox(), cards.nth(2).boundingBox()]);
  expect(desktopBoxes.every(Boolean)).toBe(true);
  expect(new Set(desktopBoxes.map((box) => Math.round(box?.y ?? 0))).size).toBe(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(cards).toHaveCount(primitiveEntries.length);
  await expect(cards.nth(0)).toBeVisible();
  await expect(cards.nth(1)).toBeVisible();
  const mobileBoxes = await Promise.all([cards.nth(0).boundingBox(), cards.nth(1).boundingBox()]);
  expect(mobileBoxes.every(Boolean)).toBe(true);
  expect(Math.round(mobileBoxes[0]?.x ?? 0)).toBe(Math.round(mobileBoxes[1]?.x ?? 0));
  expect(mobileBoxes[1]?.y ?? 0).toBeGreaterThan(mobileBoxes[0]?.y ?? 0);
});

test("gallery previews mount near the viewport, unmount when distant, and navigate without console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    // SourceBadge's missing-favicon example intentionally exercises a browser 404 fallback.
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto("/primitives");
  const cards = page.locator('[data-gallery-card="primitive"]');
  const firstCard = cards.first();
  const lastPreview = cards.last().locator("[data-gallery-preview]");

  await expect(firstCard.locator("[data-gallery-preview]")).toHaveAttribute("data-gallery-preview-state", "mounted");
  await expect(lastPreview).toHaveAttribute("data-gallery-preview-state", "deferred");
  await lastPreview.scrollIntoViewIfNeeded();
  await expect(lastPreview).toHaveAttribute("data-gallery-preview-state", "mounted");
  await firstCard.scrollIntoViewIfNeeded();
  await expect(lastPreview).toHaveAttribute("data-gallery-preview-state", "deferred");

  const firstHref = await firstCard.locator("a").getAttribute("href");
  expect(firstHref).toBeTruthy();
  await firstCard.locator("a").click();
  await expect(page).toHaveURL(firstHref ?? "");

  await page.goto("/ai");
  const agentCards = page.locator('[data-gallery-card="agent"]');
  await expect(agentCards).toHaveCount(componentEntries.length);
  await expect(agentCards.first().locator("[data-gallery-preview]")).toHaveAttribute("data-gallery-preview-state", "mounted");
  await agentCards.last().scrollIntoViewIfNeeded();
  await expect(agentCards.last().locator("[data-gallery-preview]")).toHaveAttribute("data-gallery-preview-state", "mounted");
  expect(consoleErrors).toEqual([]);
});
