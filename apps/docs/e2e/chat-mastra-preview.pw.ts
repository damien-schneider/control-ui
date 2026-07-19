import { expect, test } from "@playwright/test";

import { CHAT_PREVIEW_REPLY } from "../mastra/chat-preview-contract";

test("chat preview sends through Mastra and renders the mock reply", async ({ page }) => {
  await page.goto("/blocks/chat");

  const preview = page
    .locator('[data-control-ui="chat-layout"][data-slot="root"]')
    .filter({ has: page.locator('[data-control-ui="chat-composer"][data-slot="root"]') });
  const thread = preview.locator('[data-control-ui="chat-thread"][data-slot="root"]');
  const userTurns = thread.locator('[data-control-ui="chat-turn"][data-slot="root"][data-from="user"]');
  const assistantTurns = thread.locator('[data-control-ui="chat-turn"][data-slot="root"][data-from="assistant"]');
  const initialUserTurnCount = await userTurns.count();
  const initialAssistantTurnCount = await assistantTurns.count();

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
});
