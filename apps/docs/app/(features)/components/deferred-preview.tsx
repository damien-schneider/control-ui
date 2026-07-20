"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";

const previewRootMargin = "720px 0px";

export function DeferredPreview({ children, className }: { children: ReactNode; className?: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(([entry]) => setMounted(Boolean(entry?.isIntersecting)), {
      rootMargin: previewRootMargin,
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      inert
      aria-hidden="true"
      data-gallery-preview=""
      data-gallery-preview-state={mounted ? "mounted" : "deferred"}
      className={cn("pointer-events-none grid h-full w-full min-w-0 select-none place-items-center overflow-hidden p-5", className)}
    >
      {mounted ? (
        <div className="starting:opacity-0 grid h-full w-full min-w-0 place-items-center opacity-100 transition-opacity duration-[var(--duration-base)] ease-[var(--ease-standard)]">
          {children}
        </div>
      ) : null}
    </div>
  );
}
