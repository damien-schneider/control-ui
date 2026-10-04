import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

for (const { trigger, key, option, insertedText } of [
  { trigger: "@", key: "Shift+Digit2", option: "Sam Teammate", insertedText: "@Sam " },
  { trigger: "/", key: "/", option: "Translate To another language", insertedText: "Translate " },
]) {
  test(`typing ${trigger} keeps suggestions open and focus in the textarea until selection`, async ({ page }) => {
    await page.goto("/primitives/trigger-menu");
    const input = page.getByRole("textbox", { name: "Trigger menu demo" });
    await waitForReactHydration(input);
    await input.fill("");
    await input.press(key);
    await expect(input).toHaveValue(trigger);
    await expect(page.getByRole("listbox")).toBeVisible();
    await input.press("ArrowDown", { delay: 250 });
    await expect(input).toBeFocused();
    await expect(page.getByRole("option", { name: option })).toHaveAttribute("aria-selected", "true");
    await input.press("Enter");
    await expect(input).toHaveValue(insertedText);
    await expect(page.getByRole("listbox")).toBeHidden();
    await expect(input).toBeFocused();
  });
}

test("typing filters mentions, Escape dismisses them, and a changed query allows pointer selection", async ({ page }) => {
  await page.goto("/primitives/trigger-menu");
  const input = page.getByRole("textbox", { name: "Trigger menu demo" });
  await waitForReactHydration(input);
  await input.fill("");
  await input.pressSequentially("Hello @sa", { delay: 20 });
  await expect(input).toHaveValue("Hello @sa");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.getByRole("option", { name: "Sam Teammate" })).toBeVisible();
  await input.press("Escape", { delay: 250 });
  await expect(page.getByRole("listbox")).toBeHidden();
  await expect(input).toBeFocused();
  await input.press("m");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.getByRole("option", { name: "Sam Teammate" }).click();
  await expect(input).toHaveValue("Hello @Sam ");
  await expect(page.getByRole("listbox")).toBeHidden();
  await expect(input).toBeFocused();
});

test("an empty result lets Enter insert a newline and Tab leave the textarea", async ({ page }) => {
  await page.goto("/primitives/trigger-menu");
  const input = page.getByRole("textbox", { name: "Trigger menu demo" });
  await waitForReactHydration(input);
  const popup = page.locator('[data-control-ui="trigger-menu"][data-slot="root"]');
  await input.fill("@missing");
  await expect(popup).toBeVisible();
  await expect(popup.getByText("No matches", { exact: true })).toBeVisible();
  await expect(page.getByRole("option")).toHaveCount(0);
  await input.press("Enter");
  await expect(input).toHaveValue("@missing\n");
  await expect(popup).toBeHidden();
  await input.press("Backspace");
  await expect(popup).toBeVisible();
  await input.press("Tab");
  await expect(input).not.toBeFocused();
  await expect(popup).toBeHidden();
});
