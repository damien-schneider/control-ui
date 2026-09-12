import { expect, type Locator, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

function edgeLayers(viewport: Locator, side: string) {
  return viewport.locator("..").locator(`[data-control-family="progressive-blur"][data-side="${side}"] > [data-slot="layer"]`);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "refined" }));
  }, THEME_EDITOR_STORAGE_KEY);
  await page.goto("/primitives/progressive-blur");
  await waitForReactHydration(page.getByRole("switch", { name: "Progressive blur", exact: true }));
});

test("overflow edges appear, reverse, and clear when content fits", async ({ page }) => {
  const viewport = page.getByLabel("Places to explore", { exact: true });
  const top = edgeLayers(viewport, "top").last();
  const bottom = edgeLayers(viewport, "bottom").last();
  await expect(top).toHaveCSS("visibility", "hidden");
  await expect(bottom).toHaveCSS("opacity", "1");

  await viewport.evaluate((element) => {
    element.scrollTop = 60;
  });
  await expect(top).toHaveCSS("opacity", "1");
  await expect(bottom).toHaveCSS("opacity", "1");
  await viewport.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(bottom).toHaveCSS("visibility", "hidden");
  await viewport.evaluate((element) => {
    element.scrollTop = 0;
  });
  await expect(top).toHaveCSS("visibility", "hidden");
  await expect(bottom).toHaveCSS("opacity", "1");

  await viewport.getByRole("list").evaluate((element) => element.replaceChildren());
  await expect(top).toHaveCSS("visibility", "hidden");
  await expect(bottom).toHaveCSS("visibility", "hidden");
  await expect(viewport).toHaveCSS("mask-image", "none");
});

test("effect toggles preserve the viewport and its scroll position", async ({ page }) => {
  const viewport = page.getByLabel("Places to explore", { exact: true });
  await viewport.evaluate((element) => {
    element.scrollTop = 60;
    element.setAttribute("data-preserved-viewport", "true");
  });
  await expect(edgeLayers(viewport, "top").last()).toHaveCSS("opacity", "1");
  await page.getByRole("switch", { name: "Progressive blur", exact: true }).click();
  await expect(edgeLayers(viewport, "top")).toHaveCount(0);
  await expect(viewport).toHaveAttribute("data-preserved-viewport", "true");
  expect(await viewport.evaluate((element) => element.scrollTop)).toBe(60);
  await page.getByRole("switch", { name: "Edge fade", exact: true }).click();
  await expect(viewport).toHaveCSS("mask-image", "none");
  await page.getByRole("switch", { name: "Progressive blur", exact: true }).click();
  await expect(edgeLayers(viewport, "top").last()).toHaveCSS("opacity", "1");
  await expect(viewport).toHaveAttribute("data-preserved-viewport", "true");
  expect(await viewport.evaluate((element) => element.scrollTop)).toBe(60);
});

test("zero-radius blur layers do not darken faded text", async ({ page }) => {
  const viewport = page.getByLabel("Places to explore", { exact: true });
  const scrollArea = viewport.locator("..");
  const layers = scrollArea.locator('[data-control-family="progressive-blur"][data-slot="layer"]');
  await viewport.evaluate((element) => {
    element.scrollTop = 70;
  });
  await expect(layers.first()).toHaveCSS("opacity", "1");
  await scrollArea.locator('[data-control-family="progressive-blur"][data-slot="root"]').evaluateAll((elements) => {
    for (const element of elements) {
      if (element instanceof HTMLElement) element.style.setProperty("--cui-progressive-blur-backdrop-blur", "0px");
    }
  });
  const withLayers = await scrollArea.screenshot({ animations: "disabled" });
  await layers.evaluateAll((elements) => {
    for (const element of elements) {
      if (element instanceof HTMLElement) element.style.opacity = "0";
    }
  });
  const withoutLayers = await scrollArea.screenshot({ animations: "disabled" });
  const meanPixelDifference = await page.evaluate(
    async (screenshots) => {
      const pixels = await Promise.all(
        screenshots.map(async (screenshot) => {
          const image = new Image();
          image.src = `data:image/png;base64,${screenshot}`;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas pixel inspection is unavailable");
          context.drawImage(image, 0, 0);
          return context.getImageData(0, 0, image.width, image.height).data;
        }),
      );
      let difference = 0;
      for (let index = 0; index < pixels[0].length; index += 1) {
        difference += Math.abs(pixels[0][index] - pixels[1][index]);
      }
      return difference / pixels[0].length;
    },
    [withLayers.toString("base64"), withoutLayers.toString("base64")],
  );
  expect(meanPixelDifference).toBeLessThan(0.05);
});

