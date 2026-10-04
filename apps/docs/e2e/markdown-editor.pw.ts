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
