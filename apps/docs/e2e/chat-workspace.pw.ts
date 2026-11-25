import { type Browser, test as base, expect, type Page } from "@playwright/test";
import { serveFixture } from "./fixtures/serve-fixture";

type Recorded = { widths: number[]; docked: boolean[]; expanded: boolean[] };
type WorkspaceRemote = { setDocked: (docked: boolean) => void };

const windowSize = { width: 1400, height: 900 };

async function open(page: Page, search = "", skin = "refined") {
  await page.setViewportSize(windowSize);
  await serveFixture(page, "chat-workspace", { skin, search });
  await expect(page.getByRole("complementary", { name: "Chat" })).toBeVisible();
}

function parts(page: Page) {
  return {
    root: page.locator('[data-control-family="chat-workspace"][data-slot="root"]'),
    panel: page.getByRole("complementary", { name: "Chat" }),
    collapsible: page.locator('[data-control-family="chat-workspace"][data-slot="collapsible"]'),
    expand: page.getByRole("button", { name: "Conversation" }),
    pin: page.getByRole("button", { name: "Pin to side" }),
    float: page.getByRole("button", { name: "Float" }),
    handle: page.getByRole("separator", { name: "Resize chat panel" }),
    message: page.getByRole("textbox", { name: "Message" }),
    transcript: page.getByRole("region", { name: "Conversation" }),
    inset: page.locator('[data-control-family="chat-workspace"][data-slot="inset"]'),
  };
}

async function box(locator: ReturnType<Page["locator"]>) {
  const found = await locator.boundingBox();
  if (!found) throw new Error("Element has no box");
  return found;
}

function recorded(page: Page) {
  return page.evaluate(() => (window as unknown as { recorded: Recorded }).recorded);
}

async function settle(page: Page) {
  await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== "running"));
  await page.evaluate(() => new Promise(requestAnimationFrame));
}

function engine(browserName: "chromium" | "webkit") {
  return base.extend<object, { browser: Browser }>({
    browser: [
      async ({ playwright }, use) => {
        const browser = await playwright[browserName].launch();
        await use(browser);
        await browser.close();
      },
      { scope: "worker" },
    ],
  });
}

