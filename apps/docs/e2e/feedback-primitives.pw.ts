import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "../components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

for (const skin of ["none", "refined", "cuicui"]) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`skeleton variants keep their geometry and loop seamlessly in ${skin} ${colorScheme}`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme, reducedMotion: "no-preference" });
      await page.addInitScript(({ key, skin: initialSkin }) => localStorage.setItem(key, JSON.stringify({ skin: initialSkin })), {
        key: THEME_EDITOR_STORAGE_KEY,
        skin,
      });
      await page.goto("/primitives/skeleton");
      await waitForReactHydration(page.getByRole("combobox", { name: "Skin", exact: true }));
      await page.evaluate(() => document.fonts.ready);
      const skeletons = page.locator('[data-control-family="skeleton"][data-slot="root"]');
      await expect(skeletons).toHaveCount(9);
      const sweep = page.locator('[data-control-family="skeleton"][data-variant="shimmer"]').last();
      const pulse = page.locator('[data-control-family="skeleton"][data-variant="pulse"]').last();
      const resting = page.locator('[data-control-family="skeleton"][data-variant="none"]').last();
      await expect(resting).toHaveCSS("animation-name", "none");
      expect(await resting.evaluate((node) => getComputedStyle(node, "::after").content)).toBe("none");
      expect(await sweep.evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(1);
      expect(await pulse.evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(1);
      await expect(sweep).toHaveAttribute("aria-hidden", "true");

      const initialBounds = await sweep.boundingBox();
      for (const progress of [0, 0.25, 0.5, 0.75, 0.999999]) {
        await sweep.evaluate((node, progressRatio) => {
          for (const animation of node.getAnimations({ subtree: true })) {
            animation.pause();
            const duration = animation.effect?.getComputedTiming().duration;
            if (typeof duration !== "number") throw new Error("Missing skeleton animation duration");
            animation.currentTime = duration * progressRatio;
          }
        }, progress);
        expect(await sweep.boundingBox()).toEqual(initialBounds);
        if (progress === 0 || progress === 0.999999) {
          await sweep.screenshot({ path: testInfo.outputPath(`loop-${progress}.png`), animations: "allow" });
        }
      }
      expect(await readFile(testInfo.outputPath("loop-0.png"))).toEqual(await readFile(testInfo.outputPath("loop-0.999999.png")));

      await sweep.evaluate((node) => {
        node.style.setProperty("--cui-skeleton-animation-duration", "3s");
        node.style.setProperty("--cui-skeleton-highlight-background", "oklch(0.7 0.1 200)");
      });
      expect(await sweep.evaluate((node) => getComputedStyle(node, "::after").animationDuration)).toBe("3s");
      expect(await sweep.evaluate((node) => getComputedStyle(node, "::after").backgroundImage)).toContain("oklch(0.7 0.1 200)");
      await pulse.evaluate((node) => {
        node.style.setProperty("--cui-skeleton-pulse-opacity", "0.7");
        const animation = node.getAnimations()[0];
        animation.pause();
        const duration = animation.effect?.getComputedTiming().duration;
        if (typeof duration !== "number") throw new Error("Missing pulse duration");
        animation.currentTime = duration / 2;
      });
      await expect(pulse).toHaveCSS("opacity", "0.7");

      await page.emulateMedia({ reducedMotion: "reduce" });
      expect(await skeletons.evaluateAll((nodes) => nodes.flatMap((node) => node.getAnimations({ subtree: true })).length)).toBe(0);
      await expect(pulse).toHaveCSS("opacity", "1");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.evaluate(() => {
        document.documentElement.dataset.motion = "reduced";
      });
      expect(await skeletons.evaluateAll((nodes) => nodes.flatMap((node) => node.getAnimations({ subtree: true })).length)).toBe(0);
      await expect(pulse).toHaveCSS("opacity", "1");
      await page.setViewportSize({ width: 360, height: 900 });
      await page
        .locator('[data-control-family="card"][data-slot="root"]')
        .first()
        .screenshot({ path: testInfo.outputPath("variants.png") });
    });
  }
}

