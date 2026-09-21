import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

test("sidebar header carries the skin picker and the theme editor link", async ({ page }) => {
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "xp" }));
  }, THEME_EDITOR_STORAGE_KEY);
  await page.goto("/primitives/button");

  const header = page.locator('[data-control-ui="sidebar"][data-slot="header"]');
  const skinSelect = header.getByRole("combobox", { name: "Skin" });
  await waitForReactHydration(skinSelect);

  await expect(header.getByRole("link", { name: "Edit theme" })).toBeVisible();
  await expect(skinSelect).toHaveText("Windows XP");

  await skinSelect.click();
  const skinOptions = page.getByRole("listbox");
  for (const label of ["Refined", "Rig", "No skin", "Windows XP", "Liquid metal", "macOS", "Cuicui", "Linear"]) {
    await expect(skinOptions.getByRole("option", { name: label })).toBeVisible();
  }
  await expect(skinOptions.getByRole("option", { name: "Windows XP" })).toHaveAttribute("aria-selected", "true");

  await skinOptions.getByRole("option", { name: "Rig" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-skin", "rig");
  await expect(skinSelect).toHaveText("Rig");
});

test("search opens as a dialog from the sidebar and navigates to a result", async ({ page }) => {
  await page.goto("/primitives/button");
  const trigger = page.getByRole("button", { name: "Search documentation" });
  await waitForReactHydration(trigger);

  await trigger.click();
  const dialog = page.getByRole("dialog");
  const input = dialog.getByRole("combobox", { name: "Search documentation" });
  await expect(input).toBeFocused();

  await input.fill("architecture");
  await dialog
    .getByRole("option", { name: /Architecture/ })
    .first()
    .click();

  await expect(page).toHaveURL(/\/architecture$/);
  await expect(dialog).toBeHidden();
});

test("command+k opens search and escape closes it", async ({ page }) => {
  await page.goto("/primitives/button");
  await waitForReactHydration(page.getByRole("button", { name: "Search documentation" }));

  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("search shortcut still works when the sidebar collapses into its sheet", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/primitives/button");
  await waitForReactHydration(page.getByRole("button", { name: "Toggle Sidebar" }));

  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("combobox", { name: "Search documentation" })).toBeFocused();
});

test("the integration selector shows up only where switching rewrites the code", async ({ page }) => {
  await page.goto("/components/chat-message");
  const integration = page.locator("#usage").getByTestId("integration-select");
  await waitForReactHydration(integration);
  await expect(integration).toHaveText("Mastra");

  const usage = page.locator('#usage [data-slot="grid"]').first();
  await expect(usage).toContainText('from "@mastra/core/agent/message-list"');
  await integration.click();
  await page.getByRole("listbox").getByRole("option", { name: "AI SDK" }).click();
  await expect(integration).toHaveText("AI SDK");
  await expect(usage).toContainText('type UIMessage } from "ai"');

  await page.goto("/components/thread-rail");
  await expect(page.locator("#usage")).toBeVisible();
  await expect(page.getByTestId("integration-select")).toHaveCount(0);

  await page.goto("/primitives/button");
  await expect(page.getByTestId("integration-select")).toHaveCount(0);
});

test("integration-dependent block usage and guide code carry the selector", async ({ page }) => {
  await page.goto("/use-cases/chat");
  const blockIntegration = page.locator("#usage").getByTestId("integration-select");
  await waitForReactHydration(blockIntegration);
  await expect(blockIntegration).toHaveText("Mastra");

  await page.goto("/use-cases/theme-toggle");
  await expect(page.locator("#usage")).toBeVisible();
  await expect(page.getByTestId("integration-select")).toHaveCount(0);

  await page.goto("/build-a-screen");
  const guideIntegration = page.getByTestId("integration-select");
  await waitForReactHydration(guideIntegration);
  const guideCode = page.locator('#compose [data-slot="grid"]').first();
  await expect(guideCode).toContainText('from "@mastra/react"');

  await guideIntegration.click();
  await page.getByRole("listbox").getByRole("option", { name: "AI SDK" }).click();
  await expect(guideIntegration).toHaveText("AI SDK");
  await expect(guideCode).toContainText('import type { UIMessage } from "ai"');
});
