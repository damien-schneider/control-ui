import { expect, type Locator, type Page, test } from "@playwright/test";
import { buildKnobReachabilityProbe } from "../scripts/knob-sentinels";
import { waitForReactHydration } from "./browser-test-helpers";

const probe = buildKnobReachabilityProbe();

const galleries = ["/components", "/kits"];

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

/**
 * The probe keys knobs by family and slot, so a layout wrapper shares an anatomy with the control it holds. A part
 * the recipe never values (the knob still resolves its `@property` initial value without the probe) is no paint site.
 * The docs shell tunes knobs on its own chrome, so each check reads only the surface it is about.
 */
async function collectOffenders(page: Page, surface: string): Promise<string[]> {
  return page.evaluate(
    ({ expected, knobsByFamily, surface: surfaceSelector }) => {
      const probeStyle = document.querySelector("style[data-knob-probe]");
      if (!(probeStyle instanceof HTMLStyleElement)) throw new Error("The knob probe stylesheet is missing");
      const unvalued = document.createElement("div");
      document.documentElement.append(unvalued);
      const initialStyle = getComputedStyle(unvalued);

      const painted = `:is(${surfaceSelector}) [data-control-family], [data-control-family]:is(${surfaceSelector})`;
      const parts = [...document.querySelectorAll(painted)].map((element) => {
        const family = element.getAttribute("data-control-family") ?? "";
        const part = element.getAttribute(`data-${family}-part`) ?? element.getAttribute("data-slot") ?? "";
        const inline = element instanceof HTMLElement ? element.style : undefined;
        const knobs = [...new Set([...(knobsByFamily[family]?.[""] ?? []), ...(knobsByFamily[family]?.[part] ?? [])])].filter(
          (knob) => !inline?.getPropertyValue(knob),
        );
        return { element, family, part, knobs };
      });

      probeStyle.disabled = true;
      const valuedByRecipe = parts.map(({ element, knobs }) => {
        const style = getComputedStyle(element);
        return new Set(knobs.filter((knob) => style.getPropertyValue(knob) !== initialStyle.getPropertyValue(knob)));
      });
      probeStyle.disabled = false;
      unvalued.remove();

      return parts.flatMap(({ element, family, part, knobs }, index) => {
        const style = getComputedStyle(element);
        const identity = element.getAttribute("data-control-ui") ?? element.tagName.toLowerCase();
        return knobs
          .filter((knob) => valuedByRecipe[index].has(knob))
          .map((knob) => ({ knob, resolved: style.getPropertyValue(knob).trim() }))
          .filter(({ knob, resolved }) => resolved !== expected[knob])
          .map(({ knob, resolved }) => `${identity} ${family}/${part} ${knob} = ${resolved || "<unset>"}`);
      });
    },
    { ...probe, surface },
  );
}

async function reValueEveryKnob(page: Page) {
  await page.evaluate((css) => {
    const probeStyle = document.createElement("style");
    probeStyle.dataset.knobProbe = "";
    probeStyle.textContent = css;
    document.head.append(probeStyle);
  }, probe.css);
}

test("every knob a recipe paints reaches the part it paints in the catalog", async ({ page }) => {
  const offenders = new Set<string>();

  for (const gallery of galleries) {
    await page.goto(gallery);
    await waitForReactHydration(page.locator("[data-gallery-preview]").first());
    await reValueEveryKnob(page);

    const cards = page.locator("[data-gallery-preview]");
    const total = await cards.count();
    expect(total).toBeGreaterThan(0);
    for (let index = 0; index < total; index += 1) {
      await cards.nth(index).scrollIntoViewIfNeeded();
      await expect(cards.nth(index)).toHaveAttribute("data-gallery-preview-state", "mounted");
      for (const offender of await collectOffenders(page, "[data-gallery-preview]")) offenders.add(offender);
    }
  }

  expect([...offenders].sort()).toEqual([]);
});

test("every knob a recipe paints reaches the part it paints on a portalled surface", async ({ page }) => {
  // Each page may try a dozen candidate triggers, each spending up to 2s hovering and 2s clicking.
  test.setTimeout(portalPages.length * 30_000);
  const offenders = new Set<string>();

  for (const route of portalPages) {
    await page.goto(route);
    await waitForReactHydration(page.locator("main button").first());
    await reValueEveryKnob(page);

    const openSurfaces = () => page.locator("[data-surface]:visible").count();
    let opened = 0;

    const open = async (trigger: Locator) => {
      const before = await openSurfaces();
      const surfaced = () => expect.poll(openSurfaces, { timeout: 2_000 }).toBeGreaterThan(before);
      const succeeded = () => true;
      const failed = () => false;
      const hovered = await trigger.hover({ timeout: 2_000 }).then(surfaced).then(succeeded, failed);
      if (!(hovered || (await trigger.click({ timeout: 2_000 }).then(surfaced).then(succeeded, failed)))) return;
      opened += 1;
      for (const offender of await collectOffenders(page, "[data-surface]")) offenders.add(offender);
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
