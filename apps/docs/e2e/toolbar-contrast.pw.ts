import { expect, type Locator, test } from "@playwright/test";

const SKINS = [
  { id: "refined", label: "Refined" },
  { id: "xp", label: "Windows XP" },
  { id: "flat", label: "Flat" },
  { id: "rig", label: "Rig" },
  { id: "liquid-metal", label: "Liquid metal" },
  { id: "modern-apple", label: "Modern Apple" },
  { id: "cuicui", label: "Cuicui" },
  { id: "linear", label: "Linear" },
] as const;
const MODES = ["light", "dark"] as const;
const ICON_THRESHOLD = 3;
const TEXT_THRESHOLD = 4.5;
// backdrop clusters below this share are boundary slivers (pill rims, antialiasing), not glyph backdrop
const BACKDROP_SHARE = 0.05;

type GlyphRegion = { name: string; x: number; y: number; width: number; height: number; color: string; hasText: boolean };

// Regions are the rendered glyph bounds (svg + visible text) of every toolbar control, relative to the toolbar box.
async function glyphRegions(toolbar: Locator): Promise<GlyphRegion[]> {
  return toolbar.evaluate((toolbarElement) => {
    const host = toolbarElement.getBoundingClientRect();

    const isMeasurable = (element: Element): element is HTMLElement => {
      if (!(element instanceof HTMLElement) || element.offsetParent === null) return false;
      const styles = getComputedStyle(element);
      return styles.visibility === "visible" && Number.parseFloat(styles.opacity) > 0;
    };

    const glyphsOf = (element: HTMLElement) => {
      const nested = [...element.querySelectorAll("svg, span")]
        .map((glyph) => ({ rect: glyph.getBoundingClientRect(), text: (glyph.textContent ?? "").trim().length > 0 }))
        .filter(({ rect }) => rect.width > 1 && rect.height > 1);
      if (nested.length > 0) return nested;
      const range = document.createRange();
      range.selectNodeContents(element);
      const contentRect = range.getBoundingClientRect();
      if (contentRect.width <= 1 || contentRect.height <= 1) return [];
      return [{ rect: contentRect, text: (element.textContent ?? "").trim().length > 0 }];
    };

    const regions: GlyphRegion[] = [];
    for (const element of toolbarElement.querySelectorAll("button, a")) {
      if (!isMeasurable(element)) continue;
      const glyphs = glyphsOf(element);
      if (glyphs.length === 0) continue;
      const own = element.getBoundingClientRect();
      const left = Math.max(own.left, Math.min(...glyphs.map(({ rect }) => rect.left)));
      const top = Math.max(own.top, Math.min(...glyphs.map(({ rect }) => rect.top)));
      const right = Math.min(own.right, Math.max(...glyphs.map(({ rect }) => rect.right)));
      const bottom = Math.min(own.bottom, Math.max(...glyphs.map(({ rect }) => rect.bottom)));
      if (right - left < 2 || bottom - top < 2) continue;
      regions.push({
        name: element.getAttribute("aria-label") ?? element.getAttribute("title") ?? (element.textContent ?? "").trim(),
        x: left - host.left,
        y: top - host.top,
        width: right - left,
        height: bottom - top,
        color: getComputedStyle(element).color,
        hasText: glyphs.some(({ text }) => text),
      });
    }
    return regions;
  });
}

