import { expect, type Locator, type Page, test } from "@playwright/test";
import { serveFixture } from "./fixtures/serve-fixture";

test.beforeEach(async ({ page }) => {
  await serveFixture(page, "markdown-editor");
  await expect(page.getByRole("textbox", { name: "Comment", exact: true })).toHaveAttribute("contenteditable", "true");
  await page.getByRole("button", { name: "Load table" }).click();
});

const editorOf = (page: Page) => page.getByRole("textbox", { name: "Comment", exact: true });
const markdownOf = (page: Page) => page.getByLabel("Markdown value");
const cell = (page: Page, text: string) => editorOf(page).getByRole("cell", { name: text, exact: true });
const header = (page: Page, text: string) => editorOf(page).getByRole("columnheader", { name: text, exact: true });

async function rowOrder(page: Page) {
  const value = (await markdownOf(page).textContent()) ?? "";
  return value
    .split("\n")
    .filter((line) => line.startsWith("|") && !line.includes("---"))
    .map((line) => line.split("|")[1]?.trim());
}

async function headerOrder(page: Page) {
  const value = (await markdownOf(page).textContent()) ?? "";
  const first = value.split("\n").find((line) => line.startsWith("|")) ?? "";
  return first
    .split("|")
    .slice(1, -1)
    .map((part) => part.trim());
}

async function center(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Element must be visible");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
}

async function drag(page: Page, from: Locator, to: { x: number; y: number }) {
  const start = await center(from);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
}

test("a table reads as a ruled grid with left-aligned headers, even when the editor frame is borderless", async ({ page }) => {
  await page.locator('[data-control-family="markdown-editor"][data-slot="root"]').evaluate((root: HTMLElement) => {
    root.style.setProperty("--cui-markdown-editor-border-width", "0px");
  });
  await expect(header(page, "Need")).toHaveCSS("text-align", "start");
  await expect(cell(page, "Launch")).not.toHaveCSS("border-top-width", "0px");
  await expect(cell(page, "Launch")).not.toHaveCSS("border-top-style", "none");
  const wrapper = editorOf(page).locator(".tableWrapper");
  await expect(wrapper).toHaveCSS("overflow-x", "auto");
  const table = await wrapper.locator("table").boundingBox();
  const frame = await wrapper.boundingBox();
  expect(table && frame && table.width).toBeLessThan(frame?.width ?? 0);
});

test("hovering a cell shows grips on its row and column edges", async ({ page }) => {
  await cell(page, "Vectors").hover();
  const rowGrip = page.getByRole("button", { name: "Row actions" });
  const columnGrip = page.getByRole("button", { name: "Column actions" });
  await expect(rowGrip).toBeVisible();
  await expect(columnGrip).toBeVisible();
  const row = await center(cell(page, "Demo"));
  const column = await center(header(page, "Start with"));
  expect(Math.abs((await center(rowGrip)).y - row.y)).toBeLessThan(3);
  expect(Math.abs((await center(columnGrip)).x - column.x)).toBeLessThan(3);
  expect(Math.abs((await center(rowGrip)).x - row.box.x)).toBeLessThan(12);
});

test("dragging a row grip moves the row and keeps the header first", async ({ page }) => {
  await cell(page, "Film").hover();
  const grip = page.getByRole("button", { name: "Row actions" });
  const launch = await center(cell(page, "Launch"));
  await drag(page, grip, { x: launch.x, y: launch.box.y + 2 });
  await expect.poll(() => rowOrder(page)).toEqual(["Need", "Film", "Launch", "Demo"]);
  await expect(page.getByRole("menu")).toHaveCount(0);

  await cell(page, "Demo").hover();
  const need = await center(header(page, "Need"));
  await drag(page, grip, { x: need.x, y: need.box.y - 10 });
  await expect.poll(() => rowOrder(page)).toEqual(["Need", "Demo", "Film", "Launch"]);
});

test("dragging a column grip moves the whole column", async ({ page }) => {
  await cell(page, "Connect proof").hover();
  const grip = page.getByRole("button", { name: "Column actions" });
  const need = await center(header(page, "Need"));
  await drag(page, grip, { x: need.box.x + 2, y: need.y });
  await expect.poll(() => headerOrder(page)).toEqual(["Decision", "Need", "Start with"]);
  await expect.poll(() => rowOrder(page)).toEqual(["Decision", "Connect proof", "Return to UI", "Several proofs"]);
});

