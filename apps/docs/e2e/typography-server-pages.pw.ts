import { expect, test } from "@playwright/test";

for (const [path, title] of [
  ["/reference", "Reference"],
  ["/skins/none", "No skin"],
]) {
  test(`typography renders on the server at ${path}`, async ({ page }) => {
    await page.addInitScript(() => {
      window.__REACT_SCAN_DISABLED__ = true;
      window.__REACT_GRAB_DISABLED__ = true;
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
