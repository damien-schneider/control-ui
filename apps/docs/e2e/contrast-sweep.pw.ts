import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { skinMetas } from "../app/(features)/catalog/skins";

const SKINS = skinMetas.map((skin) => skin.id);
const MODES = ["light", "dark"] as const;

const galleries = ["/primitives", "/ai"];

const contentPages = ["/overview", "/get-started", "/create-a-skin", "/architecture", "/lock-in"];

/** Portalled surfaces render outside their trigger's tree, so a gallery card never mounts them. */
const portalPages = [
  "/ai/context",
  "/ai/inline-citation",
  "/primitives/popover",
  "/primitives/dropdown-menu",
  "/primitives/dialog",
  "/primitives/tooltip",
  "/primitives/drawer",
  "/primitives/toast",
];

/** axe reports these instead of a ratio; only glyphless text is safe to skip, the rest is unmeasured paint. */
const MEASURABLE_TEXT_EXEMPTIONS = ["Element content contains only non-text characters"];

/** Recipes key the highlight state on a presence attribute, so stamping it shows the hover paint axe cannot hover into. */
async function highlightFirstItemPerList(page: Page) {
  await page.evaluate(() => {
    const lists = new Set<Element>();
    for (const item of document.querySelectorAll('[data-popup-part="item"]')) {
      const list = item.parentElement;
      if (!list || lists.has(list)) continue;
      lists.add(list);
      item.setAttribute("data-highlighted", "");
    }
  });
}

/** The docs re-apply their own skin whenever the mode class changes, so the mode moves first and the skin is asserted after. */
async function applyTheme(page: Page, skin: string, mode: (typeof MODES)[number]) {
  await page.evaluate((dark) => document.documentElement.classList.toggle("dark", dark), mode === "dark");
  await page.evaluate((activeSkin) => {
    for (const scope of document.querySelectorAll("[data-skin]")) scope.setAttribute("data-skin", activeSkin);
  }, skin);
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute("data-skin")), { timeout: 2_000 }).toBe(skin);
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
 * lifted. Letting one window out grows it past the next one, so the pass repeats until nothing overflows.
 */
async function unclipCroppedContent(page: Page) {
  await page.evaluate(() => {
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
        element.style.overflow = "visible";
        element.style.height = "auto";
        element.style.maxHeight = "none";
        cropped = true;
      }
    }
  });
}

/**
 * axe rates only text whose background it can resolve, so three shapes are neutralised first: a gradient,
 * which it refuses outright, is replaced by the opaque composite of its worst-reading position; a stretched
 * link, which paints nothing yet hides everything under it, steps out of the way; and a cropped preview,
 * whose off-window rect still counts as an overlap, is let out of its window.
 */