for (const browserName of ["chromium", "webkit"] as const) {
  const test = engine(browserName);
  test.describe(`chat workspace in ${browserName}`, () => {
    test.use({ reducedMotion: "reduce" });

    let errors: string[] = [];
    test.beforeEach(({ page }) => {
      errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
    });
    test.afterEach(() => expect(errors).toEqual([]));

    test("floats as an island at the bottom centre of the content", async ({ page }) => {
      await open(page);
      const { root, panel } = parts(page);
      const rootBox = await box(root);
      const panelBox = await box(panel);
      expect(Math.abs(panelBox.x + panelBox.width / 2 - (rootBox.x + rootBox.width / 2))).toBeLessThanOrEqual(1);
      const gap = rootBox.y + rootBox.height - (panelBox.y + panelBox.height);
      expect(gap).toBeGreaterThan(4);
      expect(gap).toBeLessThan(40);
      expect(panelBox.width).toBeLessThanOrEqual(44 * 16);
      expect(panelBox.width).toBeGreaterThan(400);
    });

    test("centres a header title without a description on its actions", async ({ page }) => {
      await open(page);
      const { panel, pin } = parts(page);
      const title = panel.locator('[data-control-family="chat-layout"][data-slot="title"]');
      const middle = (found: { y: number; height: number }) => found.y + found.height / 2;
      expect(Math.abs(middle(await box(title)) - middle(await box(pin)))).toBeLessThanOrEqual(1);
    });

    for (const skin of ["refined", "mastra", "linear"]) {
      test(`rounds the island concentric with the composer it holds in the ${skin} skin`, async ({ page }) => {
        await open(page, "", skin);
        const { panel } = parts(page);
        const shell = panel.locator('[data-control-family="chat-composer"][data-slot="shell"]');
        const radius = (locator: typeof panel) =>
          locator.evaluate((element) => Number.parseFloat(getComputedStyle(element).borderTopLeftRadius));
        const panelBox = await box(panel);
        const shellBox = await box(shell);
        const inset = panelBox.x + panelBox.width - (shellBox.x + shellBox.width);
        expect(Math.abs((await radius(panel)) - (await radius(shell)) - inset)).toBeLessThanOrEqual(1);
        expect(Math.abs(panelBox.y + panelBox.height - (shellBox.y + shellBox.height) - inset)).toBeLessThanOrEqual(1);
      });
    }

    test("lines the header's controls up with the composer's and keeps the header no taller than a toolbar", async ({ page }) => {
      await open(page);
      const { panel, pin } = parts(page);
      const header = panel.locator('[data-control-family="chat-layout"][data-slot="header"]');
      const send = page.getByRole("button", { name: "Send message" });
      const pinBox = await box(pin);
      const sendBox = await box(send);
      expect(Math.abs(pinBox.x + pinBox.width - (sendBox.x + sendBox.width))).toBeLessThanOrEqual(1);
      expect((await box(header)).height).toBeLessThanOrEqual(pinBox.height + 16 + 1);
      const content = panel.locator('[data-control-family="chat-layout"][data-slot="thread-content"]');
      const contentStart = await content.evaluate(
        (element) => element.getBoundingClientRect().x + Number.parseFloat(getComputedStyle(element).paddingInlineStart),
      );
      expect(Math.abs(contentStart - (await box(parts(page).expand)).x)).toBeLessThanOrEqual(1);
    });

    test("keeps the composer in the conversation's scroller, fading the transcript just above it", async ({ page }) => {
      await open(page);
      const { panel, transcript, message } = parts(page);
      const dock = panel.locator('[data-control-family="chat-layout"][data-slot="dock"]');
      const shell = panel.locator('[data-control-family="chat-composer"][data-slot="shell"]');
      expect(await transcript.evaluate((viewport, element) => viewport.contains(element), await dock.elementHandle())).toBe(true);
      await transcript.evaluate((viewport) => viewport.scrollTo({ top: 0 }));
      const inset = () =>
        transcript.evaluate((viewport) => Number.parseFloat(getComputedStyle(viewport).getPropertyValue("--scroll-area-inset-end")));
      await expect.poll(inset).toBeCloseTo((await box(dock)).height, 0);
      await expect.poll(() => transcript.evaluate((viewport) => getComputedStyle(viewport).maskImage)).toContain("linear-gradient");
      expect(await dock.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");

      await message.focus();
      expect(await transcript.evaluate((viewport) => getComputedStyle(viewport).maskImage)).toContain("linear-gradient");

      const panelBox = await box(panel);
      const shellBox = await box(shell);
      await page.mouse.move((panelBox.x + shellBox.x) / 2, shellBox.y + shellBox.height / 2);
      await page.mouse.wheel(0, 240);
      await expect.poll(() => transcript.evaluate((viewport) => viewport.scrollTop)).toBeGreaterThan(0);
    });

    for (const [where, search] of [
      ["floating", ""],
      ["pinned", "?docked=1"],
    ] as const) {
      test(`runs the scrollbar down beside the composer, and scrolls on a wheel anywhere around it, ${where}`, async ({ page }) => {
        await open(page, search);
        const { panel, transcript } = parts(page);
        const shell = panel.locator('[data-control-family="chat-composer"][data-slot="shell"]');
        const thumb = panel.locator(
          '[data-control-family="scroll-area"][data-slot="scrollbar"][data-orientation="vertical"] [data-slot="thumb"]',
        );
        const toEnd = () => transcript.evaluate((viewport) => viewport.scrollTo({ top: viewport.scrollHeight }));
        const scrolled = () => transcript.evaluate((viewport) => viewport.scrollTop);

        await toEnd();
        const shellBox = await box(shell);
        await expect
          .poll(async () => (await box(thumb.first())).y + (await box(thumb.first())).height)
          .toBeGreaterThan(shellBox.y + shellBox.height / 2);

        const panelBox = await box(panel);
        const beside = shellBox.y + shellBox.height / 2;
        const below = (shellBox.y + shellBox.height + panelBox.y + panelBox.height) / 2;
        for (const [x, y] of [
          [panelBox.x + 4, beside],
          [panelBox.x + panelBox.width - 4, beside],
          [shellBox.x + shellBox.width / 2, below],
        ]) {
          await toEnd();
          const before = await scrolled();
          await page.mouse.move(x, y);
          await page.mouse.wheel(0, -200);
          await expect.poll(scrolled).toBeLessThan(before);
        }
      });
    }

    test("floats the scroll-to-latest button above the composer, clear of the fade", async ({ page }) => {
      await open(page);
      const { panel, transcript } = parts(page);
      const dock = panel.locator('[data-control-family="chat-layout"][data-slot="dock"]');
      const latest = page.getByRole("button", { name: "Scroll to latest" });
      await transcript.evaluate((viewport) => viewport.scrollTo({ top: 0 }));
      await expect(latest).toBeVisible();
      expect(await transcript.evaluate((viewport, element) => viewport.contains(element), await latest.elementHandle())).toBe(false);
      const latestBox = await box(latest);
      const dockBox = await box(dock);
      expect(latestBox.y + latestBox.height).toBeLessThan(dockBox.y);
      expect(dockBox.y - (latestBox.y + latestBox.height)).toBeLessThan(24);
      await latest.click();
      await expect
        .poll(() => transcript.evaluate((viewport) => viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop))
        .toBeLessThan(2);
    });

    test("sizes a short conversation to its content instead of holding the full transcript height", async ({ page }) => {
      await open(page, "?turns=1");
      const { transcript } = parts(page);
      const height = (await box(transcript)).height;
      expect(height).toBeLessThan(200);
      expect(await transcript.evaluate((viewport) => viewport.scrollHeight - viewport.clientHeight)).toBeLessThanOrEqual(1);
    });

    test("collapses the transcript out of reach while the composer stays usable", async ({ page }) => {
      await open(page);
      const { panel, expand, collapsible, transcript, message } = parts(page);
      const header = panel.locator('[data-control-family="chat-layout"][data-slot="header"]');
      const dock = panel.locator('[data-control-family="chat-layout"][data-slot="dock"]');
      const first = page.getByText("Message 11 in a conversation");
      await expect(expand).toHaveAttribute("aria-expanded", "true");
      await expect(first).toBeVisible();

      await expand.click();
      await settle(page);
      await expect(expand).toHaveAttribute("aria-expanded", "false");
      expect(await collapsible.evaluate((element) => element instanceof HTMLElement && element.inert)).toBe(true);
      await expect(first).toBeHidden();
      const folded = (await box(header)).height + (await box(dock)).height;
      expect(Math.abs((await box(panel)).height - folded)).toBeLessThanOrEqual(3);
      expect(await transcript.evaluate((viewport) => viewport.scrollHeight - viewport.clientHeight)).toBeLessThanOrEqual(1);
      await message.fill("still here");
      await expect(message).toHaveValue("still here");

      await expand.click();
      await settle(page);
      await expect(expand).toHaveAttribute("aria-expanded", "true");
      await expect(first).toBeVisible();
      expect(await recorded(page)).toMatchObject({ expanded: [false, true] });
    });

    test("pins into a side column of the default width and floats back", async ({ page }) => {
      await open(page);
      const { root, panel, pin, float, expand, handle } = parts(page);
      await pin.click();
      await settle(page);
      await expect(root).toHaveAttribute("data-docked", "");
      const rootBox = await box(root);
      const panelBox = await box(panel);
      expect(panelBox.width).toBeCloseTo(384, 0);
      expect(panelBox.x + panelBox.width).toBeCloseTo(rootBox.x + rootBox.width, 0);
      expect(panelBox.y).toBeCloseTo(rootBox.y, 0);
      expect(panelBox.height).toBeCloseTo(rootBox.height, 0);
      await expect(expand).toBeHidden();
      await expect(handle).toBeVisible();

      await float.click();
      await settle(page);
      await expect(root).not.toHaveAttribute("data-docked");
      await expect(handle).toBeHidden();
      await expect(pin).toBeVisible();
      expect(await recorded(page)).toMatchObject({ docked: [true, false] });
    });

    test("a long transcript stays a bounded scroller when the island changes width", async ({ page }) => {
      await open(page, "?turns=40");
      const { transcript } = parts(page);
      await page.setViewportSize({ width: 900, height: windowSize.height });
      await settle(page);
      const sizes = await transcript.evaluate((element) => ({ client: element.clientHeight, scroll: element.scrollHeight }));
      expect(sizes.client).toBeLessThan(sizes.scroll);
      expect(sizes.client).toBeLessThanOrEqual(28 * 16 + 1);
    });

    test("keeps the same panel across both toggles: draft, focus and transcript scroll survive", async ({ page }) => {
      await open(page, "?turns=40");
      const { message, transcript, pin, float } = parts(page);
      await message.fill("half a thought");
      await transcript.evaluate((viewport) => {
        viewport.scrollTop = 120;
        Object.assign(viewport, { marker: "kept" });
      });
      await message.evaluate((element) => Object.assign(element, { marker: "kept" }));
      await message.focus();

      await page.evaluate(() => (window as unknown as { workspace: WorkspaceRemote }).workspace.setDocked(true));
      await settle(page);
      await expect(message).toBeFocused();
      await expect(message).toHaveValue("half a thought");
      expect(await message.evaluate((element) => Reflect.get(element, "marker"))).toBe("kept");
      expect(await transcript.evaluate((viewport) => Reflect.get(viewport, "marker"))).toBe("kept");
      expect(await transcript.evaluate((viewport) => viewport.scrollTop)).toBeGreaterThan(0);

      await float.focus();
      await page.keyboard.press("Enter");
      await settle(page);
      await expect(pin).toBeFocused();
      await expect(message).toHaveValue("half a thought");
      expect(await transcript.evaluate((viewport) => Reflect.get(viewport, "marker"))).toBe("kept");
      expect(await transcript.evaluate((viewport) => viewport.scrollTop)).toBeGreaterThan(0);
    });

    test("resizes from the separator by pointer, clamped, reporting once on release", async ({ page }) => {
      await open(page, "?docked=1");
      const { panel, handle, root } = parts(page);
      const rootWidth = (await box(root)).width;
      const start = await box(handle);
      const x = start.x + start.width / 2;
      const y = start.y + start.height / 2;

      await page.mouse.move(x, y);
      await page.mouse.down();
      for (let step = 1; step <= 10; step++) await page.mouse.move(x - step * 10, y);
      await expect(page.locator('[data-control-family="chat-workspace"][data-slot="resize-shield"]')).toHaveCount(1);
      expect((await box(panel)).width).toBeCloseTo(484, 0);
      expect((await recorded(page)).widths).toEqual([]);
      await page.mouse.up();
      await expect(page.locator('[data-slot="resize-shield"]')).toHaveCount(0);
      expect((await recorded(page)).widths).toEqual([484]);
      await expect(handle).toHaveAttribute("aria-valuenow", "484");

      const grown = await box(handle);
      await page.mouse.move(grown.x + grown.width / 2, y);
      await page.mouse.down();
      await page.mouse.move(0, y, { steps: 4 });
      await page.mouse.up();
      expect((await box(panel)).width).toBeCloseTo(Math.min(640, rootWidth - 320), 0);

      const widest = await box(handle);
      await page.mouse.move(widest.x + widest.width / 2, y);
      await page.mouse.down();
      await page.mouse.move(windowSize.width - 1, y, { steps: 4 });
      await page.mouse.up();
      expect((await box(panel)).width).toBeCloseTo(288, 0);
      expect((await recorded(page)).widths).toEqual([484, 640, 288]);
    });

    test("a click on the separator without a drag changes nothing", async ({ page }) => {
      await open(page, "?docked=1");
      await parts(page).handle.click();
      expect((await box(parts(page).panel)).width).toBeCloseTo(384, 0);
      expect((await recorded(page)).widths).toEqual([]);
    });

    test("resizes from the keyboard in steps, with Home and End at the bounds", async ({ page }) => {
      await open(page, "?docked=1");
      const { handle, panel } = parts(page);
      await handle.focus();
      await page.keyboard.press("ArrowLeft");
      await expect(handle).toHaveAttribute("aria-valuenow", "400");
      await page.keyboard.press("Shift+ArrowLeft");
      await expect(handle).toHaveAttribute("aria-valuenow", "464");
      await page.keyboard.press("ArrowRight");
      await expect(handle).toHaveAttribute("aria-valuenow", "448");
      await page.keyboard.press("End");
      await expect(handle).toHaveAttribute("aria-valuenow", "640");
      await page.keyboard.press("Home");
      await expect(handle).toHaveAttribute("aria-valuenow", "288");
      expect((await box(panel)).width).toBeCloseTo(288, 0);
      expect((await recorded(page)).widths).toEqual([400, 464, 448, 640, 288]);
    });

    test("on the left, the column sits at the left edge and ArrowRight widens it", async ({ page }) => {
      await open(page, "?docked=1&side=left");
      const { root, panel, handle } = parts(page);
      expect((await box(panel)).x).toBeCloseTo((await box(root)).x, 0);
      await handle.focus();
      await page.keyboard.press("ArrowRight");
      await expect(handle).toHaveAttribute("aria-valuenow", "400");
    });

    test("the inset lets the end of the content scroll clear of the island, and folds away when docked", async ({ page }) => {
      await open(page);
      const { panel, inset, pin } = parts(page);
      await page.getByRole("region", { name: "Canvas" }).evaluate((viewport) => {
        viewport.scrollTop = viewport.scrollHeight;
      });
      await page.evaluate(() => new Promise(requestAnimationFrame));
      const end = await box(page.getByTestId("canvas-end"));
      const island = await box(panel);
      expect(end.y + end.height).toBeLessThanOrEqual(island.y);
      expect((await box(inset)).height).toBeGreaterThan(island.height);

      await parts(page).expand.click();
      await settle(page);
      expect((await box(inset)).height).toBeGreaterThan((await box(panel)).height);
      expect((await box(inset)).height).toBeLessThan(island.height);

      await pin.click();
      await settle(page);
      expect(await inset.evaluate((element) => element.getBoundingClientRect().height)).toBe(0);
    });

    test("a panel that opens later still clears the end of the content, and frees it once closed", async ({ page }) => {
      await page.setViewportSize(windowSize);
      await serveFixture(page, "chat-workspace", { skin: "refined", search: "?closed=1" });
      const { inset } = parts(page);
      await expect(page.getByRole("button", { name: "Open chat" })).toBeAttached();
      expect((await box(inset)).height).toBe(0);

      await page.getByRole("button", { name: "Open chat" }).click();
      const panel = page.getByRole("complementary", { name: "Chat" });
      await expect(panel).toBeVisible();
      await settle(page);
      expect((await box(inset)).height).toBeGreaterThan((await box(panel)).height);

      await page.getByRole("button", { name: "Close chat" }).click();
      await expect(panel).toHaveCount(0);
      await settle(page);
      expect(await inset.evaluate((element) => element.getBoundingClientRect().height)).toBe(0);
    });

    test("a container too narrow for a side column keeps the island floating and drops the pin", async ({ page }) => {
      await open(page, "?docked=1&frame=520");
      const { root, pin, float, handle, expand } = parts(page);
      await expect(root).not.toHaveAttribute("data-docked");
      await expect(pin).toHaveCount(0);
      await expect(float).toBeHidden();
      await expect(handle).toBeHidden();
      await expect(expand).toBeVisible();
    });
  });

  test.describe(`chat workspace motion in ${browserName}`, () => {
    async function countTransitions(page: Page) {
      await page.evaluate(() => {
        const calls = { count: 0 };
        Object.assign(window, { transitionCalls: calls });
        const original = document.startViewTransition?.bind(document);
        if (!original) return;
        document.startViewTransition = (update) => {
          calls.count++;
          return original(update);
        };
      });
    }

    test("the switch morphs with a view transition when motion is allowed", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await open(page);
      await countTransitions(page);
      const supported = await page.evaluate(() => typeof document.startViewTransition === "function");
      await parts(page).pin.click();
      await settle(page);
      await expect(parts(page).root).toHaveAttribute("data-docked", "");
      expect(await page.evaluate(() => (window as unknown as { transitionCalls: { count: number } }).transitionCalls.count)).toBe(
        supported ? 1 : 0,
      );
      await expect.poll(() => parts(page).panel.evaluate((element) => element.style.viewTransitionName)).toBe("");
    });

    test("reduced motion switches instantly, without a view transition", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await open(page);
      await countTransitions(page);
      await parts(page).pin.click();
      await expect(parts(page).root).toHaveAttribute("data-docked", "");
      expect(await page.evaluate(() => (window as unknown as { transitionCalls: { count: number } }).transitionCalls.count)).toBe(0);
    });

    test.describe(`chat workspace folding in ${browserName}`, () => {
      test.use({ reducedMotion: "no-preference" });

      test("glides the island shut with the composer pinned, the conversation visible until it folds away", async ({ page }) => {
        await open(page);
        const { panel, expand, message } = parts(page);
        const last = page.getByText("Message 11 in a conversation");
        const before = await box(panel);
        const composerBottom = async () => {
          const found = await box(message);
          return found.y + found.height;
        };
        const restingBottom = await composerBottom();
        await page.evaluate(() => {
          document.documentElement.style.setProperty("--duration-slow", "1200ms");
        });
        await expand.click();
        await page.waitForTimeout(250);
        const midway = await box(panel);
        expect(midway.height).toBeLessThan(before.height - 4);
        await expect(last).toBeVisible();
        expect(Math.abs((await composerBottom()) - restingBottom)).toBeLessThanOrEqual(1);
        await settle(page);
        await expect(last).toBeHidden();
        expect((await box(panel)).height).toBeLessThan(midway.height);
      });
    });
  });
}
