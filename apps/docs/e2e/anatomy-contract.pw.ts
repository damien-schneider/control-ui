import { expect, test } from "@playwright/test";

type SkinContract = {
  scopes: Record<string, { parts: Record<string, unknown> }>;
};

test("rendered Control UI anatomy is covered by the generated contract", async ({ page }) => {
  await page.goto("/components/code-diff");

  const contract = await page.evaluate(async () => {
    const response = await fetch("/r/skin-contract.json");
    if (!response.ok) throw new Error(`Unable to load skin contract: ${response.status}`);
    const payload: SkinContract = await response.json();
    return payload;
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
