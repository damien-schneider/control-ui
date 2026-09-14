import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";

for (const skin of ["refined", "modern-apple", "none", "cuicui", "xp", "windows-98", "rig", "linear", "liquid-metal"]) {
  for (const appearance of ["light", "dark"]) {
    test(`${skin} ${appearance}: composer focus, selectors, and knobs`, async ({ page }, testInfo) => {
      await page.addInitScript(
        ({ skinKey, themeKey, skinId, appearance: themeAppearance }) => {
          localStorage.setItem(skinKey, JSON.stringify({ skin: skinId, reduceMotion: true }));
          localStorage.setItem(themeKey, themeAppearance);
        },
        { skinKey: THEME_EDITOR_STORAGE_KEY, themeKey: THEME_STORAGE_KEY, skinId: skin, appearance },
      );
      await page.goto("/ai/chat-composer");
      const preview = page.locator("#preview");
      const composer = preview.locator('[data-control-ui="chat-composer"][data-slot="root"]');
      const shell = composer.locator('[data-slot="shell"]');
      const input = composer.getByRole("textbox", { name: "Message" });
      const model = composer.getByRole("combobox", { name: "Model", exact: true });
      const thinking = composer.getByRole("combobox", { name: "Thinking level" });
      await expect(input).toBeVisible();
      await input.click();
      await expect(input).toHaveCSS("outline-style", "none");
      await expect(shell).toHaveCSS("outline-style", "none");
      await input.press("Tab");
      await expect(model).toBeFocused();
      await model.press("Shift+Tab");
      await expect(input).toBeFocused();
      await expect(shell).not.toHaveCSS("outline-style", "none");
      await input.press("Tab");
      await expect(shell).toHaveCSS("outline-style", "none");
      await model.press("Enter");
      const modelOption = page.getByRole("option", { name: "Gemini" });
      await expect(modelOption).toBeVisible();
      await expect(modelOption.locator("svg").first()).toBeVisible();
      await modelOption.click();
      await expect(model).toContainText("Gemini");
      await expect(model).toBeFocused();
      await thinking.click();
      await page.getByRole("option", { name: "High", exact: true }).click();
      await expect(thinking).toContainText("High");
      await input.click();
      await expect(shell).toHaveCSS("outline-style", "none");
      await input.fill("Draft the deployment announcement.");
      await input.press("Shift+Enter");
      await input.pressSequentially("Include a rollback plan.");
      await input.press("Enter");
      await expect(input).toHaveValue("");
      await expect(preview.locator('[data-control-ui="chat-message"][data-slot="content"]')).toContainText("Include a rollback plan.");
      await expect(composer.getByRole("button", { name: "Send message" })).toBeDisabled();
      await preview.screenshot({ path: testInfo.outputPath("composer.png") });
      await composer.evaluate((element) => {
        element.style.setProperty("--cui-chat-composer-shell-radius", "3px");
        element.style.setProperty("--cui-chat-composer-shell-shadow", "none");
        element.style.setProperty("--cui-chat-composer-shell-background", "oklch(0.6 0.1 250)");
      });
      await expect(shell).toHaveCSS("border-radius", "3px");
      await expect(shell).toHaveCSS("box-shadow", "none");
      await expect(shell).toHaveCSS("background-color", "oklch(0.6 0.1 250)");
      await input.click();
      await expect(shell).toHaveCSS("box-shadow", "none");
      await page.setViewportSize({ width: 390, height: 844 });
      expect(await shell.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    });
  }
}

test("reasoning reuses Activity and editing reuses Textarea", async ({ page }) => {
  await page.goto("/ai/chat-layout");
  const preview = page.locator("#preview");
  const reasoning = preview.getByRole("button", { name: "Thought for 2 seconds" });
  await expect(reasoning).toHaveAttribute("data-control-ui", "activity");
  await reasoning.focus();
  await reasoning.press("Enter");
  await expect(reasoning).toHaveAttribute("aria-expanded", "true");
  await expect(preview.getByText("Keep each turn in the conversation", { exact: false })).toBeVisible();
  await reasoning.press("Enter");
  await expect(reasoning).toHaveAttribute("aria-expanded", "false");
  await page.goto("/ai/action-bar");
  const edit = preview.getByRole("button", { name: "Edit", exact: true });
  await edit.focus();
  await edit.press("Enter");
  const input = preview.getByRole("textbox", { name: "Edit message" });
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("data-control-ui", "textarea");
  await input.fill("Keep the composer above the conversation.");
  await preview.getByRole("button", { name: "Save", exact: true }).click();
  await expect(edit).toBeFocused();
  await expect(preview.locator('[data-control-ui="chat-message"][data-slot="content"]').first()).toHaveText(
    "Keep the composer above the conversation.",
  );
});

test("rich composer keeps focus, inherited knobs, and disabled state consistent", async ({ page }) => {
  await page.goto("/use-cases/chat");
  const preview = page.locator("#preview");
  const composer = preview.locator('[data-control-ui="chat-composer"][data-slot="root"]');
  const shell = composer.locator('[data-slot="shell"]');
  const input = composer.getByRole("textbox", { name: "Message" });
  await expect(input).toHaveAttribute("contenteditable", "true");
  await composer.evaluate((element) => element.style.setProperty("--cui-chat-composer-input-foreground", "oklch(0.6 0.1 250)"));
  await expect(input).toHaveCSS("color", "oklch(0.6 0.1 250)");
  await input.click();
  await expect(shell).toHaveCSS("outline-style", "none");
  await input.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(input).toBeFocused();
  await expect(shell).not.toHaveCSS("outline-style", "none");
  await input.fill("Summarize the note.");
  await input.press("Enter");
  await expect(input).toHaveAttribute("contenteditable", "false");
  await expect(input).toHaveAttribute("aria-disabled", "true");
  await preview.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(input).toHaveAttribute("contenteditable", "true");
  await expect(input).toHaveAttribute("aria-disabled", "false");
});

test("citation is stable and its source preview remains keyboard accessible", async ({ page }) => {
  await page.goto("/ai/inline-citation");
  const preview = page.locator("#preview");
  const citation = preview.getByRole("button", { name: "View 3 sources" });
  await citation.focus();
  await citation.press("Enter");
  await expect(page.getByRole("link", { name: "Popover — shadcn/ui", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(citation).toBeFocused();
  await expect(page.locator("main").getByText("Beta", { exact: true })).toHaveCount(0);
});

test("failed responses preserve the draft and allow retry", async ({ page }) => {
  await page.route("**/api/mastra/agents/chat-preview/stream", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Preview temporarily unavailable" }) }),
  );
  await page.goto("/use-cases/chat");
  const preview = page.locator("#preview");
  const input = preview.getByRole("textbox", { name: "Message" });
  await input.fill("Preserve this draft.");
  await preview.getByRole("button", { name: "Send", exact: true }).click();
  await expect(preview.getByRole("alert")).toBeVisible();
  await expect(input).toHaveText("Preserve this draft.");
  await expect(input).toHaveAttribute("contenteditable", "true");
  await page.unroute("**/api/mastra/agents/chat-preview/stream");
  await preview.getByRole("button", { name: "Send", exact: true }).click();
  await expect(preview.getByRole("alert")).toHaveCount(0);
  await expect(input).toHaveText("");
});

test("message actions stay visible on touch screens", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/ai/action-bar");
  const preview = page.locator("#preview");
  await expect(preview.getByRole("toolbar", { name: "Your message actions" })).toHaveCSS("opacity", "1");
  await preview.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(preview.getByRole("textbox", { name: "Edit message" })).toBeFocused();
  await preview.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(preview.getByRole("button", { name: "Edit", exact: true })).toBeFocused();
  await context.close();
});

for (const skin of ["refined", "cuicui", "xp", "rig"]) {
  test(`${skin}: AI gallery renders at mobile width`, async ({ page }, testInfo) => {
    await page.addInitScript(({ key, skinId }) => localStorage.setItem(key, JSON.stringify({ skin: skinId, reduceMotion: true })), {
      key: THEME_EDITOR_STORAGE_KEY,
      skinId: skin,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/ai");
    await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
    await page.waitForLoadState("networkidle");
    const cards = page.locator("[data-gallery-item-id]");
    await expect(cards).not.toHaveCount(0);
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded();
      await expect(card.locator("[data-gallery-preview]")).toHaveAttribute("data-gallery-preview-state", "mounted");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    for (const id of ["chat-composer", "activity", "task-list", "user-ask"]) {
      const card = page.locator(`[data-gallery-item-id="${id}"]`);
      await card.scrollIntoViewIfNeeded();
      await card.screenshot({ path: testInfo.outputPath(`${id}.png`) });
      if (id === "chat-composer") {
        const previewBounds = await card.locator("[data-gallery-preview]").boundingBox();
        const shellBounds = await card.locator('[data-control-ui="chat-composer"][data-slot="shell"]').boundingBox();
        if (!previewBounds || !shellBounds) throw new Error("Composer preview is missing");
        expect(shellBounds.y).toBeGreaterThanOrEqual(previewBounds.y);
        expect(shellBounds.y + shellBounds.height).toBeLessThanOrEqual(previewBounds.y + previewBounds.height);
      }
    }
  });
}