test("custom viewport anatomy keeps fading and clears effects for keyboard focus", async ({ page }) => {
  const viewport = page.getByLabel("Places to explore", { exact: true });
  await viewport.evaluate((element) => {
    element.setAttribute("data-control-ui", "code");
    element.setAttribute("data-control-family", "code");
    element.setAttribute("data-slot", "content");
    element.scrollTop = 70;
  });
  await expect(viewport).not.toHaveCSS("mask-image", "none");
  await expect(edgeLayers(viewport, "top").last()).toHaveCSS("opacity", "1");
  await viewport.getByRole("button").first().focus();
  await page.keyboard.press("Tab");
  await expect(viewport).toHaveCSS("mask-image", "none");
  await expect(edgeLayers(viewport, "top").last()).toHaveCSS("visibility", "hidden");
});

test("RTL inline edges follow scrolling and keyboard focus stays usable", async ({ page }) => {
  const viewport = page.getByLabel("Right-to-left destinations", { exact: true });
  const start = edgeLayers(viewport, "inline-start").last();
  const end = edgeLayers(viewport, "inline-end").last();
  await expect(start).toHaveCSS("visibility", "hidden");
  await expect(end).toHaveCSS("opacity", "1");
  const buttons = viewport.getByRole("button");
  await buttons.first().focus();
  for (let index = 1; index < (await buttons.count()); index += 1) await page.keyboard.press("Tab");
  await expect(buttons.last()).toBeFocused();
  await expect(start).toHaveCSS("visibility", "hidden");
  await expect(end).toHaveCSS("visibility", "hidden");
  await expect(viewport).toHaveCSS("mask-image", "none");
  expect(await viewport.evaluate((element) => element.scrollLeft)).toBeLessThan(0);
  const viewportBounds = await viewport.boundingBox();
  const lastButtonBounds = await buttons.last().boundingBox();
  expect(viewportBounds).not.toBeNull();
  expect(lastButtonBounds).not.toBeNull();
  if (!viewportBounds || !lastButtonBounds) throw new Error("Missing focused control bounds");
  expect(lastButtonBounds.x).toBeGreaterThanOrEqual(viewportBounds.x);
  await buttons.last().click();
  await buttons.last().blur();
  await viewport.evaluate((element) => {
    element.scrollLeft = -element.scrollWidth;
  });
  await expect(start).toHaveCSS("opacity", "1");
  await expect(end).toHaveCSS("visibility", "hidden");
});

