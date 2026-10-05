import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";
import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";

const buildDirectory = mkdtempSync(path.join(tmpdir(), "control-ui-markdown-editor-"));
let stylesheet: string;
let script: string;
test.beforeAll(async () => {
  execFileSync("bun", ["build", "e2e/fixtures/markdown-editor.tsx", "--outdir", buildDirectory, "--target", "browser"]);
  script = readFileSync(path.join(buildDirectory, "markdown-editor.js"), "utf8");
  const cssPath = path.resolve("app/globals.css");
  stylesheet = (await postcss([tailwind()]).process(readFileSync(cssPath, "utf8"), { from: cssPath })).css;
});
test.afterAll(() => rmSync(buildDirectory, { recursive: true, force: true }));
test.beforeEach(async ({ page }) => {
  await page.route("http://editor.test/**", (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === "/fixture.js") return route.fulfill({ contentType: "application/javascript", body: script });
    if (pathname === "/fixture.css") return route.fulfill({ contentType: "text/css", body: stylesheet });
    if (pathname === "/upload") return route.fulfill({ body: "/media/screenshot.png" });
    if (pathname === "/media/screenshot.png")
      return route.fulfill({
        contentType: "image/png",
        body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64"),
      });
    return route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>',
    });
  });
  await page.goto("http://editor.test/");
  await expect(page.getByRole("textbox", { name: "Comment", exact: true })).toHaveAttribute("contenteditable", "true");
});

async function pasteImage(page: Page) {
  await page.getByRole("textbox", { name: "Comment", exact: true }).evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array([137, 80, 78, 71])], "screenshot.png", { type: "image/png" }));
    element.dispatchEvent(new ClipboardEvent("paste", { clipboardData: transfer, bubbles: true, cancelable: true }));
  });
}

test("format, publish and reopen a comment without losing Markdown", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Comment", exact: true });
  await editor.fill("Feedback");
  await editor.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await expect(page.getByLabel("Markdown value")).toHaveText("**Feedback**");
  await editor.press("ControlOrMeta+Enter");
  await expect(page.locator('[data-slot="content"] strong').last()).toHaveText("Feedback");
  await expect(editor).toHaveText("");
  await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Edit saved comment" }).click();
  await expect(editor.locator("strong")).toHaveText("Feedback");
  await page.getByRole("button", { name: "Markdown source" }).click();
  await expect(page.getByRole("textbox", { name: "Comment", exact: true })).toHaveValue("**Feedback**");
});

test("preserves cursor and undo while the controlled value updates", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Comment", exact: true });
  await editor.pressSequentially("alpha omega");
  await editor.press("Home");
  await editor.pressSequentially("Start ");
  await expect(editor).toHaveText("Start alpha omega");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(editor).not.toHaveText("Start alpha omega");
  await page.getByRole("button", { name: "Load external value" }).click();
  await expect(editor.locator("strong")).toHaveText("update");
});

