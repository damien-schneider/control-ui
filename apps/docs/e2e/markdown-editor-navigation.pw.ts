import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("Markdown editor restores its draft after search navigation and browser history", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.assign(window, { __REACT_GRAB_DISABLED__: true, __REACT_SCAN_DISABLED__: true });
  });
  await page.goto("/components/markdown-editor");
  await waitForReactHydration(page.getByRole("button", { name: "Search documentation", exact: true }));
  const editor = page.getByRole("textbox", { name: "Project description", exact: true });
  const preview = page.getByRole("region", { name: "Saved Markdown preview", exact: true });
  await expect(editor).toHaveAttribute("contenteditable", "true");
  let draft = "Preserve this draft";
  await editor.fill(draft);
  await expect(preview.getByText(draft, { exact: true })).toBeVisible();

  for (let round = 0; round < 2; round++) {
    await page.keyboard.press("ControlOrMeta+k");
    const dialog = page.getByRole("dialog", { name: "Search documentation", exact: true });
    await dialog.getByRole("combobox").fill("checkbox");
    await dialog
      .getByRole("option")
      .filter({ hasText: /^Checkbox/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/primitives\/checkbox$/);
    await expect(page.getByRole("heading", { name: "Checkbox", exact: true }).first()).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/components\/markdown-editor$/);
    await expect(editor).toHaveText(draft);
    await expect(page.getByText("This page stopped loading", { exact: true })).toHaveCount(0);
    await editor.press("End");
    await editor.pressSequentially("!");
    draft += "!";
    await expect(editor).toHaveText(draft);
    await expect(preview.getByText(draft, { exact: true })).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/primitives\/checkbox$/);
    await page.goBack();
    await expect(editor).toHaveText(draft);
  }
  expect(errors).toEqual([]);
});

test("saved Markdown task lists use library checkboxes without bullets or editable state", async ({ page }) => {
  await page.addInitScript(() => {
    Object.assign(window, { __REACT_GRAB_DISABLED__: true, __REACT_SCAN_DISABLED__: true });
  });
  await page.goto("/components/markdown-editor");
  const editor = page.getByRole("textbox", { name: "Project description", exact: true });
  await expect(editor).toHaveAttribute("contenteditable", "true");
  const preview = page.getByRole("region", { name: "Saved Markdown preview", exact: true });
  const done = preview.getByRole("checkbox", { name: "Describe the issue", exact: true });
  const pending = preview.getByRole("checkbox", { name: "Add a screenshot", exact: true });
  await expect(done).toBeChecked();
  await expect(pending).not.toBeChecked();
  await expect(done).toHaveAttribute("data-control-ui", "checkbox");
  await expect(done).toHaveAttribute("aria-readonly", "true");
  await expect(preview.locator("li").first()).toHaveCSS("list-style-type", "none");
  await pending.click();
  await pending.press("Space");
  await expect(pending).not.toBeChecked();
  await editor.getByRole("checkbox", { name: "Add a screenshot", exact: true }).click();
  await expect(pending).toBeChecked();
});
