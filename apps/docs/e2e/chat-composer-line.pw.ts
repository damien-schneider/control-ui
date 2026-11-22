import { type Browser, type BrowserType, test as base, chromium, expect, type Locator, type Page, webkit } from "@playwright/test";
import { findConcentricOffenders } from "./concentric-geometry";
import { serveFixture } from "./fixtures/serve-fixture";

const REST_HEIGHT_LIMIT = 60;

async function open(page: Page, search = "") {
  await page.setViewportSize({ width: 900, height: 800 });
  await serveFixture(page, "chat-composer-line", { skin: "refined", search });
  await expect(composer(page).message).toBeVisible();
  await settle(page);
}

function composer(page: Page, name = "Composer") {
  const form = page.getByRole("form", { name, exact: true });
  return {
    form,
    shell: form.locator('[data-control-family="chat-composer"][data-slot="shell"]'),
    message: form.getByRole("textbox", { name: "Message" }),
    add: form.getByRole("button", { name: "Add context" }),
    model: form.getByRole("button", { name: /^Model:/ }),
    send: form.getByRole("button", { name: "Send" }),
    header: form.getByText("Context: release notes"),
  };
}

async function box(locator: Locator) {
  const found = await locator.boundingBox();
  if (!found) throw new Error("Element has no box");
  return found;
}

async function settle(page: Page) {
  await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== "running"));
  await page.evaluate(() => new Promise(requestAnimationFrame));
}

async function pinned(page: Page) {
  const { add, send } = composer(page);
  return { add: await box(add), send: await box(send) };
}