test("blur grows toward the physical edge independently of language and inherited direction", async ({ page }) => {
  const root = page.locator('[data-control-family="progressive-blur"][data-slot="root"]').first();
  const layer = root.locator('[data-slot="layer"]').last();
  const surface = root.locator("..");
  for (const { direction, language, startDirection, endDirection } of [
    { direction: "rtl", language: "en", startDirection: "right", endDirection: "left" },
    { direction: "ltr", language: "ar", startDirection: "left", endDirection: "right" },
  ]) {
    await surface.evaluate(
      (element, attributes) => {
        element.setAttribute("dir", attributes.direction);
        element.setAttribute("lang", attributes.language);
      },
      { direction, language },
    );
    for (const { label, gradientDirection } of [
      { label: "Start", gradientDirection: startDirection },
      { label: "End", gradientDirection: endDirection },
    ]) {
      await page.getByRole("button", { name: label, exact: true }).click();
      await expect(layer).toHaveCSS("mask-image", new RegExp(`^linear-gradient\\(to ${gradientDirection},`));
    }
  }
  const rtlViewport = page.getByLabel("Right-to-left destinations", { exact: true });
  await expect(edgeLayers(rtlViewport, "inline-start").last()).toHaveCSS("mask-image", /^linear-gradient\(to right,/);
  await expect(edgeLayers(rtlViewport, "inline-end").last()).toHaveCSS("mask-image", /^linear-gradient\(to left,/);
  await expect(rtlViewport).toHaveCSS("--_scroll-area-fade-right", "0px");
  await expect(rtlViewport).not.toHaveCSS("--_scroll-area-fade-left", "0px");
});

test("scrolling reveals the blur through intermediate opacity with staggered layers", async ({ page }) => {
  const viewport = page.getByLabel("Places to explore", { exact: true });
  const layers = edgeLayers(viewport, "top");
  await expect(layers.last()).toHaveCSS("visibility", "hidden");
  await viewport.evaluate((element) => {
    element.scrollTop = 60;
  });
  const transition = await layers.last().evaluate(async (element) => {
    for (let frame = 0; frame < 20; frame += 1) {
      const opacityTransition = element
        .getAnimations()
        .find((animation) => animation instanceof CSSTransition && animation.transitionProperty === "opacity");
      const timing = opacityTransition?.effect?.getTiming();
      if (opacityTransition && timing && typeof timing.duration === "number") {
        const delay = timing.delay ?? 0;
        opacityTransition.pause();
        opacityTransition.currentTime = delay;
        const initialOpacity = Number(getComputedStyle(element).opacity);
        opacityTransition.currentTime = delay + timing.duration / 2;
        const intermediateOpacity = Number(getComputedStyle(element).opacity);
        opacityTransition.play();
        return { initialOpacity, intermediateOpacity, duration: timing.duration, delay };
      }
      await new Promise(requestAnimationFrame);
    }
    throw new Error("Scrolling did not start an opacity transition");
  });
  expect(transition.initialOpacity).toBe(0);
  expect(transition.intermediateOpacity).toBeGreaterThan(0);
  expect(transition.intermediateOpacity).toBeLessThan(1);
  expect(transition.duration).toBeGreaterThan(0);
  expect(transition.delay).toBeGreaterThan(0);
  await expect(layers.last()).toHaveCSS("opacity", "1");
  await viewport.evaluate((element) => {
    element.scrollTop = 0;
  });
  await expect(layers.last()).toHaveCSS("visibility", "hidden");
});

test("standalone blur staggers individual layers and cancels a rapid reversal", async ({ page }) => {
  const visibility = page.getByRole("switch", { name: "Show blur", exact: true });
  const root = page.locator('[data-control-family="progressive-blur"][data-visible]').first();
  const layers = root.locator('[data-slot="layer"]');
  await expect(layers.last()).toHaveCSS("opacity", "1");
  await expect(root).toHaveCSS("opacity", "1");
  const delays = await layers.evaluateAll((elements) =>
    elements.map((element) => Number.parseFloat(getComputedStyle(element).transitionDelay)),
  );
  expect(delays.at(-1)).toBeGreaterThan(delays[0]);
  await visibility.click();
  await visibility.click();
  await expect(layers.last()).toHaveCSS("opacity", "1");
  await visibility.click();
  await expect(
    page.locator('[data-control-family="progressive-blur"][data-slot="root"]').first().locator('[data-slot="layer"]').last(),
  ).toHaveCSS("visibility", "hidden");
});

test("reduced motion removes delays and forced colors removes decoration", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const viewport = page.getByLabel("Places to explore", { exact: true });
  const bottom = edgeLayers(viewport, "bottom").last();
  await expect(bottom).toHaveCSS("opacity", "1");
  await expect(bottom).toHaveCSS("transition-duration", "0s");
  await expect(bottom).toHaveCSS("transition-delay", "0s");
  await page.emulateMedia({ forcedColors: "active" });
  await expect(bottom.locator("..")).toHaveCSS("display", "none");
  await expect(viewport).toHaveCSS("mask-image", "none");
});
