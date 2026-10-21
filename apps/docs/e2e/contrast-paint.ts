import type { Page } from "@playwright/test";

/**
 * Page text an open portalled surface paints over is hidden from the reader, so only the surface itself is
 * rated. A translucent surface blurs what it covers into the page color, which axe cannot model, so page
 * content lying wholly under a surface leaves the stack and the surface reads against the page beneath.
 */
async function markContentUnderSurfaces(page: Page) {
  await page.evaluate(() => {
    const surfaces = [...document.querySelectorAll("[data-surface]")].filter((node) => !node.closest("main") && node.checkVisibility());
    const covers = surfaces.map((surface) => surface.getBoundingClientRect());
    const overlaps = (box: DOMRect) =>
      covers.some((cover) => box.left < cover.right && box.right > cover.left && box.top < cover.bottom && box.bottom > cover.top);
    const inside = (box: DOMRect) =>
      covers.some((cover) => box.left >= cover.left && box.right <= cover.right && box.top >= cover.top && box.bottom <= cover.bottom);
    if (covers.length === 0) return;
    for (const element of document.querySelectorAll<HTMLElement>("main *")) {
      const box = element.getBoundingClientRect();
      if (!overlaps(box)) continue;
      element.setAttribute("data-under-surface", "");
      if (inside(box)) element.style.visibility = "hidden";
    }
  });
}

async function hideEmptyOverlays(page: Page) {
  await page.evaluate(() => {
    // Chrome keeps the medium outline width on `outline: none`, so a stroke counts only when both halves are set.
    const strokes = (width: string, style: string) => width !== "0px" && style !== "none";
    const paints = (style: CSSStyleDeclaration) =>
      style.backgroundColor !== "rgba(0, 0, 0, 0)" ||
      style.backgroundImage !== "none" ||
      style.boxShadow !== "none" ||
      strokes(style.borderWidth, style.borderStyle) ||
      strokes(style.outlineWidth, style.outlineStyle);

    for (const element of document.querySelectorAll<HTMLElement>("*")) {
      if (element.textContent?.trim()) continue;
      const style = getComputedStyle(element);
      if (style.position !== "absolute" && style.position !== "fixed") continue;
      if (paints(style)) continue;
      element.setAttribute("data-hidden-overlay", "");
      element.style.display = "none";
    }
  });
}

/**
 * axe reads geometry, not paint, so a cropped preview still shadows the text beside it until the crop is
 * lifted. A lifted window keeps its full scroll height, so absolutely positioned content stays inside it.
 * Letting one window out grows it past the next one, so the pass repeats until nothing overflows.
 * An off-screen `content-visibility: auto` preview clips by paint containment axe cannot see, and its layout
 * containment hides the overflow from the window around it, so it renders in full before anything is measured.
 */
async function unclipCroppedContent(page: Page) {
  await page.evaluate(() => {
    for (const element of document.querySelectorAll<HTMLElement>("*")) {
      if (getComputedStyle(element).contentVisibility !== "auto") continue;
      element.setAttribute("data-unskipped", "");
      element.style.contentVisibility = "visible";
    }

    const overflows = (element: HTMLElement) => {
      const style = getComputedStyle(element);
      if (style.overflowY !== "hidden" && style.overflowY !== "clip") return false;
      return element.scrollHeight > element.clientHeight;
    };

    for (let cropped = true; cropped; ) {
      cropped = false;
      for (const element of document.querySelectorAll<HTMLElement>(":not([data-unclipped])")) {
        if (!overflows(element)) continue;
        element.setAttribute("data-unclipped", "");
        element.style.minHeight = `${element.scrollHeight}px`;
        element.style.overflow = "visible";
        element.style.height = "auto";
        element.style.maxHeight = "none";
        cropped = true;
      }
    }
  });
}

/**
 * axe rates only text whose background it can resolve, so four shapes are neutralised first: a gradient,
 * which it refuses outright, is replaced by the opaque composite of its worst-reading position; a stretched
 * link, which paints nothing yet hides everything under it, steps out of the way; a cropped preview, whose
 * off-window rect still counts as an overlap, is let out of its window; and a color Chrome serialises with an
 * exponent, which axe's parser rejects, is respelled in rgb. The composite lands on the text element, or on
 * the nearest ancestor that encloses its glyphs when `leading-none` lets them spill past its box, because axe
 * refuses a background that leaves part of the text uncovered.
 */
