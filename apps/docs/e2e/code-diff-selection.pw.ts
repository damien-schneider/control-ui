import { expect, type Locator, type Page, test } from "@playwright/test";
import { serveFixture } from "./fixtures/serve-fixture";

async function open(page: Page, search = "") {
  await page.setViewportSize({ width: 900, height: 700 });
  await serveFixture(page, "code-diff-selection", { skin: "refined", search });
  // split view gives an unchanged line a button on each side
  await expect(lineNumber(page, "Unchanged line 1").first()).toBeVisible();
}

function lineNumber(page: Page, label: string): Locator {
  return page.getByRole("button", { name: new RegExp(`^${label}:`) });
}

const selection = (page: Page) => page.getByTestId("selection");

async function center(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("element is not rendered");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test("dragging across line numbers selects one range in display order", async ({ page }) => {
  await open(page);
  const start = await center(lineNumber(page, "Unchanged line 1"));
  const end = await center(lineNumber(page, "Deleted line 3"));
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 4 });
  await page.mouse.up();

  await expect(selection(page)).toHaveText("new1-old3");
  await expect(lineNumber(page, "Unchanged line 2")).toHaveAttribute("aria-pressed", "true");
  await expect(lineNumber(page, "Added line 3")).toHaveAttribute("aria-pressed", "false");
});

test("shift extends the last range and Cmd/Ctrl adds or removes another", async ({ page }) => {
  await open(page);
  await lineNumber(page, "Unchanged line 1").click();
  await lineNumber(page, "Added line 3").click({ modifiers: ["Shift"] });
  await expect(selection(page)).toHaveText("new1-new3");

  await lineNumber(page, "Added line 6").click({ modifiers: ["ControlOrMeta"] });
  await expect(selection(page)).toHaveText("new1-new3,new6-new6");

  await lineNumber(page, "Added line 6").click({ modifiers: ["ControlOrMeta"] });
  await expect(selection(page)).toHaveText("new1-new3");
});

test("clicking the only selected line clears the selection", async ({ page }) => {
  await open(page);
  await lineNumber(page, "Unchanged line 2").click();
  await expect(selection(page)).toHaveText("new2-new2");
  await lineNumber(page, "Unchanged line 2").click();
  await expect(selection(page)).toHaveText("");
});

test("the keyboard moves, extends and adds through one tab stop", async ({ page }) => {
  await open(page);
  await expect(page.locator('[data-slot="line-button"][tabindex="0"]')).toHaveCount(1);
  await lineNumber(page, "Unchanged line 1").focus();

  await page.keyboard.press("Space");
  await expect(selection(page)).toHaveText("new1-new1");

  await page.keyboard.press("ArrowDown");
  await expect(lineNumber(page, "Unchanged line 2")).toBeFocused();
  await page.keyboard.press("Shift+ArrowDown");
  await expect(lineNumber(page, "Deleted line 3")).toBeFocused();
  await expect(selection(page)).toHaveText("new1-old3");

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(lineNumber(page, "Unchanged line 4")).toBeFocused();
  await page.keyboard.press("ControlOrMeta+Space");
  await expect(selection(page)).toHaveText("new1-old3,new4-new4");
  await expect(page.locator('[data-slot="line-button"][tabindex="0"]')).toHaveCount(1);
});

test("split view selects each side by its own line number", async ({ page }) => {
  await open(page, "?style=split");
  await lineNumber(page, "Original line 3").click();
  await expect(selection(page)).toHaveText("old3-old3");

  await lineNumber(page, "Original line 3").focus();
  await page.keyboard.press("ArrowRight");
  await expect(lineNumber(page, "Modified line 3")).toBeFocused();
  await page.keyboard.press("Shift+ArrowDown");
  await expect(selection(page)).toHaveText("old3-new4");
});