async function makePaintMeasurable(page: Page) {
  await hideEmptyOverlays(page);
  await unclipCroppedContent(page);
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

    type Layer = { color: string; stops: Pixel[] };

    /** Every paint under the glyph, glyph-side first, down to the opaque one that ends the stack. */
    const paintStack = (element: HTMLElement) => {
      const layers: Layer[] = [];
      for (let node: HTMLElement | null = element; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        layers.push({ color: style.backgroundColor, stops: gradientStops(style.backgroundImage) });
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

    for (const element of document.querySelectorAll<HTMLElement>("*")) {
      const writesText = [...element.childNodes].some((child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim());
      if (!writesText) continue;
      const layers = paintStack(element);
      if (!layers?.some((layer) => layer.stops.length > 1)) continue;

      const glyph = getComputedStyle(element).color;
      const readability = (position: number) => {
        const backdrop = backdropAt(layers, position);
        return contrast(luminance(pixel(opaque(backdrop), glyph)), luminance(backdrop));
      };
      const worst = SAMPLE_POSITIONS.reduce((lowest, position) => (readability(position) < readability(lowest) ? position : lowest));

      element.setAttribute("data-flattened-gradient", "");
      element.style.backgroundColor = opaque(backdropAt(layers, worst));
      element.style.backgroundImage = "none";
    }
  });
}

async function restorePaint(page: Page) {
  await page.evaluate(() => {
    for (const element of document.querySelectorAll<HTMLElement>("[data-flattened-gradient]")) {
      element.style.removeProperty("background-color");
      element.style.removeProperty("background-image");
      element.removeAttribute("data-flattened-gradient");
    }
    for (const element of document.querySelectorAll<HTMLElement>("[data-hidden-overlay]")) {
      element.style.removeProperty("display");
      element.removeAttribute("data-hidden-overlay");
    }
    for (const element of document.querySelectorAll<HTMLElement>("[data-unclipped]")) {
      element.style.removeProperty("overflow");
      element.style.removeProperty("height");
      element.style.removeProperty("max-height");
      element.removeAttribute("data-unclipped");
    }
  });
}

async function contrastOffenders(page: Page, label: string): Promise<string[]> {
  const { violations, incomplete } = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
  const offenders = violations.flatMap((violation) =>
    violation.nodes.map((node) => `${label} ${node.target.join(" ")} — ${node.any[0]?.message ?? violation.help}`),
  );
  const unmeasured = incomplete.flatMap((entry) =>
    entry.nodes.flatMap((node) => {
      const reason = node.any[0]?.message ?? node.none[0]?.message ?? "axe returned no reason";
      if (MEASURABLE_TEXT_EXEMPTIONS.some((exemption) => reason.startsWith(exemption))) return [];
      return [`${label} ${node.target.join(" ")} — unrated: ${reason}`];
    }),
  );
  return [...offenders, ...unmeasured];
}

async function sweep(page: Page, route: string): Promise<string[]> {
  const offenders: string[] = [];
  for (const skin of SKINS) {
    for (const mode of MODES) {
      await applyTheme(page, skin, mode);
      await makePaintMeasurable(page);
      offenders.push(...(await contrastOffenders(page, `${route} ${skin}/${mode}`)));
      await restorePaint(page);
    }
  }
  return offenders;
}

async function openFirstSurface(page: Page): Promise<boolean> {
  // Portalled surfaces mount outside the page flow, so only a new one there proves a trigger opened a surface.
  const openSurfaces = () =>
    page.evaluate(
      () => [...document.querySelectorAll("[data-surface]")].filter((node) => !node.closest("main") && node.checkVisibility()).length,
    );
  const open = async (trigger: Locator) => {
    const before = await openSurfaces();
    const surfaced = () => expect.poll(openSurfaces, { timeout: 2_000 }).toBeGreaterThan(before);
    const succeeded = () => true;
    const failed = () => false;
    if (await trigger.hover({ timeout: 2_000 }).then(surfaced).then(succeeded, failed)) return true;
    return trigger.click({ timeout: 2_000 }).then(surfaced).then(succeeded, failed);
  };
  // A tooltip's or a toast's trigger is whatever the consumer wrapped, so the trigger slot alone misses it.
  for (const selector of ['main [data-slot="trigger"]', "main button"]) {
    const triggers = page.locator(selector);
    const total = Math.min(await triggers.count(), 6);
    for (let index = 0; index < total; index += 1) {
      if (await open(triggers.nth(index))) return true;
    }
  }
  return false;
}

/** Cards mount only while near the viewport, so each scroll window is swept before moving on. */
async function sweepGallery(page: Page, route: string): Promise<string[]> {
  const cards = page.locator("[data-gallery-preview]");
  const total = await cards.count();
  expect(total).toBeGreaterThan(0);
  const offenders = new Set<string>();
  const swept = new Set<number>();
  for (let index = 0; index < total; index += 1) {
    if (swept.has(index)) continue;
    await cards.nth(index).scrollIntoViewIfNeeded();
    await expect(cards.nth(index)).toHaveAttribute("data-gallery-preview-state", "mounted");
    await highlightFirstItemPerList(page);
    const mounted = await cards.evaluateAll((nodes) =>
      nodes.flatMap((node, position) => (node.getAttribute("data-gallery-preview-state") === "mounted" ? [position] : [])),
    );
    for (const position of mounted) swept.add(position);
    for (const offender of await sweep(page, route)) offenders.add(offender);
  }
  return [...offenders].sort();
}

for (const route of galleries) {
  test(`text clears WCAG AA on ${route} across skins and modes`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(await sweepGallery(page, route)).toEqual([]);
  });
}

test("text clears WCAG AA on guide pages across skins and modes", async ({ page }) => {
  const offenders: string[] = [];
  for (const route of contentPages) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    offenders.push(...(await sweep(page, route)));
  }
  expect(offenders).toEqual([]);
});

test("text on portalled surfaces clears WCAG AA across skins and modes", async ({ page }) => {
  const offenders: string[] = [];
  for (const route of portalPages) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(await openFirstSurface(page), `${route} opened no portalled surface`).toBe(true);
    await highlightFirstItemPerList(page);
    offenders.push(...(await sweep(page, route)));
    await page.keyboard.press("Escape");
    await page.mouse.move(0, 0);
  }
  expect(offenders).toEqual([]);
});
