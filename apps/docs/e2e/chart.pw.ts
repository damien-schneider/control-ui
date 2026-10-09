import { expect, type Page, test } from "@playwright/test";

const CHART_ROOT = '[data-control-family="chart"][data-slot="root"]';
const AREA_PATH = ".cui-chart-area path";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__REACT_SCAN_DISABLED__ = true;
    window.__REACT_GRAB_DISABLED__ = true;
    const startsByPath = new WeakMap<EventTarget, number>();
    Reflect.set(window, "__chartRevealStarts", startsByPath);
    Reflect.set(window, "__chartRevealCount", 0);
    document.addEventListener(
      "animationstart",
      (event) => {
        if (event.animationName !== "cui-chart-reveal" || !event.target) return;
        startsByPath.set(event.target, (startsByPath.get(event.target) ?? 0) + 1);
        Reflect.set(window, "__chartRevealCount", Number(Reflect.get(window, "__chartRevealCount")) + 1);
      },
      true,
    );
  });
});

function chartAnimations(page: Page) {
  return page.evaluate(() =>
    document.getAnimations().flatMap((animation) => {
      const target = animation.effect instanceof KeyframeEffect ? animation.effect.target : null;
      if (!target?.closest('[data-control-family="chart"][data-slot="plot"]')) return [];
      return [animation instanceof CSSTransition ? `transition:${animation.transitionProperty}` : animation.constructor.name];
    }),
  );
}

async function openSettledChartPage(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/primitives/chart");
  await page.waitForLoadState("networkidle");
  const areaPath = page.locator(AREA_PATH).first();
  await expect(areaPath).toBeAttached();
  await expect.poll(() => chartAnimations(page)).toEqual([]);
  return areaPath;
}

function revealStarts(page: Page) {
  return page.evaluate((selector) => {
    const starts: WeakMap<EventTarget, number> = Reflect.get(window, "__chartRevealStarts");
    return [...document.querySelectorAll(selector)].map((path) => starts.get(path) ?? 0);
  }, AREA_PATH);
}

test("bridges the Control UI palette into TanStack Charts", async ({ page }) => {
  await openSettledChartPage(page);
  const colors = await page
    .locator(CHART_ROOT)
    .first()
    .evaluate((root) => {
      const style = getComputedStyle(root);
      return [style.getPropertyValue("--ts-chart-1").trim(), style.getPropertyValue("--chart-blue").trim()];
    });
  expect(colors[0]).not.toBe("");
  expect(colors[0]).toBe(colors[1]);
});

test("reveals each area once and morphs the same paths when data changes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openSettledChartPage(page);
  const starts = await revealStarts(page);
  expect(starts.length).toBeGreaterThan(0);
  expect(new Set(starts)).toEqual(new Set([1]));

  await page.evaluate((selector) => {
    Reflect.set(window, "__chartPaths", [...document.querySelectorAll(selector)]);
  }, AREA_PATH);
  await page.getByRole("button", { name: "Next period" }).click();
  await expect.poll(async () => (await chartAnimations(page)).includes("transition:d")).toBe(true);
  const sameNodes = await page.evaluate((selector) => {
    const before: Element[] = Reflect.get(window, "__chartPaths");
    const after = [...document.querySelectorAll(selector)];
    return before.length === after.length && before.every((path, index) => path === after[index]);
  }, AREA_PATH);
  expect(sameNodes).toBe(true);
  expect(new Set(await revealStarts(page))).toEqual(new Set([1]));
});

test("reads paint from the chart knobs", async ({ page }) => {
  const areaPath = await openSettledChartPage(page);
  await page.addStyleTag({ content: `${CHART_ROOT} { --cui-chart-area-opacity: 0.5 }` });
  await expect.poll(() => areaPath.evaluate((path) => getComputedStyle(path).fillOpacity)).toBe("0.5");
});

test("hovering inside one area lists every series at that x, in series order", async ({ page }) => {
  await openSettledChartPage(page);
  const plot = page.locator('[data-control-family="chart"][data-slot="plot"]').first();
  const box = await plot.boundingBox();
  if (!box) throw new Error("The first chart plot has no layout box");
  await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.5);
  const rows = page.locator('[data-control-family="chart"][data-slot="tooltip-row"]');
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText("Desktop");
  await expect(rows.nth(1)).toContainText("Mobile");
  await expect(rows.nth(2)).toContainText("Tablet");
});

test("hatches forecast areas with a fading pattern", async ({ page }) => {
  await openSettledChartPage(page);
  const hatchedPath = page.locator("#example-hatched .cui-chart-area-hatched path").first();
  await expect(hatchedPath).toBeAttached();
  const paint = await hatchedPath.evaluate((path) => {
    const style = getComputedStyle(path);
    return { fill: style.fill, mask: style.mask || style.maskImage };
  });
  expect(paint.fill).toMatch(/^url\("#[\w-]+-hatch-[a-z]+"\)$/);
  expect(paint.mask).toMatch(/url\("#[\w-]+-fade"\)/);
});

test("skips every chart animation under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openSettledChartPage(page);
  expect(await page.evaluate(() => Reflect.get(window, "__chartRevealCount"))).toBe(0);
  await page.getByRole("button", { name: "Next period" }).click();
  await page.waitForTimeout(100);
  expect(await chartAnimations(page)).toEqual([]);
});

test("resizes without morphing paths", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const areaPath = await openSettledChartPage(page);
  const before = await areaPath.getAttribute("d");
  await page.setViewportSize({ width: 900, height: 900 });
  const transitions = new Set<string>();
  const collectTransitions = async () => {
    for (const name of await chartAnimations(page)) transitions.add(name);
    return areaPath.getAttribute("d");
  };
  await expect.poll(collectTransitions, { intervals: [25] }).not.toBe(before);
  for (let sample = 0; sample < 6; sample += 1) {
    await collectTransitions();
    await page.waitForTimeout(50);
  }
  expect([...transitions].filter((name) => name.startsWith("transition:"))).toEqual([]);
});

test("grows negative bars from the zero line with their gradient flipped", async ({ page }) => {
  await openSettledChartPage(page);
  const bars = page.locator("#example-bar .cui-chart-bar-y path");
  await expect(bars.first()).toBeAttached();
  const negativeBars = await page
    .locator("#example-bar .cui-chart-bar-y .cui-chart-bar-negative")
    .evaluateAll((paths) =>
      paths.map((path) => ({ fill: path.getAttribute("fill") ?? "", origin: getComputedStyle(path).transformOrigin })),
    );
  expect(negativeBars).toHaveLength(2);
  for (const bar of negativeBars) {
    expect(bar.fill).toMatch(/bar-y-negative/);
    expect(bar.origin.split(" ")[1]).toBe("0px");
  }
  const positiveFills = await bars.evaluateAll((paths) =>
    paths.filter((path) => !path.classList.contains("cui-chart-bar-negative")).map((path) => path.getAttribute("fill") ?? ""),
  );
  expect(positiveFills.length).toBeGreaterThan(0);
  expect(positiveFills.some((fill) => fill.includes("negative"))).toBe(false);
});
