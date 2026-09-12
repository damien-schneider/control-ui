import { formatColor, oklchaToHsva } from "@/components/control-ui/lib/color";

// Satori requires RGB colors.
export const controlUiLogoColor = formatColor(oklchaToHsva({ L: 0.631, C: 0.211, H: 31, a: 1 }), "rgb");
export const controlUiLogoSize = 80;
export const controlUiLogoReferenceRadiusPx = 8;
export const controlUiLogoStrands = [
  { x: 17, y: 0, width: 17, height: 80, radius: 5 },
  { x: 46, y: 0, width: 17, height: 80, radius: 5 },
  { x: 0, y: 15, width: 80, height: 15, radius: 5 },
  { x: 0, y: 50, width: 80, height: 15, radius: 5 },
];
export const controlUiLogoCutouts = [
  { x: 20, y: 17, width: 11, height: 11, radius: 2 },
  { x: 49, y: 17, width: 11, height: 11, radius: 2 },
  { x: 20, y: 52, width: 11, height: 11, radius: 2 },
  { x: 49, y: 52, width: 11, height: 11, radius: 2 },
];

export function createControlUiLogoSvg(color = controlUiLogoColor, radiusPx = controlUiLogoReferenceRadiusPx) {
  const radiusScale = radiusPx / controlUiLogoReferenceRadiusPx;
  function renderRectangles(parts: typeof controlUiLogoStrands) {
    return parts
      .map((part) => `<rect x="${part.x}" y="${part.y}" width="${part.width}" height="${part.height}" rx="${part.radius * radiusScale}"/>`)
      .join("");
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${controlUiLogoSize} ${controlUiLogoSize}"><defs><mask id="weave"><rect width="100%" height="100%" fill="white"/><g fill="black">${renderRectangles(controlUiLogoCutouts)}</g></mask></defs><g fill="${color}" mask="url(#weave)">${renderRectangles(controlUiLogoStrands)}</g></svg>`;
}

export const controlUiLogoSvg = createControlUiLogoSvg();
