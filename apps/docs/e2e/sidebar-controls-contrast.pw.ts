import { expect, type Locator, test } from "@playwright/test";

const SKINS = [
  { id: "refined", label: "Refined" },
  { id: "xp", label: "Windows XP" },
  { id: "none", label: "No skin" },
  { id: "rig", label: "Rig" },
  { id: "liquid-metal", label: "Liquid metal" },
  { id: "modern-apple", label: "macOS" },
  { id: "cuicui", label: "Cuicui" },
  { id: "linear", label: "Linear" },
] as const;
const MODES = ["light", "dark"] as const;
const ICON_THRESHOLD = 3;
const TEXT_THRESHOLD = 4.5;

const BACKDROP_SHARE = 0.05;

type GlyphRegion = { name: string; x: number; y: number; width: number; height: number; color: string; hasText: boolean };

async function glyphRegions(controls: Locator): Promise<GlyphRegion[]> {
  return controls.evaluate((controlsElement) => {
    const host = controlsElement.getBoundingClientRect();

    const isMeasurable = (element: Element): element is HTMLElement => {
      if (!(element instanceof HTMLElement) || element.offsetParent === null) return false;
      const styles = getComputedStyle(element);
      return styles.visibility === "visible" && Number.parseFloat(styles.opacity) > 0;
    };

    const paintsWithTextColor = (glyph: Element) =>
      glyph.tagName !== "svg" ||
      glyph.getAttribute("stroke") === "currentColor" ||
      glyph.getAttribute("fill") === "currentColor" ||
      glyph.querySelector('[stroke="currentColor"], [fill="currentColor"]') !== null;

    const textGlyphs = (element: HTMLElement) => {
      const glyphs: { rect: DOMRect; color: string; hasText: boolean }[] = [];
      const textNodes = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      while (textNodes.nextNode()) {
        const node = textNodes.currentNode;
        const parent = node.parentElement;
        if (!(node.textContent?.trim() && parent && isMeasurable(parent))) continue;
        const range = document.createRange();
        range.selectNode(node);
        glyphs.push({ rect: range.getBoundingClientRect(), color: getComputedStyle(parent).color, hasText: true });
      }
      return glyphs;
    };

    const iconGlyphs = (element: HTMLElement) =>
      [...element.querySelectorAll("svg")]
        .filter((icon) => icon.checkVisibility() && paintsWithTextColor(icon))
        .map((icon) => ({ rect: icon.getBoundingClientRect(), color: getComputedStyle(icon).color, hasText: false }));

    return [...controlsElement.querySelectorAll("button, a")].filter(isMeasurable).flatMap((element) => {
      const name = element.getAttribute("aria-label") ?? element.getAttribute("title") ?? (element.textContent ?? "").trim();
      const own = element.getBoundingClientRect();
      return [...textGlyphs(element), ...iconGlyphs(element)].flatMap(({ rect, color, hasText }) => {
        const left = Math.max(own.left, rect.left);
        const top = Math.max(own.top, rect.top);
        const right = Math.min(own.right, rect.right);
        const bottom = Math.min(own.bottom, rect.bottom);
        if (right - left < 2 || bottom - top < 2) return [];
        return [{ name, x: left - host.left, y: top - host.top, width: right - left, height: bottom - top, color, hasText }];
      });
    });
  });
}

async function minimumContrasts(controls: Locator, regions: GlyphRegion[]): Promise<number[]> {
  await controls.evaluate((controlsElement) => {
    for (const element of controlsElement.querySelectorAll("button, a, button *, a *")) {
      if (element instanceof HTMLElement) element.style.setProperty("color", "transparent", "important");
    }
    for (const icon of controlsElement.querySelectorAll("button svg, a svg")) {
      if (icon instanceof SVGElement) icon.style.visibility = "hidden";
    }
  });
  const shot = await controls.screenshot({ animations: "disabled" });
  await controls.evaluate((controlsElement) => {
    for (const element of controlsElement.querySelectorAll("button, a, button *, a *")) {
      if (element instanceof HTMLElement) element.style.removeProperty("color");
    }
    for (const icon of controlsElement.querySelectorAll("button svg, a svg")) {
      if (icon instanceof SVGElement) icon.style.removeProperty("visibility");
    }
  });

  return controls.page().evaluate(
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
        const clusters = [...backdropClusters(data).values()];
        const totalPixels = data.length / 4;
        const qualifying = clusters.filter((cluster) => cluster.count / totalPixels >= minimumShare);
        const dominant = clusters.reduce((largest, cluster) => (cluster.count > largest.count ? cluster : largest));

        let minimum = Number.POSITIVE_INFINITY;
        for (const cluster of qualifying.length > 0 ? qualifying : [dominant]) {
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

test("sidebar header controls keep rendered contrast across every skin and mode", async ({ page }) => {
  test.setTimeout(600_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/theme-editor");
  await page.waitForLoadState("networkidle");

  const controls = page.locator('[data-control-ui="sidebar"][data-slot="header"]');
  const violations: string[] = [];

  for (const skin of SKINS) {
    await page.getByRole("combobox", { name: "Skin", exact: true }).click();
    await page.getByRole("option", { name: skin.label, exact: true }).click();
    await page.mouse.move(0, 0);
    await expect(page.locator("html")).toHaveAttribute("data-skin", skin.id);
    await expect(controls).toHaveCSS("opacity", "1");

    for (const mode of MODES) {
      await page.evaluate((activeMode) => {
        localStorage.setItem("control-ui:theme:v1", activeMode);
        document.documentElement.classList.toggle("dark", activeMode === "dark");
      }, mode);

      await page.waitForTimeout(400);

      const regions = await glyphRegions(controls);
      expect(regions.length).toBeGreaterThan(0);
      const ratios = await minimumContrasts(controls, regions);
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
