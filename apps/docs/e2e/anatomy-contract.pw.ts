import { expect, test } from "@playwright/test";

type SkinContract = {
  scopes: Record<string, { parts: Record<string, unknown> }>;
};

test("rendered Control UI anatomy is covered by the generated contract", async ({ page }) => {
  await page.goto("/primitives/code-diff");

  const contract = await page.evaluate(async () => {
    const response = await fetch("/r/skin-contract.json");
    if (!response.ok) throw new Error(`Unable to load skin contract: ${response.status}`);
    return (await response.json()) as SkinContract;
  });
  const renderedParts = await page.locator("[data-control-ui][data-slot]").evaluateAll((elements) =>
    elements.map((element) => ({
      scope: element.getAttribute("data-control-ui"),
      part: element.getAttribute("data-slot"),
    })),
  );

  await expect(page.locator("[data-ui], [data-component]")).toHaveCount(0);
  await expect(page.locator("[data-control-ui]:not([data-slot])")).toHaveCount(0);
  expect(renderedParts.length).toBeGreaterThan(0);
  const undocumented = renderedParts.filter(
    ({ scope, part }) => !scope || !part || !Object.hasOwn(contract.scopes[scope]?.parts ?? {}, part),
  );
  expect(undocumented).toEqual([]);
});

test("portalled floating and modal surfaces keep scoped anatomy and geometry", async ({ page }) => {
  await page.goto("/primitives/popover");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Dimensions", exact: true }).click();

  const floating = page.locator('[data-control-ui="popover"][data-slot="content"]');
  await expect(floating).toHaveAttribute("data-surface", "floating");
  await expect(floating).toBeVisible();
  expect(await floating.boundingBox()).toMatchObject({ width: expect.any(Number), height: expect.any(Number) });

  await page.goto("/primitives/dialog");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();

  const modal = page.locator('[data-control-ui="dialog"][data-slot="content"]');
  await expect(modal).toHaveAttribute("data-surface", "modal");
  await expect(modal).toBeVisible();
  const box = await modal.boundingBox();
  expect(box?.width).toBeGreaterThan(0);
  expect(box?.height).toBeGreaterThan(0);
});
