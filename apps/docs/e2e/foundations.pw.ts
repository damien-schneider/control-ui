import { expect, test } from "@playwright/test";
import { THEME_CONTRACT } from "@/src/registry/lib/theme-contract";

test("foundations names every theme contract token", async ({ page }) => {
  await page.goto("/foundations");
  await expect(page.getByRole("heading", { name: "Ramps" })).toBeVisible();
  const namedTokens = await page.evaluate(() => {
    const main = document.querySelector("main") ?? document.body;
    const titles = [...main.querySelectorAll("[title]")].map((element) => element.getAttribute("title") ?? "");
    return [...`${main.innerText} ${titles.join(" ")}`.matchAll(/--[a-z0-9-]+/g)].map((match) => match[0]);
  });
  const named = new Set(namedTokens);
  expect(THEME_CONTRACT.map((token) => token.name).filter((name) => !named.has(name))).toEqual([]);
});
