import { expect, type Page, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

async function openReveal(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/reveal");
  const scopes = page.locator("main [data-control-family='reveal'][data-slot='scope']");
  const row = scopes.filter({ hasText: "Quarterly report.pdf" });
  await waitForReactHydration(row);
  return { scopes, row, actions: row.locator("[data-slot='content']") };
}

test("reveal content shows on hover, keyboard focus, and while its menu is open, without moving", async ({ page }) => {
  const { scopes, row, actions } = await openReveal(page);
  const sibling = scopes.filter({ hasText: "Launch notes.md" }).locator("[data-slot='content']");
  await page.mouse.move(0, 0);
  await expect(actions).toHaveCSS("opacity", "0");
  const hiddenBox = await actions.boundingBox();

  await row.hover();
  await expect(actions).toHaveCSS("opacity", "1");
  await expect(sibling).toHaveCSS("opacity", "0");
  expect(await actions.boundingBox()).toEqual(hiddenBox);
  await page.mouse.move(0, 0);
  await expect(actions).toHaveCSS("opacity", "0");

  await page.getByRole("button", { name: "Rename Quarterly report.pdf" }).focus();
  await expect(actions).toHaveCSS("opacity", "1");

  await page.getByRole("button", { name: "Quarterly report.pdf actions" }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(actions).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
});

test("nested reveal content follows its nearest scope", async ({ page }) => {
  await openReveal(page);
  await page.evaluate(() => {
    const anatomy = (slot: string, tag: string, text: string) => {
      const element = document.createElement(tag);
      element.dataset.controlFamily = "reveal";
      element.dataset.slot = slot;
      element.id = text;
      element.textContent = text;
      return element;
    };
    const outer = anatomy("scope", "div", "outer-scope");
    const inner = anatomy("scope", "div", "inner-scope");
    inner.append(anatomy("content", "span", "inner-content"));
    outer.append(anatomy("content", "span", "outer-content"), inner);
    outer.style.cssText = "position: fixed; inset-block-start: 40%; inset-inline-start: 40%; z-index: 2147483647";
    document.body.append(outer);
  });
  const outerContent = page.locator("#outer-content");
  const innerContent = page.locator("#inner-content");

  await page.mouse.move(0, 0);
  await expect(outerContent).toHaveCSS("opacity", "0");
  await expect(innerContent).toHaveCSS("opacity", "0");

  await outerContent.hover({ force: true });
  await expect(outerContent).toHaveCSS("opacity", "1");
  await expect(innerContent).toHaveCSS("opacity", "0");

  await innerContent.hover({ force: true });
  await expect(innerContent).toHaveCSS("opacity", "1");
  await expect(outerContent).toHaveCSS("opacity", "1");
});

test.describe("on a touch screen", () => {
  test.use({ hasTouch: true, isMobile: true });

  test("reveal content stays visible", async ({ page }) => {
    const { actions } = await openReveal(page);
    await expect(actions).toHaveCSS("opacity", "1");
  });
});
