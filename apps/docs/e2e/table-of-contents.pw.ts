import { expect, type Locator, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

const railColumns = async (navigation: Locator) => {
  const path = (await navigation.locator('[data-slot="rail"]').getAttribute("d")) ?? "";
  return [...new Set([...path.matchAll(/[ML]([\d.]+) /g)].map(([, x]) => Number(x)))];
};

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/primitives/table-of-contents");
  await waitForReactHydration(page.getByRole("navigation", { name: "Range", exact: true }));
});

test("root knobs style the panel, heading hierarchy, rail, and trail", async ({ page }) => {
  const navigation = page.getByRole("navigation", { name: "Range", exact: true });
  await navigation.evaluate((node) => {
    const knobs = {
      background: "oklch(0.95 0 0)",
      "border-color": "oklch(0.7 0 0)",
      "border-width": "3px",
      radius: "17px",
      shadow: "none",
      "backdrop-filter": "blur(4px)",
      padding: "20px",
      "label-foreground": "oklch(0.3 0 0)",
      "label-font-size": "15px",
      "label-font-weight": "600",
      "label-gap": "18px",
      "item-font-size": "16px",
      "item-line-height": "1.75",
      "item-font-weight": "500",
      "item-root-font-weight": "700",
      "item-padding-block": "8px",
      "item-padding-inline": "10px",
      "item-indent-size": "14px",
      "rail-stroke": "oklch(0.6 0 0)",
      "rail-size": "3px",
      "trail-stroke": "oklch(0.4 0 0)",
      "trail-size": "5px",
    };
    for (const [name, value] of Object.entries(knobs)) node.style.setProperty(`--cui-table-of-contents-${name}`, value);
  });

  await expect(navigation).toHaveCSS("background-color", "oklch(0.95 0 0)");
  await expect(navigation).toHaveCSS("border-color", "oklch(0.7 0 0)");
  await expect(navigation).toHaveCSS("border-width", "3px");
  await expect(navigation).toHaveCSS("border-radius", "17px");
  await expect(navigation).toHaveCSS("box-shadow", "none");
  await expect(navigation).toHaveCSS("backdrop-filter", "blur(4px)");
  await expect(navigation).toHaveCSS("padding", "20px");
  const label = navigation.locator('[data-slot="label"]');
  await expect(label).toHaveCSS("color", "oklch(0.3 0 0)");
  await expect(label).toHaveCSS("font-size", "15px");
  await expect(label).toHaveCSS("font-weight", "600");
  await expect(label).toHaveCSS("margin-bottom", "18px");
  const firstHeading = navigation.getByRole("link", { name: "Installation", exact: true });
  const deepestHeading = navigation.getByRole("link", { name: "Colors", exact: true });
  await expect(firstHeading).toHaveCSS("font-weight", "700");
  await expect(firstHeading).toHaveCSS("padding-inline-start", "10px");
  await expect(deepestHeading).toHaveCSS("font-size", "16px");
  await expect(deepestHeading).toHaveCSS("line-height", "28px");
  await expect(deepestHeading).toHaveCSS("font-weight", "500");
  await expect(deepestHeading).toHaveCSS("padding-block-start", "8px");
  await expect(deepestHeading).toHaveCSS("padding-inline-start", "38px");
  await expect(deepestHeading).toHaveCSS("padding-inline-end", "10px");
  const rail = navigation.locator('[data-slot="rail"]');
  await expect(rail).toHaveCSS("stroke", "oklch(0.6 0 0)");
  await expect(rail).toHaveCSS("stroke-width", "3px");
  const trail = navigation.locator('[data-slot="trail"]');
  await expect(trail).toHaveCSS("stroke", "oklch(0.4 0 0)");
  await expect(trail).toHaveCSS("stroke-width", "5px");
  await expect.poll(() => railColumns(navigation)).toEqual([2.5, 16.5, 30.5]);

  await navigation.evaluate((node) => {
    node.setAttribute("dir", "rtl");
    node.style.width = "240px";
  });
  await expect(deepestHeading).toHaveCSS("padding-right", "38px");
  const trackWidth = await navigation.locator('[data-slot="track"]').evaluate((node) => node.clientWidth);
  await expect.poll(() => railColumns(navigation)).toEqual([trackWidth - 2.5, trackWidth - 16.5, trackWidth - 30.5]);
});

test("the read section lights its stretch of the rail and the text, never a background", async ({ page }) => {
  const navigation = page.getByRole("navigation", { name: "Range", exact: true });
  const motion = navigation.getByRole("link", { name: "Motion", exact: true });
  await motion.click();
  await expect(motion).toHaveAttribute("aria-current", "location");
  await expect(motion).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const trail = navigation.locator('[data-slot="trail"]');
  await expect(trail).toHaveCSS("opacity", "1");
  await expect.poll(() => trail.evaluate((node) => Number.parseFloat(getComputedStyle(node).strokeDashoffset))).toBeLessThan(0);
});

test("the progress indicator rides the rail to the section being read", async ({ page }) => {
  const navigation = page.getByRole("navigation", { name: "Progress", exact: true });
  const indicator = navigation.locator('[data-slot="indicator"]');
  const usage = navigation.getByRole("link", { name: "Usage", exact: true });
  await usage.click();
  await expect(usage).toHaveAttribute("aria-current", "location");
  await expect(indicator).toHaveCSS("opacity", "1");
  await expect
    .poll(async () => {
      const [dot, link] = await Promise.all([indicator.boundingBox(), usage.boundingBox()]);
      return dot && link ? Math.abs(dot.y + dot.height / 2 - (link.y + link.height / 2)) : Number.POSITIVE_INFINITY;
    })
    .toBeLessThan(1);
});

test("shared tokens and link-state knobs preserve keyboard navigation and reduced motion", async ({ page }) => {
  const navigation = page.getByRole("navigation", { name: "Range", exact: true });
  await navigation.evaluate((node) => {
    node.style.setProperty("--text-body", "17px");
    node.style.setProperty("--cui-table-of-contents-item-foreground", "oklch(0.45 0 0)");
    node.style.setProperty("--cui-table-of-contents-item-hover-foreground", "oklch(0.35 0 0)");
    node.style.setProperty("--cui-table-of-contents-item-active-foreground", "oklch(0.25 0 0)");
  });
  const usage = navigation.getByRole("link", { name: "Usage", exact: true });
  await expect(usage).not.toHaveAttribute("aria-current");
  await expect(usage).toHaveCSS("font-size", "17px");
  await expect(usage).toHaveCSS("color", "oklch(0.45 0 0)");
  await usage.hover();
  await expect(usage).toHaveCSS("color", "oklch(0.35 0 0)");
  await page.mouse.move(0, 0);
  await navigation.getByRole("link", { name: "Skins", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(usage).toBeFocused();
  await expect(usage).toHaveCSS("color", "oklch(0.35 0 0)");
  await expect(usage).not.toHaveCSS("outline-style", "none");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#toc-example-usage$/);
  await expect(usage).toHaveAttribute("aria-current", "location");
  await expect(usage).toHaveCSS("color", "oklch(0.25 0 0)");

  await page.emulateMedia({ reducedMotion: "reduce" });
  const duration = await navigation
    .locator('[data-slot="trail"]')
    .evaluate((node) => Number.parseFloat(getComputedStyle(node).transitionDuration));
  expect(duration).toBeLessThanOrEqual(0.001);
});
