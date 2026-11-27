import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test('a control that declares data-focus-ring="none" on itself draws no ring, not even the browser default', async ({ page }) => {
  await page.goto("/components/button");
  const button = page.getByRole("tabpanel", { name: "Preview", exact: true }).getByRole("button", { name: "Solid", exact: true });
  await waitForReactHydration(button);

  await button.focus();
  expect(await button.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  await expect(button).not.toHaveCSS("outline-style", "none");

  await button.blur();
  await button.evaluate((element) => element.setAttribute("data-focus-ring", "none"));
  await button.focus();
  expect(await button.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  await expect(button).toHaveCSS("outline-style", "none");
});
