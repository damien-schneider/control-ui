import { expect, test } from "@playwright/test";
import { buildKnobReachabilityProbe } from "../scripts/knob-sentinels";

const probe = buildKnobReachabilityProbe();

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

async function collectOffenders(page: import("@playwright/test").Page): Promise<string[]> {
  return page.evaluate(({ expected, knobsByFamily }) => {
    const unreached = (element: Element, family: string, part: string): string[] => {
      const knobs = new Set([...(knobsByFamily[family]?.[""] ?? []), ...(knobsByFamily[family]?.[part] ?? [])]);
      const style = getComputedStyle(element);
      const identity = element.getAttribute("data-control-ui") ?? element.tagName.toLowerCase();
      const inline = element instanceof HTMLElement ? element.style : undefined;
      return [...knobs]
        .filter((knob) => !inline?.getPropertyValue(knob))
        .map((knob) => ({ knob, resolved: style.getPropertyValue(knob).trim() }))
        .filter(({ knob, resolved }) => resolved !== expected[knob])
        .map(({ knob, resolved }) => `${identity} ${family}/${part} ${knob} = ${resolved || "<unset>"}`);
    };

    return [...document.querySelectorAll("[data-control-family]")].flatMap((element) => {
      const family = element.getAttribute("data-control-family") ?? "";
      const part = element.getAttribute(`data-${family}-part`) ?? element.getAttribute("data-slot") ?? "";
      return unreached(element, family, part);
    });
  }, probe);
}

async function reValueEveryKnob(page: import("@playwright/test").Page) {
  await page.addStyleTag({ content: probe.css });
}

test("every knob a recipe paints reaches the part it paints in the catalog", async ({ page }) => {
  const offenders = new Set<string>();

  for (const gallery of galleries) {
    await page.goto(gallery);
    await page.waitForLoadState("networkidle");
    await reValueEveryKnob(page);

    const cards = page.locator("[data-gallery-preview]");
    const total = await cards.count();
    expect(total).toBeGreaterThan(0);
    for (let index = 0; index < total; index += 1) {
      await cards.nth(index).scrollIntoViewIfNeeded();
      await expect(cards.nth(index)).toHaveAttribute("data-gallery-preview-state", "mounted");
      for (const offender of await collectOffenders(page)) offenders.add(offender);
    }
  }

  expect([...offenders].sort()).toEqual([]);
});

test("every knob a recipe paints reaches the part it paints on a portalled surface", async ({ page }) => {
  const offenders = new Set<string>();

  for (const route of portalPages) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    await reValueEveryKnob(page);

    const openSurfaces = () => page.locator("[data-surface]:visible").count();
    let opened = 0;

    const open = async (trigger: import("@playwright/test").Locator) => {
      const before = await openSurfaces();
      const surfaced = () => expect.poll(openSurfaces, { timeout: 2_000 }).toBeGreaterThan(before);
      const succeeded = () => true;
      const failed = () => false;
      const hovered = await trigger.hover({ timeout: 2_000 }).then(surfaced).then(succeeded, failed);
      if (!(hovered || (await trigger.click({ timeout: 2_000 }).then(surfaced).then(succeeded, failed)))) return;
      opened += 1;
      for (const offender of await collectOffenders(page)) offenders.add(offender);
      await page.keyboard.press("Escape");
      await page.mouse.move(0, 0);
    };

    // A tooltip's or a toast's trigger is whatever the consumer wrapped, so the trigger slot alone misses it.
    for (const selector of ['main [data-slot="trigger"]', "main button"]) {
      const triggers = page.locator(selector);
      const total = Math.min(await triggers.count(), 6);
      for (let index = 0; index < total && opened < 2; index += 1) await open(triggers.nth(index));
      if (opened > 0) break;
    }
    expect(opened, `${route} opened no portalled surface`).toBeGreaterThan(0);
  }

  expect([...offenders].sort()).toEqual([]);
});
