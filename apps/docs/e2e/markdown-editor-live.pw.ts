import { expect, type Locator, type Page, test } from "@playwright/test";
import { FIXTURE_ORIGIN, serveFixture } from "./fixtures/serve-fixture";

test.beforeEach(async ({ page }) => {
  await page.route(`${FIXTURE_ORIGIN}/upload?*`, (route) => route.fulfill({ body: "/media/screenshot.png" }));
  await page.route(`${FIXTURE_ORIGIN}/media/*`, (route) =>
    route.fulfill({
      contentType: "image/png",
      body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64"),
    }),
  );
  await serveFixture(page, "markdown-editor-live");
  await expect(editorOf(page)).toHaveAttribute("contenteditable", "true");
});

const editorOf = (page: Page) => page.getByRole("textbox", { name: "Comment", exact: true });
const markdownOf = (page: Page) => page.getByLabel("Markdown value");
const load = (page: Page, name: string) => page.getByRole("button", { name, exact: true }).click();
const cellWith = (page: Page, role: "cell" | "columnheader", text: string) =>
  editorOf(page)
    .getByRole(role)
    .filter({ hasText: new RegExp(`^${text}$`) });
const cell = (page: Page, text: string) => cellWith(page, "cell", text);
const header = (page: Page, text: string) => cellWith(page, "columnheader", text);
const hasFocusWithin = (locator: Locator) => locator.evaluate((element) => element.contains(document.activeElement));

async function tableRows(page: Page) {
  const value = (await markdownOf(page).textContent()) ?? "";
  return value
    .split("\n")
    .filter((line) => line.startsWith("|") && !line.includes("---"))
    .map((line) => line.split("|")[1]?.trim());
}

async function center(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Element must be visible");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
}

test("the Markdown a writer types is the Markdown that is saved", async ({ page }) => {
  await load(page, "Load unusual Markdown");
  const source = (await markdownOf(page).textContent()) ?? "";
  const editor = editorOf(page);
  await editor.click();
  await editor.press("ControlOrMeta+End");
  await editor.pressSequentially("!");
  await expect(markdownOf(page)).toHaveText(`${source}!`);
});

test("markup shows only on the line holding the caret", async ({ page }) => {
  await load(page, "Load inline markup");
  const editor = editorOf(page);
  const line = editor.locator(".cm-line").first();
  await editor.locator(".cm-line").last().click();
  await expect(line).toHaveText("Some bold text");
  await expect(line.locator("strong")).toHaveText("bold");
  await line.locator("strong").click();
  await expect(line).toHaveText("Some **bold** text");
});

test("a heading shows its level markup wherever the caret sits in it", async ({ page }) => {
  await load(page, "Load blocks");
  const editor = editorOf(page);
  const heading = editor.locator(".cm-line").first();
  await editor.getByText("Second paragraph").click();
  await expect(heading).toHaveText("First");
  await heading.click();
  await editor.press("End");
  await expect(heading).toHaveText("## First");
});

test("the gap between two blocks is not a line the caret can open", async ({ page }) => {
  await load(page, "Load blocks");
  const editor = editorOf(page);
  const heading = editor.locator(".cm-line").first();
  const paragraph = editor.getByText("Second paragraph");
  await paragraph.click();
  const headingBox = await center(heading);
  const before = await center(paragraph);
  await page.mouse.click(before.x, (headingBox.box.y + headingBox.box.height + before.box.y) / 2);
  expect((await center(paragraph)).box.y).toBe(before.box.y);
  await editor.pressSequentially("New ");
  await expect.poll(() => markdownOf(page).textContent()).toBe("## First\n\nNew Second paragraph\n\n- [ ] Third task");
});

