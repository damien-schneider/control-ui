import { expect, test } from "@playwright/test";

import { CHAT_PREVIEW_REPLY } from "../mastra/chat-preview-contract";

type ChatPreviewObserverState = typeof globalThis & {
  chatPreviewObserver?: MutationObserver;
  chatPreviewTexts?: string[];
};

test("chat preview sends through Mastra and renders the streamed mock reply", async ({ page }) => {
  await page.goto("/blocks/chat");

  const preview = page
    .locator('[data-control-ui="chat-scene"][data-slot="root"]')
    .filter({ has: page.locator('[data-control-ui="chat-input"][data-slot="root"]') });
  const thread = preview.locator('[data-control-ui="chat-thread"][data-slot="root"]');
  const userTurns = thread.locator('[data-control-ui="chat-turn"][data-slot="root"][data-from="user"]');
  const assistantTurns = thread.locator('[data-control-ui="chat-turn"][data-slot="root"][data-from="assistant"]');
  const initialUserTurnCount = await userTurns.count();
  const initialAssistantTurnCount = await assistantTurns.count();

  await thread.evaluate((element) => {
    const state = globalThis as ChatPreviewObserverState;
    state.chatPreviewTexts = [];
    state.chatPreviewObserver = new MutationObserver(() => {
      const assistantContent = element.querySelectorAll<HTMLElement>(
        '[data-control-ui="chat-turn"][data-slot="root"][data-from="assistant"] [data-control-ui="chat-message"][data-slot="content"]',
      );
      const text = assistantContent.item(assistantContent.length - 1).textContent?.trim();
      if (text && state.chatPreviewTexts?.at(-1) !== text) state.chatPreviewTexts?.push(text);
    });
    state.chatPreviewObserver.observe(element, { childList: true, characterData: true, subtree: true });
  });

  const prompt = "Stream a reply from the preview";
  await preview.getByRole("textbox", { name: "Message" }).fill(prompt);
  await preview.getByRole("button", { name: "Send" }).click();

  await expect(userTurns).toHaveCount(initialUserTurnCount + 1);
  await expect(userTurns.last()).toContainText(prompt);
  await expect(preview.getByRole("button", { name: "Stop" })).toBeVisible();
  await expect(assistantTurns).toHaveCount(initialAssistantTurnCount + 1);

  const streamedReply = assistantTurns.last().locator('[data-control-ui="chat-message"][data-slot="content"]');
  await expect(streamedReply).toHaveText(CHAT_PREVIEW_REPLY);
  await expect(preview.getByRole("button", { name: "Send" })).toBeVisible();
  await expect(preview.getByRole("textbox", { name: "Message" })).toHaveText("");

  const observedTexts = await thread.evaluate(() => {
    const state = globalThis as ChatPreviewObserverState;
    state.chatPreviewObserver?.disconnect();
    return state.chatPreviewTexts ?? [];
  });

  expect(observedTexts.some((text) => text !== CHAT_PREVIEW_REPLY && CHAT_PREVIEW_REPLY.startsWith(text))).toBe(true);
});
