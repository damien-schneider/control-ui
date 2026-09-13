import { expect, type Page, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "../components/theme";

async function readScreenshotRow(page: Page, screenshotBase64: string, bottomInsetPx: number) {
  return page.evaluate(
    async ({ encoded, distanceFromBottom }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${encoded}`;
      await image.decode();
      const raster = document.createElement("canvas");
      raster.width = image.naturalWidth;
      raster.height = image.naturalHeight;
      const context = raster.getContext("2d");
      if (!context) throw new Error("Canvas unavailable for glass measurement");
      context.drawImage(image, 0, 0);
      return Array.from(context.getImageData(0, raster.height - distanceFromBottom, raster.width, 1).data);
    },
    { encoded: screenshotBase64, distanceFromBottom: bottomInsetPx },
  );
}

function colorAtFraction(row: number[], fraction: number) {
  const offset = Math.floor((row.length / 4) * fraction) * 4;
  return row.slice(offset, offset + 3);
}

for (const mode of ["light", "dark"] as const) {
  test(`macOS ${mode} transmits background colors and refracts the menu edges`, async ({ page }) => {
    await page.addInitScript(
      ({ skinKey, modeKey, appearance }) => {
        localStorage.setItem(skinKey, JSON.stringify({ skin: "modern-apple", reduceMotion: true }));
        localStorage.setItem(modeKey, appearance);
      },
      { skinKey: THEME_EDITOR_STORAGE_KEY, modeKey: THEME_STORAGE_KEY, appearance: mode },
    );
    await page.goto("/primitives/dropdown-menu");
    await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toContainText("macOS");
    const trigger = page.getByRole("button", { name: "Options", exact: true });
    const menu = page.getByRole("menu").filter({ has: page.getByRole("menuitemcheckbox", { name: "Notifications", exact: true }) });
    await trigger.click();
    await expect(menu).toBeVisible();
    const bounds = await menu.boundingBox();
    if (!bounds) throw new Error("Menu has no bounds");
    await page.keyboard.press("Escape");
    await page.evaluate(({ x, y, width, height }) => {
      const backdrop = document.createElement("div");
      backdrop.dataset.glassTransmissionFixture = "";
      Object.assign(backdrop.style, {
        position: "absolute",
        left: `${x - 64}px`,
        top: `${y - 64}px`,
        width: `${width + 128}px`,
        height: `${height + 128}px`,
        background: "linear-gradient(to right, rgb(24 72 232) 50%, rgb(232 72 24) 50%)",
        pointerEvents: "none",
      });
      document.body.append(backdrop);
    }, bounds);
    await trigger.click();
    await expect(menu).not.toHaveCSS("backdrop-filter", "none");
    await expect(menu.locator("canvas")).toHaveCount(0);
    const png = await menu.screenshot();
    const colorRow = await readScreenshotRow(page, png.toString("base64"), 10);
    const colors = { left: colorAtFraction(colorRow, 0.25), right: colorAtFraction(colorRow, 0.75) };
    expect(colors.left[2] - colors.left[0], JSON.stringify(colors)).toBeGreaterThan(45);
    expect(colors.right[0] - colors.right[2], JSON.stringify(colors)).toBeGreaterThan(45);
    await page.locator("[data-glass-transmission-fixture]").evaluate((backdrop) => {
      backdrop.style.background = "repeating-linear-gradient(to right, rgb(32 32 32) 0 16px, rgb(240 240 240) 16px 32px)";
    });
    const refracted = await menu.screenshot();
    await menu.evaluate((element) => element.style.setProperty("--apple-glass-refraction", "blur(0px)"));
    const blurred = await menu.screenshot();
    const rows = await Promise.all([
      readScreenshotRow(page, refracted.toString("base64"), 6),
      readScreenshotRow(page, blurred.toString("base64"), 6),
    ]);
    const rowWidth = rows[0].length / 4;
    const difference = (start: number, end: number) => {
      let total = 0;
      let count = 0;
      for (let x = Math.floor(rowWidth * start); x < rowWidth * end; x += 1) {
        total += Math.abs(rows[0][x * 4] - rows[1][x * 4]);
        count += 1;
      }
      return total / count;
    };
    const distortion = { edge: difference(0.025, 0.08), center: difference(0.4, 0.6) };
    expect(distortion.edge, JSON.stringify(distortion)).toBeGreaterThan(2);
    expect(distortion.center, JSON.stringify(distortion)).toBeLessThan(3);
  });
}

test("search glass follows the scrolling page with JavaScript paused", async ({ page }) => {
  await page.addInitScript(
    ({ skinKey, modeKey }) => {
      localStorage.setItem(skinKey, JSON.stringify({ skin: "modern-apple", reduceMotion: true }));
      localStorage.setItem(modeKey, "light");
    },
    { skinKey: THEME_EDITOR_STORAGE_KEY, modeKey: THEME_STORAGE_KEY },
  );
  await page.goto("/primitives/popover");
  await expect(page.getByRole("combobox", { name: "Skin", exact: true })).toContainText("macOS");
  const viewport = page.locator("[data-docs-content] [data-scroll-area-viewport]").first();
  await page.locator("[data-docs-page-grid]").evaluate((grid) => {
    grid.style.position = "relative";
    grid.style.minHeight = "2400px";
    const backdrop = document.createElement("div");
    Object.assign(backdrop.style, {
      position: "absolute",
      inset: "0",
      zIndex: "1",
      pointerEvents: "none",
      background: "linear-gradient(to bottom, rgb(24 72 232) 600px, rgb(232 72 24) 600px)",
    });
    grid.append(backdrop);
  });
  const search = page.getByRole("combobox", { name: "Search documentation" });
  await search.focus();
  const popup = page.locator('[data-control-ui="command"][data-slot="popup"]');
  await expect(popup).toBeVisible();
  await expect(popup).not.toHaveCSS("backdrop-filter", "none");
  await expect(popup.locator("canvas")).toHaveCount(0);
  const bounds = await popup.boundingBox();
  if (!bounds) throw new Error("Search popup has no bounds");
  const session = await page.context().newCDPSession(page);
  const clip = { ...bounds, scale: 1 };
  const before = await session.send("Page.captureScreenshot", { clip });
  let after: { data: string };
  try {
    await session.send("Emulation.setScriptExecutionDisabled", { value: true });
    await page.mouse.move(1100, 700);
    await page.mouse.wheel(0, 700);
    after = await session.send("Page.captureScreenshot", { clip });
  } finally {
    await session.send("Emulation.setScriptExecutionDisabled", { value: false });
    await session.detach();
  }
  await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(600);
  const rows = await Promise.all([readScreenshotRow(page, before.data, 6), readScreenshotRow(page, after.data, 6)]);
  const transmitted = rows.map((row) => colorAtFraction(row, 0.5));
  expect(transmitted[0][2] - transmitted[0][0], JSON.stringify(transmitted)).toBeGreaterThan(45);
  expect(transmitted[1][0] - transmitted[1][2], JSON.stringify(transmitted)).toBeGreaterThan(45);
  await search.fill("Popover");
  await expect(popup.getByRole("option", { name: /^Popover / })).toBeVisible();
  await search.press("Escape");
  await expect(popup).not.toBeVisible();
});
