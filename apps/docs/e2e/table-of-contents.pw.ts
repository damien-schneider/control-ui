import { expect, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/primitives/table-of-contents");
  await waitForReactHydration(page.getByRole("navigation", { name: "Both", exact: true }));
});

test("root knobs style the panel, heading hierarchy, rail, trail, and highlight", async ({ page }) => {
  const navigation = page.getByRole("navigation", { name: "Both", exact: true });
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
      "item-indent": "14px",
      "rail-background": "oklch(0.6 0 0)",
      "rail-width": "3px",
      "trail-background": "oklch(0.4 0 0)",
      "trail-width": "5px",
      "trail-radius": "1px",
      "highlight-radius": "9px",
      "highlight-background": "oklch(0.9 0 0)",
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
  const firstHeading = navigation.getByRole("link", { name: "Agent surface", exact: true });
  const nestedHeading = navigation.getByRole("link", { name: "HTTP API", exact: true });
  await expect(firstHeading).toHaveCSS("font-weight", "700");
  await expect(firstHeading).toHaveCSS("padding-inline-start", "10px");
  await expect(nestedHeading).toHaveCSS("font-size", "16px");
  await expect(nestedHeading).toHaveCSS("line-height", "28px");
  await expect(nestedHeading).toHaveCSS("font-weight", "500");
  await expect(nestedHeading).toHaveCSS("padding-block-start", "8px");
  await expect(nestedHeading).toHaveCSS("padding-inline-start", "38px");
  await expect(nestedHeading).toHaveCSS("padding-inline-end", "10px");
  const rail = navigation.locator('[data-slot="rail"]');
  await expect(rail).toHaveCSS("width", "3px");
  await expect(rail).toHaveCSS("background-color", "oklch(0.6 0 0)");
  const trail = navigation.locator('[data-slot="trail"]');
  await expect(trail).toHaveCSS("width", "5px");
  await expect(trail).toHaveCSS("border-radius", "1px");
  await expect(trail).toHaveCSS("background-color", "oklch(0.4 0 0)");
  const highlight = navigation.locator('[data-control-family="track-highlight"]');
  await expect(highlight).toHaveCSS("border-radius", "9px");
  await expect(highlight).toHaveCSS("background-color", "oklch(0.9 0 0)");
  await expect(highlight).toHaveCSS("padding", "0px");

  await navigation.evaluate((node) => node.setAttribute("dir", "rtl"));
  await expect(nestedHeading).toHaveCSS("padding-right", "38px");
  await expect(rail).toHaveCSS("right", "0px");
  await expect(trail).toHaveCSS("right", "0px");
});

test("shared tokens and link-state knobs preserve keyboard navigation and reduced motion", async ({ page }) => {
  const navigation = page.getByRole("navigation", { name: "Background", exact: true });
  await navigation.evaluate((node) => {
    node.style.setProperty("--text-body", "17px");
    node.style.setProperty("--radius-popup-item", "11px");
    node.style.setProperty("--active-fill", "oklch(0.85 0 0)");
    node.style.setProperty("--cui-table-of-contents-item-foreground", "oklch(0.45 0 0)");
    node.style.setProperty("--cui-table-of-contents-item-hover-foreground", "oklch(0.35 0 0)");
    node.style.setProperty("--cui-table-of-contents-item-active-foreground", "oklch(0.25 0 0)");
  });
  const release = navigation.getByRole("link", { name: "Release notes", exact: true });
  const highlight = navigation.locator('[data-control-family="track-highlight"]');
  await expect(release).not.toHaveAttribute("aria-current");
  await expect(release).toHaveCSS("font-size", "17px");
  await expect(release).toHaveCSS("color", "oklch(0.45 0 0)");
  await expect(highlight).toHaveCSS("border-radius", "11px");
  await expect(highlight).toHaveCSS("background-color", "oklch(0.85 0 0)");
  await release.hover();
  await expect(release).toHaveCSS("color", "oklch(0.35 0 0)");
  await page.mouse.move(0, 0);
  await navigation.getByRole("link", { name: "Overrides", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(release).toBeFocused();
  await expect(release).toHaveCSS("color", "oklch(0.35 0 0)");
  await expect(release).not.toHaveCSS("outline-style", "none");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#toc-example-release$/);
  await expect(release).toHaveAttribute("aria-current", "location");
  await expect(release).toHaveCSS("color", "oklch(0.25 0 0)");

  await page.emulateMedia({ reducedMotion: "reduce" });
  const duration = await highlight.evaluate((node) => Number.parseFloat(getComputedStyle(node).transitionDuration));
  expect(duration).toBeLessThanOrEqual(0.001);
});