export async function makePaintMeasurable(page: Page) {
  await hideEmptyOverlays(page);
  await unclipCroppedContent(page);
  await markContentUnderSurfaces(page);
  await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("no 2d context to resolve colors with");

    type Pixel = [number, number, number, number];

    // A rejected color leaves fillStyle untouched, so each layer starts from a known one to fail loudly instead of silently.
    const pixel = (...layers: string[]): Pixel => {
      context.clearRect(0, 0, 1, 1);
      for (const layer of layers) {
        context.fillStyle = "#000000";
        context.fillStyle = layer;
        context.fillRect(0, 0, 1, 1);
      }
      const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
      return [red, green, blue, alpha];
    };

    const channel = (value: number) => {
      const ratio = value / 255;
      return ratio <= 0.04045 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
    };
    const luminance = ([red, green, blue]: Pixel) => 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
    const contrast = (one: number, other: number) => (Math.max(one, other) + 0.05) / (Math.min(one, other) + 0.05);
    const opaque = ([red, green, blue]: Pixel) => `rgb(${red} ${green} ${blue})`;
    const css = ([red, green, blue, alpha]: Pixel) => `rgb(${red} ${green} ${blue} / ${alpha / 255})`;

    const closingParenthesis = (source: string, open: number) => {
      let depth = 0;
      for (let index = open; index < source.length; index += 1) {
        if (source[index] === "(") depth += 1;
        if (source[index] !== ")") continue;
        depth -= 1;
        if (depth === 0) return index + 1;
      }
      return -1;
    };

    const COLOR_FUNCTIONS = new Set(["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch", "color", "color-mix"]);
    const functionCallAt = (source: string, cursor: number) => {
      const offset = source.slice(cursor).search(/[a-z][a-z0-9-]*\(/i);
      if (offset < 0) return null;
      const start = cursor + offset;
      const open = source.indexOf("(", start);
      const close = closingParenthesis(source, open);
      if (close < 0) return null;
      if (!COLOR_FUNCTIONS.has(source.slice(start, open).toLowerCase())) return { color: null, cursor: open + 1 };
      return { color: source.slice(start, close), cursor: close };
    };

    const gradientStops = (image: string) => {
      if (image === "none" || image.includes("url(")) return [];
      const stops: Pixel[] = [];
      for (let call = functionCallAt(image, 0); call; call = functionCallAt(image, call.cursor)) {
        if (call.color) stops.push(pixel(call.color));
      }
      return stops;
    };

    // CSS interpolates gradients with alpha premultiplied, so a fade to transparent keeps its hue instead of sliding to black.
    const premultiplied = ([red, green, blue, alpha]: Pixel): Pixel => [
      (red * alpha) / 255,
      (green * alpha) / 255,
      (blue * alpha) / 255,
      alpha,
    ];
    const straight = ([red, green, blue, alpha]: Pixel): Pixel =>
      alpha === 0
        ? [0, 0, 0, 0]
        : [Math.round((red * 255) / alpha), Math.round((green * 255) / alpha), Math.round((blue * 255) / alpha), alpha];

    const stopAt = (stops: Pixel[], position: number): Pixel => {
      const span = (stops.length - 1) * position;
      const index = Math.min(Math.floor(span), stops.length - 2);
      const progress = span - index;
      const from = premultiplied(stops[index]);
      const to = premultiplied(stops[index + 1]);
      const mix = (band: number, other: number) => band + (other - band) * progress;
      return straight([mix(from[0], to[0]), mix(from[1], to[1]), mix(from[2], to[2]), mix(from[3], to[3])]);
    };

    type Layer = { node: HTMLElement; color: string; stops: Pixel[] };

    const contains = (box: DOMRect, x: number, y: number) => x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;

    /** A positioned child painted behind the text, such as a tab's sliding indicator, without being its ancestor. */
    const paintingChild = (child: Element): { box: DOMRect; layer: Layer }[] => {
      if (!(child instanceof HTMLElement) || child.textContent?.trim()) return [];
      const style = getComputedStyle(child);
      if (style.position !== "absolute" || style.visibility === "hidden") return [];
      const stops = gradientStops(style.backgroundImage);
      if (stops.length === 0 && pixel(style.backgroundColor)[3] === 0) return [];
      return [{ box: child.getBoundingClientRect(), layer: { node: child, color: style.backgroundColor, stops } }];
    };
    const paintingChildren = new Map<HTMLElement, { box: DOMRect; layer: Layer }[]>();
    const positionedBackdrops = (node: HTMLElement, chain: Element | null, x: number, y: number) => {
      const children = paintingChildren.get(node) ?? [...node.children].flatMap(paintingChild);
      paintingChildren.set(node, children);
      return children.filter(({ box, layer }) => layer.node !== chain && contains(box, x, y)).map(({ layer }) => layer);
    };

    /** Every paint under the glyph, glyph-side first, down to the opaque one that ends the stack. */
    const paintStack = (element: HTMLElement) => {
      const layers: Layer[] = [];
      const box = element.getBoundingClientRect();
      const [x, y] = [box.left + box.width / 2, box.top + box.height / 2];
      let chain: Element | null = null;
      for (let node: HTMLElement | null = element; node; chain = node, node = node.parentElement) {
        const style = getComputedStyle(node);
        layers.push(...positionedBackdrops(node, chain, x, y));
        layers.push({ node, color: style.backgroundColor, stops: gradientStops(style.backgroundImage) });
        if (pixel(style.backgroundColor)[3] === 255) return layers;
      }
      return null;
    };

    const backdropAt = (layers: Layer[], position: number) => {
      const paints: string[] = [];
      for (const layer of [...layers].reverse()) {
        paints.push(layer.color);
        if (layer.stops.length > 1) paints.push(css(stopAt(layer.stops, position)));
        else if (layer.stops.length === 1) paints.push(css(layer.stops[0]));
      }
      return pixel(...paints);
    };

    const SAMPLE_POSITIONS = [0, 0.25, 0.5, 0.75, 1];

    const worstReading = (element: HTMLElement, layers: Layer[]) => {
      const glyph = getComputedStyle(element).color;
      const readability = (at: number) => {
        const backdrop = backdropAt(layers, at);
        return contrast(luminance(pixel(opaque(backdrop), glyph)), luminance(backdrop));
      };
      const position = SAMPLE_POSITIONS.reduce((lowest, candidate) => (readability(candidate) < readability(lowest) ? candidate : lowest));
      return { position, readability: readability(position) };
    };

    const enclosesOwnGlyphs = (node: HTMLElement, element: HTMLElement) => {
      const box = node.getBoundingClientRect();
      const range = document.createRange();
      return [...element.childNodes].every((child) => {
        if (child.nodeType !== Node.TEXT_NODE) return true;
        range.selectNodeContents(child);
        return [...range.getClientRects()].every(
          (glyphs) => glyphs.top >= box.top && glyphs.bottom <= box.bottom && glyphs.left >= box.left && glyphs.right <= box.right,
        );
      });
    };

    const paintDepth = (element: HTMLElement, layers: Layer[]) => {
      const shallowestGradient = layers.findIndex((layer) => layer.stops.length > 1);
      const enclosing = layers.slice(0, shallowestGradient).findIndex((layer) => enclosesOwnGlyphs(layer.node, element));
      return enclosing === -1 ? shallowestGradient : enclosing;
    };

    const flattenings = new Map<HTMLElement, { readability: number; color: string }>();
    const recordFlattening = (element: HTMLElement) => {
      const writesText = [...element.childNodes].some((child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim());
      if (!writesText) return;
      const layers = paintStack(element);
      if (!layers?.some((layer) => layer.stops.length > 1)) return;
      const reading = worstReading(element, layers);
      const depth = paintDepth(element, layers);
      const target = layers[depth].node;
      const current = flattenings.get(target);
      if (current && current.readability <= reading.readability) return;
      flattenings.set(target, { readability: reading.readability, color: opaque(backdropAt(layers.slice(depth), reading.position)) });
    };
    for (const element of document.querySelectorAll<HTMLElement>("*")) recordFlattening(element);

    for (const [node, { color }] of flattenings) {
      node.setAttribute("data-flattened-gradient", "");
      node.style.backgroundColor = color;
      node.style.backgroundImage = "none";
    }

    const EXPONENT_NOTATION = /\de[+-]?\d/;
    const respellExponentColors = (element: HTMLElement) => {
      const style = getComputedStyle(element);
      for (const property of ["color", "background-color"]) {
        const value = style.getPropertyValue(property);
        if (!EXPONENT_NOTATION.test(value)) continue;
        element.setAttribute("data-respelled-color", "");
        element.style.setProperty(property, css(pixel(value)));
      }
    };
    for (const element of document.querySelectorAll<HTMLElement>("*")) respellExponentColors(element);
  });
}