test("arrow keys cross the gap between blocks in one press", async ({ page }) => {
  await load(page, "Load blocks");
  const editor = editorOf(page);
  await editor.locator(".cm-line").first().click();
  await editor.press("End");
  await editor.press("ArrowDown");
  await editor.pressSequentially("|");
  await expect(markdownOf(page)).toHaveText(/\n\nS[^\n|]+\|/);
  await editor.press("ArrowUp");
  await editor.pressSequentially("|");
  await expect(markdownOf(page)).toHaveText(/^## [^\n]*\|[^\n]*\n\n/);
});

test("Enter after a heading opens a paragraph that stays its own block", async ({ page }) => {
  await load(page, "Load blocks");
  const editor = editorOf(page);
  await editor.locator(".cm-line").first().click();
  await editor.press("End");
  await editor.press("Enter");
  await editor.pressSequentially("Intro");
  await expect.poll(() => markdownOf(page).textContent()).toBe("## First\n\nIntro\n\nSecond paragraph\n\n- [ ] Third task");
});

test("an empty line a writer adds between blocks keeps its place once text follows it", async ({ page }) => {
  const editor = editorOf(page);
  await editor.click();
  await editor.pressSequentially("A");
  await editor.press("Enter");
  await editor.press("Enter");
  const caretLine = editor.locator(".cm-line").last();
  const before = await center(caretLine);
  await editor.pressSequentially("B");
  await expect.poll(() => markdownOf(page).textContent()).toBe("A\n\n\nB");
  expect((await center(editor.getByText("B", { exact: true }))).box.y).toBe(before.box.y);
});

test("toolbar formatting writes Markdown and undo restores the text", async ({ page }) => {
  const editor = editorOf(page);
  await editor.fill("Feedback");
  await editor.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await expect(markdownOf(page)).toHaveText("**Feedback**");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(markdownOf(page)).toHaveText("Feedback");
  await load(page, "Load external value");
  await expect(editor.locator("strong")).toHaveText("update");
});

test("the source view shows every mark in the same editor", async ({ page }) => {
  await load(page, "Load inline markup");
  const editor = editorOf(page);
  await page.getByRole("button", { name: "Markdown source" }).click();
  await expect(editor.locator(".cm-line").first()).toHaveText("Some **bold** text");
  await expect(editor.locator("strong")).toHaveCount(0);
  await page.getByRole("button", { name: "Markdown source" }).click();
  await expect(editor.locator("strong")).toHaveText("bold");
});

test("a pasted screenshot uploads and renders as an image", async ({ page }) => {
  await editorOf(page).evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array([137, 80, 78, 71])], "screenshot.png", { type: "image/png" }));
    element.dispatchEvent(new ClipboardEvent("paste", { clipboardData: transfer, bubbles: true, cancelable: true }));
  });
  await expect(markdownOf(page)).toHaveText("![screenshot.png](/media/screenshot.png)");
  await page.getByRole("button", { name: "Load blocks" }).focus();
  await expect(editorOf(page).getByRole("img", { name: "screenshot.png" })).toBeVisible();
});

test("slash commands and mentions insert Markdown", async ({ page }) => {
  const editor = editorOf(page);
  await editor.pressSequentially("/h2");
  await expect(page.getByRole("option", { name: "Heading 2", exact: true })).toBeVisible();
  await editor.press("Enter");
  await editor.pressSequentially("A heading");
  await expect(editor.locator('[data-heading="2"]')).toHaveText("## A heading");
  await editor.press("Enter");
  await editor.pressSequentially("/task");
  await page.getByRole("option", { name: "Task list" }).click();
  await editor.pressSequentially("Ship it @");
  await editor.press("ArrowDown");
  await editor.press("Enter");
  await expect(markdownOf(page)).toHaveText("## A heading\n\n- [ ] Ship it [@Sam Rivera](/people/sam)");
  await expect(editor.getByRole("checkbox")).toHaveCount(1);
});

test("task checkboxes toggle the Markdown marker and undo", async ({ page }) => {
  await load(page, "Load blocks");
  const checkbox = editorOf(page).getByRole("checkbox", { name: "Third task" });
  await checkbox.click();
  await expect(markdownOf(page)).toHaveText("## First\n\nSecond paragraph\n\n- [x] Third task");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(markdownOf(page)).toHaveText("## First\n\nSecond paragraph\n\n- [ ] Third task");
  await page.getByRole("button", { name: "Toggle disabled" }).click();
  await expect(checkbox).toBeDisabled();
});

test("block handles move whole blocks by keyboard and by drag", async ({ page }) => {
  await load(page, "Load blocks");
  const editor = editorOf(page);
  await editor.locator('[data-heading="2"]').hover();
  const handle = page.getByRole("button", { name: "Drag to reorder block" });
  await handle.focus();
  await handle.press("Alt+ArrowDown");
  await expect(markdownOf(page)).toHaveText("Second paragraph\n\n## First\n\n- [ ] Third task");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(markdownOf(page)).toHaveText("## First\n\nSecond paragraph\n\n- [ ] Third task");

  await editor.locator('[data-heading="2"]').hover();
  const bounds = await editor.boundingBox();
  if (!bounds) throw new Error("Editor must have a visible drop target");
  await handle.dragTo(editor, { targetPosition: { x: 70, y: bounds.height - 4 } });
  await expect(markdownOf(page)).toHaveText("Second paragraph\n\n- [ ] Third task\n\n## First");
  await expect(editor.locator('[data-heading="2"]')).toHaveCount(1);
});

