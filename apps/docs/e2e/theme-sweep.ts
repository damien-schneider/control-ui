import { expect, type Locator, type Page } from "@playwright/test";
import { skinMetas } from "../app/(features)/catalog/skins";

export const SKINS = skinMetas.map((skin) => skin.id);
export const MODES = ["light", "dark"] as const;
export type Mode = (typeof MODES)[number];

/** Portalled surfaces render outside their trigger's tree, so a gallery card never mounts them. */
export const portalPages = [
  "/kits/context",
  "/kits/inline-citation",
  "/components/popover",
  "/components/dropdown-menu",
  "/components/dialog",
  "/components/tooltip",
  "/components/drawer",
  "/components/toast",
];

/**
 * A skin change reflows the gallery, so cards entering the viewport margin mount and fetch their preview, and
 * colors run a transition from the previous paint. Measuring waits for the observers to fire, every mounted
 * preview to arrive, and each transition to jump to its end.
 */
export async function settle(page: Page) {
  await page.evaluate(() => {
    const { promise, resolve } = Promise.withResolvers<void>();
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve)));
    return promise;
  });
  await expect(page.locator('[data-gallery-preview-state="mounted"] [data-preview-loading]')).toHaveCount(0, { timeout: 60_000 });
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      if (animation instanceof CSSTransition) animation.finish();
    }
  });
}

/** The docs re-apply their own skin whenever the mode class changes, so the mode moves first and the skin is asserted after. */
export async function applyTheme(page: Page, skin: string, mode: Mode) {
  await page.evaluate((dark) => document.documentElement.classList.toggle("dark", dark), mode === "dark");
  await page.evaluate((activeSkin) => {
    for (const scope of document.querySelectorAll("[data-skin]")) scope.setAttribute("data-skin", activeSkin);
  }, skin);
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute("data-skin")), { timeout: 2_000 }).toBe(skin);
  await settle(page);
}

export async function openFirstSurface(page: Page): Promise<boolean> {
  // Portalled surfaces mount outside the page flow, so only a new one there proves a trigger opened a surface.
  const openSurfaces = () =>
    page.evaluate(
      () => [...document.querySelectorAll("[data-surface]")].filter((node) => !node.closest("main") && node.checkVisibility()).length,
    );
  const open = async (trigger: Locator) => {
    const before = await openSurfaces();
    const surfaced = () => expect.poll(openSurfaces, { timeout: 2_000 }).toBeGreaterThan(before);
    const succeeded = () => true;
    const failed = () => false;
    if (await trigger.hover({ timeout: 2_000 }).then(surfaced).then(succeeded, failed)) return true;
    return trigger.click({ timeout: 2_000 }).then(surfaced).then(succeeded, failed);
  };
  // A tooltip's or a toast's trigger is whatever the consumer wrapped, so the trigger slot alone misses it.
  for (const selector of ['main [data-slot="trigger"]', "main button"]) {
    const triggers = page.locator(selector);
    const total = Math.min(await triggers.count(), 6);
    for (let index = 0; index < total; index += 1) {
      if (await open(triggers.nth(index))) return true;
    }
  }
  return false;
}
