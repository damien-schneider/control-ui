import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { meanScreenshotDifference, waitForReactHydration } from "./browser-test-helpers";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, JSON.stringify({ skin: "refined" }));
  }, THEME_EDITOR_STORAGE_KEY);
});

for (const { label, path, axis, startEdge, endEdge, scrollSign } of [
  {
    label: "Places to explore",
    path: "/primitives/progressive-blur",
    axis: "y",
    startEdge: "top",
    endEdge: "bottom",
    scrollSign: 1,
  },
  {
    label: "Horizontal roadmap",
    path: "/primitives/scroll-area",
    axis: "x",
    startEdge: "left",
    endEdge: "right",
    scrollSign: 1,
  },
  {
    label: "Right-to-left destinations",
    path: "/primitives/progressive-blur",
    axis: "x",
    startEdge: "right",
    endEdge: "left",
    scrollSign: -1,
  },
]) {
  test(`${label} fades in proportion to the distance from each edge`, async ({ page }) => {
    await page.goto(path);
    const viewport = page.getByLabel(label, { exact: true });
    await waitForReactHydration(viewport.getByRole("button").first());
    await viewport.locator("..").evaluate((element) => element.style.setProperty("--scroll-fade-size", "32px"));

    for (const distance of [0, 2, 8, 16, 32, 64, 8, 0]) {
      await viewport.evaluate(
        (element, scroll) => {
          if (scroll.axis === "y") element.scrollTop = scroll.distance;
          else element.scrollLeft = scroll.distance * scroll.sign;
        },
        { axis, distance, sign: scrollSign },
      );
      await expect(viewport).toHaveCSS(`--_scroll-area-fade-${startEdge}`, `${Math.min(distance, 32)}px`);
      await expect(viewport).toHaveCSS(`--_scroll-area-fade-${endEdge}`, "32px");
    }

    for (const distance of [32, 16, 2, 0]) {
      await viewport.evaluate(
        (element, scroll) => {
          if (scroll.axis === "y") element.scrollTop = element.scrollHeight - element.clientHeight - scroll.distance;
          else element.scrollLeft = (element.scrollWidth - element.clientWidth - scroll.distance) * scroll.sign;
        },
        { axis, distance, sign: scrollSign },
      );
      await expect(viewport).toHaveCSS(`--_scroll-area-fade-${endEdge}`, `${distance}px`);
      await expect(viewport).toHaveCSS(`--_scroll-area-fade-${startEdge}`, "32px");
    }

    for (const edge of axis === "y" ? ["left", "right"] : ["top", "bottom"]) {
      await expect(viewport).toHaveCSS(`--_scroll-area-fade-${edge}`, "0px");
    }
  });
}

test("the painted mask matches scroll distance and adapts when content shrinks", async ({ page }) => {
  await page.goto("/primitives/progressive-blur");
  const blurToggle = page.getByRole("switch", { name: "Progressive blur", exact: true });
  await waitForReactHydration(blurToggle);
  await blurToggle.click();
  const viewport = page.getByLabel("Places to explore", { exact: true });
  const scrollArea = viewport.locator("..");
  await scrollArea.evaluate((element) => {
    element.style.setProperty("--scroll-fade-size", "32px");
    element.style.background = "black";
    element.style.borderRadius = "0";
    element.style.border = "0";
  });
  await viewport.evaluate((element) => {
    element.style.background = "white";
  });

  for (const distance of [0, 8, 16, 32, 8, 0]) {
    await viewport.evaluate((element, scrollTop) => {
      element.scrollTop = scrollTop;
    }, distance);
    await expect(viewport).toHaveCSS("--_scroll-area-fade-top", `${distance}px`);
    const actualMask = await scrollArea.screenshot();
    await viewport.evaluate((element, fadeDepth) => {
      element.style.maskImage = `linear-gradient(to bottom, transparent, black ${fadeDepth}px)`;
    }, distance);
    const expectedMask = await scrollArea.screenshot();
    expect(await meanScreenshotDifference(page, [actualMask, expectedMask], { x: 0, y: 0, width: 100, height: 32 })).toBeLessThan(0.1);
    await viewport.evaluate((element) => element.style.removeProperty("mask-image"));
  }

  const content = viewport.locator(':scope > [data-slot="content"]');
  const viewportHeight = await viewport.evaluate((element) => element.clientHeight);
  await content.evaluate((element, height) => {
    element.replaceChildren();
    element.style.height = `${height + 12}px`;
  }, viewportHeight);
  await expect(viewport).toHaveCSS("--_scroll-area-fade-bottom", "12px");
  await content.evaluate((element, height) => {
    element.style.height = `${height}px`;
  }, viewportHeight);
  await expect(viewport).toHaveCSS("--_scroll-area-fade-bottom", "0px");
  await expect(viewport).toHaveCSS("mask-image", "none");
});
