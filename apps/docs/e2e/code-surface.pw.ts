import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
});

test("headerless copy stays clear of source and announces success", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/primitives/code-diff");
  const diff = page.locator('[data-control-ui="code-diff"][data-slot="root"]:not([data-header])').first();
  const copy = diff.getByRole("button", { name: "Copy code" });
  await expect(copy).toBeVisible();

  const overlapsSource = await diff.evaluate((element) => {
    const button = element.querySelector<HTMLButtonElement>('button[aria-label="Copy code"]');
    const code = element.querySelector("code");
    if (!button || !code) throw new Error("Headerless CodeDiff anatomy missing");
    const buttonRect = button.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(code);
    return [...range.getClientRects()].some(
      (rect) =>
        rect.left < buttonRect.right && rect.right > buttonRect.left && rect.top < buttonRect.bottom && rect.bottom > buttonRect.top,
    );
  });
  expect(overlapsSource).toBe(false);

  await expect(async () => {
    await diff.getByRole("button", { name: /^Copy/ }).click();
    await expect(diff.getByRole("button", { name: "Copied" })).toBeVisible({ timeout: 1_000 });
  }).toPass();
});

test("patch copy preserves the exact input instead of synthesizing partial source", async ({ page }) => {
  await page.goto("/primitives/code-diff");
  const expectedPatch = `diff --git a/src/utils.ts b/src/utils.ts
--- a/src/utils.ts
+++ b/src/utils.ts
@@ -1,3 +1,3 @@ export function slugify()
 export function slugify(input: string) {
-  return input.toLowerCase().replace(/\\s+/g, "-");
+  return input.trim().toLowerCase().replace(/\\s+/g, "-");
 }
`;
  const primaryPreview = page.locator('[data-control-ui="code-diff"][data-slot="root"][data-header="true"]');
  const patchDiff = primaryPreview.filter({ hasText: "src/utils.ts" }).first();

  await expect(async () => {
    await patchDiff.getByRole("button", { name: /^Copy/ }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(expectedPatch);
  }).toPass();
});

test("changed syntax keeps both Shiki color and diff emphasis", async ({ page }) => {
  await page.goto("/primitives/code-diff");
  const patchDiff = page.locator('[data-control-ui="code-diff"][data-slot="root"]').filter({ hasText: "src/utils.ts" }).first();
  const trim = patchDiff.locator('[data-line-type="add"] span').filter({ hasText: /^trim$/ });
  await expect(trim).toBeVisible();

  const colors = await trim.evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--code-token-function)";
    probe.style.backgroundColor = "var(--diff-add-emphasis)";
    element.parentElement?.append(probe);
    const actual = getComputedStyle(element);
    const expected = getComputedStyle(probe);
    const result = {
      actualColor: actual.color,
      expectedColor: expected.color,
      actualBackground: actual.backgroundColor,
      expectedBackground: expected.backgroundColor,
    };
    probe.remove();
    return result;
  });

  expect(colors.actualColor).toBe(colors.expectedColor);
  expect(colors.actualBackground).toBe(colors.expectedBackground);
});
