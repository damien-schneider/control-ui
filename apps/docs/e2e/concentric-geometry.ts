/**
 * Runs inside the page, so it must stay self-contained. A rounded part whose corner sits inside the corner box of the
 * nearest painted rounded surface must follow that curve: per axis, its radius is the surface radius minus the inset.
 * Circles and capsules are shapes of their own: they may be rounder than the curve, never squarer.
 */
export function findConcentricOffenders(): string[] {
  const ALPHA_ZERO = /(?:,\s*0|\/\s*0)\)$/;
  const COLOR = /(?:rgba?|oklch|oklab|lab|lch|hsla?|color)\([^)]*\)|transparent/g;
  const INTERACTIVE =
    'button, a[href], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"], [role="tab"], [data-popup-part="item"]';
  const CORNERS = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"] as const;

  const transparent = (color: string) => color === "transparent" || ALPHA_ZERO.test(color);
  const paintedShadow = (shadow: string) =>
    shadow !== "none" && (shadow.match(COLOR) ?? ["opaque"]).some((color) => color !== "opaque" && !transparent(color));
  const borderPaints = (style: CSSStyleDeclaration) =>
    (["top", "right", "bottom", "left"] as const).every(
      (side) =>
        Number.parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0 &&
        style.getPropertyValue(`border-${side}-style`) !== "none" &&
        !transparent(style.getPropertyValue(`border-${side}-color`)),
    );
  const paints = (style: CSSStyleDeclaration) =>
    !transparent(style.backgroundColor) || style.backgroundImage !== "none" || paintedShadow(style.boxShadow) || borderPaints(style);

  type Box = { rect: DOMRect; radii: [number, number][]; border: number; shape: string; clips: boolean };
  const boxes = new Map<Element, Box | null>();

  const length = (value: string, basis: number) =>
    value.endsWith("%") ? (Number.parseFloat(value) / 100) * basis : Number.parseFloat(value) || 0;

  const box = (element: Element): Box | null => {
    if (boxes.has(element)) return boxes.get(element) ?? null;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const scale = element instanceof HTMLElement && element.offsetWidth > 0 ? rect.width / element.offsetWidth : 1;
    const raw = CORNERS.map((corner): [number, number] => {
      const [x = "0", y = x] = style
        .getPropertyValue(
          `border-${corner
            .replace(/([A-Z])/g, "-$1")
            .toLowerCase()
            .slice(1)}-radius`,
        )
        .split(" ");
      return [length(x, rect.width / scale) * scale, length(y, rect.height / scale) * scale];
    });
    const [tl, tr, br, bl] = raw;
    const fit = Math.min(
      1,
      rect.width / (tl[0] + tr[0] || 1),
      rect.width / (bl[0] + br[0] || 1),
      rect.height / (tl[1] + bl[1] || 1),
      rect.height / (tr[1] + br[1] || 1),
    );
    const result: Box = {
      rect,
      radii: raw.map(([x, y]): [number, number] => [x * fit, y * fit]),
      border: Number.parseFloat(style.borderTopWidth) * scale || 0,
      shape: style.getPropertyValue("corner-top-left-shape") || "round",
      clips: style.overflowX !== "visible" || style.overflowY !== "visible",
    };
    boxes.set(element, result);
    return result;
  };

  const label = (element: Element) => {
    const family = element.getAttribute("data-control-family");
    const part = element.getAttribute("data-slot") ?? element.getAttribute("data-popup-part");
    return family ? `${family}/${part ?? "?"}` : `${element.tagName.toLowerCase()}${part ? `[${part}]` : ""}`;
  };

  const surfaceOf = (element: Element) => {
    for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
      if (paints(getComputedStyle(node))) return node;
    }
    return null;
  };

  const scrolls = (node: Element) => {
    const style = getComputedStyle(node);
    const overflowing = node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1;
    return overflowing && /auto|scroll/.test(`${style.overflowX} ${style.overflowY}`);
  };
  const scrolledWithin = (element: Element, surface: Element) => {
    for (let node = element.parentElement; node && node !== surface; node = node.parentElement) {
      if (scrolls(node)) return true;
    }
    return false;
  };
  const pill = ({ rect, radii }: Box) => radii.every(([x, y]) => Math.min(x, y) >= Math.min(rect.width, rect.height) / 2 - 0.5);
  const circle = (part: Box) => pill(part) && Math.abs(part.rect.width - part.rect.height) < 1;

  const inScope = (element: Element) =>
    !element.closest("[data-reflet-widget], [data-concentric-exempt]") && (element.closest("main") || element.closest("[data-surface]"));

  type Pair = { element: Element; surface: Element; inner: Box; outer: Box };
  const pairOf = (element: Element): Pair | null => {
    if (!inScope(element) || !element.checkVisibility({ visibilityProperty: true, opacityProperty: true })) return null;
    if (!paints(getComputedStyle(element)) && !element.matches(INTERACTIVE)) return null;
    const surface = surfaceOf(element);
    if (!surface?.hasAttribute("data-control-family")) return null;
    const inner = box(element);
    const outer = box(surface);
    if (!inner || !outer || inner.rect.width === 0 || inner.rect.height === 0) return null;
    if (circle(inner) || scrolledWithin(element, surface)) return null;
    return { element, surface, inner, outer };
  };

  const insetsOf = ({ inner: { rect: e }, outer: { rect: s, border } }: Pair): [number, number][] => [
    [e.left - s.left - border, e.top - s.top - border],
    [s.right - e.right - border, e.top - s.top - border],
    [s.right - e.right - border, s.bottom - e.bottom - border],
    [e.left - s.left - border, s.bottom - e.bottom - border],
  ];

  /** Only a corner inside the surface's corner box can poke out of its curve. */
  const inCornerBox = (curve: [number, number], [dx, dy]: [number, number], clips: boolean) => {
    const [curveX, curveY] = curve;
    if (curveX <= 0.5 || curveY <= 0.5 || dx < -0.5 || dy < -0.5 || dx >= curveX || dy >= curveY) return false;
    return !(clips && (dx < 0.5 || dy < 0.5));
  };

  const range = (x: number, y: number) =>
    Math.abs(x - y) < 1 ? x.toFixed(1) : `${Math.min(x, y).toFixed(1)}–${Math.max(x, y).toFixed(1)}`;

  const cornerFinding = ({ element, surface, inner, outer }: Pair, corner: number, [dx, dy]: [number, number]): string | null => {
    const [outerX, outerY] = outer.radii[corner] ?? [0, 0];
    const curveX = outerX - outer.border;
    const curveY = outerY - outer.border;
    if (!inCornerBox([curveX, curveY], [dx, dy], outer.clips)) return null;
    const [innerX, innerY] = inner.radii[corner] ?? [0, 0];
    const wantX = Math.max(0, curveX - dx);
    const wantY = Math.max(0, curveY - dy);
    const low = Math.min(wantX, wantY) - 1;
    const high = Math.max(wantX, wantY) + 1;
    const radius = Math.min(innerX, innerY);
    const shapeMismatch = radius > 0.5 && inner.shape !== outer.shape;
    const fits = radius >= low && (Math.max(innerX, innerY) <= high || pill(inner));
    if (fits && !shapeMismatch) return null;
    const shape = shapeMismatch ? `, shape ${inner.shape}≠${outer.shape}` : "";
    return `${label(element)} in ${label(surface)}: r=${radius.toFixed(1)} want ${range(wantX, wantY)} (surface ${curveX.toFixed(1)}, inset ${dx.toFixed(1)}/${dy.toFixed(1)}${shape})`;
  };

  const offenders = new Set<string>();
  for (const element of document.querySelectorAll("body *")) {
    const pair = pairOf(element);
    if (!pair) continue;
    const finding = insetsOf(pair)
      .map((inset, corner) => cornerFinding(pair, corner, inset))
      .find((found) => found !== null);
    if (finding) offenders.add(finding);
  }
  return [...offenders].sort();
}
