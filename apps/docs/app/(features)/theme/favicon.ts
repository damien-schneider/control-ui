export const themeFaviconColors = {
  light: {
    background: "oklch(0.9425 0.0108 80)",
    brand: "oklch(0.3184 0.0327 61)",
  },
  dark: {
    background: "oklch(0.1618 0.0096 61)",
    brand: "oklch(0.9645 0.008 84)",
  },
} as const;

export function createThemeFaviconSvg(backgroundColor: string, brandColor: string, styles = ""): string {
  const styleElement = styles ? `<style>${styles}</style>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${styleElement}<rect width="512" height="512" fill="${backgroundColor}"/><rect x="66" y="85" width="381" height="150" rx="75" fill="${brandColor}"/><rect x="215" y="104" width="213" height="112" rx="56" fill="${backgroundColor}"/><rect x="66" y="278" width="381" height="150" rx="75" fill="${brandColor}"/><rect x="85" y="297" width="343" height="112" rx="56" fill="${backgroundColor}"/><rect x="133" y="312" width="20" height="84" rx="10" fill="${brandColor}"/></svg>`;
}

export function createThemeFaviconUrl(backgroundColor: string, brandColor: string): string {
  return `data:image/svg+xml,${encodeURIComponent(createThemeFaviconSvg(backgroundColor, brandColor))}`;
}
