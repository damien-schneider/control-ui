import { expect, type Locator, test } from "@playwright/test";
import { waitForReactHydration } from "./browser-test-helpers";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__REACT_SCAN_DISABLED__ = true;
    window.__REACT_GRAB_DISABLED__ = true;
  });
});

async function expectCentered(container: Locator, content: Locator) {
  await expect(content).toBeVisible();
  await expect
    .poll(async () => {
      const outer = await container.boundingBox();
      const inner = await content.boundingBox();
      if (!outer || !inner) return Number.POSITIVE_INFINITY;
      return Math.max(
        Math.abs(inner.x + inner.width / 2 - (outer.x + outer.width / 2)),
        Math.abs(inner.y + inner.height / 2 - (outer.y + outer.height / 2)),
      );
    })
    .toBeLessThan(1);
}

for (const width of [390, 795, 1440]) {
  test(`audio visualizer versions stay centered without centering wrappers at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/components/audio-visualizer");
    const preview = page.locator("#preview");
    const panel = preview.getByRole("tabpanel", { name: "Preview", exact: true });
    const content = preview.locator("[data-preview-layout] > div");
    await waitForReactHydration(preview.getByRole("tab", { name: "Preview", exact: true }));

    for (const [label, variant] of [
      ["Live waveform", "bars"],
      ["Line", "line"],
      ["Bar visualizer", "bar"],
      ["Live waveform", "bars"],
    ]) {
      await preview.getByRole("button", { name: label, exact: true }).click();
      const visualizer = preview.locator(`[data-control-ui="audio-visualizer"][data-slot="root"][data-variant="${variant}"]`).first();
      await expect(visualizer).toBeVisible();
      await expectCentered(panel, content);
      await preview.getByRole("tab", { name: "Code", exact: true }).press("Enter");
      const code = preview.getByRole("region", { name: "tsx code" });
      await expect(code).toContainText("@/components/control-ui/audio-visualizer");
      await expect(code).not.toContainText("justify-center");
      await preview.getByRole("tab", { name: "Preview", exact: true }).press("Enter");
      await expectCentered(panel, content);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });

  test(`bounded component previews stay centered and responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/components/audio-recorder");
    const preview = page.locator("#preview");
    const frame = preview.locator("[data-preview-layout]");
    const content = frame.locator(":scope > div");
    await expect(preview.getByRole("combobox", { name: "Microphone" })).toBeVisible();
    await waitForReactHydration(preview.getByRole("combobox", { name: "Microphone" }));
    await expectCentered(preview.getByRole("tabpanel", { name: "Preview", exact: true }), content);
    await expect
      .poll(async () => {
        const available = await frame.boundingBox();
        const bounds = await content.boundingBox();
        if (!available || !bounds) return Number.POSITIVE_INFINITY;
        return Math.abs(bounds.width - Math.min(available.width, 448));
      })
      .toBeLessThan(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

test("the preview frame contains the app shell through loading and tab changes", async ({ page }) => {
  await page.goto("/primitives/app-shell");
  const preview = page.locator("#preview");
  const shell = preview.locator("[data-app-shell]");
  await expect(shell).toBeVisible();
  await waitForReactHydration(preview.getByRole("tab", { name: "Preview", exact: true }));
  const height = await shell.evaluate((element) => element.getBoundingClientRect().height);
  expect(height).toBeGreaterThan(300);
  expect(height).toBeLessThan(500);
  await preview.getByRole("button", { name: "Show loading" }).click();
  await expect(preview.getByRole("status")).toContainText("Loading inbox");
  await expect(preview.getByText("AppShellHeader", { exact: true })).toBeVisible();
  expect(await shell.evaluate((element) => element.getBoundingClientRect().height)).toBe(height);

  await preview.getByRole("tab", { name: "Code", exact: true }).click();
  const code = preview.getByRole("region", { name: "tsx code" });
  await expect(code).toContainText('<AppShell layout="contained"');
  await expect(code).not.toContainText("h-104 w-full overflow-hidden rounded-xl border");
  await preview.getByRole("tab", { name: "Preview", exact: true }).click();
  await expect(preview.getByRole("button", { name: "Show content" })).toBeVisible();
  expect(await shell.evaluate((element) => element.getBoundingClientRect().height)).toBe(height);
});

for (const width of [390, 1440]) {
  test(`aspect ratio stays sized and interactive at ${width}px without presentation wrappers in its code`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/primitives/aspect-ratio");
    const widescreen = page.locator("#preview").getByText("aspect-video", { exact: true });
    const square = page.locator("#preview").getByText("aspect-square", { exact: true });
    await waitForReactHydration(widescreen);
    await expect
      .poll(async () => {
        const bounds = await widescreen.boundingBox();
        return bounds ? bounds.width / bounds.height : 0;
      })
      .toBeCloseTo(16 / 9, 1);
    await expect
      .poll(async () => {
        const bounds = await square.boundingBox();
        return bounds ? bounds.width / bounds.height : 0;
      })
      .toBeCloseTo(1, 1);

    const example = page.locator("#example-runtime-ratio");
    const slider = example.getByRole("slider", { name: "Aspect ratio" });
    await waitForReactHydration(slider);
    await slider.focus();
    await slider.press("Home");
    await expect(slider).toHaveAttribute("aria-valuenow", "1");
    const surface = example.getByText("1.00 / 1", { exact: true });
    await expect(surface).toBeVisible();
    const bounds = await surface.boundingBox();
    if (!bounds) throw new Error("Runtime aspect ratio is not measurable");
    expect(bounds.width).toBeGreaterThan(100);
    expect(bounds.width).toBeLessThanOrEqual(256);
    expect(bounds.width / bounds.height).toBeCloseTo(1, 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);

    await example.getByRole("tab", { name: "Code", exact: true }).click();
    const code = example.getByRole("region", { name: "tsx code" });
    await expect(code).toContainText("<AspectRatio ratio={ratio}");
    await expect(code).not.toContainText("flex w-64 flex-col gap-3");
    await expect(code).not.toContainText("grid w-full max-w-md grid-cols-2 gap-4");
    await example.getByRole("tab", { name: "Preview", exact: true }).click();
    await expect(slider).toHaveAttribute("aria-valuenow", "1");
  });
}
