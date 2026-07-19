"use client";

import { useEffect, useState } from "react";
import type { ThemeAuditResult } from "./audit-contract";
import { auditTheme } from "./audit-theme";

export function useThemeAudit(root?: HTMLElement | null): ThemeAuditResult[] {
  const [results, setResults] = useState<ThemeAuditResult[]>([]);

  useEffect(() => {
    let frame = 0;
    const scheduleAudit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setResults(auditTheme(root ?? document.documentElement)));
    };
    scheduleAudit();
    const observer = new MutationObserver(scheduleAudit);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-skin", "style"] });
    if (root && root !== document.documentElement) {
      observer.observe(root, { attributes: true, attributeFilter: ["class", "data-skin", "style"] });
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [root]);

  return results;
}
