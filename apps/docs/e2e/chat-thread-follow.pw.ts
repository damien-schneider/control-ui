import { expect, type Locator, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";
import { waitForSkinLayout } from "./browser-test-helpers";

const reply = "Auto-scroll keeps the newest words in view, and the button appears the moment you read back through the thread.";

function distanceToEnd(viewport: Locator) {
  return viewport.evaluate((element) => Math.round(element.scrollHeight - element.clientHeight - element.scrollTop));
}

test("a streaming reply stays in view until the reader scrolls back, and sending returns to the latest", async ({ page }) => {
  await page.addInitScript(
    ({ skinKey, themeKey }) => {
      localStorage.setItem(skinKey, JSON.stringify({ skin: "refined", reduceMotion: true }));
      localStorage.setItem(themeKey, "light");
    },
    { skinKey: THEME_EDITOR_STORAGE_KEY, themeKey: THEME_STORAGE_KEY },
  );
  await page.goto("/kits/chat-layout");
  await waitForSkinLayout(page, "refined");
  const thread = page.locator('#preview [data-control-ui="chat-thread"][data-slot="root"]').first();
  const viewport = thread.locator('[data-control-family="scroll-area"][data-slot="viewport"]').first();
  const message = thread.getByRole("textbox", { name: "Message" });
  const replies = thread.locator(
    '[data-control-ui="chat-message"][data-slot="root"][data-role="assistant"] [data-control-ui="chat-message"][data-slot="content"]',
  );
  const jumpToLatest = thread.getByRole("button", { name: "Scroll to latest" });
  await thread.scrollIntoViewIfNeeded();

  async function send(text: string) {
    const sentReplies = await replies.count();
    await message.fill(text);
    await message.press("Enter");
    await expect(replies).toHaveCount(sentReplies + 1);
    return replies.nth(sentReplies);
  }

  const firstReply = await send("First follow-up");
  await expect(firstReply).toHaveText(reply);
  expect(await distanceToEnd(viewport)).toBeLessThanOrEqual(1);
  await expect(jumpToLatest).toBeHidden();

  const secondReply = await send("Second follow-up");
  await expect(secondReply).toHaveText(/^Auto-scroll/);
  const box = await viewport.boundingBox();
  if (!box) throw new Error("Thread viewport must be laid out");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 3);
  await page.mouse.wheel(0, -240);
  await expect.poll(() => distanceToEnd(viewport)).toBeGreaterThan(100);
  const readingPosition = await viewport.evaluate((element) => element.scrollTop);
  await expect(secondReply).toHaveText(reply);
  expect(await viewport.evaluate((element) => element.scrollTop)).toBe(readingPosition);
  await expect(jumpToLatest).toBeVisible();

  const thirdReply = await send("Third follow-up");
  await expect.poll(() => distanceToEnd(viewport)).toBeLessThanOrEqual(1);
  await expect(thirdReply).toHaveText(reply);
  expect(await distanceToEnd(viewport)).toBeLessThanOrEqual(1);
  await expect(jumpToLatest).toBeHidden();
});