test("table cells edit their Markdown in place, are named by their column, and Tab walks the grid", async ({ page }) => {
  await load(page, "Load table");
  await expect(header(page, "Need")).toBeVisible();
  await expect(editorOf(page).getByRole("textbox", { name: "Start with", exact: true })).toHaveCount(4);
  await cell(page, "Framer").click();
  await page.keyboard.press("End");
  await page.keyboard.type("s");
  await expect(markdownOf(page)).toContainText("| Launch | Framers | Connect proof |");
  await cell(page, "Several proofs").click();
  await page.keyboard.press("Tab");
  await page.keyboard.type("Teaser");
  await expect.poll(() => tableRows(page)).toEqual(["Need", "Launch", "Demo", "Film", "Teaser"]);
});

test("a pipe typed in a cell stays inside the cell and undo restores it", async ({ page }) => {
  await load(page, "Load table");
  await cell(page, "Vectors").click();
  await page.keyboard.press("End");
  await page.keyboard.type("|Paths");
  await expect(markdownOf(page)).toContainText("| Demo | Vectors\\|Paths | Return to UI |");
  await expect(editorOf(page).getByRole("columnheader")).toHaveCount(3);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(markdownOf(page)).toContainText("| Demo | Vectors | Return to UI |");
});

test("consumer extensions also run inside table cells", async ({ page }) => {
  await load(page, "Load table");
  await expect(cell(page, "Connect proof").locator(".proof-mark")).toHaveText("proof");
  await expect(cell(page, "Several proofs").locator(".proof-mark")).toHaveCount(0);
});

test("arrow keys leave a table for the text around it and come back", async ({ page }) => {
  await load(page, "Load table");
  await header(page, "Need").click();
  await page.keyboard.press("ArrowUp");
  await page.keyboard.type("Intro");
  await expect(markdownOf(page)).toContainText("Intro\n\n| Need | Start with | Decision |");
  await page.keyboard.press("ArrowDown");
  await expect.poll(() => header(page, "Need").evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await cell(page, "Several proofs").click();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.type("Outro");
  await expect(markdownOf(page)).toContainText("| Film | Analytics | Several proofs |\n\nOutro");
});

test("table grips move, align and add rows and columns", async ({ page }) => {
  await load(page, "Load table");
  await cell(page, "Framer").hover();
  await page.getByRole("button", { name: "Column actions" }).click();
  await page.getByRole("menuitem", { name: "Align center" }).click();
  await expect(markdownOf(page)).toContainText(/\| -+ \| :-+: \| -+ \|/);
  await expect.poll(() => hasFocusWithin(editorOf(page))).toBe(true);

  await cell(page, "Film").hover();
  const rowGrip = page.getByRole("button", { name: "Row actions" });
  const launch = await center(cell(page, "Launch"));
  const start = await center(rowGrip);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(launch.x, launch.box.y + 2, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => tableRows(page)).toEqual(["Need", "Film", "Launch", "Demo"]);

  await cell(page, "Launch").hover();
  await rowGrip.focus();
  await rowGrip.press("Alt+ArrowDown");
  await expect.poll(() => tableRows(page)).toEqual(["Need", "Film", "Demo", "Launch"]);

  await cell(page, "Launch").hover();
  await page.getByRole("button", { name: "Add row" }).click();
  await expect.poll(async () => (await tableRows(page)).length).toBe(5);
});

test("the table slash command inserts a header row table", async ({ page }) => {
  const editor = editorOf(page);
  await editor.click();
  await editor.pressSequentially("/table");
  await page.keyboard.press("Enter");
  await expect(editor.getByRole("columnheader")).toHaveCount(3);
  await expect(editor.getByRole("row")).toHaveCount(3);
  await expect(markdownOf(page)).toHaveText("|  |  |  |\n| --- | --- | --- |\n|  |  |  |\n|  |  |  |");
});

test("a disabled editor locks the text and hides block handles", async ({ page }) => {
  await load(page, "Load blocks");
  await page.getByRole("button", { name: "Toggle disabled" }).click();
  await expect(editorOf(page)).toHaveAttribute("contenteditable", "false");
  await editorOf(page).locator('[data-heading="2"]').hover();
  await expect(page.getByRole("button", { name: "Drag to reorder block" })).toHaveCount(0);
});
