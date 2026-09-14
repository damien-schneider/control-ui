import { expect, test } from "@playwright/test";

test("command search announces no matches and restores keyboard choices", async ({ page }) => {
  await page.goto("/primitives/command");
  const input = page.getByPlaceholder("Type a command or search...");
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await input.fill("missing command");
  await expect(page.getByRole("status")).toHaveText("No results found.");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("listbox", { name: "Suggestions" })).toHaveCount(0);
  await input.fill("search");
  await expect(input).toHaveAttribute("aria-expanded", "true");
  const result = page.getByRole("option", { name: "Search docs" });
  await expect(result).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(result).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("status")).toHaveCount(0);
});