test("failed publication keeps the draft and source-only content is preserved", async ({ page }) => {
  await page.getByRole("button", { name: "Load HTML source" }).click();
  const source = page.getByRole("textbox", { name: "Comment", exact: true });
  await expect(source).toHaveValue("<details><summary>More</summary>Preserve me</details>");
  await expect(page.getByRole("button", { name: "Edit link", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Insert image", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Toggle post failure" }).click();
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Post unavailable");
  await expect(source).toHaveValue("<details><summary>More</summary>Preserve me</details>");
});

test("uploads a pasted screenshot and publishes an image-only comment", async ({ page }) => {
  await pasteImage(page);
  await expect(page.getByLabel("Markdown value")).toHaveText("![screenshot.png](/media/screenshot.png)");
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(page.locator('[data-control-family="markdown"] img')).toHaveAttribute("src", "/media/screenshot.png");
  await page.getByRole("button", { name: "Edit saved comment" }).click();
  await expect(page.locator(".tiptap img[src]")).toHaveAttribute("src", "/media/screenshot.png");
});

test("blocks publication on failed upload and supports retry", async ({ page }) => {
  let attempts = 0;
  await page.route("http://editor.test/upload?*", (route) => {
    attempts += 1;
    return route.fulfill(attempts === 1 ? { status: 503, body: "Unavailable" } : { body: "/media/screenshot.png" });
  });
  await page.getByRole("textbox", { name: "Comment", exact: true }).fill("With screenshot");
  await pasteImage(page);
  await expect(page.getByRole("button", { name: "Retry upload" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Post", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Retry upload" }).click();
  await expect(page.locator(".tiptap img[src]")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Post", exact: true })).toBeEnabled();
});

test("removing an upload prevents late completion from inserting an image", async ({ page }) => {
  let finish: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  await page.route("http://editor.test/upload?*", async (route) => {
    await pending;
    await route.fulfill({ body: "/media/screenshot.png" });
  });
  await pasteImage(page);
  await page.getByRole("button", { name: "Remove screenshot.png" }).click();
  finish?.();
  await expect(page.locator("[data-image-upload]")).toHaveCount(0);
  await expect(page.locator(".tiptap img[src]")).toHaveCount(0);
  await expect(page.getByLabel("Markdown value")).toHaveText("");
});

test("IME confirmation never publishes a comment", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Comment", exact: true });
  await editor.fill("日本語");
  await editor.dispatchEvent("keydown", { key: "Enter", ctrlKey: true, isComposing: true, keyCode: 229 });
  await expect(page.getByLabel("Markdown value")).toHaveText("日本語");
});

test("pastes Markdown structure and keeps controls usable on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const editor = page.getByRole("textbox", { name: "Comment", exact: true });
  await editor.evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.setData("text/plain", "## Pasted title\n\n- [x] Complete\n- [ ] Next");
    element.dispatchEvent(new ClipboardEvent("paste", { clipboardData: transfer, bubbles: true, cancelable: true }));
  });
  await expect(editor.locator("h2")).toHaveText("Pasted title");
  await expect(editor.getByRole("checkbox")).toHaveCount(2);
  await page.getByRole("button", { name: "Insert image", exact: true }).click();
  await page.getByRole("textbox", { name: "Image URL", exact: true }).fill("javascript:alert(1)");
  await expect(page.getByRole("button", { name: "Insert image", exact: true }).last()).toBeDisabled();
  await page.getByRole("textbox", { name: "Image URL", exact: true }).fill("/media/screenshot.png");
  await page.getByRole("textbox", { name: "Image description", exact: true }).fill("A screenshot");
  await page.getByRole("button", { name: "Insert image", exact: true }).last().click();
  await expect(editor.getByRole("img", { name: "A screenshot" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("replacing a draft with source content cancels pending uploads", async ({ page }) => {
  let finish: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  await page.route("http://editor.test/upload?*", async (route) => {
    await pending;
    await route.fulfill({ body: "/media/screenshot.png" });
  });
  await pasteImage(page);
  await expect(page.getByRole("button", { name: "Remove screenshot.png" })).toBeVisible();
  await page.getByRole("button", { name: "Load HTML source" }).click();
  finish?.();
  await expect(page.getByRole("button", { name: "Remove screenshot.png" })).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Comment", exact: true })).toHaveValue(
    "<details><summary>More</summary>Preserve me</details>",
  );
});

test("dropped images keep their order when uploads finish out of order", async ({ page }) => {
  let finishFirst: (() => void) | undefined;
  const first = new Promise<void>((resolve) => {
    finishFirst = resolve;
  });
  await page.route("http://editor.test/upload?*", async (route) => {
    const name = new URL(route.request().url()).searchParams.get("name");
    if (name === "first.png") await first;
    await route.fulfill({ body: `/media/${name}` });
  });
  await page.getByRole("textbox", { name: "Comment", exact: true }).evaluate((element) => {
    const transfer = new DataTransfer();
    for (const name of ["first.png", "second.png"]) transfer.items.add(new File(["image"], name, { type: "image/png" }));
    const box = element.getBoundingClientRect();
    element.dispatchEvent(
      new DragEvent("drop", {
        dataTransfer: transfer,
        clientX: box.left + 12,
        clientY: box.top + 12,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await expect(page.locator('.tiptap img[src="/media/second.png"]')).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Post", exact: true })).toBeDisabled();
  finishFirst?.();
  await expect(page.locator(".tiptap img[src]")).toHaveCount(2);
  await expect(page.getByLabel("Markdown value")).toHaveText("![first.png](/media/first.png)\n\n![second.png](/media/second.png)");
});

test("publishing source Markdown preserves significant leading spaces", async ({ page }) => {
  await page.getByRole("button", { name: "Markdown source" }).click();
  await page.getByRole("textbox", { name: "Comment", exact: true }).fill("    indented code");
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await page.getByRole("button", { name: "Edit saved comment" }).click();
  await expect(page.getByRole("textbox", { name: "Comment", exact: true })).toHaveValue("    indented code");
});

test("slash commands filter, keep editor focus, and support keyboard and pointer selection", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Comment", exact: true });
  await editor.pressSequentially("/h2");
  await expect(page.getByRole("listbox", { name: "Insert block" })).toBeVisible();
  await expect(page.getByRole("option", { name: "Heading 2", exact: true })).toBeVisible();
  await expect(editor).toBeFocused();
  await editor.press("Enter");
  await editor.pressSequentially("A heading");
  await expect(editor.locator("h2")).toHaveText("A heading");
  await expect(page.getByLabel("Markdown value")).toHaveText("## A heading");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await editor.press("Enter");
  await editor.pressSequentially("/task");
  await page.getByRole("option", { name: "Task list" }).click();
  await editor.pressSequentially("Ship it");
  await expect(editor.getByRole("checkbox")).toHaveCount(1);
  await expect(page.getByLabel("Markdown value")).toContainText("- [ ] Ship it");
});

test("mentions retain identity through source editing, save, reopen, and undo", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Comment", exact: true });
  await editor.pressSequentially("Hello @");
  await expect(page.getByRole("listbox", { name: "Mention people" })).toBeVisible();
  await editor.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Sam Rivera" })).toHaveAttribute("aria-selected", "true");
  await editor.press("Enter");
  await expect(editor.getByRole("link", { name: "@Sam Rivera" })).toHaveAttribute("href", "/people/sam");
  await expect(editor).toBeFocused();
  await expect(page.getByLabel("Markdown value")).toContainText("[@Sam Rivera](/people/sam)");
  await page.getByRole("button", { name: "Markdown source" }).click();
  await expect(editor).toHaveValue(/\[@Sam Rivera\]\(\/people\/sam\)/);
  await page.getByRole("button", { name: "Markdown source" }).click();
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await page.getByRole("button", { name: "Edit saved comment" }).click();
  await expect(editor.getByRole("link", { name: "@Sam Rivera" })).toHaveAttribute("href", "/people/sam");
  await editor.press("End");
  await editor.pressSequentially(" @alex");
  await page.getByRole("option", { name: "Alex Morgan" }).click();
  await expect(editor.getByRole("link", { name: "@Alex Morgan" })).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(editor.getByRole("link", { name: "@Alex Morgan" })).toHaveCount(0);
});

test("suggestions respect Escape, empty results, code, source, disabled state and IME", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Comment", exact: true });
  await editor.pressSequentially("@");
  await editor.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await editor.press("Shift");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await editor.pressSequentially("nobody");
  await expect(page.getByText("No people found", { exact: true })).toBeVisible();
  await editor.press("Enter");
  await expect(editor.locator("p")).toHaveCount(2);
  await editor.pressSequentially("@");
  await editor.dispatchEvent("keydown", { key: "Enter", isComposing: true, keyCode: 229 });
  await expect(editor.getByRole("link")).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle disabled" }).click();
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Drag to reorder block" })).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle disabled" }).click();
  await page.getByRole("button", { name: "Clear draft" }).click();
  await page.getByRole("button", { name: "Code block", exact: true }).click();
  await editor.pressSequentially("@alex /h2");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await page.getByRole("button", { name: "Markdown source" }).click();
  await editor.fill("@alex\n/h2");
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("block handles reorder complete blocks by keyboard and preserve undo", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Comment", exact: true });
  await page.getByRole("button", { name: "Load blocks" }).click();
  await editor.locator("h2").hover();
  const handle = page.getByRole("button", { name: "Drag to reorder block" });
  await handle.focus();
  await handle.press("Alt+ArrowUp");
  await expect(page.getByLabel("Markdown value")).toHaveText("## First\n\nSecond paragraph\n\n- [ ] Third task");
  await handle.press("Alt+ArrowDown");
  await expect(page.getByLabel("Markdown value")).toHaveText("Second paragraph\n\n## First\n\n- [ ] Third task");
  await handle.press("Alt+ArrowDown");
  await expect(page.getByLabel("Markdown value")).toHaveText("Second paragraph\n\n- [ ] Third task\n\n## First");
  await expect(editor.locator("h2")).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Markdown value")).toContainText("## First\n\n- [ ] Third task");
});

test("dragging a handle moves a block instead of copying it", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Comment", exact: true });
  await page.getByRole("button", { name: "Load blocks" }).click();
  await editor.locator("h2").hover();
  const handle = page.getByRole("button", { name: "Drag to reorder block" });
  const bounds = await editor.boundingBox();
  if (!bounds) throw new Error("Editor must have a visible drop target");
  await handle.dragTo(editor, { targetPosition: { x: 70, y: bounds.height - 4 } });
  await expect(editor.locator("h2")).toHaveCount(1);
  await expect(editor.locator("h2")).toHaveText("First");
  await expect(page.getByLabel("Markdown value")).toHaveText("Second paragraph\n\n- [ ] Third task\n\n## First");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Markdown value")).toHaveText("## First\n\nSecond paragraph\n\n- [ ] Third task");
});

test("editor has one frame and an embedded shared toolbar at narrow widths", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const editor = page.getByRole("textbox", { name: "Comment", exact: true });
  await editor.click();
  await expect(editor).toHaveCSS("outline-style", "none");
  await expect(page.locator('[data-control-family="markdown-editor"][data-slot="root"]')).toHaveCSS("outline-style", "none");
  const toolbar = page.getByRole("toolbar", { name: "Markdown formatting" });
  await expect(toolbar).toHaveAttribute("data-chrome", "embedded");
  await expect(toolbar).toHaveCSS("box-shadow", "none");
  await expect(toolbar).toHaveCSS("border-top-width", "0px");
  await editor.pressSequentially("/head");
  await expect(page.getByRole("listbox", { name: "Insert block" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await editor.press("Escape");
  await page.getByRole("button", { name: "Markdown source" }).click();
  await expect(editor).toHaveCSS("box-shadow", "none");
  await expect(editor).toHaveCSS("border-width", "0px");
});

test("toolbar scrolls horizontally and popover triggers retain shared button sizing", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const toolbar = page.getByRole("toolbar", { name: "Markdown formatting" });
  const viewport = page.locator('[data-control-family="markdown-editor"][data-slot="toolbar"] [data-scroll-area-viewport]');
  expect(await viewport.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  const bold = toolbar.getByRole("button", { name: "Bold", exact: true });
  for (const name of ["Edit link", "Insert image"]) {
    const trigger = toolbar.getByRole("button", { name, exact: true });
    await expect(trigger).toHaveAttribute("data-slot", "button");
    await expect(trigger).toHaveAttribute("data-control-family", "toolbar");
    expect(await trigger.evaluate((element) => element.getBoundingClientRect().width)).toEqual(
      await bold.evaluate((element) => element.getBoundingClientRect().width),
    );
  }
  await toolbar.getByRole("button", { name: "Text style" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(toolbar.getByRole("button", { name: "Markdown source" })).toBeFocused();
  expect(await viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  const rows = await toolbar
    .getByRole("button")
    .evaluateAll((buttons) => new Set(buttons.map((button) => button.getBoundingClientRect().top)).size);
  expect(rows).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("heading menu preserves selection and shares typography with rendered Markdown", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Comment", exact: true });
  await editor.fill("Shared heading");
  for (const level of [1, 2, 3, 4, 5, 6]) {
    await page.getByRole("button", { name: "Text style" }).click();
    await page.getByRole("menuitemradio", { name: `Heading ${level}`, exact: true }).click();
    await expect(editor).toBeFocused();
    await expect(editor.locator(`h${level}`)).toHaveText("Shared heading");
    await expect(page.getByLabel("Markdown value")).toHaveText(`${"#".repeat(level)} Shared heading`);
  }
  const styles = await editor.locator("h6").evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.fontSize, style.fontWeight, style.lineHeight];
  });
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(page.getByRole("heading", { level: 6, name: "Shared heading" })).toBeVisible();
  expect(
    await page.getByRole("heading", { level: 6, name: "Shared heading" }).evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.fontSize, style.fontWeight, style.lineHeight];
    }),
  ).toEqual(styles);
  await page.getByRole("button", { name: "Edit saved comment" }).click();
  await page.getByRole("button", { name: "Text style" }).click();
  await page.getByRole("menuitemradio", { name: "Paragraph", exact: true }).click();
  await expect(page.getByLabel("Markdown value")).toHaveText("Shared heading");
});

test("link popover preserves text selection and supports keyboard removal", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Comment", exact: true });
  await editor.fill("Read the guide");
  await editor.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Edit link", exact: true }).click();
  await page.getByRole("textbox", { name: "URL", exact: true }).fill("https://example.com/guide");
  await page.getByRole("textbox", { name: "URL", exact: true }).press("Enter");
  await expect(editor.getByRole("link", { name: "Read the guide" })).toHaveAttribute("href", "https://example.com/guide");
  await expect(editor).toBeFocused();
  await page.getByRole("button", { name: "Edit link", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "URL", exact: true })).toHaveValue("https://example.com/guide");
  await page.getByRole("button", { name: "Remove link", exact: true }).press("Enter");
  await expect(editor.getByRole("link")).toHaveCount(0);
  await expect(page.getByLabel("Markdown value")).toHaveText("Read the guide");
  await expect(editor).toBeFocused();
});

test("shared task checkboxes support keyboard, undo, nested content, save and disabled state", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Comment", exact: true });
  await page.getByRole("button", { name: "Markdown source" }).click();
  await editor.fill("- [ ] Parent\n  - [x] Child");
  await page.getByRole("button", { name: "Markdown source" }).click();
  const parent = editor.getByRole("checkbox", { name: "Parent", exact: true });
  const child = editor.getByRole("checkbox", { name: "Child", exact: true });
  await expect(parent).toHaveAttribute("data-control-ui", "checkbox");
  await expect(child).toBeChecked();
  await parent.focus();
  await parent.press("Space");
  await expect(parent).toBeChecked();
  await expect(page.getByLabel("Markdown value")).toContainText("- [x] Parent");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(parent).not.toBeChecked();
  await child.click();
  await expect(child).not.toBeChecked();
  await page.getByRole("button", { name: "Toggle disabled" }).click();
  await expect(parent).toBeDisabled();
  await expect(child).toBeDisabled();
  await page.getByRole("button", { name: "Toggle disabled" }).click();
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await page.getByRole("button", { name: "Edit saved comment" }).click();
  await expect(parent).not.toBeChecked();
  await expect(child).not.toBeChecked();
});