test("grip menus insert, align, move and delete, and protect the header row", async ({ page }) => {
  await cell(page, "Framer").hover();
  await page.getByRole("button", { name: "Column actions" }).click();
  await page.getByRole("menuitem", { name: "Align center" }).click();
  await expect(markdownOf(page)).toContainText(/\| -+ \| :-+: \| -+ \|/);
  await expect(editorOf(page)).toBeFocused();

  await cell(page, "Framer").hover();
  await page.getByRole("button", { name: "Column actions" }).click();
  await page.getByRole("menuitem", { name: "Insert column right" }).click();
  await expect.poll(async () => (await headerOrder(page)).length).toBe(4);

  await cell(page, "Demo").hover();
  await page.getByRole("button", { name: "Row actions" }).click();
  await page.getByRole("menuitem", { name: "Move row up" }).click();
  await expect.poll(() => rowOrder(page)).toEqual(["Need", "Demo", "Launch", "Film"]);

  await cell(page, "Film").hover();
  await page.getByRole("button", { name: "Row actions" }).click();
  await page.getByRole("menuitem", { name: "Delete row" }).click();
  await expect.poll(() => rowOrder(page)).toEqual(["Need", "Demo", "Launch"]);

  await header(page, "Need").hover();
  await page.getByRole("button", { name: "Row actions" }).click();
  await expect(page.getByRole("menuitem", { name: "Delete row" })).toBeDisabled();
  await expect(page.getByRole("menuitem", { name: "Move row up" })).toBeDisabled();
  await expect(page.getByRole("menuitem", { name: "Insert row above" })).toBeDisabled();
});

test("pressing a grip selects its row without a focus ring on the cells", async ({ page }) => {
  await cell(page, "Demo").hover();
  await page.getByRole("button", { name: "Row actions" }).click();
  await page.keyboard.press("Escape");
  const selected = editorOf(page).locator(".selectedCell");
  await expect(selected).toHaveCount(3);
  await expect(selected.first()).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(selected.first()).toHaveCSS("outline-style", "none");
});

test("grips move rows and columns from the keyboard", async ({ page }) => {
  await cell(page, "Launch").hover();
  const rowGrip = page.getByRole("button", { name: "Row actions" });
  await rowGrip.focus();
  await rowGrip.press("Alt+ArrowDown");
  await expect.poll(() => rowOrder(page)).toEqual(["Need", "Demo", "Launch", "Film"]);
  await rowGrip.press("Alt+ArrowDown");
  await expect.poll(() => rowOrder(page)).toEqual(["Need", "Demo", "Film", "Launch"]);

  await header(page, "Need").hover();
  const columnGrip = page.getByRole("button", { name: "Column actions" });
  await columnGrip.focus();
  await columnGrip.press("Alt+ArrowRight");
  await expect.poll(() => headerOrder(page)).toEqual(["Start with", "Need", "Decision"]);
});

test("edge buttons add a row and a column", async ({ page }) => {
  await cell(page, "Several proofs").hover();
  await page.getByRole("button", { name: "Add row" }).click();
  await expect.poll(async () => (await rowOrder(page)).length).toBe(5);
  await expect(editorOf(page)).toBeFocused();
  await editorOf(page).pressSequentially("Teaser");
  await expect.poll(() => rowOrder(page)).toEqual(["Need", "Launch", "Demo", "Film", "Teaser"]);

  await cell(page, "Launch").hover();
  await page.getByRole("button", { name: "Add column" }).click();
  await expect.poll(async () => (await headerOrder(page)).length).toBe(4);
});

test("the table slash command inserts a header row table", async ({ page }) => {
  await page.getByRole("button", { name: "Clear draft" }).click();
  const editor = editorOf(page);
  await editor.click();
  await editor.pressSequentially("/table");
  await page.keyboard.press("Enter");
  await expect(editor.getByRole("columnheader")).toHaveCount(3);
  await expect(editor.getByRole("row")).toHaveCount(3);
  await expect(editor.locator("p").filter({ hasText: "/table" })).toHaveCount(0);
});
