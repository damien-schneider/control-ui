"use client";

import { useEffect } from "react";
import { createThemeFaviconUrl, themeFaviconColors } from "@/app/(features)/theme/favicon";

const FALLBACK_BACKGROUND = themeFaviconColors.light.background;
const FALLBACK_BRAND = themeFaviconColors.light.brand;

function readThemeColors(): { background: string; brand: string } {
  const probe = document.createElement("span");
  probe.style.backgroundColor = `var(--sidebar, ${FALLBACK_BACKGROUND})`;
  probe.style.color = `var(--sidebar-primary, ${FALLBACK_BRAND})`;
  probe.style.position = "fixed";
  probe.style.visibility = "hidden";
  document.body.append(probe);

  const style = getComputedStyle(probe);
  const colors = {
    background: style.backgroundColor || FALLBACK_BACKGROUND,
    brand: style.color || FALLBACK_BRAND,
  };
  probe.remove();
  return colors;
}

export function ThemeFavicon() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.sizes = "any";
    document.head.append(link);

    let frame = 0;
    function update() {
      frame = 0;
      const colors = readThemeColors();
      link.href = createThemeFaviconUrl(colors.background, colors.brand);
    }
    function scheduleUpdate() {
      if (frame === 0) frame = requestAnimationFrame(update);
    }

    update();
    const observer = new MutationObserver(scheduleUpdate);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-skin", "style"],
    });

    return () => {
      observer.disconnect();
      if (frame !== 0) cancelAnimationFrame(frame);
      link.remove();
    };
  }, []);

  return null;
}
