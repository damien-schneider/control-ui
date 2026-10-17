import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.assign(window, { __REACT_GRAB_DISABLED__: true, __REACT_SCAN_DISABLED__: true });
  });
  await page.goto("/kits/markdown-editor");
  await waitForReactHydration(page.getByRole("button", { name: "Search documentation", exact: true }));
  await expect(page.getByRole("textbox", { name: "Project notes", exact: true })).toHaveAttribute("contenteditable", "true");
});

test("bubble menu formats the selected text and leaves when the selection collapses", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Project notes", exact: true });
  const bubble = page.getByRole("toolbar", { name: "Selection formatting", exact: true });
  await editor.scrollIntoViewIfNeeded();
  await expect(bubble).toHaveCount(0);
  await editor.locator("p", { hasText: "We need" }).dblclick();
  await expect(bubble).toBeVisible();
  await bubble.getByRole("button", { name: "Italic", exact: true }).click();
  await expect(editor.locator("em")).toHaveCount(1);
  await expect(bubble.getByRole("button", { name: "Italic", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(bubble).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await expect(bubble).toHaveCount(0);
});

test("bubble menu formats a select-all selection", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Project notes", exact: true });
  const bubble = page.getByRole("toolbar", { name: "Selection formatting", exact: true });
  await editor.scrollIntoViewIfNeeded();
  await editor.locator("blockquote p").click();
  await page.keyboard.press("ControlOrMeta+a");
  await bubble.getByRole("button", { name: "Strikethrough", exact: true }).click();
  await expect(editor.locator("h2 s")).toHaveText("Project feedback");
  await expect(editor.locator("blockquote s")).toHaveText("Keep the next step easy to find.");
});

test("bubble menu applies a link and returns to the editor with the selection kept", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Project notes", exact: true });
  const bubble = page.getByRole("toolbar", { name: "Selection formatting", exact: true });
  await editor.scrollIntoViewIfNeeded();
  await editor.locator("h2").click();
  await page.keyboard.press("End");
  await page.keyboard.press("Shift+Home");
  await bubble.getByRole("button", { name: "Edit link", exact: true }).click();
  await page.getByRole("textbox", { name: "URL", exact: true }).fill("https://example.com");
  await page.keyboard.press("Enter");
  await expect(editor.locator('a[href="https://example.com"]')).toHaveCount(1);
  await expect(editor).toBeFocused();
  await expect(bubble).toBeVisible();
});

test("bubble menu stays away from code blocks", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "Project notes", exact: true });
  const bubble = page.getByRole("toolbar", { name: "Selection formatting", exact: true });
  await editor.scrollIntoViewIfNeeded();
  await editor.locator("blockquote p").click();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.type("``` const answer = 42");
  await expect(editor.locator("pre")).toHaveText("const answer = 42");
  await editor.locator("pre").selectText();
  await expect.poll(() => page.evaluate(() => getSelection()?.toString())).toBe("const answer = 42");
  await page.waitForTimeout(400);
  await expect(bubble).toHaveCount(0);
});
