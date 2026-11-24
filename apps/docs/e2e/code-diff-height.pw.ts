import { expect, type Page, test } from "@playwright/test";
import { serveFixture } from "./fixtures/serve-fixture";

const BODY = '[data-control-family="code-diff"][data-slot="body"]';

async function open(page: Page, search = "") {
  await page.setViewportSize({ width: 640, height: 900 });
  await serveFixture(page, "code-diff-proposal", { skin: "refined", search });
  await expect(page.locator(BODY)).toBeVisible();
}

const scrolls = (page: Page) => page.locator(BODY).evaluate((body) => body.scrollHeight > body.clientHeight + 1);

test("a diff taller than its cap opens to its full length and folds back", async ({ page }) => {
  await open(page);
  const capped = await page.locator(BODY).evaluate((body) => body.clientHeight);
  expect(await scrolls(page)).toBe(true);

  const showAll = page.getByRole("button", { name: "Show all lines" });
  await expect(showAll).toHaveAttribute("aria-expanded", "false");
  await showAll.click();

  const showFewer = page.getByRole("button", { name: "Show fewer lines" });
  await expect(showFewer).toHaveAttribute("aria-expanded", "true");
  await expect.poll(() => scrolls(page)).toBe(false);
  expect(await page.locator(BODY).evaluate((body) => body.clientHeight)).toBeGreaterThan(capped);

  await showFewer.click();
  await expect(page.getByRole("button", { name: "Show all lines" })).toBeFocused();
  await expect.poll(() => page.locator(BODY).evaluate((body) => body.clientHeight)).toBe(capped);
});

test("a diff that already fits offers nothing to open", async ({ page }) => {
  await open(page, "?max=60rem");
  expect(await scrolls(page)).toBe(false);
  await expect(page.getByRole("button", { name: "Show all lines" })).toHaveCount(0);
});
