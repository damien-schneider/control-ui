import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";

const buildDirectory = mkdtempSync(path.join(tmpdir(), "control-ui-tabs-"));
const theme = readFileSync(path.resolve("src/registry/sources/control-ui/theme.css"), "utf8");
const tabsRecipe = readFileSync(path.resolve("src/registry/sources/control-ui/recipes/tabs.css"), "utf8");
let script: string;
let stylesheet: string;

test.beforeAll(async () => {
  execFileSync("bun", ["build", "e2e/fixtures/tabs-transition.tsx", "--outdir", buildDirectory, "--target", "browser"]);
  script = readFileSync(path.join(buildDirectory, "tabs-transition.js"), "utf8");
  const result = await postcss([tailwind()]).process(
    `@import "tailwindcss"; @source "../src/registry/sources/control-ui/ui/tabs.tsx"; @source "./fixtures/tabs-transition.tsx"; ${theme}\n${tabsRecipe}`,
    { from: path.resolve("e2e/tabs-transition.css") },
  );
  stylesheet = result.css;
});

test.afterAll(() => rmSync(buildDirectory, { recursive: true, force: true }));

test.beforeEach(async ({ page }) => {
  await page.route("http://tabs.test/**", (route) => {
    if (new URL(route.request().url()).pathname === "/fixture.js") {
      return route.fulfill({ contentType: "application/javascript", body: script });
    }
    return route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
        ${stylesheet}
        * { box-sizing: border-box; }
        :root { --spacing: 4px; --control-h-sm: 36px; }
        body { margin: 0; font-family: system-ui; background: var(--background); color: var(--foreground); }
        main { width: min(100% - 48px, 960px); margin: 40px auto; }
        button { border: 0; background: none; font: inherit; }
        article, .generate { border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .generate { padding-block: 80px; text-align: center; }
      </style></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`,
    });
  });
  await page.goto("http://tabs.test/");
  await expect(page.getByRole("tabpanel", { name: "Releases" })).toBeVisible();
});

type PanelBounds = Pick<DOMRect, "x" | "y" | "width" | "height">;

type PanelTransitionFrame = {
  incoming: PanelBounds;
  outgoing: PanelBounds | null;
  direction: string | null;
  paintedPanels: number;
};

type PanelTransitionCapture = {
  initial: PanelBounds;
  frames: PanelTransitionFrame[];
  slideStartTimes: number[];
  heightStart: number;
  supportsHeightMorph: boolean;
};

async function captureTransition(trigger: HTMLElement): Promise<PanelTransitionCapture> {
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
  const root = trigger.closest('[data-slot="root"]') ?? trigger.closest("main")?.querySelector('[data-slot="root"]');
  if (!root) throw new Error("Tabs root is missing");
  const previousPanel = root.querySelector('[data-slot="panel"]:not([inert])');
  if (!(previousPanel instanceof HTMLElement)) throw new Error("Active panel is missing");
  const previousBounds = previousPanel.getBoundingClientRect();
  const rootBounds = root.getBoundingClientRect();
  const initial = {
    x: rootBounds.x + previousPanel.offsetLeft,
    y: rootBounds.y + previousPanel.offsetTop,
    width: previousBounds.width,
    height: previousBounds.height,
  };
  trigger.click();
  let animations = root.getAnimations({ subtree: true });
  let panelSlides = animations.filter((animation) => animation instanceof CSSTransition && animation.transitionProperty === "translate");
  for (let frame = 0; frame < 10; frame += 1) {
    await new Promise(requestAnimationFrame);
    animations = root.getAnimations({ subtree: true });
    panelSlides = animations.filter((animation) => animation instanceof CSSTransition && animation.transitionProperty === "translate");
    if (panelSlides.length === 2 && panelSlides.every((animation) => animation.startTime !== null)) break;
  }
  const heightAnimation = animations.find((animation) => animation instanceof CSSTransition && animation.transitionProperty === "height");
  const heightEffect = heightAnimation?.effect;
  const heightStart = heightEffect instanceof KeyframeEffect ? heightEffect.getKeyframes()[0]?.height : undefined;
  const slideStartTimes = panelSlides.map((animation) => Number(animation.startTime));
  const measureFrame = () => {
    const incoming = root.querySelector('[data-slot="panel"]:not([inert])');
    if (!incoming) throw new Error("Incoming panel is missing");
    const outgoing = root.querySelector('[data-slot="panel"][inert][data-ending-style][data-slide-exiting]');
    const incomingBounds = incoming.getBoundingClientRect();
    const outgoingBounds = outgoing?.getBoundingClientRect();
    return {
      incoming: { x: incomingBounds.x, y: incomingBounds.y, width: incomingBounds.width, height: incomingBounds.height },
      outgoing: outgoingBounds?.width
        ? { x: outgoingBounds.x, y: outgoingBounds.y, width: outgoingBounds.width, height: outgoingBounds.height }
        : null,
      direction: incoming.getAttribute("data-activation-direction"),
      paintedPanels: [...root.querySelectorAll('[data-slot="panel"]')].filter((panel) => panel.getBoundingClientRect().width > 0).length,
    };
  };
  const frames = [0.1, 0.5, 0.9].map((progress) => {
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getTiming().duration) * progress;
    }
    return measureFrame();
  });
  for (const animation of animations) animation.finish();
  for (let frame = 0; frame < 3; frame += 1) await new Promise(requestAnimationFrame);
  frames.push(measureFrame());
  return {
    initial,
    frames,
    slideStartTimes,
    heightStart: Number.parseFloat(String(heightStart)),
    supportsHeightMorph: CSS.supports("height", "calc-size(auto, size)"),
  };
}

function expectAdjacentPanels(incoming: PanelBounds, outgoing: PanelBounds, direction: string | null, orientation: string) {
  expect(outgoing.width).toBeCloseTo(incoming.width, 0);
  if (orientation === "horizontal") {
    expect(outgoing.y).toBeCloseTo(incoming.y, 0);
    const trailingEdge = direction === "right" ? outgoing.x + outgoing.width : incoming.x + incoming.width;
    const leadingEdge = direction === "right" ? incoming.x : outgoing.x;
    expect(Math.abs(trailingEdge - leadingEdge)).toBeLessThan(1);
    return;
  }
  expect(outgoing.x).toBeCloseTo(incoming.x, 0);
  const trailingEdge = direction === "down" ? outgoing.y + outgoing.height : incoming.y + incoming.height;
  const leadingEdge = direction === "down" ? incoming.y : outgoing.y;
  expect(Math.abs(trailingEdge - leadingEdge)).toBeLessThan(1);
}

function expectHeightMorph(transition: PanelTransitionCapture) {
  if (!transition.supportsHeightMorph) return;
  const settled = transition.frames.at(-1);
  if (!settled) throw new Error("Settled frame is missing");
  const difference = Math.abs(transition.initial.height - settled.incoming.height);
  if (difference < 1) return;
  expect(transition.heightStart).toBeCloseTo(transition.initial.height, 0);
  if (difference < 100) return;
  expect(
    transition.frames.some((frame) => {
      const heightChange = Math.abs(transition.initial.height - frame.incoming.height);
      return heightChange > 20 && heightChange < difference - 20;
    }),
  ).toBe(true);
}

function expectAlignedTransition(transition: PanelTransitionCapture, orientation: string) {
  expect(transition.slideStartTimes).toHaveLength(2);
  expect(Math.abs((transition.slideStartTimes[0] ?? 0) - (transition.slideStartTimes[1] ?? 0))).toBeLessThan(1);
  expect(transition.frames.filter((frame) => frame.outgoing)).toHaveLength(3);
  for (const frame of transition.frames) {
    expect(frame.paintedPanels).toBeLessThanOrEqual(2);
    expect(frame.incoming.width).toBeCloseTo(transition.initial.width, 0);
    if (frame.outgoing) expectAdjacentPanels(frame.incoming, frame.outgoing, frame.direction, orientation);
  }
  const settled = transition.frames.at(-1);
  expect(settled?.paintedPanels).toBe(1);
  expect(settled?.incoming.x).toBeCloseTo(transition.initial.x, 0);
  expect(settled?.incoming.y).toBeCloseTo(transition.initial.y, 0);
  expectHeightMorph(transition);
}

for (const width of [390, 1440]) {
  for (const orientation of ["horizontal", "vertical"]) {
    test(`${orientation} tabs at ${width}px slide aligned in both directions and morph their height`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`http://tabs.test/?orientation=${orientation}`);
      await page.addStyleTag({ content: '[data-slide="scope"] { --duration-slow: 500ms; }' });
      const forward = await page.getByRole("tab", { name: "Settings", exact: true }).evaluate(captureTransition);
      expectAlignedTransition(forward, orientation);
      const backward = await page.getByRole("tab", { name: "Releases", exact: true }).evaluate(captureTransition);
      expectAlignedTransition(backward, orientation);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await page.screenshot({ path: testInfo.outputPath("settled.png") });
    });
  }
}

test("external selection and uncontrolled browser tabs keep the slide aligned", async ({ page }) => {
  await page.addStyleTag({ content: '[data-slide="scope"] { --duration-slow: 500ms; }' });
  await page.getByRole("tabpanel", { name: "Releases" }).evaluate(async (panel) => {
    panel.style.height = "1500px";
    for (let frame = 0; frame < 2; frame += 1) await new Promise(requestAnimationFrame);
  });
  const external = await page.getByRole("button", { name: "Open settings" }).evaluate(captureTransition);
  expectAlignedTransition(external, "horizontal");
  await page.goto("http://tabs.test/?uncontrolled&variant=browser");
  await page.addStyleTag({ content: '[data-slide="scope"] { --duration-slow: 500ms; }' });
  const uncontrolled = await page.getByRole("tab", { name: "Settings", exact: true }).evaluate(captureTransition);
  expectAlignedTransition(uncontrolled, "horizontal");
});

test("switching during entry keeps the latest pair aligned in either direction", async ({ page }) => {
  for (const orientation of ["horizontal", "vertical"]) {
    for (const name of ["Embed", "Releases"]) {
      await page.goto(`http://tabs.test/?orientation=${orientation}`);
      await page.addStyleTag({ content: '[data-slide="scope"] { --duration-slow: 1s; }' });
      await page.getByRole("tab", { name: "Settings", exact: true }).click();
      const interrupted = await page.getByRole("tab", { name, exact: true }).evaluate(captureTransition);
      expectAlignedTransition(interrupted, orientation);
    }
  }
});

test("rapid switches hide older exiting panels and retain mounted form state", async ({ page }) => {
  await page.addStyleTag({ content: '[data-slide="scope"] { --duration-slow: 1s; }' });
  for (const name of ["Settings", "Releases", "Embed", "Settings"]) {
    await page.getByRole("tab", { name, exact: true }).click();
    await expect(page.getByRole("tabpanel", { name })).toBeVisible();
    expect(await page.locator('[data-slot="panel"]:visible').count()).toBeLessThanOrEqual(2);
    await expect(page.locator('[data-slot="panel"][inert]:visible:not([data-slide-exiting])')).toHaveCount(0);
  }
  await expect(page.locator('[data-slot="panel"]:visible')).toHaveCount(1);
  await page.getByRole("tab", { name: "Embed", exact: true }).click();
  await page.getByRole("textbox", { name: "Embed title" }).fill("My updates");
  await page.getByRole("button", { name: "Open settings" }).click();
  await expect(page.getByRole("tabpanel", { name: "Settings" })).toBeVisible();
  await page.getByRole("tab", { name: "Embed", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Embed title" })).toHaveValue("My updates");
  await expect(page.locator('[data-slot="panel"]:visible')).toHaveCount(1);
});

test("keyboard selection and reduced motion switch immediately without moving content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const releases = page.getByRole("tab", { name: "Releases", exact: true });
  await releases.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Settings", exact: true })).toBeFocused();
  const settings = page.getByRole("tabpanel", { name: "Settings" });
  await expect(settings).toBeVisible();
  await expect(page.locator('[data-slot="panel"]:visible')).toHaveCount(1);
  expect(await settings.evaluate((panel) => getComputedStyle(panel).transitionDuration)).toBe("0s");
  await page.keyboard.press("Tab");
  await expect(settings).toBeFocused();
});

test("paints clipped panels during the slide", async ({ page }, testInfo) => {
  await page.addStyleTag({ content: '[data-slide="scope"] { --duration-slow: 1s; }' });
  await page.getByRole("tab", { name: "Settings", exact: true }).click();
  await expect
    .poll(() =>
      page
        .locator('[data-slide="scope"]')
        .evaluate(
          (root) =>
            root
              .getAnimations({ subtree: true })
              .filter((animation) => animation instanceof CSSTransition && animation.transitionProperty === "translate").length,
        ),
    )
    .toBe(2);
  await page.locator('[data-slide="scope"]').evaluate(async (root) => {
    const animations = root.getAnimations({ subtree: true });
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getTiming().duration) * 0.15;
    }
    await Promise.all(animations.map((animation) => animation.ready));
    for (let frame = 0; frame < 2; frame += 1) await new Promise(requestAnimationFrame);
  });
  await page.screenshot({ path: testInfo.outputPath("transition.png") });
});
