import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test("autocomplete input group keeps its leading icon, filters while typing, and clears from the trailing addon", async ({ page }) => {
  await page.goto("/components/autocomplete");
  const input = page.getByRole("combobox", { name: "Search components", exact: true });
  const group = input.locator("..");
  await waitForReactHydration(input);
  await expect(group).toHaveAttribute("data-control-ui", "input-group");
  await expect(group.locator('[data-slot="addon"]').first().locator("svg")).toBeVisible();

  await input.fill("com");
  const options = page.getByRole("option");
  await expect(options).toHaveText(["Autocomplete", "Combobox", "Command"]);

  const clear = group.getByRole("button", { name: "Clear search", exact: true, includeHidden: true });
  await clear.click();
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
});
