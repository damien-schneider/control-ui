function roundedOutline(width: number, height: number, radius: number, offset: number) {
  const left = 1.8 + offset;
  const top = 1.8 - offset;
  const right = width - 1.8 + offset * 0.3;
  const bottom = height - 1.8 - offset * 0.3;
  const curve = Math.min(radius, (right - left) / 2, (bottom - top) / 2);
  const drift = Math.min(1.1, height / 28);
  return [
    `M ${left + curve} ${top}`,
    `C ${width * 0.35} ${top - drift} ${width * 0.7} ${top + drift} ${right - curve} ${top + drift * 0.3}`,
    `Q ${right} ${top} ${right} ${top + curve}`,
    `C ${right - drift * 0.6} ${height * 0.4} ${right + drift * 0.5} ${height * 0.7} ${right - drift * 0.3} ${bottom - curve}`,
    `Q ${right} ${bottom} ${right - curve} ${bottom}`,
    `C ${width * 0.65} ${bottom + drift} ${width * 0.3} ${bottom - drift * 0.7} ${left + curve} ${bottom}`,
    `Q ${left} ${bottom} ${left} ${bottom - curve}`,
    `C ${left + drift * 0.5} ${height * 0.6} ${left - drift * 0.4} ${height * 0.3} ${left} ${top + curve}`,
    `Q ${left} ${top} ${left + curve} ${top} Z`,
  ].join(" ");
}

function ovalOutline(width: number, height: number, offset: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = centerX - 1.8;
  const radiusY = centerY - 1.8;
  return [
    `M ${centerX} ${centerY - radiusY + offset}`,
    `C ${centerX + radiusX * 1.32} ${centerY - radiusY} ${centerX + radiusX * 1.35} ${centerY + radiusY} ${centerX + offset} ${centerY + radiusY}`,
    `C ${centerX - radiusX * 1.35} ${centerY + radiusY} ${centerX - radiusX * 1.31} ${centerY - radiusY} ${centerX} ${centerY - radiusY + offset} Z`,
  ].join(" ");
}

export function sketchStrokeImage(width: number, height: number, radius: number, color: string, oval: boolean) {
  const outline = (offset: number) => {
    if (oval) return ovalOutline(width, height, offset);
    return roundedOutline(width, height, radius, offset);
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round"><path d="${outline(0)}" stroke-width="1.35"/><path d="${outline(0.65)}" stroke-width="0.75" opacity="0.38"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
