import { expect, type Locator, type Page, test } from "@playwright/test";
import { serveFixture } from "./fixtures/serve-fixture";

const ICON = '[data-control-family="activity"][data-slot="icon"]';
const TITLE = '[data-control-family="activity"][data-slot="title"]';

async function open(page: Page) {
  await page.setViewportSize({ width: 900, height: 800 });
  await serveFixture(page, "activity-group", { skin: "refined" });
  await expect(page.getByRole("button", { name: "Run" })).toBeVisible();
}

const row = (page: Page, name: string) =>
  page.locator(`[data-control-family="activity"]:is([data-slot="trigger"], [data-slot="row"])[aria-label="${name}"]`);

const box = async (locator: Locator) => {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error("not rendered");
  return rect;
};

test("a running group spins only its own icon and the step still running", async ({ page }) => {
  await open(page);
  await expect(row(page, "Run").locator(`${ICON} svg`)).toHaveCSS("animation-name", "cui-spin");
  await expect(row(page, "Edit").locator(`${ICON} svg`)).toHaveCSS("animation-name", "cui-spin");
  await expect(row(page, "Thought").locator(`${ICON} svg`)).toHaveCSS("animation-name", "none");
  await expect(row(page, "Read").locator(`${ICON} svg`)).toHaveCSS("animation-name", "none");
});

test("a running group shimmers only the titles still running", async ({ page }) => {
  await open(page);
  const shimmer = (name: string) =>
    row(page, name)
      .locator(TITLE)
      .evaluate((title) => {
        const painted = [title, ...title.querySelectorAll("*")];
        return painted.some((element) => getComputedStyle(element).animationName.includes("cui-shimmer"));
      });
  expect(await shimmer("Edit")).toBe(true);
  expect(await shimmer("Read")).toBe(false);
  expect(await shimmer("Thought")).toBe(false);
});

test("nested steps stack as a tight list under the group's title", async ({ page }) => {
  await open(page);
  const thought = await box(row(page, "Thought"));
  const read = await box(row(page, "Read"));
  const edit = await box(row(page, "Edit"));
  expect(read.y - (thought.y + thought.height)).toBeLessThanOrEqual(2);
  expect(edit.y - (read.y + read.height)).toBeLessThanOrEqual(2);

  const groupTitle = await box(row(page, "Run").locator(TITLE));
  const nestedIcon = await box(row(page, "Read").locator(ICON));
  expect(Math.abs(nestedIcon.x - groupTitle.x)).toBeLessThanOrEqual(1);
});
