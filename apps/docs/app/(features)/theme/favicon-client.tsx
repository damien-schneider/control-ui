"use client";

import { useEffect, useRef, useState } from "react";
import { createControlUiLogoSvg } from "@/app/(features)/brand/logo";
import styles from "./favicon.module.css";

export function ThemeFavicon() {
  const probeRef = useRef<HTMLSpanElement>(null);
  const [iconUrl, setIconUrl] = useState<string>();

  useEffect(() => {
    const probe = probeRef.current;
    if (!probe) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const style = getComputedStyle(probe);
      const svg = createControlUiLogoSvg(style.color, Number.parseFloat(style.borderTopLeftRadius));
      setIconUrl(`data:image/svg+xml,${encodeURIComponent(svg)}`);
    };

    function scheduleUpdate() {
      if (frame === 0) frame = requestAnimationFrame(update);
    }

    const observer = new MutationObserver(scheduleUpdate);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-skin", "style"] });
    scheduleUpdate();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <span ref={probeRef} aria-hidden="true" className={styles.probe} />
      {iconUrl && <link rel="icon" type="image/svg+xml" sizes="any" href={iconUrl} />}
    </>
  );
}
