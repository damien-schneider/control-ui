import { expect, type Locator, type Page } from "@playwright/test";

export async function waitForReactHydration(locator: Locator) {
  await expect.poll(() => locator.evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps$")))).toBe(true);
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
