import { THEME_AUDIT_PAIRS, type ThemeAuditPair, type ThemeAuditResult } from "./audit-contract";

type Rgb = [number, number, number];

type ResolvedPaint = {
  css: string;
  pixels: Rgb[];
};

const WHITE: Rgb = [255, 255, 255];
const GRADIENT_SAMPLE_STEPS = 16;
const CSS_COLOR_FUNCTIONS: Record<string, true> = {
  rgb: true,
  rgba: true,
  hsl: true,
  hsla: true,
  hwb: true,
  lab: true,
  lch: true,
  oklab: true,
  oklch: true,
  color: true,
};

function channelLuminance(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance([red, green, blue]: Rgb): number {
  return 0.2126 * channelLuminance(red) + 0.7152 * channelLuminance(green) + 0.0722 * channelLuminance(blue);
}

function contrastRatio(foreground: Rgb, background: Rgb): number {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

function rgbCss([red, green, blue]: Rgb): string {
  return `rgb(${red} ${green} ${blue})`;
}

function paintPixel(context: CanvasRenderingContext2D, layers: string[]): Rgb {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, 1, 1);
  for (const color of layers) {
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
  }
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  return [red, green, blue];
}

function uniquePixels(pixels: Rgb[]): Rgb[] {
  const seen = new Set<string>();
  return pixels.filter((pixel) => {
    const key = pixel.join(",");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function closingParenthesisIndex(value: string, openIndex: number): number {
  let depth = 1;
  for (let index = openIndex + 1; index < value.length; index += 1) {
    if (value[index] === "(") depth += 1;
    if (value[index] !== ")") continue;
    depth -= 1;
    if (depth === 0) return index + 1;
  }
  return -1;
}

function extractCssColors(paint: string): string[] {
  const colors: string[] = [];
  let cursor = 0;
  while (cursor < paint.length) {
    const functionStart = paint.slice(cursor).search(/[a-z][a-z0-9-]*\(/i);
    if (functionStart < 0) break;
    const nameStart = cursor + functionStart;
    const open = paint.indexOf("(", nameStart);
    const name = paint.slice(nameStart, open).toLowerCase();
    const close = closingParenthesisIndex(paint, open);
    if (close < 0) break;
    if (CSS_COLOR_FUNCTIONS[name]) {
      colors.push(paint.slice(nameStart, close));
      cursor = close;
      continue;
    }
    cursor = open + 1;
  }
  return colors;
}

function interpolatePixels(from: Rgb, to: Rgb): Rgb[] {
  return Array.from({ length: GRADIENT_SAMPLE_STEPS + 1 }, (_, index) => {
    const progress = index / GRADIENT_SAMPLE_STEPS;
    return from.map((channel, channelIndex) => Math.round(channel + (to[channelIndex] - channel) * progress)) as Rgb;
  });
}

function sampleBackground(element: HTMLElement, backdrops: Rgb[], context: CanvasRenderingContext2D): ResolvedPaint | null {
  const styles = getComputedStyle(element);
  const color = styles.backgroundColor;
  const image = styles.backgroundImage;
  const colorPixels = backdrops.map((backdrop) => paintPixel(context, [rgbCss(backdrop), color]));
  if (image === "none") return { css: color, pixels: uniquePixels(colorPixels) };
  if (image.includes("url(")) return null;

  const gradientColors = extractCssColors(image);
  if (gradientColors.length === 0) return null;
  const pixels = colorPixels.flatMap((colorPixel) => {
    const stops = gradientColors.map((gradientColor) => paintPixel(context, [rgbCss(colorPixel), gradientColor]));
    if (stops.length === 1) return stops;
    return stops.slice(0, -1).flatMap((stop, index) => interpolatePixels(stop, stops[index + 1]));
  });
  return { css: image, pixels: uniquePixels(pixels) };
}

function minimumContrast(foreground: string, backgrounds: Rgb[], context: CanvasRenderingContext2D): number {
  return Math.min(
    ...backgrounds.map((background) => {
      const foregroundPixel = paintPixel(context, [rgbCss(background), foreground]);
      return contrastRatio(foregroundPixel, background);
    }),
  );
}

function unresolvedResult(pair: ThemeAuditPair, resolvedForeground: string | null, resolvedBackground: string | null): ThemeAuditResult {
  return { ...pair, ratio: null, status: "unresolved", resolvedForeground, resolvedBackground };
}

function auditTokenPair(root: HTMLElement, pair: ThemeAuditPair, context: CanvasRenderingContext2D): ThemeAuditResult {
  const mount = root === document.documentElement ? document.body : root;
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;left:-10000px;top:0;width:64px;height:64px;overflow:hidden;pointer-events:none";

  const paintDefinitions = [
    ...(pair.underlays ?? []).map((token) => ({ token, paint: undefined })),
    { token: pair.surface, paint: pair.surfacePaint },
    { token: pair.background, paint: pair.backgroundPaint },
  ];
  const paintElements = paintDefinitions.map(({ token, paint }) => {
    const element = document.createElement("div");
    element.style.cssText = `width:100%;height:100%;background:${paint ?? `var(${token})`}`;
    return { element, token };
  });
  let parent = container;
  for (const { element } of paintElements) {
    parent.append(element);
    parent = element;
  }

  const foreground = document.createElement("span");
  foreground.style.color = `var(${pair.foreground})`;
  parent.append(foreground);
  mount.append(container);

  const foregroundStyles = getComputedStyle(foreground);
  const hasForeground = foregroundStyles.getPropertyValue(pair.foreground).trim().length > 0;
  const hasDependencies = (pair.dependencies ?? []).every((token) => foregroundStyles.getPropertyValue(token).trim().length > 0);
  const resolvedForeground = hasForeground ? foregroundStyles.color : null;
  let backdrops = [WHITE];
  let resolvedBackground: string | null = null;
  let resolved = true;

  for (const { element, token } of paintElements) {
    if (getComputedStyle(element).getPropertyValue(token).trim().length === 0) {
      resolved = false;
      break;
    }
    const paint = sampleBackground(element, backdrops, context);
    if (!paint) {
      resolved = false;
      break;
    }
    backdrops = paint.pixels;
    resolvedBackground = paint.css;
  }
  container.remove();

  if (!resolvedForeground || !hasDependencies || !resolved || !resolvedBackground) {
    return unresolvedResult(pair, resolvedForeground, resolvedBackground);
  }
  const ratio = minimumContrast(resolvedForeground, backdrops, context);
  return {
    ...pair,
    ratio,
    status: ratio >= pair.threshold ? "pass" : "fail",
    resolvedForeground,
    resolvedBackground,
  };
}

type ActiveTabProbe = {
  surface: HTMLDivElement;
  list: HTMLDivElement;
  tab: HTMLDivElement;
  indicator: HTMLSpanElement;
};

function createActiveTabProbe(pair: ThemeAuditPair): ActiveTabProbe {
  const surface = document.createElement("div");
  const list = document.createElement("div");
  const tab = document.createElement("div");
  const indicator = document.createElement("span");

  surface.style.cssText = `position:fixed;left:-10000px;top:0;width:240px;height:80px;overflow:hidden;pointer-events:none;background:var(${pair.surface})`;
  list.dataset.controlUi = "tabs";
  list.dataset.slot = "list";
  list.dataset.size = "sm";
  list.style.setProperty("--tabs-trigger-h", "32px");
  list.style.setProperty("--active-tab-width", "96px");
  list.style.setProperty("--active-tab-left", "0px");
  tab.dataset.controlUi = "tabs";
  tab.dataset.slot = "tab";
  tab.dataset.active = "true";
  tab.setAttribute("aria-selected", "true");
  tab.textContent = "Active tab";
  indicator.dataset.controlUi = "tabs";
  indicator.dataset.slot = "indicator";
  list.append(tab, indicator);
  surface.append(list);
  return { surface, list, tab, indicator };
}

function ownsBackground(styles: CSSStyleDeclaration): boolean {
  return styles.backgroundImage !== "none" || styles.backgroundColor !== "rgba(0, 0, 0, 0)";
}

function sampleActiveTab(probe: ActiveTabProbe, context: CanvasRenderingContext2D): ResolvedPaint | null {
  const surfacePaint = sampleBackground(probe.surface, [WHITE], context);
  if (!surfacePaint) return null;
  const listPaint = sampleBackground(probe.list, surfacePaint.pixels, context);
  if (!listPaint) return null;

  const indicatorCoversGlyph = probe.indicator.getBoundingClientRect().height >= probe.tab.getBoundingClientRect().height / 2;
  let tabBackdrop = listPaint;
  let resolvedBackground = listPaint.css;
  if (indicatorCoversGlyph) {
    const indicatorPaint = sampleBackground(probe.indicator, listPaint.pixels, context);
    if (!indicatorPaint) return null;
    tabBackdrop = indicatorPaint;
    if (ownsBackground(getComputedStyle(probe.indicator))) resolvedBackground = indicatorPaint.css;
  }

  const tabPaint = sampleBackground(probe.tab, tabBackdrop.pixels, context);
  if (!tabPaint) return null;
  if (ownsBackground(getComputedStyle(probe.tab))) resolvedBackground = tabPaint.css;
  return { css: resolvedBackground, pixels: tabPaint.pixels };
}

function auditActiveTab(root: HTMLElement, pair: ThemeAuditPair, context: CanvasRenderingContext2D): ThemeAuditResult {
  const mount = root === document.documentElement ? document.body : root;
  const probe = createActiveTabProbe(pair);
  mount.append(probe.surface);

  const listStyles = getComputedStyle(probe.list);
  const hasForeground = listStyles.getPropertyValue(pair.foreground).trim().length > 0;
  const hasBackground = listStyles.getPropertyValue(pair.background).trim().length > 0;
  const resolvedForeground = hasForeground ? getComputedStyle(probe.tab).color : null;
  const tabPaint = sampleActiveTab(probe, context);
  probe.surface.remove();

  if (!resolvedForeground || !hasBackground || !tabPaint) {
    return unresolvedResult(pair, resolvedForeground, tabPaint?.css ?? null);
  }
  const ratio = minimumContrast(resolvedForeground, tabPaint.pixels, context);
  return {
    ...pair,
    ratio,
    status: ratio >= pair.threshold ? "pass" : "fail",
    resolvedForeground,
    resolvedBackground: tabPaint.css,
  };
}

function auditPair(root: HTMLElement, pair: ThemeAuditPair, context: CanvasRenderingContext2D): ThemeAuditResult {
  if (pair.probe === "tabs-active") return auditActiveTab(root, pair, context);
  return auditTokenPair(root, pair, context);
}

export function auditTheme(root: HTMLElement, pairs: readonly ThemeAuditPair[] = THEME_AUDIT_PAIRS): ThemeAuditResult[] {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas 2D context unavailable");
  return pairs.map((pair) => auditPair(root, pair, context));
}
