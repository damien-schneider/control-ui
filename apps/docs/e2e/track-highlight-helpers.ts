import { expect, type Locator, type Page } from "@playwright/test";

export async function expectHighlightOn(highlight: Locator, item: Locator) {
  await expect(highlight).toBeVisible();
  await expect
    .poll(async () => {
      const [highlightBox, itemBox] = await Promise.all([highlight.boundingBox(), item.boundingBox()]);
      if (!highlightBox || !itemBox) return Number.POSITIVE_INFINITY;
      return Math.max(
        Math.abs(highlightBox.x - itemBox.x),
        Math.abs(highlightBox.y - itemBox.y),
        Math.abs(highlightBox.width - itemBox.width),
        Math.abs(highlightBox.height - itemBox.height),
      );
    })
    .toBeLessThan(1);
}

export async function disableAnchorSupport(page: Page) {
  await page.addInitScript(() => {
    const supports = CSS.supports.bind(CSS);
    CSS.supports = (property: string, value?: string) => {
      if (property.includes("anchor")) return false;
      return value === undefined ? supports(property) : supports(property, value);
    };
  });
  await page.route("**/*.css*", async (route) => {
    const response = await route.fetch();
    const css = await response.text();
    await route.fulfill({ response, body: css.replace(/anchor-scope:\s*--cui-track(?=\s*\))/g, "unsupported-anchor-scope: --cui-track") });
  });
}
