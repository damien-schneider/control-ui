import { expect, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { waitForReactHydration } from "./browser-test-helpers";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    window.__REACT_SCAN_DISABLED__ = true;
    window.__REACT_GRAB_DISABLED__ = true;
    localStorage.setItem(key, JSON.stringify({ skin: "refined" }));
  }, THEME_EDITOR_STORAGE_KEY);
});

for (const width of [360, 390, 795, 1440]) {
  test(`alternatives remain clear of preview tabs and viewport edges at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/components/audio-visualizer");
    const choices = page.getByRole("radiogroup", { name: "Alternatives" });
    const line = choices.getByRole("radio", { name: "Line envelope", exact: true });
    await waitForReactHydration(line);
    await line.click();
    await expect(line).toBeChecked();
    await expect(page.locator("#usage")).toContainText("@/components/control-ui/audio-visualizer-line");
    const bounds = await choices.boundingBox();
    const tabs = await page.locator("#preview").getByRole("tablist").boundingBox();
    if (!bounds || !tabs) throw new Error("Component choices and preview tabs must be measurable");
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    expect(bounds.y + bounds.height).toBeLessThan(tabs.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.locator("#preview").getByRole("tab", { name: "Code", exact: true }).click();
    await expect(page.locator("#preview").getByRole("region", { name: "tsx code" })).toContainText("audio-visualizer-line");
    await expect(line).toBeVisible();
  });
}

test("alternative selection keeps install, usage, source, reload, and history in sync", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/components/audio-visualizer?from=docs#alternatives");
  const choices = page.getByRole("radiogroup", { name: "Alternatives" });
  const line = choices.getByRole("radio", { name: "Line envelope", exact: true });
  await waitForReactHydration(line);
  await line.click();
  await expect(page).toHaveURL(/\?from=docs&alternative=line#alternatives$/);
  await expect(page.locator("#install")).toContainText("/r/audio-visualizer-line.json");
  await expect(page.locator("#usage")).toContainText('from "@/components/control-ui/audio-visualizer-line"');
  await expect(page.locator("#source")).toContainText("src/registry/sources/control-ui/audio-visualizer-line.tsx");
  await page.locator("#usage").getByRole("button", { name: "Copy code", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('from "@/components/control-ui/audio-visualizer-line"');
  await page.reload();
  await expect(line).toBeChecked();
  await waitForReactHydration(line);
  await choices.getByRole("radio", { name: "Frequency bars", exact: true }).click();
  await expect(page.locator("#usage")).toContainText("getByteFrequencyData");
  await expect(page.locator("#install")).toContainText("/r/audio-visualizer-bar.json");
  await page.goBack();
  await expect(line).toBeChecked();
  await expect(page.locator("#usage")).toContainText("audio-visualizer-line");
  await page.goForward();
  await expect(choices.getByRole("radio", { name: "Frequency bars", exact: true })).toBeChecked();
});

test("unknown alternatives fall back to a coherent default and keyboard navigation selects the next implementation", async ({ page }) => {
  await page.goto("/components/audio-visualizer?alternative=unknown");
  const choices = page.getByRole("radiogroup", { name: "Alternatives" });
  const waveform = choices.getByRole("radio", { name: "Waveform", exact: true });
  await expect(waveform).toBeChecked();
  await expect(page.locator("#install")).toContainText("/r/audio-visualizer.json");
  await expect(page.locator("#usage")).toContainText('from "@/components/control-ui/audio-visualizer"');
  await waitForReactHydration(waveform);
  await waveform.focus();
  await waveform.press("ArrowRight");
  await expect(choices.getByRole("radio", { name: "Line envelope", exact: true })).toBeChecked();
  await expect(page).toHaveURL(/alternative=line$/);
});

test("notification variants share installation and show matching usage for both integrations", async ({ page }) => {
  await page.goto("/components/dynamic-notification?variant=liquid");
  const choices = page.getByRole("radiogroup", { name: "Variants" });
  const liquid = choices.getByRole("radio", { name: "Liquid glass", exact: true });
  await expect(liquid).toBeChecked();
  await waitForReactHydration(liquid);
  const install = await page.locator("#install").getByRole("region", { name: "bash code" }).innerText();
  for (const integration of ["Mastra", "AI SDK"]) {
    await page.getByRole("combobox", { name: "Integration", exact: true }).click();
    await page.getByRole("option", { name: integration, exact: true }).click();
    for (const [label, variant, part] of [
      ["Surface", "surface", ""],
      ["Backdrop blur", "glass", "DynamicNotificationGlass"],
      ["Liquid glass", "liquid", "DynamicNotificationLiquid"],
    ]) {
      await choices.getByRole("radio", { name: label, exact: true }).click();
      await expect(page.locator("#usage")).toContainText(`variant="${variant}"`);
      if (part) await expect(page.locator("#usage")).toContainText(`<${part} />`);
      await expect(page.locator("#install").getByRole("region", { name: "bash code" })).toHaveText(install);
      await expect(page.locator("#source").getByRole("tab", { name: "dynamic-notification.tsx", exact: true })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(page.locator('#preview [data-control-ui="dynamic-notification"][data-slot="root"]').first()).toHaveAttribute(
        "data-variant",
        variant,
      );
    }
  }
  await page.reload();
  await expect(liquid).toBeChecked();
  await expect(page.locator("#usage")).toContainText("<DynamicNotificationLiquid />");
});
