import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";
import { disableAnchorSupport, expectHighlightOn } from "./track-highlight-helpers";

test("track highlight is discoverable as a primitive with working hover and selection examples", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "refined" }));
  }, THEME_EDITOR_STORAGE_KEY);
  await page.goto("/primitives/button");
  const navigation = page.locator("[data-docs-sidebar-navigation]");
  const link = navigation.getByRole("link", { name: "Track highlight", exact: true });
  await waitForReactHydration(link);
  await link.click();
  await expect(page).toHaveURL(/\/primitives\/track-highlight$/);
  await expect(page.getByRole("heading", { name: "Track highlight", exact: true, level: 1 })).toBeVisible();

  const hover = page.getByRole("group", { name: "Hover and focus", exact: true });
  const activity = hover.getByRole("button", { name: "Activity", exact: true });
  const overview = hover.getByRole("button", { name: "Overview", exact: true });
  const hoverHighlight = hover.locator('[data-control-family="track-highlight"]');
  await waitForReactHydration(activity);
  const idleFill = await activity.evaluate((node) => getComputedStyle(node).backgroundColor);
  const selectedFill = await overview.evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(selectedFill).not.toBe(idleFill);
  await overview.hover();
  await expect(overview).toHaveCSS("background-color", selectedFill);
  await activity.hover();
  await expectHighlightOn(hoverHighlight, activity);
  await expect(hoverHighlight).toHaveCSS("border-radius", await activity.evaluate((node) => getComputedStyle(node).borderRadius));
  await expect(activity).toHaveCSS("background-color", idleFill);
  await expect(overview).toHaveCSS("background-color", selectedFill);
  await expect(overview).toHaveAttribute("aria-pressed", "true");
  await activity.click();
  await expect(activity).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Tab");
  const members = hover.getByRole("button", { name: "Members", exact: true });
  await expect(members).toBeFocused();
  await expectHighlightOn(hoverHighlight, members);
  await expect(hover.getByRole("button", { name: "Archived", exact: true })).toBeDisabled();

  const selection = page.getByRole("group", { name: "Selection and preview", exact: true });
  await selection.scrollIntoViewIfNeeded();
  const selectionHighlight = selection.locator('[data-control-family="track-highlight"]');
  const initialSelection = selection.getByRole("button", { name: "Overview", exact: true });
  const preview = selection.getByRole("button", { name: "Activity", exact: true });
  const selected = selection.getByRole("button", { name: "Members", exact: true });
  await expectHighlightOn(selectionHighlight, initialSelection);
  await expect(initialSelection).toHaveCSS("background-color", idleFill);
  await selected.click();
  await expect(selected).toHaveAttribute("aria-pressed", "true");
  await preview.hover();
  await expectHighlightOn(selectionHighlight, preview);
  await expect(preview).toHaveCSS("background-color", idleFill);
  await expect(selected).toHaveCSS("background-color", idleFill);
  await page.mouse.move(0, 0);
  await expectHighlightOn(selectionHighlight, selected);
  await expect(selectionHighlight).toHaveCSS("border-radius", await selected.evaluate((node) => getComputedStyle(node).borderRadius));
  const initialRadius = await selected.evaluate((node) => getComputedStyle(node).borderRadius);
  await selection.evaluate((node) => node.style.setProperty("--radius-control", "12px"));
  await expect(selected).not.toHaveCSS("border-radius", initialRadius);
  await expect(selectionHighlight).toHaveCSS("border-radius", await selected.evaluate((node) => getComputedStyle(node).borderRadius));
});

