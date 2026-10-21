import { expect, test } from "@playwright/test";
import { serveFixture } from "./fixtures/serve-fixture";

for (const variant of ["sidebar", "inset", "floating", "page"]) {
  for (const collapsed of [false, true]) {
    test(`${variant} ${collapsed ? "collapsed" : "expanded"} fills short document pages through loading`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await serveFixture(page, "app-shell", { search: `?variant=${variant}&collapsed=${collapsed}` });
      const content = page.locator("[data-app-shell-content]");
      const route = page.locator('[data-control-family="page-layout"][data-slot="root"]');
      await expect(route).toHaveAttribute("data-scroll", "page");
      const canvasBackground = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
      const shellBackground = await page.locator("[data-app-shell]").evaluate((shell) => getComputedStyle(shell).backgroundColor);
      expect(canvasBackground).not.toBe("rgba(0, 0, 0, 0)");
      if (variant === "inset") expect(canvasBackground).toBe(shellBackground);
      const contentBounds = await content.boundingBox();
      const routeBounds = await route.boundingBox();
      if (!contentBounds || !routeBounds) throw new Error("Missing shell bounds");
      expect(Math.abs(contentBounds.y + contentBounds.height - routeBounds.y - routeBounds.height)).toBeLessThanOrEqual(2);
      await page.getByRole("button", { name: "Toggle loading" }).click();
      await expect(page.getByText("You’re all caught up.")).toBeVisible();
      expect(await route.boundingBox()).toEqual(routeBounds);
      await page.getByRole("button", { name: "Toggle length" }).click();
      await page.mouse.move(1000, 700);
      await page.mouse.wheel(0, 700);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
      await expect(page.getByRole("button", { name: "Toggle sidebar", exact: true })).toBeInViewport();
    });
  }
}

for (const scroll of ["inset", "none"]) {
  for (const width of [390, 1440]) {
    test(`${scroll} at ${width}px keeps scrolling inside the workspace`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await serveFixture(page, "app-shell", { search: `?scroll=${scroll}` });
      await expect(page.locator('[data-control-family="page-layout"][data-slot="root"]')).toHaveAttribute("data-scroll", scroll);
      if (scroll === "inset") await page.getByRole("button", { name: "Toggle length" }).click();
      const viewport = page.locator('[data-app-shell-content] [data-control-ui="scroll-area"][data-slot="viewport"]').first();
      await viewport.hover();
      await page.mouse.wheel(0, 700);
      await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(300);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).overscrollBehaviorY)).toBe("auto");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await expect(page.getByRole("button", { name: "Toggle sidebar", exact: true })).toBeInViewport();
    });
  }
}
