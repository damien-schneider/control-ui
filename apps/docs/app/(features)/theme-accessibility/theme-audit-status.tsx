"use client";

import { AlertTriangleIcon, CheckCircle2Icon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/control-ui/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
import { Text, TextLink } from "@/components/control-ui/ui/typography";
import { useThemeAudit } from "./use-theme-audit";

export function ThemeAuditStatus({ root, className }: { root: HTMLElement | null; className?: string }) {
  const results = useThemeAudit(root);
  const errors = results.filter((result) => result.severity === "error" && result.status !== "pass");
  const warnings = results.filter((result) => result.severity === "warning" && result.status !== "pass");
  const requiredCount = results.filter((result) => result.severity === "error").length;

  if (results.length === 0)
    return (
      <Text as="p" size="caption" tone="muted" className={className}>
        Checking theme contrast…
      </Text>
    );

  const failing = errors.length > 0;
  return (
    <Alert tone={failing ? "danger" : "success"} className={className}>
      {failing ? <AlertTriangleIcon aria-hidden /> : <CheckCircle2Icon aria-hidden />}
      <AlertTitle>
        {failing
          ? `${errors.length} required contrast ${errors.length === 1 ? "check fails" : "checks fail"} WCAG AA in this preview.`
          : `${requiredCount} required contrast checks clear WCAG AA in this preview.`}
        {warnings.length > 0
          ? ` ${warnings.length} focus or boundary ${warnings.length === 1 ? "warning remains" : "warnings remain"}.`
          : ""}
      </AlertTitle>
      <AlertDescription>
        {failing ? (
          <Collapsible>
            <CollapsibleTrigger>
              <ChevronRightIcon aria-hidden />
              <Text size="caption" weight="medium" tone="foreground">
                Show failing checks
              </Text>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-1.5 grid list-disc gap-1 pl-5">
                {errors.map((result) => (
                  <Text as="li" size="caption" tone="muted" key={result.id}>
                    {result.label}: {result.ratio === null ? "unresolved" : `${result.ratio.toFixed(2)}:1`}
                  </Text>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        ) : null}
        <Text as="p" size="caption">
          <TextLink render={<Link href="/theme-accessibility" />}>Open the active theme audit</TextLink>
        </Text>
      </AlertDescription>
    </Alert>
  );
}