for (const positioning of ["anchors", "fallback"]) {
  test.describe(positioning, () => {
    test.use({ viewport: { width: 1440, height: 1100 } });
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((storageKey) => {
        localStorage.setItem(storageKey, JSON.stringify({ skin: "refined" }));
      }, THEME_EDITOR_STORAGE_KEY);
      if (positioning === "fallback") await disableAnchorSupport(page);
    });

    test("sidebar hover preserves selection, follows focus, and stays within its group", async ({ page }) => {
      await page.goto("/primitives/sidebar");
      await waitForReactHydration(page.getByRole("combobox", { name: "Menu highlight" }));
      await page.getByRole("combobox", { name: "Menu highlight" }).selectOption("hover");
      const group = page.getByRole("group", { name: "Sidebar", exact: true });
      const highlight = group.locator('[data-control-family="track-highlight"]').first();
      const agents = group.getByRole("button", { name: "Agents", exact: true });
      const workflows = group.getByRole("button", { name: "Workflows", exact: true });
      const settings = group.getByRole("button", { name: "Settings", exact: true });
      await waitForReactHydration(agents);
      await workflows.hover();
      await expectHighlightOn(highlight, workflows);
      await expect(highlight).toHaveCSS("border-radius", await workflows.evaluate((node) => getComputedStyle(node).borderRadius));
      await expect(agents).toHaveAttribute("data-active", "true");
      await expect(workflows).not.toHaveAttribute("data-active");
      await group.getByRole("button", { name: "Tools", exact: true }).hover({ force: true });
      if (positioning === "anchors") await expect(highlight).toBeHidden();
      else await expect(highlight).toHaveCSS("opacity", "0");
      await settings.hover();
      await expectHighlightOn(highlight, settings);
      await settings.click();
      await expect(settings).toHaveAttribute("data-active", "true");
      const otherGroup = group.locator('[data-slot="menu-track"]').last();
      const otherHighlight = otherGroup.locator('[data-control-family="track-highlight"]');
      const documentation = otherGroup.getByRole("link", { name: "Documentation", exact: true });
      await documentation.hover();
      await expectHighlightOn(otherHighlight, documentation);
      if (positioning === "anchors") await expect(highlight).toBeHidden();
      else await expect(highlight).toHaveCSS("opacity", "0");
      await page.keyboard.press("Tab");
      await workflows.focus();
      await expectHighlightOn(highlight, workflows);
      await page.keyboard.press("Tab");
      await expect(group.getByRole("button", { name: "Workflows actions", exact: true })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(settings).toBeFocused();
      await expectHighlightOn(highlight, settings);
      await expect(group.getByRole("button", { name: "Tools", exact: true })).toBeDisabled();
      expect(await highlight.evaluate((node) => Boolean(node.style.top))).toBe(positioning === "fallback");
    });

    test("checkbox hover keeps all selections and tracks full labels", async ({ page }) => {
      await page.goto("/primitives/checkbox-group");
      const group = page.getByRole("group", { name: "Notification channels" });
      const highlight = group.locator('[data-control-family="track-highlight"]').first();
      const sms = group.getByRole("checkbox", { name: "SMS" });
      const smsRow = group.locator('label[for="channel-sms"]');
      await waitForReactHydration(sms);
      await group.getByText("Critical alerts only", { exact: true }).hover();
      await expectHighlightOn(highlight, smsRow);
      await expect(highlight).toHaveCSS("border-radius", await smsRow.evaluate((node) => getComputedStyle(node).borderRadius));
      await expect(sms).toHaveAttribute("aria-checked", "false");
      await expect(group.getByRole("checkbox", { name: "Email" })).toHaveAttribute("aria-checked", "true");
      await expect(group.getByRole("checkbox", { name: "Push" })).toHaveAttribute("aria-checked", "true");
      await group.getByText("Critical alerts only", { exact: true }).click();
      await expect(sms).toHaveAttribute("aria-checked", "true");
      await page.keyboard.press("Tab");
      const push = group.getByRole("checkbox", { name: "Push" });
      await expect(push).toBeFocused();
      await expectHighlightOn(highlight, group.locator('label[for="channel-push"]'));
      await page.keyboard.press("Space");
      await expect(push).toHaveAttribute("aria-checked", "false");
    });
  });
}

test("CSS hover highlight snaps to unequal rows with either motion preference", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "refined" }));
  }, THEME_EDITOR_STORAGE_KEY);
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/primitives/sidebar");
  await waitForReactHydration(page.getByRole("combobox", { name: "Menu highlight" }));
  await page.getByRole("combobox", { name: "Menu highlight" }).selectOption("hover");
  const group = page.getByRole("group", { name: "Sidebar", exact: true });
  const highlight = group.locator('[data-control-family="track-highlight"]').first();
  const first = group.getByRole("button", { name: "Agents", exact: true });
  const last = group.getByRole("button", { name: "Settings", exact: true });
  await first.hover();
  await expectHighlightOn(highlight, first);
  const lastBox = await last.boundingBox();
  if (!lastBox) throw new Error("Sidebar row is not laid out");
  await last.hover();
  const positions = await highlight.evaluate(async (node) => {
    const framePositions: number[] = [];
    for (let frame = 0; frame < 12; frame++) {
      await new Promise(requestAnimationFrame);
      framePositions.push(node.getBoundingClientRect().y);
    }
    return framePositions;
  });
  expect(positions.every((top) => Math.abs(top - lastBox.y) < 1)).toBe(true);
  await expectHighlightOn(highlight, last);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(highlight).toHaveCSS("transition-duration", "0s");
  await first.hover();
  await expectHighlightOn(highlight, first);
});

test("highlight works in static markup without JavaScript", async ({ page, browser }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/primitives/sidebar");
  await waitForReactHydration(page.getByRole("combobox", { name: "Menu highlight" }));
  await page.getByRole("combobox", { name: "Menu highlight" }).selectOption("hover");
  await expect(page.getByRole("group", { name: "Sidebar", exact: true })).toBeVisible();
  const markup = await page.content();
  const staticPage = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 1440, height: 1100 } });
  try {
    await staticPage.route("**/primitives/sidebar", (route) => route.fulfill({ contentType: "text/html", body: markup }));
    await staticPage.goto("http://127.0.0.1:3000/primitives/sidebar");
    const group = staticPage.getByRole("group", { name: "Sidebar", exact: true });
    const workflows = group.getByRole("button", { name: "Workflows", exact: true });
    await workflows.hover();
    await expectHighlightOn(group.locator('[data-control-family="track-highlight"]').first(), workflows);
  } finally {
    await staticPage.close();
  }
});

test("anchor syntax support without transitions uses the measured fallback", async ({ page }) => {
  await page.addInitScript(() => {
    const getAnimations = Element.prototype.getAnimations;
    Element.prototype.getAnimations = function (options) {
      if (this.parentElement?.style.anchorScope === "--_track-transition-probe") return [];
      return getAnimations.call(this, options);
    };
  });
  await page.goto("/primitives/sidebar");
  await waitForReactHydration(page.getByRole("combobox", { name: "Menu highlight" }));
  await page.getByRole("combobox", { name: "Menu highlight" }).selectOption("hover");
  const group = page.getByRole("group", { name: "Sidebar", exact: true });
  const workflows = group.getByRole("button", { name: "Workflows", exact: true });
  const highlight = group.locator('[data-control-family="track-highlight"]').first();
  await waitForReactHydration(workflows);
  await workflows.hover();
  await expect(highlight).toHaveAttribute("data-measured", "");
  await expectHighlightOn(highlight, workflows);
});
