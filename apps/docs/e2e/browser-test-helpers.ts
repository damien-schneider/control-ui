import { expect, type Locator, type Page } from "@playwright/test";
import { PAGE_LAYOUT_SKINS } from "../components/theme";

/** Recipes remove a shadow with `0 0 transparent` layers, which a registered shadow knob can still interpolate. */
export const unpaintedShadow = /^(?:none|(?:rgba\(0, 0, 0, 0\) 0px 0px 0px 0px(?:, )?)+)$/;

export async function waitForReactHydration(locator: Locator) {
  await expect.poll(() => locator.evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps$")))).toBe(true);
}

export function paintedEdge(field: Locator) {
  return field.evaluate((element) => {
    const style = getComputedStyle(element);
    return `${style.borderColor} ${style.boxShadow}`;
  });
}

/** Text entry draws no focus outline: the caret marks focus and the field's edge tints away from its resting paint. */
export async function expectTextFocusEdge(field: Locator, restingEdge: string) {
  await expect(field).toHaveCSS("outline-style", "none");
  await expect.poll(() => paintedEdge(field)).not.toBe(restingEdge);
}

/** A point on `part` whose topmost element is `part` itself, never one of its child controls. */
export async function blankPoint(part: Locator) {
  const point = await part.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const y = box.top + box.height / 2;
    for (let x = box.left + 2; x < box.right - 2; x += 4) {
      if (document.elementFromPoint(x, y) === element) return { x, y };
    }
    return null;
  });
  if (!point) throw new Error("No blank point to press");
  return point;
}

export function cursorAt(page: Page, point: { x: number; y: number }) {
  return page.evaluate(({ x, y }) => {
    const element = document.elementFromPoint(x, y);
    return element ? getComputedStyle(element).cursor : null;
  }, point);
}

export async function waitForSkinLayout(page: Page, skin: string) {
  await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
  await expect(page.locator('[data-control-ui="page-layout"][data-slot="root"]').first()).toHaveAttribute(
    "data-scroll",
    PAGE_LAYOUT_SKINS.includes(skin) ? "page" : "inset",
  );
  await expect.poll(() => page.evaluate(sidebarMatchesViewport)).toBe(true);
}

function sidebarMatchesViewport() {
  const sidebarBreakpoint = getComputedStyle(document.documentElement).getPropertyValue("--breakpoint-lg").trim();
  const sidebarIsMobile = matchMedia(`(width < ${sidebarBreakpoint})`).matches;
  const desktopSidebar = document.querySelector('[data-docs-shell] [data-control-ui="sidebar"][data-slot="root"]:not([data-mobile])');
  return !(sidebarIsMobile && desktopSidebar);
}

export async function meanScreenshotDifference(
  page: Page,
  screenshots: [Buffer, Buffer],
  screenshotRegion?: { x: number; y: number; width: number; height: number },
): Promise<number> {
  return page.evaluate(
    async ({ encodedScreenshots, region }) => {
      const pixels = await Promise.all(
        encodedScreenshots.map(async (screenshot) => {
          const image = new Image();
          image.src = `data:image/png;base64,${screenshot}`;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas pixel inspection is unavailable");
          context.drawImage(image, 0, 0);
          return context.getImageData(region?.x ?? 0, region?.y ?? 0, region?.width ?? image.width, region?.height ?? image.height).data;
        }),
      );
      let difference = 0;
      for (let index = 0; index < pixels[0].length; index += 1) {
        difference += Math.abs(pixels[0][index] - pixels[1][index]);
      }
      return difference / pixels[0].length;
    },
    { encodedScreenshots: screenshots.map((screenshot) => screenshot.toString("base64")), region: screenshotRegion },
  );
}
