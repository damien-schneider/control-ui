"use client";

import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/control-ui/lib/cn";
import { useThemeAudit } from "./use-theme-audit";

export function ThemeAuditStatus({ root, className }: { root: HTMLElement | null; className?: string }) {
  const results = useThemeAudit(root);
  const errors = results.filter((result) => result.severity === "error" && result.status !== "pass");
  const warnings = results.filter((result) => result.severity === "warning" && result.status !== "pass");
  const requiredCount = results.filter((result) => result.severity === "error").length;

  if (results.length === 0) return <p className={cn("text-caption text-muted-foreground", className)}>Checking theme contrast…</p>;

  return (
    <div className={cn("grid gap-2 text-caption", className)} aria-live="polite">
      <p
        className={cn(
          "flex items-start gap-2",
          errors.length > 0 ? "text-red-700 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400",
        )}
      >
        {errors.length > 0 ? (
          <AlertTriangleIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        ) : (
          <CheckCircle2Icon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        )}
        <span>
          {errors.length > 0
            ? `${errors.length} required contrast ${errors.length === 1 ? "check fails" : "checks fail"} WCAG AA in this preview.`
            : `${requiredCount} required contrast checks clear WCAG AA in this preview.`}
          {warnings.length > 0
            ? ` ${warnings.length} focus or boundary ${warnings.length === 1 ? "warning remains" : "warnings remain"}.`
            : ""}
        </span>
      </p>
      {errors.length > 0 ? (
        <details>
          <summary className="cursor-pointer font-medium text-foreground">Show failing checks</summary>
          <ul className="mt-1.5 grid list-disc gap-1 pl-5 text-muted-foreground">
            {errors.map((result) => (
              <li key={result.id}>
                {result.label}: {result.ratio === null ? "unresolved" : `${result.ratio.toFixed(2)}:1`}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <Link href="/theme-accessibility" className="w-fit font-medium text-primary-text underline underline-offset-4">
        Open the active theme audit
      </Link>
    </div>
  );
}
