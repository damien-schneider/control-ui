import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test('a control that declares data-focus-ring="none" on itself draws no ring, not even the browser default', async ({ page }) => {
  await page.goto("/components/input");
  const input = page.getByRole("textbox", { name: "Email", exact: true });
  await waitForReactHydration(input);

  await input.focus();
  await expect(input).toHaveCSS("outline-style", "solid");

  await input.blur();
  await input.evaluate((element) => element.setAttribute("data-focus-ring", "none"));
  await input.focus();
  expect(await input.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  await expect(input).toHaveCSS("outline-style", "none");
});