test("drag previews are compact, transparent and cleaned up after dragging", async ({ page }) => {
  await page.getByRole("button", { name: "Load blocks" }).click();
  await page.locator('.tiptap ul[data-type="taskList"]').hover();
  const handle = page.getByRole("button", { name: "Drag to reorder block" });
  await handle.hover();
  await expect(handle).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(handle).toHaveCSS("box-shadow", "none");
  await handle.dispatchEvent("dragstart", { dataTransfer: await page.evaluateHandle(() => new DataTransfer()) });
  const preview = page.locator("[data-markdown-drag-preview]");
  await expect(preview).toHaveCount(1);
  await expect(preview).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  expect(await preview.evaluate((element) => element.getBoundingClientRect().width)).toBeLessThanOrEqual(320);
  await expect(page.locator(".ProseMirror-selectednode")).toHaveCSS("outline-style", "none");
  await handle.dispatchEvent("dragend");
  await expect(preview).toHaveCount(0);
});

test("first drag of a long task list stays responsive and transfers every task", async ({ page }) => {
  await page.getByRole("button", { name: "Load long task list" }).click();
  const editor = page.getByRole("textbox", { name: "Comment", exact: true });
  await expect(editor.getByRole("checkbox")).toHaveCount(200);
  await editor.getByRole("checkbox", { name: "Task 1", exact: true }).hover();
  const handle = page.getByRole("button", { name: "Drag to reorder block" });
  await expect(handle).toHaveAttribute("data-visible", "");
  const sample = await handle.evaluate((element) => {
    const transfer = new DataTransfer();
    const started = performance.now();
    element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    const prepared = performance.now();
    element.dispatchEvent(new DragEvent("dragstart", { dataTransfer: transfer, bubbles: true, cancelable: true }));
    const elapsed = performance.now() - prepared;
    const preview = document.querySelector("[data-markdown-drag-preview]");
    const previewElements = preview?.querySelectorAll("*").length ?? 0;
    const html = transfer.getData("text/html");
    element.dispatchEvent(new DragEvent("dragend", { dataTransfer: transfer, bubbles: true }));
    return { prepareMs: prepared - started, dragMs: elapsed, previewElements, html };
  });
  await test.info().attach("first-drag", {
    body: JSON.stringify({ prepareMs: sample.prepareMs, dragMs: sample.dragMs, previewElements: sample.previewElements }),
    contentType: "application/json",
  });
  expect(sample.html).toContain("Task 200");
  expect(sample.previewElements).toBeLessThanOrEqual(80);
  expect(sample.dragMs).toBeLessThan(100);
  expect(sample.prepareMs + sample.dragMs).toBeLessThan(150);
  await expect(page.locator("[data-markdown-drag-preview]")).toHaveCount(0);
  await expect(editor.getByRole("checkbox")).toHaveCount(200);
});

for (const skin of ["modern-apple", "refined"]) {
  test(`${skin} keeps editor and source controls embedded`, async ({ page }) => {
    await page.locator("body").evaluate((body, value) => body.setAttribute("data-skin", value), skin);
    const toolbar = page.getByRole("toolbar", { name: "Markdown formatting" });
    await expect(toolbar).toHaveCSS("box-shadow", "none");
    await expect(toolbar).toHaveCSS("border-top-width", "0px");
    await page.getByRole("button", { name: "Markdown source" }).click();
    const source = page.getByRole("textbox", { name: "Comment", exact: true });
    await source.fill("## Source title");
    await expect(source).toHaveCSS("box-shadow", "none");
    await expect(source).toHaveCSS("border-width", "0px");
    await expect(source).toHaveCSS("border-radius", "0px");
    await page.getByRole("button", { name: "Markdown source" }).click();
    await expect(page.getByRole("heading", { name: "Source title" })).toBeVisible();
  });
}
