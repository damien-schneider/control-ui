import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";
import { blankPoint, cursorAt, expectTextFocusEdge, paintedEdge, waitForReactHydration, waitForSkinLayout } from "./browser-test-helpers";

const composerVariantsWithOwnCode = [
  { skin: "refined", appearance: "light" },
  { skin: "modern-apple", appearance: "light" },
  { skin: "liquid-metal", appearance: "light" },
  { skin: "cuicui", appearance: "dark" },
];

for (const { skin, appearance } of composerVariantsWithOwnCode) {
  test(`${skin} ${appearance}: composer focus, selectors, and knobs`, async ({ page }) => {
    await page.addInitScript(
      ({ skinKey, themeKey, skinId, appearance: themeAppearance }) => {
        localStorage.setItem(skinKey, JSON.stringify({ skin: skinId, reduceMotion: true }));
        localStorage.setItem(themeKey, themeAppearance);
      },
      { skinKey: THEME_EDITOR_STORAGE_KEY, themeKey: THEME_STORAGE_KEY, skinId: skin, appearance },
    );
    await page.goto("/kits/chat-composer");
    const preview = page.locator("#preview");
    const composer = preview.locator('[data-control-ui="chat-composer"][data-slot="root"]');
    const shell = composer.locator('[data-slot="shell"]');
    const input = composer.getByRole("textbox", { name: "Message" });
    const model = composer.getByRole("button", { name: /^Model: / });
    await waitForSkinLayout(page, skin);
    await expect(input).toBeVisible();
    await waitForReactHydration(input);
    const restingEdge = await paintedEdge(shell);
    await input.click();
    await expect(input).toHaveCSS("outline-width", "0px");
    await expectTextFocusEdge(shell, restingEdge);
    await input.press("Tab");
    await expect(model).toBeFocused();
    await expect.poll(() => paintedEdge(shell)).toBe(restingEdge);
    await model.press("Shift+Tab");
    await expect(input).toBeFocused();
    await expectTextFocusEdge(shell, restingEdge);
    await input.press("Tab");
    await expect(shell).toHaveCSS("outline-style", "none");
    await expect(model).toHaveAccessibleName("Model: Claude Sonnet 4.5, Thinking: Medium");
    const chevron = model.locator('[data-slot="chevron"]');
    await expect(chevron).not.toHaveCSS("color", "rgba(0, 0, 0, 0)");
    await model.press("Enter");
    await expect(chevron).toHaveCSS("rotate", "180deg");
    const modelOption = page.getByRole("option", { name: "Gemini 2.5 Pro" });
    await expect(modelOption).toBeVisible();
    await expect(modelOption.locator("svg").first()).toBeVisible();
    await modelOption.click();
    await expect(modelOption).toBeHidden();
    await expect(model).toHaveAccessibleName("Model: Gemini 2.5 Pro, Thinking: Medium");
    await expect(model).toBeFocused();
    const toolbarSpace = await blankPoint(composer.locator('[data-slot="toolbar"]'));
    expect(await cursorAt(page, toolbarSpace)).toBe("text");
    await expect(model).toHaveCSS("cursor", "pointer");
    await page.mouse.click(toolbarSpace.x, toolbarSpace.y);
    await expect(input).toBeFocused();
    await model.click();
    const thinking = page.getByRole("slider", { name: "Thinking" });
    await thinking.focus();
    await thinking.press("ArrowRight");
    await expect(thinking).toHaveAttribute("aria-valuetext", "High");
    await expect(model).toHaveAccessibleName("Model: Gemini 2.5 Pro, Thinking: High");
    await page.keyboard.press("Escape");
    await expect(thinking).toBeHidden();
    await input.click();
    await expectTextFocusEdge(shell, restingEdge);
    await input.fill("Draft the deployment announcement.");
    await input.press("Shift+Enter");
    await input.pressSequentially("Include a rollback plan.");
    await input.press("Enter");
    await expect(input).toHaveValue("");
    await expect(preview.locator('[data-control-ui="chat-message"][data-slot="content"]')).toContainText("Include a rollback plan.");
    await expect(composer.getByRole("button", { name: "Send message" })).toBeDisabled();
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

test("reasoning reuses Activity", async ({ page }) => {
  await page.goto("/kits/chat-layout");
  const preview = page.locator("#preview");
  const reasoning = preview.getByRole("button", { name: "Thought for 2 seconds" });
  await waitForReactHydration(reasoning);
  await expect(reasoning).toHaveAttribute("data-control-ui", "activity");
  await reasoning.focus();
  await reasoning.press("Enter");
  await expect(reasoning).toHaveAttribute("aria-expanded", "true");
  await expect(preview.getByText("Keep each turn in the conversation", { exact: false })).toBeVisible();
  await reasoning.press("Enter");
  await expect(reasoning).toHaveAttribute("aria-expanded", "false");
});

test("rich composer keeps focus, inherited knobs, and locks read-only while responding", async ({ page }) => {
  await page.goto("/templates/chat");
  const preview = page.locator("#preview");
  const composer = preview.locator('[data-control-ui="chat-composer"][data-slot="root"]');
  const shell = composer.locator('[data-slot="shell"]');
  const input = composer.getByRole("textbox", { name: "Message" });
  await expect(input).toHaveAttribute("contenteditable", "true");
  await composer.evaluate((element) => element.style.setProperty("--cui-chat-composer-input-foreground", "oklch(0.6 0.1 250)"));
  await expect(input).toHaveCSS("color", "oklch(0.6 0.1 250)");
  const restingEdge = await paintedEdge(shell);
  await input.click();
  await expectTextFocusEdge(shell, restingEdge);
  await input.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(input).toBeFocused();
  await expectTextFocusEdge(shell, restingEdge);
  await input.blur();
  await expect.poll(() => paintedEdge(shell)).toBe(restingEdge);
  const toolbarSpace = await blankPoint(composer.locator('[data-slot="toolbar"]'));
  await page.mouse.click(toolbarSpace.x, toolbarSpace.y);
  await expect(input).toBeFocused();
  await input.fill("Summarize the note.");
  await input.press("Enter");
  await expect(input).toHaveAttribute("contenteditable", "true");
  await expect(input).toHaveAttribute("aria-readonly", "true");
  await expect(input).toHaveAttribute("aria-busy", "true");
  await preview.getByRole("button", { name: "Stop response", exact: true }).click();
  await expect(input).not.toHaveAttribute("aria-readonly", "true");
  await expect(input).not.toHaveAttribute("aria-busy", "true");
});

test("citation is stable and its source preview remains keyboard accessible", async ({ page }) => {
  await page.goto("/kits/inline-citation");
  const preview = page.locator("#preview");
  const citation = preview.getByRole("button", { name: "view 3 sources" });
  await waitForReactHydration(citation);
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
  await page.goto("/templates/chat");
  const preview = page.locator("#preview");
  const input = preview.getByRole("textbox", { name: "Message" });
  const send = preview.getByRole("button", { name: "Send", exact: true });
  await expect(input).toHaveAttribute("contenteditable", "true");
  await input.fill("Preserve this draft.");
  await send.click();
  await expect(preview.getByRole("alert")).toBeVisible();
  await expect(input).toHaveText("Preserve this draft.");
  await expect(input).toHaveAttribute("contenteditable", "true");
  await page.unroute("**/api/mastra/agents/chat-preview/stream");
  await send.click();
  await expect(preview.getByRole("alert")).toHaveCount(0);
  await expect(input).toHaveText("");
});

test("message actions stay visible on touch screens", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/kits/action-bar");
  const preview = page.locator("#preview");
  const actions = preview.getByRole("toolbar", { name: "Message actions" });
  await waitForReactHydration(actions);
  await expect(actions).toHaveCSS("opacity", "1");
  await preview.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(preview.getByRole("textbox", { name: "Edit message" })).toBeFocused();
  await preview.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(preview.getByRole("button", { name: "Edit", exact: true })).toBeFocused();
  await context.close();
});

for (const skin of ["refined", "xp"]) {
  test(`${skin}: AI gallery renders at mobile width`, async ({ page }) => {
    await page.addInitScript(({ key, skinId }) => localStorage.setItem(key, JSON.stringify({ skin: skinId, reduceMotion: true })), {
      key: THEME_EDITOR_STORAGE_KEY,
      skinId: skin,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/kits");
    await waitForSkinLayout(page, skin);
    const cards = page.locator("[data-gallery-item-id]");
    await expect(cards).not.toHaveCount(0);
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded();
      await expect(card.locator("[data-gallery-preview]")).toHaveAttribute("data-gallery-preview-state", "mounted");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    const composerCard = page.locator('[data-gallery-item-id="chat-composer"]');
    await composerCard.scrollIntoViewIfNeeded();
    const previewBounds = await composerCard.locator("[data-gallery-preview]").boundingBox();
    const shellBounds = await composerCard.locator('[data-control-ui="chat-composer"][data-slot="shell"]').boundingBox();
    if (!previewBounds || !shellBounds) throw new Error("Composer preview is missing");
    expect(shellBounds.y).toBeGreaterThanOrEqual(previewBounds.y);
    expect(shellBounds.y + shellBounds.height).toBeLessThanOrEqual(previewBounds.y + previewBounds.height);
  });
}
