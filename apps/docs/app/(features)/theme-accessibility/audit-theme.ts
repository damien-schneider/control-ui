import { THEME_AUDIT_PAIRS, type ThemeAuditAnatomy, type ThemeAuditPair, type ThemeAuditResult } from "./audit-contract";

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

function mixChannel(from: number, to: number, progress: number) {
  return Math.round(from + (to - from) * progress);
}

function interpolatePixels(from: Rgb, to: Rgb): Rgb[] {
  return Array.from({ length: GRADIENT_SAMPLE_STEPS + 1 }, (_, index) => {
    const progress = index / GRADIENT_SAMPLE_STEPS;
    return [mixChannel(from[0], to[0], progress), mixChannel(from[1], to[1], progress), mixChannel(from[2], to[2], progress)];
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

function buildAnatomy(parent: HTMLElement, anatomy: ThemeAuditAnatomy, tag: string): HTMLElement {
  let current = parent;
  for (const node of anatomy) {
    const element = document.createElement(node === anatomy.at(-1) ? tag : "div");
    for (const [name, value] of Object.entries(node.attributes)) element.setAttribute(name, value);
    if (node.style) element.style.cssText = node.style;
    current.append(element);
    current = element;
  }
  return current;
}

function buildPaintLayer(parent: HTMLElement, paint: string): HTMLElement {
  const element = document.createElement("div");
  element.style.cssText = `width:100%;height:100%;background:${paint}`;
  parent.append(element);
  return element;
}

type PaintElement = { element: HTMLElement; token: string };

function buildPaintElements(container: HTMLElement, pair: ThemeAuditPair): { parent: HTMLElement; elements: PaintElement[] } {
  const definitions = [
    ...(pair.underlays ?? []).map((token) => ({ token, paint: undefined, anatomy: undefined })),
    { token: pair.surface, paint: pair.surfacePaint, anatomy: pair.surfaceAnatomy },
    { token: pair.background, paint: pair.backgroundPaint, anatomy: pair.backgroundAnatomy },
  ];
  const elements: PaintElement[] = [];
  let parent = container;
  for (const { token, paint, anatomy } of definitions) {
    parent = anatomy ? buildAnatomy(parent, anatomy, "div") : buildPaintLayer(parent, paint ?? `var(${token})`);
    elements.push({ element: parent, token });
  }
  return { parent, elements };
}

function buildForeground(parent: HTMLElement, pair: ThemeAuditPair, measuresOutline: boolean): HTMLElement {
  const foreground = pair.foregroundAnatomy
    ? buildAnatomy(parent, pair.foregroundAnatomy, measuresOutline ? "button" : "span")
    : parent.appendChild(document.createElement("span"));
  if (!(pair.foregroundAnatomy ?? pair.backgroundAnatomy ?? pair.surfaceAnatomy)) {
    foreground.style.color = `var(${pair.foreground})`;
  }
  foreground.textContent = "Ag";
  return foreground;
}

function resolveForeground(
  pair: ThemeAuditPair,
  foreground: HTMLElement,
  measuresOutline: boolean,
): { paint: string | null; dependenciesResolve: boolean; insideOutline: boolean } {
  const styles = getComputedStyle(foreground);
  const dependenciesResolve = (pair.dependencies ?? []).every((token) => styles.getPropertyValue(token).trim().length > 0);
  const paintedByRecipe = Boolean(pair.foregroundAnatomy ?? pair.backgroundAnatomy ?? pair.surfaceAnatomy);
  const tokenDeclared = paintedByRecipe || styles.getPropertyValue(pair.foreground).trim().length > 0;
  const measured = measuresOutline ? outlineIndicator(foreground, styles) : styles.color;
  return {
    paint: tokenDeclared ? measured : null,
    dependenciesResolve,
    insideOutline: measuresOutline && Number.parseFloat(styles.outlineOffset) < 0,
  };
}

function resolveBackground(elements: readonly PaintElement[], context: CanvasRenderingContext2D): ResolvedPaint | null {
  let pixels = [WHITE];
  let css: string | null = null;
  for (const { element, token } of elements) {
    if (getComputedStyle(element).getPropertyValue(token).trim().length === 0) return null;
    const paint = sampleBackground(element, pixels, context);
    if (!paint) return null;
    pixels = paint.pixels;
    css = paint.css;
  }
  return css ? { css, pixels } : null;
}

function auditTokenPair(root: HTMLElement, pair: ThemeAuditPair, context: CanvasRenderingContext2D): ThemeAuditResult {
  const mount = root === document.documentElement ? document.body : root;
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;left:-10000px;top:0;width:64px;height:64px;overflow:hidden;pointer-events:none";
  const { parent, elements } = buildPaintElements(container, pair);
  const measuresOutline = pair.measure === "outline";
  const foreground = buildForeground(parent, pair, measuresOutline);
  mount.append(container);
  if (measuresOutline) foreground.focus();

  const resolvedForeground = resolveForeground(pair, foreground, measuresOutline);
  const resolvedBackground = resolveBackground(elements, context);
  const comparisonBackground =
    resolvedBackground && resolvedForeground.insideOutline
      ? sampleBackground(foreground, resolvedBackground.pixels, context)
      : resolvedBackground;
  container.remove();
  if (!resolvedForeground.paint || !resolvedForeground.dependenciesResolve || !comparisonBackground) {
    return unresolvedResult(pair, resolvedForeground.paint, comparisonBackground?.css ?? null);
  }
  const ratio = minimumContrast(resolvedForeground.paint, comparisonBackground.pixels, context);
  return {
    ...pair,
    ratio,
    status: ratio >= pair.threshold ? "pass" : "fail",
    resolvedForeground: resolvedForeground.paint,
    resolvedBackground: comparisonBackground.css,
  };
}

/**
 * An indicator paints no pixel when a skin zeroes it to `none`/`0px`, and none the user can see when
 * the skin clips the control's own box — a clip-path or hidden overflow eats an outward outline the
 * same way it ate the box-shadow ring it replaced. Either way there is no color to measure.
 */
function outlineIndicator(element: HTMLElement, styles: CSSStyleDeclaration): string | null {
  if (!element.matches(":focus-visible")) return null;
  if (styles.outlineStyle === "none" || Number.parseFloat(styles.outlineWidth) === 0) return null;
  const clipped = styles.clipPath !== "none" || styles.overflow !== "visible";
  if (clipped && Number.parseFloat(styles.outlineOffset) >= 0) return null;
  return styles.outlineColor;
}

export function auditTheme(root: HTMLElement, pairs: readonly ThemeAuditPair[] = THEME_AUDIT_PAIRS): ThemeAuditResult[] {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas 2D context unavailable");
  return pairs.map((pair) => auditTokenPair(root, pair, context));
}
