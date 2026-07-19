import { expect, test } from "@playwright/test";

test("activity disclosure bounds and scrolls a long trace", async ({ page }) => {
  await page.goto("/ai/activity");

  const trigger = page.getByRole("button", { name: /Thinking/ });
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger.locator("a")).toHaveCount(0);

  const activity = trigger.locator("..");
  const viewport = activity.locator('[data-control-ui="activity"][data-slot="content-viewport"]');
  await expect(viewport).toBeVisible();

  await expect.poll(() => viewport.evaluate((element) => element.scrollHeight - element.clientHeight)).toBeGreaterThan(0);

  const scrollTop = await viewport.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    return element.scrollTop;
  });
  expect(scrollTop).toBeGreaterThan(0);
});

test("web search composition keeps source links in content and falls back when a favicon fails", async ({ page }) => {
  await page.goto("/ai/activity");

  const trigger = page.getByRole("button", { name: /Searched the web for Base UI disclosure patterns/ });
  await expect(trigger.locator("a")).toHaveCount(0);

  const source = page.getByRole("link", { name: "MDN" });
  await expect(source).toBeVisible();
  await expect(source.locator('[data-control-ui="avatar"][data-slot="fallback"]')).toBeVisible();
});
