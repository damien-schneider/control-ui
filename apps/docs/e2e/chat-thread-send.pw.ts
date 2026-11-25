import { chromium, expect, type Page, test, webkit } from "@playwright/test";
import { serveFixture } from "./fixtures/serve-fixture";

async function open(page: Page, search = "") {
  await serveFixture(page, "chat-thread-send", { skin: "refined", search });
  const thread = page.locator('[data-control-ui="chat-thread"][data-slot="root"]');
  return {
    thread,
    viewport: thread.locator("[data-scroll-area-viewport]"),
    dock: thread.locator('[data-slot="dock"]'),
    message: page.getByRole("textbox", { name: "Message" }),
    jump: page.locator('[data-slot="scroll-anchor"]'),
  };
}

async function top(locator: ReturnType<Page["locator"]>) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("not laid out");
  return box;
}

test.describe("sending in a chat thread", () => {
  test.use({ reducedMotion: "reduce" });

  test("floats the jump button just above the composer after a long draft goes out", async ({ page }) => {
    const { viewport, dock, message, jump } = await open(page);
    await message.fill(Array.from({ length: 8 }, (_line, index) => `Line ${index + 1} of a long draft`).join("\n"));
    await message.press("Enter");
    await page.getByRole("button", { name: "Write a long answer" }).click();
    await viewport.evaluate((element) => element.scrollBy(0, -600));
    await expect(jump).toBeVisible();
    const button = await top(jump);
    const composer = await top(dock);
    expect(composer.y - (button.y + button.height)).toBeGreaterThan(4);
    expect(composer.y - (button.y + button.height)).toBeLessThan(24);
  });

  test("writes while the answer streams below, and turns back into an arrow once it settles", async ({ page }) => {
    const { viewport, jump } = await open(page);
    const arrow = jump.locator('[data-slot="scroll-arrow"]');
    const writing = jump.locator('[data-slot="scroll-writing"]');
    await viewport.evaluate((element) => element.scrollBy(0, -600));
    await expect(jump).toBeVisible();
    await expect(arrow).toHaveCSS("opacity", "1");
    await expect(writing).toHaveCSS("opacity", "0");
    await page.getByRole("button", { name: "Streaming" }).click();
    await expect(arrow).toHaveCSS("opacity", "0");
    await expect(writing).toHaveCSS("opacity", "1");
    await expect(writing).toHaveCSS("animation-name", "none");
    await expect(writing).toHaveCSS("stroke-dashoffset", "0px");
    await page.getByRole("button", { name: "Streaming" }).click();
    await expect(arrow).toHaveCSS("opacity", "1");
  });

  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("draws its pen stroke over and over while the answer streams", async ({ page }) => {
      const { viewport, jump } = await open(page);
      await viewport.evaluate((element) => element.scrollBy(0, -600));
      await page.getByRole("button", { name: "Streaming" }).click();
      await expect(jump.locator('[data-slot="scroll-writing"]')).toHaveCSS("animation-name", "cui-chat-thread-write");
    });
  });
});

for (const engine of [chromium, webkit]) {
  test(`keeps the jump button and the fade on the composer's edge as it grows and shrinks in ${engine.name()}`, async () => {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({ reducedMotion: "reduce" });
      const { thread, viewport, dock, message } = await open(page);
      const layer = thread.locator('[data-slot="anchor-layer"]');
      const offset = async () => {
        const composer = await top(dock);
        const clearance = await viewport.evaluate(
          (node) =>
            Number.parseFloat(getComputedStyle(node).scrollPaddingBottom) - Number.parseFloat(getComputedStyle(node).scrollPaddingTop),
        );
        return Math.max(Math.abs((await top(layer)).y - composer.y), Math.abs(clearance - composer.height));
      };
      await message.fill(Array.from({ length: 6 }, (_line, index) => `Line ${index + 1}`).join("\n"));
      await expect.poll(offset).toBeLessThanOrEqual(1);
      await message.fill("");
      await expect.poll(offset).toBeLessThanOrEqual(1);
    } finally {
      await browser.close();
    }
  });
}
