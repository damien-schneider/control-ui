"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type RevealState = "armed" | "done";

const revealThreshold = 0.2;

export function RevealOnView({ className, children }: { className?: string; children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [reveal, setReveal] = useState<RevealState>();

  useEffect(() => {
    const host = hostRef.current;
    if (!host || host.getBoundingClientRect().top < window.innerHeight) return;

    setReveal("armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setReveal("done");
        observer.disconnect();
      },
      { threshold: revealThreshold },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} data-reveal={reveal} className={className}>
      {children}
    </div>
  );
}
