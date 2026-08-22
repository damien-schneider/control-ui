import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { skinMetas } from "../app/(features)/catalog/skins";

const SKINS = skinMetas.map((skin) => skin.id);
const MODES = ["light", "dark"] as const;

const galleries = ["/primitives", "/ai"];

/** Portalled surfaces render outside their trigger's tree, so a gallery card never mounts them. */
const portalPages = [
  "/ai/context",
  "/ai/inline-citation",
  "/primitives/popover",
  "/primitives/dropdown-menu",
  "/primitives/dialog",
  "/primitives/tooltip",
  "/primitives/drawer",
  "/primitives/toast",
];

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

async function paint(page: Page, skin: string, mode: (typeof MODES)[number]) {
  await page.evaluate(
    ({ activeSkin, activeMode }) => {
      for (const scope of document.querySelectorAll("[data-skin]")) scope.setAttribute("data-skin", activeSkin);
      document.documentElement.classList.toggle("dark", activeMode === "dark");
    },
    { activeSkin: skin, activeMode: mode },
  );
}

async function contrastOffenders(page: Page, scope: string, label: string): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).withRules(["color-contrast"]).include(scope).analyze();
  return violations.flatMap((violation) =>
    violation.nodes.map((node) => `${label} ${node.target.join(" ")} — ${node.any[0]?.message ?? violation.help}`),
  );
}

async function sweep(page: Page, scope: string, route: string): Promise<string[]> {
  const offenders: string[] = [];
  for (const skin of SKINS) {
    for (const mode of MODES) {
      await paint(page, skin, mode);
      offenders.push(...(await contrastOffenders(page, scope, `${route} ${skin}/${mode}`)));
    }
  }
  return offenders;
}

async function openFirstSurface(page: Page): Promise<boolean> {
  const openSurfaces = () => page.locator("[data-surface]:visible").count();
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
    await highlightFirstItemPerList(page);
    const mounted = await cards.evaluateAll((nodes) =>
      nodes.flatMap((node, position) => (node.getAttribute("data-gallery-preview-state") === "mounted" ? [position] : [])),
    );
    for (const position of mounted) swept.add(position);
    for (const offender of await sweep(page, '[data-gallery-preview-state="mounted"] [data-control-family]', route))
      offenders.add(offender);
  }
  return [...offenders].sort();
}

for (const route of galleries) {
  test(`text inside every Control UI part clears WCAG AA on ${route} across skins and modes`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(await sweepGallery(page, route)).toEqual([]);
  });
}

test("text on portalled surfaces clears WCAG AA across skins and modes", async ({ page }) => {
  const offenders: string[] = [];
  for (const route of portalPages) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(await openFirstSurface(page), `${route} opened no portalled surface`).toBe(true);
    await highlightFirstItemPerList(page);
    offenders.push(...(await sweep(page, "[data-surface]", route)));
    await page.keyboard.press("Escape");
    await page.mouse.move(0, 0);
  }
  expect(offenders).toEqual([]);
});
