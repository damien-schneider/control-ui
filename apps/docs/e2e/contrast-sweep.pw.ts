import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { MODE_LOCKED_SKINS } from "../components/theme";
import { makePaintMeasurable, restorePaint } from "./contrast-paint";
import { applyTheme, MODES, openFirstSurface, portalPages, SKINS, settle } from "./theme-sweep";

const galleries = ["/components", "/kits"];

const contentPages = ["/overview", "/get-started", "/create-a-skin", "/architecture", "/lock-in"];

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
    // Sweeping every component preview across all skins and modes takes ~18 min on a 4-vCPU machine.
    test.setTimeout(1_800_000);
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
