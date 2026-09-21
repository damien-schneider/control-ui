import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

for (const theme of ["light", "dark"]) {
  test(`attachment progress covers the remaining content in ${theme} mode`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.addInitScript(
      ({ editorKey, themeKey, appearance }) => {
        localStorage.setItem(editorKey, JSON.stringify({ skin: "modern-apple" }));
        localStorage.setItem(themeKey, appearance);
      },
      { editorKey: THEME_EDITOR_STORAGE_KEY, themeKey: THEME_STORAGE_KEY, appearance: theme },
    );
    await page.goto("/components/chat-composer-attachment");
    const shell = page.locator('#preview [data-control-family="chat-composer"][data-slot="shell"]');
    const image = shell.getByRole("listitem", { name: "vision-reference.png" });
    const remove = image.getByRole("button", { name: "Remove vision-reference.png" });
    await waitForReactHydration(remove);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const progress = image.getByRole("progressbar", { name: "Uploading vision-reference.png" });
    await expect(progress).toHaveAttribute("aria-valuenow", "64");
    const indicator = progress.locator('[data-slot="progress-indicator"]');
    const geometry = await indicator.evaluate((element) => {
      const attachment = element.closest("li");
      if (!attachment) throw new Error("The progress overlay must belong to an attachment");
      const tile = attachment.getBoundingClientRect();
      const veil = element.getBoundingClientRect();
      return { height: veil.height / tile.height, width: veil.width / tile.width, rightInset: tile.right - veil.right };
    });
    expect(geometry.height).toBe(1);
    expect(geometry.width).toBeCloseTo(0.36, 2);
    expect(geometry.rightInset).toBe(0);

    const file = shell.getByRole("listitem", { name: "Document_de_Synthese_J0025.pdf" });
    const preview = file.locator('[data-slot="preview"]');
    const fileBounds = await file.boundingBox();
    const previewBounds = await preview.boundingBox();
    if (!fileBounds || !previewBounds) throw new Error("The file tile must have visible bounds");
    expect(previewBounds.x).toBe(fileBounds.x);
    expect(previewBounds.y).toBe(fileBounds.y);
    expect(previewBounds.height).toBe(fileBounds.height);
    await expect(file).toHaveCSS("border-width", "0px");
    await expect(preview).toHaveCSS("border-radius", "0px");
    await shell.screenshot({ path: testInfo.outputPath(`attachment-${theme}.png`) });

    await image.evaluate((element) => element.style.setProperty("--overlay-opacity", "0.5"));
    await expect(indicator).toHaveCSS("background-color", /\/ 0\.5\)/);
    const transition = await indicator.evaluate(async (element) => {
      element.style.inlineSize = "20%";
      await new Promise(requestAnimationFrame);
      const animation = element.getAnimations().find((entry) => entry instanceof CSSTransition);
      if (!animation?.effect) throw new Error("Upload progress must transition between values");
      const duration = animation.effect.getTiming().duration;
      if (typeof duration !== "number") throw new Error("Upload transition must have a duration");
      animation.pause();
      animation.currentTime = duration / 2;
      const intermediateWidth = element.getBoundingClientRect().width;
      animation.finish();
      return { intermediateWidth, completedWidth: element.getBoundingClientRect().width };
    });
    expect(transition.intermediateWidth).toBeGreaterThan(transition.completedWidth);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(indicator).toHaveCSS("transition-duration", "0s");
    await remove.click();
    await expect(image).toHaveCount(0);
  });
}
