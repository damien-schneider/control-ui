import { expect, test } from "@playwright/test";
import { THEME_AUDIT_CATEGORIES, THEME_AUDIT_PAIRS } from "../app/(features)/theme-accessibility/audit-contract";

test("theme accessibility page audits the active mode and filters issues", async ({ page }) => {
  await page.goto("/theme-accessibility");
  const audit = page.getByTestId("theme-accessibility-audit");
  await expect(audit.getByRole("row")).toHaveCount(THEME_AUDIT_PAIRS.length + THEME_AUDIT_CATEGORIES.length);

  await audit.getByRole("radio", { name: "Light" }).check({ force: true });
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  const bodyRow = audit.getByRole("row", { name: /Body text on background/ });
  const lightResult = await bodyRow.textContent();

  await audit.getByRole("radio", { name: "Dark" }).check({ force: true });
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect.poll(() => bodyRow.textContent()).not.toBe(lightResult);

  await audit.getByRole("button", { name: "Show issues only" }).click();
  await expect(audit.getByRole("button", { name: "Show all pairs" })).toBeVisible();
  const filteredRows = await audit.locator("tbody tr").count();
  expect(filteredRows).toBeGreaterThan(0);
  expect(filteredRows).toBeLessThan(THEME_AUDIT_PAIRS.length);
});

test("theme accessibility page audits the rendered active tab state", async ({ page }) => {
  await page.goto("/theme-accessibility");
  const audit = page.getByTestId("theme-accessibility-audit");
  const activeTabRow = audit.getByRole("row", { name: /Active tab on background/ });
  await expect(activeTabRow).toBeVisible();
  await page.locator("html").evaluate((element) => {
    element.style.setProperty("--foreground", "oklch(0.5 0 0)");
    element.style.setProperty("--background", "oklch(0.5 0 0)");
  });

  await expect(activeTabRow).toContainText("1.00:1");
  await expect(activeTabRow).toContainText("Fail");
});