// Glyphs are hidden before the shot, so every sampled pixel is real rendered backdrop —
// gradients, translucency, and specificity outcomes are all measured as pixels, not as styles.
async function minimumContrasts(toolbar: Locator, regions: GlyphRegion[]): Promise<number[]> {
  await toolbar.evaluate((toolbarElement) => {
    for (const element of toolbarElement.querySelectorAll("button, a")) {
      if (element instanceof HTMLElement) element.style.setProperty("color", "transparent", "important");
    }
  });
  const shot = await toolbar.screenshot({ animations: "disabled" });
  await toolbar.evaluate((toolbarElement) => {
    for (const element of toolbarElement.querySelectorAll("button, a")) {
      if (element instanceof HTMLElement) element.style.removeProperty("color");
    }
  });

  return toolbar.page().evaluate(
    async ({ encoded, sampled, minimumShare }) => {
      const scale = window.devicePixelRatio;
      const image = new Image();
      image.src = `data:image/png;base64,${encoded}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas 2D context unavailable");
      context.drawImage(image, 0, 0);

      const mix = document.createElement("canvas");
      mix.width = 1;
      mix.height = 1;
      const mixContext = mix.getContext("2d", { willReadFrequently: true });
      if (!mixContext) throw new Error("Canvas 2D context unavailable");

      const channel = (value: number) => {
        const normalized = value / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      };
      const luminance = (pixel: [number, number, number]) =>
        0.2126 * channel(pixel[0]) + 0.7152 * channel(pixel[1]) + 0.0722 * channel(pixel[2]);
      const contrast = (a: [number, number, number], b: [number, number, number]) => {
        const first = luminance(a);
        const second = luminance(b);
        return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
      };
      const composite = (backdrop: [number, number, number], color: string): [number, number, number] => {
        mixContext.fillStyle = `rgb(${backdrop[0]} ${backdrop[1]} ${backdrop[2]})`;
        mixContext.fillRect(0, 0, 1, 1);
        mixContext.fillStyle = color;
        mixContext.fillRect(0, 0, 1, 1);
        const rendered = mixContext.getImageData(0, 0, 1, 1).data;
        return [rendered[0], rendered[1], rendered[2]];
      };

      const backdropClusters = (data: Uint8ClampedArray) => {
        const clusters = new Map<number, { count: number; red: number; green: number; blue: number }>();
        for (let index = 0; index < data.length; index += 4) {
          const key = ((data[index] >> 3) << 10) | ((data[index + 1] >> 3) << 5) | (data[index + 2] >> 3);
          const cluster = clusters.get(key) ?? { count: 0, red: 0, green: 0, blue: 0 };
          cluster.count += 1;
          cluster.red += data[index];
          cluster.green += data[index + 1];
          cluster.blue += data[index + 2];
          clusters.set(key, cluster);
        }
        return clusters;
      };

      return sampled.map((region) => {
        const left = Math.max(0, Math.round(region.x * scale));
        const top = Math.max(0, Math.round(region.y * scale));
        const width = Math.min(image.width - left, Math.round(region.width * scale));
        const height = Math.min(image.height - top, Math.round(region.height * scale));
        const { data } = context.getImageData(left, top, width, height);
        const clusters = backdropClusters(data);
        const totalPixels = data.length / 4;

        let minimum = Number.POSITIVE_INFINITY;
        for (const cluster of clusters.values()) {
          if (cluster.count / totalPixels < minimumShare) continue;
          const backdrop: [number, number, number] = [
            Math.round(cluster.red / cluster.count),
            Math.round(cluster.green / cluster.count),
            Math.round(cluster.blue / cluster.count),
          ];
          const ratio = contrast(composite(backdrop, region.color), backdrop);
          if (ratio < minimum) minimum = ratio;
        }
        return minimum;
      });
    },
    { encoded: shot.toString("base64"), sampled: regions, minimumShare: BACKDROP_SHARE },
  );
}

test("floating toolbar controls keep rendered contrast across every skin and mode", async ({ page }) => {
  test.setTimeout(600_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/primitives/button");
  await page.waitForLoadState("networkidle");

  const toolbar = page.locator("[data-docs-floating-toolbar]");
  const violations: string[] = [];

  for (const skin of SKINS) {
    await toolbar.getByRole("button", { name: "Edit theme" }).click();
    await page.getByRole("button", { name: skin.label, exact: true }).click();
    await page.keyboard.press("Escape");
    await page.mouse.move(0, 0);
    await expect(page.locator("html")).toHaveAttribute("data-skin", skin.id);
    await expect(toolbar).toHaveCSS("opacity", "1");

    for (const mode of MODES) {
      await page.evaluate((activeMode) => {
        localStorage.setItem("control-ui:theme:v1", activeMode);
        document.documentElement.classList.toggle("dark", activeMode === "dark");
      }, mode);
      // transition-colors on toolbar items: let paints settle before sampling pixels
      await page.waitForTimeout(400);

      const regions = await glyphRegions(toolbar);
      expect(regions.length).toBeGreaterThan(0);
      const ratios = await minimumContrasts(toolbar, regions);
      regions.forEach((region, index) => {
        const threshold = region.hasText ? TEXT_THRESHOLD : ICON_THRESHOLD;
        if (ratios[index] < threshold) {
          violations.push(`${skin.id} ${mode} "${region.name}": ${ratios[index].toFixed(2)}:1 (needs ${threshold}:1)`);
        }
      });
    }
  }

  expect(violations).toEqual([]);
});
