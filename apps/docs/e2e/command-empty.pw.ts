import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("command search announces no matches and restores keyboard choices", async ({ page }) => {
  await page.goto("/primitives/command");
  const preview = page.locator("#preview");
  const input = preview.getByRole("combobox");
  await waitForReactHydration(input);
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await input.fill("missing command");
  await expect(preview.getByRole("status")).toHaveText("No results found");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(preview.getByRole("listbox", { name: "Suggestions" })).toHaveCount(0);
  await input.fill("search");
  await expect(input).toHaveAttribute("aria-expanded", "true");
  const result = preview.getByRole("option", { name: "Search docs" });
  await expect(result).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(result).toHaveAttribute("aria-selected", "true");
  await expect(preview.getByRole("status")).toHaveText("1 result");
});
