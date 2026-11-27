"use client";

import { type RefObject, useEffect, useState } from "react";

const nearViewportMargin = "720px 0px";

export function useNearViewport(hostRef: RefObject<Element | null>) {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setNear(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: nearViewportMargin },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [hostRef]);

  return near;
}
