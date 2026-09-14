import { expect, type Locator, type Page, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

async function startDrag(page: Page, control: Locator) {
  const thumb = control.locator('[data-slot="thumb"]');
  const bounds = await thumb.boundingBox();
  if (!bounds) throw new Error("Switch thumb is not visible");
  const position = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  await page.mouse.move(position.x, position.y);
  await page.mouse.down();
  return position;
}

for (const skin of ["modern-apple", "refined"]) {
  test.describe(`${skin} switch`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(({ key, skin: skinId }) => localStorage.setItem(key, JSON.stringify({ skin: skinId, reduceMotion: true })), {
        key: THEME_EDITOR_STORAGE_KEY,
        skin,
      });
      await page.goto("/primitives/switch");
      await waitForReactHydration(page.getByRole("switch", { name: "Share analytics", exact: true }));
    });

    test("click, keyboard and drag commit through the same checked state", async ({ page }) => {
      const control = page.getByRole("switch", { name: "Share analytics", exact: true });
      await control.click();
      await expect(control).toBeChecked();
      await control.press("Space");
      await expect(control).not.toBeChecked();
      await expect(control).toBeFocused();
      const position = await startDrag(page, control);
      await page.mouse.move(position.x + 70, position.y, { steps: 5 });
      await expect(control).not.toBeChecked();
      await expect(control).toHaveAttribute("data-dragging", "");
      await page.mouse.up();
      await expect(control).toBeChecked();
      await expect(control).not.toHaveAttribute("data-dragging");
      const returnPosition = await startDrag(page, control);
      await page.mouse.move(returnPosition.x - 70, returnPosition.y, { steps: 5 });
      await page.mouse.up();
      await expect(control).not.toBeChecked();
    });

    test("returning, escaping and interrupted drags keep the original value", async ({ page }) => {
      const control = page.getByRole("switch", { name: "Share analytics", exact: true });
      const position = await startDrag(page, control);
      await page.mouse.move(position.x + 30, position.y);
      await page.mouse.move(position.x, position.y);
      await page.mouse.up();
      await expect(control).not.toBeChecked();

      for (const interruption of ["escape", "pointercancel", "lostpointercapture"]) {
        const interruptedPosition = await startDrag(page, control);
        await page.mouse.move(interruptedPosition.x + 30, interruptedPosition.y);
        if (interruption === "escape") await page.keyboard.press("Escape");
        else await control.dispatchEvent(interruption, { pointerId: 1 });
        await page.mouse.up();
        await expect(control).not.toBeChecked();
        await expect(control).not.toHaveAttribute("data-dragging");
      }
      await control.press("Space");
      await expect(control).toBeChecked();
    });

    test("uncontrolled input stays synchronized and locked switches ignore dragging", async ({ page }) => {
      const control = page.getByRole("switch", { name: "Automatic updates", exact: true });
      const input = page.locator('input[name="automatic-updates"]');
      const position = await startDrag(page, control);
      await page.mouse.move(position.x - 50, position.y);
      await page.mouse.up();
      await expect(control).not.toBeChecked();
      await expect(input).not.toBeChecked();
      await page.getByText("Automatic updates", { exact: true }).click();
      await expect(control).toBeChecked();
      await expect(input).toBeChecked();

      for (const name of ["On, disabled", "Managed by organization"]) {
        const locked = page.getByRole("switch", { name, exact: true });
        const lockedPosition = await startDrag(page, locked);
        await page.mouse.move(lockedPosition.x - 50, lockedPosition.y);
        await page.mouse.up();
        await expect(locked).toBeChecked();
        await expect(locked).not.toHaveAttribute("data-dragging");
      }
    });

    test("RTL drags toward the logical checked end", async ({ page }) => {
      await page.locator("html").evaluate((element) => element.setAttribute("dir", "rtl"));
      const control = page.getByRole("switch", { name: "Share analytics", exact: true });
      const thumb = control.locator('[data-slot="thumb"]');
      const before = await thumb.boundingBox();
      const position = await startDrag(page, control);
      await page.mouse.move(position.x - 60, position.y, { steps: 5 });
      await page.mouse.up();
      await expect(control).toBeChecked();
      const after = await thumb.boundingBox();
      if (!before || !after) throw new Error("Switch thumb is not visible");
      expect(after.x).toBeLessThan(before.x);
    });

    test("touch dragging toggles while a vertical scroll gesture cancels", async ({ page }) => {
      const session = await page.context().newCDPSession(page);
      await session.send("Emulation.setTouchEmulationEnabled", { enabled: true });
      const control = page.getByRole("switch", { name: "Share analytics", exact: true });
      const bounds = await control.boundingBox();
      if (!bounds) throw new Error("Switch is not visible");
      const touch = { x: bounds.x + 8, y: bounds.y + bounds.height / 2 };
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [touch] });
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ ...touch, x: touch.x + 50 }] });
      await expect(control).toHaveAttribute("data-dragging", "");
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await expect(control).toBeChecked();
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [touch] });
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ ...touch, y: touch.y + 80 }] });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await expect(control).toBeChecked();
      await expect(control).not.toHaveAttribute("data-dragging");
      await session.detach();
    });
  });
}

for (const mode of ["light", "dark"] as const) {
  test(`macOS switch proportions and transient glass in ${mode}`, async ({ page }) => {
    await page.addInitScript(
      ({ skinKey, modeKey, mode: appearance }) => {
        localStorage.setItem(skinKey, JSON.stringify({ skin: "modern-apple", reduceMotion: true }));
        localStorage.setItem(modeKey, appearance);
      },
      { skinKey: THEME_EDITOR_STORAGE_KEY, modeKey: THEME_STORAGE_KEY, mode },
    );
    await page.goto("/primitives/switch");
    const control = page.getByRole("switch", { name: "Share analytics", exact: true });
    const thumb = control.locator('[data-slot="thumb"]');
    await waitForReactHydration(control);
    await expect(control).toHaveCSS("width", "54px");
    await expect(control).toHaveCSS("height", "24px");
    await expect(thumb).toHaveCSS("width", "32px");
    await expect(thumb).toHaveCSS("height", "20px");
    await expect(control).toHaveCSS("corner-shape", "round");
    await expect(thumb).toHaveCSS("corner-shape", "round");
    await expect(thumb).toHaveCSS("backdrop-filter", "none");
    await startDrag(page, control);
    await expect(thumb).not.toHaveCSS("backdrop-filter", "none");
    await page.mouse.up();
    await expect(control).toBeChecked();
    await expect(thumb).toHaveCSS("backdrop-filter", "none");
    const session = await page.context().newCDPSession(page);
    await session.send("Emulation.setEmulatedMedia", {
      features: [
        { name: "prefers-reduced-motion", value: "reduce" },
        { name: "prefers-reduced-transparency", value: "reduce" },
      ],
    });
    await startDrag(page, control);
    await expect(thumb).toHaveCSS("backdrop-filter", "none");
    await expect(thumb).toHaveCSS("transition-duration", "0s");
    const sidebar = page.locator('[data-control-family="sidebar"][data-slot="inner"]').first();
    expect(await sidebar.evaluate((element) => getComputedStyle(element, "::before").backdropFilter)).toBe("none");
    await page.mouse.up();
    await session.detach();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(control).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
}
