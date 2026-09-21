import { expect, test } from "@playwright/test";
import { categoriesWithEntries } from "../app/(features)/catalog/categories";
import { componentEntries } from "../app/(features)/catalog/components";
import { primitiveEntries } from "../app/(features)/catalog/primitives";

test("catalog overviews render every live preview as one browse-only card", async ({ page }) => {
  await page.goto("/primitives");

  const primitiveCards = page.locator('[data-gallery-card="primitive"]');
  await expect(primitiveCards).toHaveCount(primitiveEntries.length);
  for (const category of categoriesWithEntries(primitiveEntries)) {
    await expect(page.getByRole("heading", { name: category.label, exact: true, level: 2 })).toBeVisible();
  }

  const firstPrimitiveCard = primitiveCards.first();
  const firstPrimitivePreview = firstPrimitiveCard.locator("[data-gallery-preview]");
  const firstPrimitiveLink = firstPrimitiveCard.getByRole("link");
  await expect(firstPrimitivePreview).toHaveAttribute("inert", "");
  await expect(firstPrimitivePreview).toHaveAttribute("aria-hidden", "true");
  await expect(firstPrimitiveLink).toHaveCount(1);
  await firstPrimitiveLink.focus();
  await expect(firstPrimitiveLink).toBeFocused();

  await page.goto("/components");
  await expect(page.getByRole("heading", { name: "Components", level: 1 })).toBeVisible();
  for (const category of categoriesWithEntries(componentEntries)) {
    await expect(page.getByRole("heading", { name: category.label, exact: true, level: 2 })).toBeVisible();
  }
  await expect(page.locator('[data-gallery-card="component"]')).toHaveCount(componentEntries.length);
});

test("gallery columns respond to their available width", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/primitives");

  const cards = page.locator('[data-gallery-card="primitive"]');
  await expect(cards).toHaveCount(primitiveEntries.length);
  await expect(cards.nth(0)).toBeVisible();
  await expect(cards.nth(1)).toBeVisible();
  await expect(cards.nth(2)).toBeVisible();
  await expect
    .poll(() =>
      cards.evaluateAll((elements) => {
        const boxes = elements.slice(0, 3).map((element) => element.getBoundingClientRect());
        return (
          boxes.length === 3 &&
          boxes.every(({ width, height }) => width > 0 && height > 0) &&
          new Set(boxes.map(({ y }) => Math.round(y))).size === 1
        );
      }),
    )
    .toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(cards).toHaveCount(primitiveEntries.length);
  await expect(cards.nth(0)).toBeVisible();
  await expect(cards.nth(1)).toBeVisible();
  await expect
    .poll(() =>
      cards.evaluateAll((elements) => {
        const boxes = elements.slice(0, 2).map((element) => element.getBoundingClientRect());
        return (
          boxes.length === 2 &&
          boxes.every(({ width, height }) => width > 0 && height > 0) &&
          Math.round(boxes[0]?.x ?? 0) === Math.round(boxes[1]?.x ?? 0) &&
          (boxes[1]?.y ?? 0) > (boxes[0]?.y ?? 0)
        );
      }),
    )
    .toBe(true);
});

test("gallery previews mount near the viewport, stay mounted, and navigate without console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
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
  await expect(lastPreview).toHaveAttribute("data-gallery-preview-state", "mounted");

  const firstHref = await firstCard.getByRole("link").getAttribute("href");
  expect(firstHref).toBeTruthy();
  await firstCard.getByRole("link").click();
  await expect(page).toHaveURL(firstHref ?? "");

  await page.goto("/components");
  const componentCards = page.locator('[data-gallery-card="component"]');
  await expect(componentCards).toHaveCount(componentEntries.length);
  await expect(componentCards.first().locator("[data-gallery-preview]")).toHaveAttribute("data-gallery-preview-state", "mounted");
  await componentCards.last().scrollIntoViewIfNeeded();
  await expect(componentCards.last().locator("[data-gallery-preview]")).toHaveAttribute("data-gallery-preview-state", "mounted");
  expect(consoleErrors).toEqual([]);
});
