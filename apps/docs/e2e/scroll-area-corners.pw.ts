import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { meanScreenshotDifference, waitForReactHydration } from "./browser-test-helpers";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((key) => localStorage.setItem(key, JSON.stringify({ skin: "modern-apple" })), THEME_EDITOR_STORAGE_KEY);
});

test("attachment corners take priority over blur and retain the edge fade", async ({ page }, testInfo) => {
  await page.goto("/ai/chat-composer-attachment");
  const shell = page.locator('#preview [data-control-family="chat-composer"][data-slot="shell"]');
  const viewport = shell.locator("[data-scroll-area-viewport]");
  const scrollArea = viewport.locator("..");
  const endBlur = scrollArea.locator('[data-control-family="progressive-blur"][data-side="inline-end"]');
  await waitForReactHydration(shell.getByRole("button").first());
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect(scrollArea).toHaveAttribute("data-overflow-x-end", "");
  await expect(viewport).not.toHaveCSS("mask-image", "none");

  for (const cornerShape of ["superellipse(1.25)", "squircle", "scoop"]) {
    await shell.evaluate((element, shape) => element.style.setProperty("--corner-shape", shape), cornerShape);
    await expect(shell).toHaveCSS("corner-shape", cornerShape);
    await expect(scrollArea).toHaveCSS("corner-shape", cornerShape);
    const withRequestedBlur = await shell.screenshot({ animations: "disabled" });
    await endBlur.evaluate((element) => {
      element.style.display = "none";
    });
    const fadeOnly = await shell.screenshot({ animations: "disabled" });
    expect(await meanScreenshotDifference(page, [withRequestedBlur, fadeOnly])).toBeLessThan(0.05);
    await endBlur.evaluate((element) => element.style.removeProperty("display"));
  }

  await shell.evaluate((element) => element.style.setProperty("--corner-shape", "superellipse(1.25)"));
  await shell.screenshot({ path: testInfo.outputPath("attachment-fade.png") });
  await viewport.evaluate((element) => {
    element.scrollLeft = 100;
  });
  await expect(scrollArea).toHaveAttribute("data-overflow-x-start", "");
  await shell.evaluate((element) => element.style.setProperty("--corner-shape", "round"));
  await expect(endBlur).toHaveCSS("display", "block");
  await expect(endBlur.locator('[data-slot="layer"]').last()).toHaveCSS("opacity", "1");
  expect(await viewport.evaluate((element) => element.scrollLeft)).toBe(100);
});

test("code blocks and popup lists preserve the skin corners", async ({ page }) => {
  await page.goto("/primitives/phone-input");
  const code = page.locator('[data-control-family="code"][data-slot="root"]:has([data-scroll-area-viewport])').first();
  await expect(code).toHaveCSS("corner-shape", "superellipse(1.25)");
  const countryTrigger = page.getByRole("button", { name: "Phone number country: France (+33)", exact: true }).first();
  await waitForReactHydration(countryTrigger);
  await countryTrigger.click();
  const popup = page.locator('[data-popup-kind="popover"][data-popup-part="surface"]');
  await expect(popup).toHaveCSS("corner-shape", "superellipse(1.25)");
  await expect(popup.locator('[data-popup-kind="command"][data-slot="root"]')).toHaveCSS("corner-shape", "superellipse(1.25)");
  await expect(popup.locator("[data-scroll-area-viewport]")).not.toHaveCSS("mask-image", "none");
  await expect(popup.locator('[data-control-family="progressive-blur"][data-side="bottom"]')).toHaveCSS("display", "none");
});
