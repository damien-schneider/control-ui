import { expect, type Locator, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

const TRIGGER = '[data-control-ui="morphing-panel"][data-slot="trigger"]';
const CONTENT = '[data-control-ui="morphing-panel"][data-slot="content"]';

async function bounds(locator: Locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height), x: rect.x, y: rect.y, bottom: rect.bottom, right: rect.right };
  });
}

async function expectSize(locator: Locator, width: number, height: number) {
  await expect
    .poll(async () => {
      const rect = await bounds(locator);
      return { width: rect.width, height: rect.height };
    })
    .toEqual({ width, height });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.assign(window, { __REACT_SCAN_DISABLED__: true, __REACT_GRAB_DISABLED__: true });
  });
  await page.goto("/primitives/morphing-panel");
  await waitForReactHydration(page.locator('[data-example="settings"]'));
});

test("one trigger morphs between sizes without moving the preview center or overflowing tabs", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const panel = page.locator('[data-example="settings"]');
  const trigger = panel.locator(TRIGGER);
  const content = panel.locator(CONTENT);
  await expectSize(panel, 132, 52);
  const collapsed = await bounds(panel);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.evaluate((element) => {
    element.setAttribute("data-original-trigger", "true");
  });
  await trigger.click();
  await expectSize(panel, 360, 304);
  await expect(panel).toHaveAttribute("data-last-open-reason", "trigger-press");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger).toBeFocused();
  await expect(content).toBeVisible();
  const expanded = await bounds(panel);
  expect(expanded.x + expanded.width / 2).toBeCloseTo(collapsed.x + collapsed.width / 2, 0);
  expect(expanded.y + expanded.height / 2).toBeCloseTo(collapsed.y + collapsed.height / 2, 0);

  const dimensions = panel.getByRole("tabpanel", { name: "Size", exact: true });
  expect(await dimensions.evaluate((element) => element.scrollHeight <= element.clientHeight)).toBe(true);
  const tabs = panel.getByRole("tablist", { name: "Canvas settings" });
  expect(await tabs.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect((await bounds(tabs)).y).toBeGreaterThanOrEqual((await bounds(trigger)).bottom);
  await panel.getByRole("tab", { name: "Ratio", exact: true }).click();
  await expectSize(panel, 360, 268);
  await expect(panel.getByRole("button", { name: "Apply" })).toBeInViewport();
  await page.keyboard.press("ArrowRight");
  await expect(panel.getByRole("tab", { name: "Prompt", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expectSize(panel, 360, 284);
  await panel.getByRole("textbox", { name: "Style prompt" }).fill("Retain this draft.");
  await page.keyboard.press("Escape");
  await expect(panel).toHaveAttribute("data-last-open-reason", "escape-key");
  await expectSize(panel, 132, 52);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("data-original-trigger", "true");
  await expect(content).toBeAttached();
  await expect(content).toBeHidden();
  await trigger.click();
  await expect(panel.getByRole("textbox", { name: "Style prompt" })).toHaveValue("Retain this draft.");
  await panel.getByRole("button", { name: "Apply" }).click();
  await expect(trigger).toBeFocused();
  await expect(panel).toHaveAttribute("data-last-open-reason", "close-press");
});

test("narrow screens keep every tab visible and honor reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 300, height: 700 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const panel = page.locator('[data-example="settings"]');
  await panel.locator(TRIGGER).click();
  const geometry = await panel.evaluate((element) => {
    const content = element.querySelector<HTMLElement>('[data-slot="content"]');
    const tabs = element.querySelector<HTMLElement>('[role="tablist"]');
    if (!content || !tabs) throw new Error("Missing panel content");
    return {
      width: element.getBoundingClientRect().width,
      contentOverflows: content.scrollWidth > content.clientWidth,
      tabsOverflow: tabs.scrollWidth > tabs.clientWidth,
      transitionDuration: getComputedStyle(element).transitionDuration,
    };
  });
  expect(geometry.width).toBeLessThan(300);
  expect(geometry.contentOverflows).toBe(false);
  expect(geometry.tabsOverflow).toBe(false);
  expect(geometry.transitionDuration.split(",").every((duration) => Number.parseFloat(duration) === 0)).toBe(true);
  for (const name of ["Size", "Ratio", "Prompt"]) {
    await panel.getByRole("tab", { name, exact: true }).click();
    await expect(panel.getByRole("tabpanel", { name, exact: true })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Apply" })).toBeInViewport();
  }
});

test("bottom-start stays anchored throughout the morph in both reading directions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const panel = page.locator('[data-example="menu"]');
  await panel.scrollIntoViewIfNeeded();
  for (const direction of ["ltr", "rtl"]) {
    await panel.locator("..").evaluate((element, dir) => element.setAttribute("dir", dir), direction);
    await expectSize(panel, 152, 48);
    const frames = await panel.evaluate(async (element) => {
      const trigger = element.querySelector<HTMLButtonElement>('[data-slot="trigger"]');
      if (!trigger) throw new Error("Missing trigger");
      const samples: { left: number; right: number; bottom: number; width: number }[] = [];
      const sample = () => {
        const rect = element.getBoundingClientRect();
        samples.push({ left: rect.left, right: rect.right, bottom: rect.bottom, width: rect.width });
      };
      sample();
      trigger.click();
      const start = performance.now();
      await new Promise<void>((resolve) => {
        function frame() {
          sample();
          if (performance.now() - start > 650) resolve();
          else requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
      return samples;
    });
    expect(frames.some((frame) => frame.width > 152 && frame.width < 272)).toBe(true);
    for (const frame of frames) {
      expect(frame.bottom).toBeCloseTo(frames[0].bottom, 0);
      expect(direction === "ltr" ? frame.left : frame.right).toBeCloseTo(direction === "ltr" ? frames[0].left : frames[0].right, 0);
    }
    await panel.getByRole("button", { name: "Projects", exact: true }).click();
    await expect(panel.locator(TRIGGER)).toBeFocused();
    await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
  }
});

test("save confirmation focuses its labelled dialog, cancels without saving, and confirms in place", async ({ page }) => {
  const panel = page.locator('[data-example="confirmation"]');
  const trigger = panel.locator(TRIGGER);
  await trigger.scrollIntoViewIfNeeded();
  const collapsed = await bounds(panel);
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Save changes?" });
  await expect(dialog).toBeFocused();
  await expect(dialog).toHaveAttribute("aria-modal", "false");
  await expectSize(panel, 328, 244);
  const expanded = await bounds(panel);
  expect(expanded.right).toBeCloseTo(collapsed.right, 0);
  expect(expanded.bottom).toBeCloseTo(collapsed.bottom, 0);
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toBeFocused();
  await expect(page.getByText("You have unpublished changes.", { exact: true })).toBeVisible();
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("button", { name: "Confirm save" }).click();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText("Saved");
  await expect(page.getByText("Your changes have been saved.", { exact: true })).toBeVisible();
});

test("bounded surfaces scroll their body while keeping header and actions visible", async ({ page }) => {
  const panel = page.locator('[data-example="confirmation"]');
  const positioner = panel.locator("..");
  await positioner.evaluate((element) => {
    if (!(element instanceof HTMLElement)) throw new Error("Missing positioner");
    element.style.height = "184px";
    element.style.width = "240px";
  });
  await panel.locator(TRIGGER).click();
  await expectSize(panel, 240, 184);
  const content = panel.locator(CONTENT);
  const body = panel.locator('[data-slot="body"]');
  const footer = panel.locator('[data-slot="footer"]');
  expect(await body.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  expect((await bounds(footer)).bottom).toBeLessThanOrEqual((await bounds(content)).bottom);
  await expect(panel.getByRole("button", { name: "Confirm save" })).toBeInViewport();
  await body.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await panel.getByRole("button", { name: "Confirm save" }).click();
  await expect(panel.locator(TRIGGER)).toBeFocused();
});
