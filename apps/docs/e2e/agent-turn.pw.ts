import { type Browser, type BrowserType, test as base, chromium, expect, type Locator, type Page, webkit } from "@playwright/test";
import { serveFixture } from "./fixtures/serve-fixture";

const SLOW_SWAP = '[data-control-family="swap"][data-slot="root"] { --cui-swap-animation-duration: 1600ms; }';

async function open(page: Page, style = "") {
  await page.setViewportSize({ width: 900, height: 800 });
  await serveFixture(page, "agent-turn", { skin: "refined", style });
  await expect(run(page).trigger).toBeVisible();
}

function run(page: Page) {
  const trigger = page.getByRole("button", { name: "Run" });
  return {
    trigger,
    title: trigger.locator('[data-control-family="activity"][data-slot="title"]'),
    swap: trigger.locator('[data-control-family="swap"][data-slot="root"]'),
    label: (text: string) => trigger.locator('[data-control-family="swap"][data-slot="label"]', { hasText: text }),
    words: (text: string) => trigger.locator('[data-control-family="swap"][data-slot="text"]', { hasText: text }),
    next: page.getByRole("button", { name: "Next step" }),
    finish: page.getByRole("button", { name: "Finish" }),
  };
}

async function box(locator: Locator) {
  const found = await locator.boundingBox();
  if (!found) throw new Error("Element has no box");
  return found;
}

async function settle(page: Page) {
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((animation) => animation.playState !== "running" || animation.effect?.getTiming().iterations === Number.POSITIVE_INFINITY),
  );
  await page.evaluate(() => new Promise(requestAnimationFrame));
}

function runningAnimations(locator: Locator) {
  return locator.evaluate((element) =>
    element
      .getAnimations()
      .filter((animation) => animation.playState === "running")
      .map((animation) => (animation instanceof CSSAnimation ? animation.animationName : "")),
  );
}

function inEngine(engine: BrowserType) {
  return base.extend<object, { engineBrowser: Browser }>({
    engineBrowser: [
      async ({ playwright: _playwright }, use) => {
        const browser = await engine.launch();
        await use(browser);
        await browser.close();
      },
      { scope: "worker" },
    ],
    page: async ({ engineBrowser, reducedMotion }, use) => {
      const context = await engineBrowser.newContext({ reducedMotion, colorScheme: "light" });
      await use(await context.newPage());
      await context.close();
    },
  });
}

for (const engine of [chromium, webkit]) {
  const test = inEngine(engine);

  test.describe(`agent turn in ${engine.name()}`, () => {
    test.use({ reducedMotion: "no-preference" });

    test("a running step's title rolls into the next one: the old words rise out, the new rise in", async ({ page }) => {
      await open(page, SLOW_SWAP);
      const { next, label } = run(page);
      await next.click();
      await expect(label("Reading notes.md")).toHaveCount(1);
      expect(await runningAnimations(label("Reading notes.md"))).toContain("cui-swap-label-exit");
      expect(await runningAnimations(label("Searching the web"))).toContain("cui-swap-label-enter");
      await settle(page);
      await expect(run(page).trigger).toHaveAccessibleName("Run");
      await expect(page.getByText("Searching the web", { exact: false }).first()).toBeVisible();
    });

    test("the title's width glides between steps instead of jumping", async ({ page }) => {
      await open(page, SLOW_SWAP);
      const { next, swap } = run(page);
      const before = (await box(swap)).width;
      await next.click();
      const widths = await swap.evaluate(
        (element) =>
          new Promise<number[]>((resolve) => {
            const seen: number[] = [];
            const started = performance.now();
            const sample = () => {
              seen.push(element.getBoundingClientRect().width);
              if (performance.now() - started < 600) requestAnimationFrame(sample);
              else resolve(seen);
            };
            requestAnimationFrame(sample);
          }),
      );
      await settle(page);
      const after = (await box(swap)).width;
      expect(after).toBeGreaterThan(before + 40);
      expect(widths.some((width) => width > before + 1 && width < after - 1)).toBe(true);
    });

    test("a step too long for the row ends in an ellipsis inside it", async ({ page }) => {
      await open(page);
      const { next, trigger, label } = run(page);
      await next.click();
      await settle(page);
      const [triggerBox, labelBox] = await Promise.all([box(trigger), box(label("Searching the web"))]);
      expect(labelBox.x + labelBox.width).toBeLessThanOrEqual(triggerBox.x + triggerBox.width);
      await expect(label("Searching the web")).toHaveCSS("text-overflow", "ellipsis");
      expect(await label("Searching the web").evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
    });

    test("a running title shimmers and stops once the run settles", async ({ page }) => {
      await open(page);
      const { finish, words } = run(page);
      await expect(words("Reading notes.md")).toHaveCSS("animation-name", "cui-shimmer");
      await finish.click();
      await settle(page);
      await expect(words("Worked for 12s")).not.toHaveCSS("animation-name", "cui-shimmer");
    });

    test("only the latest answer keeps its actions and run details showing at rest", async ({ page }) => {
      await open(page);
      const earlier = page.getByRole("toolbar", { name: "Earlier answer actions" });
      const latest = page.getByRole("toolbar", { name: "Latest answer actions" });
      await page.mouse.move(890, 790);
      await expect(earlier).toHaveCSS("opacity", "0");
      await expect(latest).toHaveCSS("opacity", "1");
      await expect(latest.getByText("Opus · High · 12s")).toBeVisible();
      await page.getByText("Earlier answer text.").hover();
      await expect(earlier).toHaveCSS("opacity", "1");
    });

    test("run details read as quiet metadata beside the actions", async ({ page }) => {
      await open(page);
      const latest = page.getByRole("toolbar", { name: "Latest answer actions" });
      const meta = latest.getByText("Opus · High · 12s");
      const [copyBox, metaBox] = await Promise.all([box(latest.getByRole("button", { name: "Copy" })), box(meta)]);
      expect(Math.abs(copyBox.y + copyBox.height / 2 - (metaBox.y + metaBox.height / 2))).toBeLessThanOrEqual(1);
      const [metaColor, mutedColor, numbers] = await meta.evaluate((element) => {
        const probe = document.createElement("span");
        probe.style.color = "var(--muted-foreground)";
        element.append(probe);
        const muted = getComputedStyle(probe).color;
        probe.remove();
        const style = getComputedStyle(element);
        return [style.color, muted, style.fontVariantNumeric];
      });
      expect(metaColor).toBe(mutedColor);
      expect(numbers).toContain("tabular-nums");
    });
  });

  test.describe(`agent turn under reduced motion in ${engine.name()}`, () => {
    test.use({ reducedMotion: "reduce" });

    test("steps swap at once", async ({ page }) => {
      await open(page);
      const { next, label } = run(page);
      await next.click();
      await expect
        .poll(() => label("Searching the web").evaluate((element) => Number.parseFloat(getComputedStyle(element).animationDuration)))
        .toBeLessThan(0.01);
      await expect(label("Searching the web")).toBeVisible();
    });
  });
}