function expectSamePlace(actual: Awaited<ReturnType<typeof pinned>>, expected: Awaited<ReturnType<typeof pinned>>) {
  for (const part of ["add", "send"] as const) {
    expect(Math.abs(actual[part].x - expected[part].x), `${part} x`).toBeLessThanOrEqual(1);
    expect(Math.abs(actual[part].y - expected[part].y), `${part} y`).toBeLessThanOrEqual(1);
  }
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

  test.describe(`one-line composer in ${engine.name()}`, () => {
    test("fits a slider in its corner the way it fits its buttons", async ({ page }) => {
      await open(page, "?layout=stacked&corner=slider");
      expect(await page.evaluate(findConcentricOffenders)).toEqual([]);
      const [outer, moving] = await composer(page)
        .form.locator('[data-control-family="range"][data-slot="indicator"]')
        .evaluate((fill) =>
          [getComputedStyle(fill).borderTopLeftRadius, getComputedStyle(fill).borderTopRightRadius].map(Number.parseFloat),
        );
      expect(moving).toBeLessThan(outer);
    });

    test("rests on one line with its tools, message and Send side by side", async ({ page }) => {
      await open(page);
      const { shell, message, add, send } = composer(page);
      const [shellBox, messageBox, addBox, sendBox] = await Promise.all([box(shell), box(message), box(add), box(send)]);
      expect(shellBox.height).toBeLessThan(REST_HEIGHT_LIMIT);
      expect(messageBox.x).toBeGreaterThan(addBox.x + addBox.width);
      expect(messageBox.x + messageBox.width).toBeLessThanOrEqual(sendBox.x);
      const centre = (part: { y: number; height: number }) => part.y + part.height / 2;
      expect(Math.abs(centre(messageBox) - centre(sendBox))).toBeLessThanOrEqual(1);
    });

    test("opens upward on focus without moving its tools or Send, then closes back to one line", async ({ page }) => {
      await open(page, "?header");
      const { shell, message, header } = composer(page);
      const restHeight = (await box(shell)).height;
      const rest = await pinned(page);
      await expect(header).toBeHidden();

      await message.click();
      await settle(page);
      expect((await box(shell)).height).toBeGreaterThan(restHeight + 20);
      expectSamePlace(await pinned(page), rest);
      await expect(header).toBeVisible();
      await expect(message).toBeFocused();

      await page.getByRole("button", { name: "Outside" }).click();
      await settle(page);
      expect((await box(shell)).height).toBeCloseTo(restHeight, 0);
      expectSamePlace(await pinned(page), rest);
    });

    for (const layout of ["auto", "stacked"] as const) {
      test(`keeps the model picker beside Send while its popover opens (${layout})`, async ({ page }) => {
        await open(page, `?layout=${layout}`);
        const { message, model, send } = composer(page);
        await message.fill("a draft");
        await settle(page);
        const before = await box(model);
        expect((await box(send)).x - (before.x + before.width)).toBeLessThanOrEqual(12);

        await model.click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await settle(page);
        const after = await box(model);
        expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1);
        expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
      });
    }

    test("glides between the two layouts instead of jumping", async ({ page }) => {
      await open(page);
      const { shell, message } = composer(page);
      await message.focus();
      const running = await shell.evaluate((element) => element.getAnimations().length);
      expect(running).toBeGreaterThan(0);
    });

    test("stays open while it holds a draft", async ({ page }) => {
      await open(page);
      const { shell, message } = composer(page);
      const restHeight = (await box(shell)).height;
      await message.fill("Summarise the release notes");
      await page.getByRole("button", { name: "Outside" }).click();
      await settle(page);
      expect((await box(shell)).height).toBeGreaterThan(restHeight + 20);
    });

    test("a tool pressed at rest does its job without opening the composer", async ({ page }) => {
      await open(page);
      const { shell, add } = composer(page);
      const restHeight = (await box(shell)).height;
      await add.click();
      await settle(page);
      expect((await box(shell)).height).toBeCloseTo(restHeight, 0);
    });

    test("stays open while its model picker is open, and closes when an outside click dismisses both", async ({ page }) => {
      await open(page);
      const { shell, message, model } = composer(page);
      const restHeight = (await box(shell)).height;
      await message.click();
      await model.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await settle(page);
      expect((await box(shell)).height).toBeGreaterThan(restHeight + 20);

      await page.getByRole("option", { name: /GPT-5/ }).click();
      await settle(page);
      expect((await box(shell)).height).toBeGreaterThan(restHeight + 20);

      await model.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.mouse.click(860, 40);
      await expect(page.getByRole("dialog")).toBeHidden();
      await settle(page);
      expect((await box(shell)).height).toBeCloseTo(restHeight, 0);
    });

    test("closes when keyboard focus leaves it", async ({ page }) => {
      await open(page);
      const { shell, message } = composer(page);
      const restHeight = (await box(shell)).height;
      await message.focus();
      await settle(page);
      for (let step = 0; step < 6; step += 1) await page.keyboard.press("Shift+Tab");
      await settle(page);
      expect((await box(shell)).height).toBeCloseTo(restHeight, 0);
    });

    test("closes when a press lands in another composer", async ({ page }) => {
      await open(page);
      const first = composer(page);
      const second = composer(page, "Second composer");
      const restHeight = (await box(first.shell)).height;
      await first.message.click();
      await second.message.click();
      await settle(page);
      expect((await box(first.shell)).height).toBeCloseTo(restHeight, 0);
      expect((await box(second.shell)).height).toBeGreaterThan(restHeight + 20);
    });

    test("an attachment landing on the resting composer opens it", async ({ page }) => {
      await open(page);
      const { shell } = composer(page);
      const restHeight = (await box(shell)).height;
      await page.getByRole("button", { name: "Attach to Composer" }).click();
      await settle(page);
      expect((await box(shell)).height).toBeGreaterThan(restHeight + 20);
      await expect(shell.getByRole("listitem", { name: "notes-0.txt" })).toBeVisible();
    });

    test("stays open while any part holds it, until the last one lets go", async ({ page }) => {
      await open(page);
      const { shell } = composer(page);
      const restHeight = (await box(shell)).height;
      const hold = page.getByRole("button", { name: "Hold Composer open" });
      await hold.click();
      await settle(page);
      expect((await box(shell)).height).toBeGreaterThan(restHeight + 20);
      await page.getByRole("button", { name: "Attach to Composer" }).click();
      await hold.click();
      await settle(page);
      expect((await box(shell)).height).toBeGreaterThan(restHeight + 20);
    });

    test("keeps its footer below the line and its Send in place", async ({ page }) => {
      await open(page, "?footer");
      const { shell, message } = composer(page);
      const rest = await pinned(page);
      await message.click();
      await settle(page);
      expectSamePlace(await pinned(page), rest);
      const footer = await box(shell.getByText("Answers can be wrong."));
      expect(footer.y).toBeGreaterThan(rest.send.y + rest.send.height);
    });

    test("the rich editor rests on one line and opens on focus", async ({ page }) => {
      await open(page, "?editor");
      const { shell, message, send } = composer(page);
      const restHeight = (await box(shell)).height;
      expect(restHeight).toBeLessThan(REST_HEIGHT_LIMIT);
      const rest = await pinned(page);
      await message.click();
      await settle(page);
      expect((await box(shell)).height).toBeGreaterThan(restHeight + 20);
      expectSamePlace(await pinned(page), rest);
      await page.keyboard.type("Hello");
      await expect(message).toHaveText("Hello");
      await expect(send).toBeEnabled();
    });

    test("the stacked layout keeps its open shape at rest", async ({ page }) => {
      await open(page, "?layout=stacked");
      const { shell, message } = composer(page);
      const restHeight = (await box(shell)).height;
      expect(restHeight).toBeGreaterThan(REST_HEIGHT_LIMIT);
      await message.click();
      await settle(page);
      expect((await box(shell)).height).toBeCloseTo(restHeight, 0);
    });

    test.describe("with reduced motion", () => {
      test.use({ reducedMotion: "reduce" });

      test("snaps open without animating", async ({ page }) => {
        await open(page);
        const { shell, message } = composer(page);
        await message.focus();
        const running = await shell.evaluate((element) => element.getAnimations({ subtree: true }).length);
        expect(running).toBe(0);
      });
    });
  });
}