test("alert knobs reach the icon and text while long messages wrap without clipping", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/primitives/alert");
  const alert = page.getByRole("alert").first();
  await waitForReactHydration(alert);
  await alert.locator("..").screenshot({ path: testInfo.outputPath("alerts.png") });
  await alert.evaluate((node) => {
    node.style.width = "260px";
    node.style.setProperty("--cui-alert-padding", "20px");
    node.style.setProperty("--cui-alert-padding-inline", "24px");
    node.style.setProperty("--cui-alert-foreground", "oklch(0.4 0.1 200)");
    node.style.setProperty("--cui-alert-description-foreground", "oklch(0.5 0.1 200)");
    node.style.setProperty("--cui-alert-icon-size", "28px");
    const title = node.querySelector('[data-slot="title"]');
    const description = node.querySelector('[data-slot="description"]');
    if (!title || !description) throw new Error("Missing alert anatomy");
    title.textContent = "Your deployment could not be published because the project configuration needs updating";
    description.textContent = "deployment_".repeat(30);
  });
  const title = alert.locator('[data-slot="title"]');
  await expect(alert).toHaveCSS("padding", "20px 24px");
  await expect(alert.locator(":scope > svg")).toHaveCSS("width", "28px");
  await expect(title).toHaveCSS("color", "oklch(0.4 0.1 200)");
  await expect(alert.locator('[data-slot="description"]')).toHaveCSS("color", "oklch(0.5 0.1 200)");
  expect(await title.evaluate((node) => node.clientHeight > Number.parseFloat(getComputedStyle(node).lineHeight))).toBe(true);
  expect(
    await alert.evaluate((node) =>
      [node, ...node.querySelectorAll("[data-slot]")].every(
        (part) => part.scrollWidth <= part.clientWidth && part.scrollHeight <= part.clientHeight,
      ),
    ),
  ).toBe(true);
  await alert.locator(":scope > svg").evaluate((node) => node.remove());
  expect(
    await title.evaluate((node) => {
      const panel = node.closest('[role="alert"]');
      if (!panel) throw new Error("Missing alert root");
      return node.getBoundingClientRect().x - panel.getBoundingClientRect().x;
    }),
  ).toBe(25);
});

test("empty state knobs reach every part and long content stays within a narrow panel", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/primitives/empty");
  const empty = page.locator('[data-control-family="empty"][data-slot="root"]');
  await waitForReactHydration(empty);
  await empty.screenshot({ path: testInfo.outputPath("empty.png") });
  await empty.evaluate((node) => {
    node.style.width = "260px";
    node.style.setProperty("--cui-empty-padding", "20px");
    node.style.setProperty("--cui-empty-gap", "32px");
    node.style.setProperty("--cui-empty-media-size", "56px");
    node.style.setProperty("--cui-empty-media-icon-size", "28px");
    node.style.setProperty("--cui-empty-description-foreground", "oklch(0.5 0.1 200)");
    node.style.setProperty("--cui-empty-media-foreground", "oklch(0.4 0.1 200)");
    const title = node.querySelector('[data-slot="title"]');
    const description = node.querySelector('[data-slot="description"]');
    if (!title || !description) throw new Error("Missing empty state anatomy");
    title.textContent = "No conversations in this workspace yet";
    description.textContent = "workspace_".repeat(30);
  });
  await expect(empty).toHaveCSS("padding", "20px");
  await expect(empty).toHaveCSS("gap", "32px");
  await expect(empty.locator('[data-slot="media"]')).toHaveCSS("width", "56px");
  await expect(empty.locator('[data-slot="media"] > svg')).toHaveCSS("width", "28px");
  await expect(empty.locator('[data-slot="media"] > svg')).toHaveCSS("color", "oklch(0.4 0.1 200)");
  await expect(empty.locator('[data-slot="description"]')).toHaveCSS("color", "oklch(0.5 0.1 200)");
  expect(
    await empty.evaluate((node) =>
      [node, ...node.querySelectorAll("[data-slot]")].every(
        (part) => part.scrollWidth <= part.clientWidth && part.scrollHeight <= part.clientHeight,
      ),
    ),
  ).toBe(true);
  await empty
    .locator('[data-slot="description"]')
    .evaluate((node) => node.style.setProperty("--cui-empty-description-foreground", "oklch(0.6 0.1 200)"));
  await expect(empty.locator('[data-slot="description"]')).toHaveCSS("color", "oklch(0.6 0.1 200)");
  const action = empty.getByRole("button", { name: "New message", exact: true });
  await action.focus();
  await expect(action).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(action).not.toBeFocused();
});