export async function restorePaint(page: Page) {
  await page.evaluate(() => {
    for (const element of document.querySelectorAll<HTMLElement>("[data-flattened-gradient]")) {
      element.style.removeProperty("background-color");
      element.style.removeProperty("background-image");
      element.removeAttribute("data-flattened-gradient");
    }
    for (const element of document.querySelectorAll<HTMLElement>("[data-respelled-color]")) {
      element.style.removeProperty("color");
      element.style.removeProperty("background-color");
      element.removeAttribute("data-respelled-color");
    }
    for (const element of document.querySelectorAll<HTMLElement>("[data-hidden-overlay]")) {
      element.style.removeProperty("display");
      element.removeAttribute("data-hidden-overlay");
    }
    for (const element of document.querySelectorAll<HTMLElement>("[data-under-surface]")) {
      element.style.removeProperty("visibility");
      element.removeAttribute("data-under-surface");
    }
    for (const element of document.querySelectorAll<HTMLElement>("[data-unskipped]")) {
      element.style.removeProperty("content-visibility");
      element.removeAttribute("data-unskipped");
    }
    for (const element of document.querySelectorAll<HTMLElement>("[data-unclipped]")) {
      element.style.removeProperty("overflow");
      element.style.removeProperty("height");
      element.style.removeProperty("max-height");
      element.style.removeProperty("min-height");
      element.removeAttribute("data-unclipped");
    }
  });
}
