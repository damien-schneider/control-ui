import { expect, type Locator, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";

async function horizontalInsetError(container: Locator, content: Locator) {
  const [containerBox, contentBox] = await Promise.all([container.boundingBox(), content.boundingBox()]);
  if (!containerBox || !contentBox) return Number.POSITIVE_INFINITY;
  const leftInset = contentBox.x - containerBox.x;
  const rightInset = containerBox.x + containerBox.width - (contentBox.x + contentBox.width);
  return Math.abs(leftInset - rightInset);
}

test("floating toolbar contains search and skin controls while section navigation follows the sidebar header", async ({ page }) => {
  await page.goto("/primitives/button");

  const toolbar = page.locator("[data-docs-floating-toolbar]");
  const sidebarHeader = page.locator('[data-control-ui="sidebar"][data-slot="header"]');
  const sectionNavigation = page.getByRole("navigation", { name: "Documentation sections" });

  await expect(toolbar.getByRole("combobox", { name: "Search documentation" })).toBeVisible();
  await expect(toolbar.getByRole("button", { name: "Edit theme" })).toBeVisible();
  const skinSelect = toolbar.getByRole("combobox", { name: "Skin" });
  await expect(skinSelect).toHaveText("Windows XP");
  await skinSelect.click();
  const skinOptions = page.getByRole("listbox");
  for (const label of ["Refined", "Rig", "Flat", "Windows XP", "Liquid metal", "Modern Apple", "Cuicui", "Linear"]) {
    await expect(skinOptions.getByRole("option", { name: label })).toBeVisible();
  }
  await expect(skinOptions.getByRole("option", { name: "Windows XP" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Escape");
  await expect(toolbar.getByRole("navigation")).toHaveCount(0);
  await expect(toolbar.getByRole("link")).toHaveCount(0);
  await expect(sectionNavigation).toBeVisible();
  await expect(sectionNavigation.getByRole("combobox", { name: "Documentation section" })).toHaveText("Primitives");

  const [headerBox, navigationBox] = await Promise.all([sidebarHeader.boundingBox(), sectionNavigation.boundingBox()]);
  expect(headerBox).not.toBeNull();
  expect(navigationBox).not.toBeNull();
  expect(navigationBox?.y ?? 0).toBeGreaterThanOrEqual((headerBox?.y ?? 0) + (headerBox?.height ?? 0) - 1);

  await skinSelect.click();
  await page.getByRole("option", { name: "Rig" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-skin", "rig");
  await expect(skinSelect).toHaveText("Rig");
});

test("sidebar setup controls follow the section selector", async ({ page }) => {
  await page.goto("/ai");
  await page.waitForLoadState("networkidle");

  const sectionNavigation = page.getByRole("navigation", { name: "Documentation sections" });
  const integration = page.getByTestId("integration-select");
  await expect(sectionNavigation).toBeVisible();
  await expect(integration).toBeVisible();

  await expect
    .poll(async () => {
      const [navigationBox, integrationBox] = await Promise.all([sectionNavigation.boundingBox(), integration.boundingBox()]);
      if (!navigationBox || !integrationBox) return false;
      return integrationBox.y >= navigationBox.y + navigationBox.height - 1;
    })
    .toBe(true);
});

test("search closes without moving through a second focus state", async ({ page }) => {
  await page.goto("/primitives/button");
  await page.waitForLoadState("networkidle");

  const toolbar = page.locator("[data-docs-floating-toolbar]");
  const search = toolbar.getByRole("combobox", { name: "Search documentation" });
  const close = toolbar.getByRole("button", { name: "Close search" });
  const results = toolbar.locator('[data-control-ui="command"][data-slot="list"]');

  await search.fill("architecture");
  await expect(results).toBeVisible();

  await close.hover();
  await page.mouse.down();
  await expect(search).toBeFocused();
  await page.mouse.up();

  await expect(search).toHaveValue("");
  await expect(results).toBeHidden();
  await expect(close).toBeHidden();
});

test("active search keeps balanced outer spacing", async ({ page }) => {
  await page.goto("/primitives/button");
  await page.waitForLoadState("networkidle");

  const toolbar = page.locator("[data-docs-floating-toolbar]");
  const search = toolbar.getByRole("combobox", { name: "Search documentation" });
  const searchShell = search.locator("..");

  await search.focus();

  await expect.poll(() => horizontalInsetError(toolbar, searchShell)).toBeLessThan(1);
});

for (const { name, width, height } of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`floating toolbar fits its controls and expands for search on ${name}`, async ({ page }) => {
    // width motion is the subject here, so the default skin's reduced-motion flag is opted out of
    await page.addInitScript((storageKey) => {
      localStorage.setItem(storageKey, JSON.stringify({ skin: "refined" }));
    }, THEME_EDITOR_STORAGE_KEY);
    await page.setViewportSize({ width, height });
    await page.goto("/primitives/button");
    await page.waitForLoadState("networkidle");

    const panel = page.locator("[data-docs-floating-panel]");
    const toolbar = page.locator("[data-docs-floating-toolbar]");
    const skinControls = toolbar.locator("[data-skin-controls]");
    const themeEditorTrigger = toolbar.getByRole("button", { name: "Edit theme" });
    const search = toolbar.getByRole("combobox", { name: "Search documentation" });
    const maximumWidth = width - 16;
    const restingWidth = await panel.evaluate((element) => element.getBoundingClientRect().width);
    const focusedEndpoint = await toolbar.evaluate((element) => {
      const probe = document.createElement("div");
      probe.style.position = "fixed";
      probe.style.width = "min(34rem, calc(100vw - 1rem))";
      element.append(probe);
      const resolvedWidth = probe.getBoundingClientRect().width;
      probe.remove();
      return resolvedWidth;
    });

    expect(restingWidth).toBeLessThan(maximumWidth);
    await expect.poll(() => toolbar.evaluate((element) => element.getBoundingClientRect().width)).toBeCloseTo(restingWidth, 1);
    await expect.poll(() => skinControls.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);

    await themeEditorTrigger.focus();
    await expect.poll(() => panel.evaluate((element) => element.getBoundingClientRect().width)).toBeCloseTo(restingWidth, 1);

    await toolbar.evaluate((element) => {
      if (!(element instanceof HTMLElement)) return;
      element.style.setProperty("--duration-base", "10s");
      element.style.setProperty("--ease-standard", "linear");
    });
    await search.focus();

    const widthMotions = await toolbar.evaluate((element) => {
      const transitions = element
        .getAnimations({ subtree: true })
        .filter((animation): animation is CSSTransition => animation instanceof CSSTransition);
      for (const transition of transitions) {
        transition.pause();
        transition.currentTime = 5_000;
      }
      return transitions
        .filter((transition) => transition.transitionProperty === "width")
        .map((transition) => ({
          duration: transition.effect?.getTiming().duration,
          easing: transition.effect?.getTiming().easing,
        }));
    });
    expect(widthMotions).toHaveLength(2);
    expect(widthMotions.every((motion) => motion.duration === 10_000 && motion.easing === "linear")).toBe(true);

    const midpointWidth = await toolbar.evaluate((element) => element.getBoundingClientRect().width);
    expect(midpointWidth).toBeGreaterThan(restingWidth);
    expect(midpointWidth).toBeLessThan(focusedEndpoint);
    await expect.poll(() => panel.evaluate((element) => element.getBoundingClientRect().width)).toBeCloseTo(midpointWidth, 1);

    await toolbar.evaluate((element) => {
      for (const animation of element.getAnimations({ subtree: true })) animation.finish();
    });
    await expect.poll(() => panel.evaluate((element) => element.getBoundingClientRect().width)).toBeCloseTo(focusedEndpoint, 1);
    expect(focusedEndpoint).toBeLessThanOrEqual(maximumWidth + 1);
  });
}
