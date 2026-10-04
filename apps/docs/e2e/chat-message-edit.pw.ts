import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";
import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";

const buildDirectory = mkdtempSync(path.join(tmpdir(), "control-ui-message-edit-"));
let script: string;
let stylesheet: string;

test.beforeAll(async () => {
  execFileSync("bun", ["build", "e2e/fixtures/chat-message-edit.tsx", "--outdir", buildDirectory, "--target", "browser"]);
  script = readFileSync(path.join(buildDirectory, "chat-message-edit.js"), "utf8");
  const result = await postcss([tailwind()]).process('@import "../app/globals.css"; @source "./fixtures/chat-message-edit.tsx";', {
    from: path.resolve("e2e/chat-message-edit.css"),
  });
  stylesheet = result.css;
});
test.afterAll(() => rmSync(buildDirectory, { recursive: true, force: true }));

async function openFixture(page: Page, query = "", skin = "none") {
  await page.route("http://message.test/**", (route) => {
    if (new URL(route.request().url()).pathname === "/fixture.js") return route.fulfill({ contentType: "text/javascript", body: script });
    return route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html data-skin="${skin}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${stylesheet}</style></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`,
    });
  });
  await page.goto(`http://message.test/?${query}`);
  await expect(page.getByRole("button", { name: "Edit", exact: true })).toBeVisible();
  await settle(page);
}

async function settle(page: Page) {
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})));
  });
}

for (const skin of ["none", "mastra"]) {
  for (const width of [1280, 360]) {
    test(`edit preserves geometry and DOM at ${width}px with ${skin}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await openFixture(page, "", skin);
      const surface = page.locator('[data-slot="content"]');
      const following = page.getByTestId("following-message");
      const before = await surface.boundingBox();
      const followingBefore = await following.boundingBox();
      await surface.evaluate((element) => {
        element.setAttribute("data-retained", "true");
      });
      const textarea = await page.locator("textarea").elementHandle();
      await page.getByRole("button", { name: "Edit", exact: true }).click();
      const input = page.getByRole("textbox", { name: "Edit message" });
      await expect(input).toBeFocused();
      await settle(page);
      expect(await surface.boundingBox()).toEqual(before);
      expect(await following.boundingBox()).toEqual(followingBefore);
      await expect(surface).toHaveAttribute("data-retained", "true");
      expect(await textarea?.evaluate((element) => element.isConnected)).toBe(true);
      await input.press("Escape");
      await settle(page);
      expect(await surface.boundingBox()).toEqual(before);
      expect(await following.boundingBox()).toEqual(followingBefore);
      await expect(page.getByRole("button", { name: "Edit", exact: true })).toBeFocused();
    });
  }
}

test("drafts stay local, preserve whitespace, cancel and reset from host updates", async ({ page }) => {
  await openFixture(page);
  const edit = page.getByRole("button", { name: "Edit", exact: true });
  const input = page.getByRole("textbox", { name: "Edit message" });
  await edit.click();
  await input.fill("  first line\n\n<script>literal text</script>  ");
  await expect(page.getByLabel("Save count")).toHaveText("0");
  await input.press("Control+Enter");
  await expect(edit).toBeFocused();
  await expect(page.getByLabel("Saved value")).toHaveText("  first line\n\n<script>literal text</script>  ", { useInnerText: true });
  expect(await page.getByLabel("Saved value").textContent()).toBe("  first line\n\n<script>literal text</script>  ");
  await expect(page.locator('[data-slot="content"] script')).toHaveCount(0);
  await edit.click();
  await input.fill("Discard this draft");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(edit).toBeFocused();
  await page.getByRole("button", { name: "Update externally" }).click();
  await edit.click();
  await expect(input).toHaveValue("Updated by the host");
  await input.press("Enter");
  await expect(input).toHaveValue("Updated by the host\n");
  await input.fill(" \n ");
  await expect(page.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
  await input.press("Control+Enter");
  await expect(input).toBeVisible();
  await expect(page.getByLabel("Save count")).toHaveText("1");
});

test("async saves lock duplicate submissions and retain failed drafts for retry", async ({ page }) => {
  await openFixture(page, "async");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  const input = page.getByRole("textbox", { name: "Edit message" });
  await input.fill("Retry this message");
  await input.press("Control+Enter");
  await input.press("Control+Enter");
  await input.press("Escape");
  await expect(input).toHaveAttribute("readonly", "");
  await expect(page.getByLabel("Save count")).toHaveText("1");
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Reject save" }).click();
  await expect(page.getByRole("alert")).toContainText("Couldn't save");
  await expect(input).toHaveValue("Retry this message");
  await expect(input).not.toHaveAttribute("readonly");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("button", { name: "Resolve save" }).click();
  await expect(page.getByLabel("Saved value")).toHaveText("Retry this message");
  await expect(page.getByRole("button", { name: "Edit", exact: true })).toBeFocused();
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("growing drafts keep the bubble width and cancel back to the original height", async ({ page }) => {
  await openFixture(page);
  const surface = page.locator('[data-slot="content"]');
  const before = await surface.boundingBox();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  const input = page.getByRole("textbox", { name: "Edit message" });
  await input.fill("A much longer draft. ".repeat(40));
  await settle(page);
  const expanded = await surface.boundingBox();
  expect(expanded?.width).toBe(before?.width);
  expect(expanded?.height).toBeGreaterThan(before?.height ?? 0);
  await input.press("Escape");
  await settle(page);
  expect(await surface.boundingBox()).toEqual(before);
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(input).toHaveValue("Summarize the latest deployment notes.");
});

test("chat preview edits the message without replacing the composer draft", async ({ page }) => {
  await page.goto("/use-cases/chat");
  const preview = page.locator("#preview");
  const composer = preview.getByRole("textbox", { name: "Message", exact: true });
  await composer.fill("Keep this unsent draft");
  await preview.getByRole("button", { name: "Edit", exact: true }).click();
  const editor = preview.getByRole("textbox", { name: "Edit message" });
  await editor.fill("An edited attachment question");
  await editor.press("Control+Enter");
  await expect(preview.locator('[data-slot="edit-value"]')).toHaveText("An edited attachment question");
  await expect(composer).toHaveText("Keep this unsent draft");
});

test("long drafts, flat layout, IME, empty messages and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 360, height: 640 });
  await openFixture(page, "flat&text=");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  const input = page.getByRole("textbox", { name: "Edit message" });
  const value = `${"Long plain-text message ".repeat(80)}\n`;
  await input.fill(value);
  await input.dispatchEvent("keydown", { key: "Enter", ctrlKey: true, isComposing: true });
  await input.dispatchEvent("keydown", { key: "Escape", isComposing: true });
  await expect(page.getByLabel("Save count")).toHaveText("0");
  await expect(input).toBeFocused();
  expect(await input.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await input.press("Control+Enter");
  await expect(page.getByRole("button", { name: "Edit", exact: true })).toBeFocused();
  expect(await page.getByLabel("Saved value").textContent()).toBe(value);
});
