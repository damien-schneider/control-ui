import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { skinMetas } from "../app/(features)/catalog/skins";
import { MODE_LOCKED_SKINS } from "../components/theme";
import { makePaintMeasurable, restorePaint } from "./contrast-paint";

const SKINS = skinMetas.map((skin) => skin.id);
const MODES = ["light", "dark"] as const;

const galleries = ["/components", "/kits"];

const contentPages = ["/overview", "/get-started", "/create-a-skin", "/architecture", "/lock-in"];

/** Portalled surfaces render outside their trigger's tree, so a gallery card never mounts them. */
const portalPages = [
  "/kits/context",
  "/kits/inline-citation",
  "/components/popover",
  "/components/dropdown-menu",
  "/components/dialog",
  "/components/tooltip",
  "/components/drawer",
  "/components/toast",
];

/** axe reports these instead of a ratio; only glyphless text is safe to skip, the rest is unmeasured paint. */
const MEASURABLE_TEXT_EXEMPTIONS = ["Element content contains only non-text characters"];

/** Recipes key the highlight state on a presence attribute, so stamping it shows the hover paint axe cannot hover into. */
async function highlightFirstItemPerList(page: Page) {
  await page.evaluate(() => {
    const lists = new Set<Element>();
    for (const item of document.querySelectorAll('[data-popup-part="item"]')) {
      const list = item.parentElement;
      if (!list || lists.has(list)) continue;
      lists.add(list);
      item.setAttribute("data-highlighted", "");
    }
  });
}

/**
 * A skin change reflows the gallery, so cards entering the viewport margin mount and fetch their preview, and
 * colors run a transition from the previous paint. Measuring waits for the observers to fire, every mounted
 * preview to arrive, and each transition to jump to its end.
 */
async function settle(page: Page) {
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
async function applyTheme(page: Page, skin: string, mode: (typeof MODES)[number]) {
  await page.evaluate((dark) => document.documentElement.classList.toggle("dark", dark), mode === "dark");
  await page.evaluate((activeSkin) => {
    for (const scope of document.querySelectorAll("[data-skin]")) scope.setAttribute("data-skin", activeSkin);
  }, skin);
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute("data-skin")), { timeout: 2_000 }).toBe(skin);
  await settle(page);
}

async function contrastOffenders(page: Page, label: string): Promise<string[]> {
  const { violations, incomplete } = await new AxeBuilder({ page })
    .withRules(["color-contrast"])
    .exclude("[data-reflet-widget]")
    .exclude("[data-under-surface]")
    .analyze();
  const offenders = violations.flatMap((violation) =>
    violation.nodes.map((node) => `${label} ${node.target.join(" ")} — ${node.any[0]?.message ?? violation.help}`),
  );
  const unmeasured = incomplete.flatMap((entry) =>
    entry.nodes.flatMap((node) => {
      const reason = node.any[0]?.message ?? node.none[0]?.message ?? "axe returned no reason";
      if (MEASURABLE_TEXT_EXEMPTIONS.some((exemption) => reason.startsWith(exemption))) return [];
      return [`${label} ${node.target.join(" ")} — unrated: ${reason}`];
    }),
  );
  return [...offenders, ...unmeasured];
}

async function sweep(page: Page, route: string): Promise<string[]> {
  const offenders: string[] = [];
  for (const skin of SKINS) {
    const lockedMode = MODE_LOCKED_SKINS[skin];
    const modes = lockedMode ? [lockedMode] : MODES;
    for (const mode of modes) {
      await applyTheme(page, skin, mode);
      await makePaintMeasurable(page);
      offenders.push(...(await contrastOffenders(page, `${route} ${skin}/${mode}`)));
      await restorePaint(page);
    }
  }
  return offenders;
}

async function openFirstSurface(page: Page): Promise<boolean> {
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

/** Cards mount only while near the viewport, so each scroll window is swept before moving on. */
async function sweepGallery(page: Page, route: string): Promise<string[]> {
  const cards = page.locator("[data-gallery-preview]");
  const total = await cards.count();
  expect(total).toBeGreaterThan(0);
  const offenders = new Set<string>();
  const swept = new Set<number>();
  for (let index = 0; index < total; index += 1) {
    if (swept.has(index)) continue;
    await cards.nth(index).scrollIntoViewIfNeeded();
    await expect(cards.nth(index)).toHaveAttribute("data-gallery-preview-state", "mounted");
    await settle(page);
    await highlightFirstItemPerList(page);
    const mounted = await cards.evaluateAll((nodes) =>
      nodes.flatMap((node, position) => (node.getAttribute("data-gallery-preview-state") === "mounted" ? [position] : [])),
    );
    for (const position of mounted) swept.add(position);
    for (const offender of await sweep(page, route)) offenders.add(offender);
  }
  return [...offenders].sort();
}

for (const route of galleries) {
  test(`text clears WCAG AA on ${route} across skins and modes`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(await sweepGallery(page, route)).toEqual([]);
  });
}

test("text clears WCAG AA on guide pages across skins and modes", async ({ page }) => {
  const offenders: string[] = [];
  for (const route of contentPages) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    offenders.push(...(await sweep(page, route)));
  }
  expect(offenders).toEqual([]);
});

test("text on portalled surfaces clears WCAG AA across skins and modes", async ({ page }) => {
  const offenders: string[] = [];
  for (const route of portalPages) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(await openFirstSurface(page), `${route} opened no portalled surface`).toBe(true);
    await highlightFirstItemPerList(page);
    offenders.push(...(await sweep(page, route)));
    await page.keyboard.press("Escape");
    await page.mouse.move(0, 0);
  }
  expect(offenders).toEqual([]);
});
