import { expect, type Locator, type Page, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "@/components/theme";
import { SKIN_META_BY_ID } from "@/components/theme-drawer/presets";
import type { SkinId } from "@/components/theme-drawer/types";
import { meanScreenshotDifference, waitForReactHydration } from "./browser-test-helpers";

async function visitWithSkin(page: Page, url: string, skin: SkinId) {
  await page.goto(url);
  await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toHaveText(SKIN_META_BY_ID[skin].label);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

async function inspectScrollEdge(page: Page, screenshot: Buffer) {
  return page.evaluate(async (encodedScreenshot) => {
    const image = new Image();
    image.src = `data:image/png;base64,${encodedScreenshot}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = 48;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas pixel inspection is unavailable");
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 24, image.width, 24).data;
    let coloredPixels = 0;
    let detailedPixels = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      if (Math.max(red, green, blue) - Math.min(red, green, blue) > 80) coloredPixels += 1;
      if ((index / 4 + 1) % image.width === 0) continue;
      const difference = Math.max(...[0, 1, 2].map((channel) => Math.abs(pixels[index + channel] - pixels[index + 4 + channel])));
      if (difference > 10) detailedPixels += 1;
    }
    return { coloredPixels, detailedPixels };
  }, screenshot.toString("base64"));
}

async function expectUnchangedBackdropAtZeroBlur(page: Page, viewport: Locator) {
  const scrollArea = viewport.locator("..");
  const overlays = scrollArea.locator(':scope > [data-control-family="progressive-blur"]');
  await expect(overlays).not.toHaveCount(0);
  await overlays.evaluateAll((elements) => {
    for (const element of elements) {
      if (element instanceof HTMLElement) element.style.setProperty("--cui-progressive-blur-backdrop-blur", "0px");
    }
  });
  await viewport.evaluate((element) => {
    element.scrollTop = 600;
  });
  await expect(scrollArea).toHaveAttribute("data-overflow-y-start", "");
  await expect(viewport).not.toHaveCSS("mask-image", "none");
  await expect(scrollArea.locator('[data-control-family="progressive-blur"][data-side="top"] [data-slot="layer"]').last()).toHaveCSS(
    "opacity",
    "1",
  );
  const withBlur = await scrollArea.screenshot({ animations: "disabled" });
  await overlays.evaluateAll((elements) => {
    for (const element of elements) {
      if (element instanceof HTMLElement) element.style.display = "none";
    }
  });
  const withoutBlur = await scrollArea.screenshot({ animations: "disabled" });
  expect(await meanScreenshotDifference(page, [withBlur, withoutBlur])).toBeLessThan(0.05);
}

for (const skinId of ["refined", "modern-apple"] as const) {
  test.describe(skinId, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(({ storageKey, skin }) => localStorage.setItem(storageKey, JSON.stringify({ skin })), {
        storageKey: THEME_EDITOR_STORAGE_KEY,
        skin: skinId,
      });
    });

    for (const mode of ["light", "dark"]) {
      test(`search results retain text beneath the blur in ${mode} mode`, async ({ page }) => {
        await page.addInitScript(({ key, theme }) => localStorage.setItem(key, theme), { key: THEME_STORAGE_KEY, theme: mode });
        await visitWithSkin(page, "/primitives/phone-input", skinId);
        const searchTrigger = page.getByRole("button", { name: "Search documentation", exact: true });
        await waitForReactHydration(searchTrigger);
        await searchTrigger.click();
        const dialog = page.getByRole("dialog");
        const search = dialog.getByRole("combobox", { name: "Search documentation", exact: true });
        await expect(search).toBeFocused();
        const list = dialog.locator('[data-control-ui="command"][data-slot="list"]');
        await expect(list).toBeVisible();
        const viewport = dialog.locator("[data-scroll-area-viewport]");
        await viewport.evaluate((element) => {
          const result = element.querySelectorAll("[cmdk-item]")[30];
          element.scrollTop += result.getBoundingClientRect().top - element.getBoundingClientRect().top - 28;
        });
        await expect(viewport.locator("..")).toHaveAttribute("data-overflow-y-start", "");
        if (skinId === "modern-apple")
          await expect(dialog.locator('[data-side="top"] [data-slot="layer"]').last()).toHaveCSS("opacity", "1");
        expect((await inspectScrollEdge(page, await dialog.screenshot())).detailedPixels).toBeGreaterThan(100);
        await expect(search).toBeFocused();
      });
    }

    test("sidebar blur preserves the underlying surface", async ({ page }) => {
      await visitWithSkin(page, "/primitives/scroll-area", skinId);
      await waitForReactHydration(page.getByLabel("Horizontal roadmap", { exact: true }).getByRole("button").first());
      const viewport = page.locator("[data-docs-sidebar-navigation] [data-scroll-area-viewport]");
      await expectUnchangedBackdropAtZeroBlur(page, viewport);
    });

    test("code block blur preserves syntax at the clipped edge", async ({ page }) => {
      await visitWithSkin(page, "/primitives/scroll-area", skinId);
      await waitForReactHydration(page.getByLabel("Horizontal roadmap", { exact: true }).getByRole("button").first());
      const viewport = page.locator('[data-control-family="code"][data-slot="content"][data-scroll-area-viewport]');
      const scrollArea = viewport.locator("..");
      await scrollArea.scrollIntoViewIfNeeded();
      await viewport.evaluate((element) => {
        element.scrollTop = 580;
      });
      await expect(scrollArea).toHaveAttribute("data-overflow-y-start", "");
      await expect(scrollArea.locator('[data-control-family="progressive-blur"][data-side="top"] [data-slot="layer"]').last()).toHaveCSS(
        "opacity",
        "1",
      );
      expect((await inspectScrollEdge(page, await scrollArea.screenshot())).coloredPixels).toBeGreaterThan(10);
    });

    test("country list blur preserves the masked countries", async ({ page }) => {
      await visitWithSkin(page, "/primitives/phone-input", skinId);
      const countryTrigger = page.getByRole("button", { name: "Phone number country: France (+33)", exact: true }).first();
      await waitForReactHydration(countryTrigger);
      await countryTrigger.click();
      const popup = page.locator('[data-popup-kind="popover"][data-popup-part="surface"]');
      const viewport = popup.locator("[data-scroll-area-viewport]");
      const scrollArea = viewport.locator("..");
      await viewport.evaluate((element) => {
        element.scrollTop = 600;
      });
      await expect(scrollArea).toHaveAttribute("data-overflow-y-start", "");
      await expect(scrollArea.locator('[data-control-family="progressive-blur"][data-side="top"] [data-slot="layer"]').last()).toHaveCSS(
        "opacity",
        "1",
      );
      expect((await inspectScrollEdge(page, await scrollArea.screenshot())).coloredPixels).toBeGreaterThan(10);
      await expectUnchangedBackdropAtZeroBlur(page, viewport);
    });
  });
}

for (const skinId of ["refined", "modern-apple", "linear"] as const) {
  for (const mode of ["light", "dark"]) {
    test(`${skinId} ${mode} country picker preserves its surface and search outline`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 1100 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(
        ({ editorKey, themeKey, skin, theme }) => {
          localStorage.setItem(editorKey, JSON.stringify({ skin }));
          localStorage.setItem(themeKey, theme);
        },
        { editorKey: THEME_EDITOR_STORAGE_KEY, themeKey: THEME_STORAGE_KEY, skin: skinId, theme: mode },
      );
      await visitWithSkin(page, "/primitives/phone-input", skinId);
      const trigger = page.getByRole("button", { name: "Phone number country: France (+33)", exact: true }).first();
      await waitForReactHydration(trigger);
      await trigger.click();
      const popup = page.locator('[data-popup-kind="popover"][data-popup-part="surface"]');
      const command = popup.locator('[data-popup-kind="command"][data-slot="root"]');
      const input = popup.getByRole("combobox");
      await input.focus();
      await expect(input).toBeFocused();
      const inputBounds = await input.locator("..").boundingBox();
      if (!inputBounds) throw new Error("Missing country search bounds");
      const clip = { x: inputBounds.x - 6, y: inputBounds.y - 6, width: inputBounds.width + 12, height: inputBounds.height + 12 };
      const searchOutline = await page.screenshot({ clip });
      await command.evaluate((element) => {
        element.style.overflow = "visible";
      });
      const unclippedOutline = await page.screenshot({ clip });
      expect(await meanScreenshotDifference(page, [searchOutline, unclippedOutline])).toBeLessThan(0.05);

      const surface = await popup.screenshot();
      await command.evaluate((element) => {
        element.style.background = "transparent";
        element.style.boxShadow = "none";
        element.style.backdropFilter = "none";
      });
      const parentSurface = await popup.screenshot();
      expect(await meanScreenshotDifference(page, [surface, parentSurface])).toBeLessThan(0.05);

      await input.fill("Germany");
      await expect(popup.getByRole("option", { name: /Germany/ })).toBeVisible();
      await input.press("Enter");
      await expect(popup).toBeHidden();
      await expect(page.getByRole("button", { name: "Phone number country: Germany (+49)", exact: true }).first()).toBeVisible();
    });
  }
}
