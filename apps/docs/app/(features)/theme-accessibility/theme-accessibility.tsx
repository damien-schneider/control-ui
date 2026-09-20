"use client";

import { AlertTriangleIcon, CheckCircle2Icon, CircleHelpIcon, CopyIcon, PaintbrushIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { cn } from "@/components/control-ui/lib/cn";
import { Button, ButtonLink } from "@/components/control-ui/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/control-ui/ui/empty";
import { Skeleton } from "@/components/control-ui/ui/skeleton";
import { ThemeModeSwitch } from "@/components/theme-toggle";
import { THEME_AUDIT_CATEGORIES, type ThemeAuditCategory, type ThemeAuditResult, type ThemeAuditStatus } from "./audit-contract";
import { useThemeAudit } from "./use-theme-audit";

const CLI_COMMAND = "bun run theme:a11y path/to/theme.css";

function AuditOutcome({ result }: { result: ThemeAuditResult }) {
  const statusLabel: Record<ThemeAuditStatus, string> = {
    pass: "Pass",
    fail: result.severity === "warning" ? "Warn" : "Fail",
    unresolved: "Missing",
  };

  return (
    <span
      className={cn(
        "inline-flex min-w-14 justify-center rounded-full px-2 py-1 text-micro font-semibold tabular-nums",
        result.status === "pass" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
        result.status === "fail" && result.severity === "error" && "bg-red-500/15 text-red-700 dark:text-red-400",
        result.status === "fail" && result.severity === "warning" && "bg-amber-500/15 text-amber-800 dark:text-amber-300",
        result.status === "unresolved" && "bg-muted text-muted-foreground",
      )}
    >
      {statusLabel[result.status]}
    </span>
  );
}

function ContrastSample({ result }: { result: ThemeAuditResult }) {
  return (
    <span
      aria-hidden
      className="inline-flex size-9 items-center justify-center overflow-hidden rounded-[var(--radius-control)] border border-border"
      style={{ background: result.surfacePaint ?? `var(${result.surface})` }}
    >
      <span
        className="grid size-full place-items-center text-caption font-semibold"
        style={{
          color: result.resolvedForeground ?? `var(${result.foreground})`,
          background: result.resolvedBackground ?? result.backgroundPaint ?? `var(${result.background})`,
        }}
      >
        Aa
      </span>
    </span>
  );
}

function AuditTable({ category, results }: { category: ThemeAuditCategory; results: ThemeAuditResult[] }) {
  const issueCount = results.filter((result) => result.status !== "pass").length;

  return (
    <section className="grid gap-3" aria-labelledby={`audit-${category.replaceAll(" ", "-").toLowerCase()}`}>
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id={`audit-${category.replaceAll(" ", "-").toLowerCase()}`}
          className="text-balance text-heading-4 font-semibold text-foreground"
        >
          {category}
        </h2>
        <span className="text-caption tabular-nums text-muted-foreground">
          {issueCount === 0 ? `${results.length} passed` : `${issueCount} ${issueCount === 1 ? "issue" : "issues"}`}
        </span>
      </header>
      <div className="overflow-x-auto border-y border-border">
        <table className="w-full min-w-3xl border-collapse text-left text-caption">
          <caption className="sr-only">{category} theme contrast results</caption>
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th scope="col" className="w-14 py-2 pr-3 font-medium">
                Sample
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Pairing
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Tokens
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">
                Ratio
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id} className="border-b border-border/60 last:border-b-0">
                <td className="py-2.5 pr-3">
                  <ContrastSample result={result} />
                </td>
                <th scope="row" className="py-2.5 pr-4 font-medium text-foreground">
                  {result.label}
                  <span className="mt-0.5 block font-normal text-muted-foreground">
                    {result.severity === "warning" ? "Advisory" : "Required"} {result.threshold >= 4.5 ? "text" : "non-text"} contrast
                  </span>
                </th>
                <td className="py-2.5 pr-4 font-mono text-micro leading-5 text-muted-foreground">
                  <code>{result.foreground}</code>
                  <span aria-hidden> / </span>
                  <code>{result.background}</code>
                </td>
                <td className="py-2.5 pr-4 text-right font-mono tabular-nums text-foreground">
                  {result.ratio === null ? "—" : `${result.ratio.toFixed(2)}:1`}
                  <span className="mt-0.5 block text-micro text-muted-foreground">min {result.threshold}:1</span>
                </td>
                <td className="py-2.5 text-right">
                  <AuditOutcome result={result} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AuditResultsSkeleton() {
  return (
    <div className="grid gap-9">
      <p role="status" className="sr-only">
        Resolving theme tokens…
      </p>
      {[0, 1].map((group) => (
        <div key={group} className="grid gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-16" />
          </div>
          <div className="grid gap-2 border-y border-border py-2.5">
            <Skeleton className="h-4 w-full" />
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} className="h-10 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditResults({ loading, results }: { loading: boolean; results: ThemeAuditResult[] }) {
  if (loading) return <AuditResultsSkeleton />;
  if (results.length === 0) {
    return (
      <Empty className="py-10" style={{ "--cui-empty-border-color": "var(--border)" }}>
        <EmptyHeader>
          <EmptyMedia>
            <CheckCircle2Icon aria-hidden className="text-emerald-600 dark:text-emerald-400" />
          </EmptyMedia>
          <EmptyTitle>No contrast issues in this mode</EmptyTitle>
          <EmptyDescription>
            Every required and advisory pairing clears its ratio here. Change a token and the audit re-runs against the live theme.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <ButtonLink variant="surface" size="sm" render={<Link href="/theme-editor" />}>
            <PaintbrushIcon aria-hidden className="size-3.5" /> Open the token editor
          </ButtonLink>
        </EmptyContent>
      </Empty>
    );
  }
  return (
    <div className="grid gap-9">
      {THEME_AUDIT_CATEGORIES.map((category) => {
        const categoryResults = results.filter((result) => result.category === category);
        return categoryResults.length > 0 ? <AuditTable key={category} category={category} results={categoryResults} /> : null;
      })}
    </div>
  );
}

export function ThemeAccessibility() {
  const results = useThemeAudit();
  const [issuesOnly, setIssuesOnly] = useState(false);
  const commandCopy = useCopyToClipboard({ text: CLI_COMMAND });
  const requiredResults = results.filter((result) => result.severity === "error");
  const requiredFailures = requiredResults.filter((result) => result.status !== "pass");
  const advisoryWarnings = results.filter((result) => result.severity === "warning" && result.status !== "pass");
  const displayedResults = issuesOnly ? results.filter((result) => result.status !== "pass") : results;
  const failureNoun = requiredFailures.length === 1 ? "failure" : "failures";
  let auditSummary = `${requiredResults.length} required checks pass`;
  if (results.length === 0) auditSummary = "Checking the active theme…";
  else if (requiredFailures.length > 0) auditSummary = `${requiredFailures.length} required ${failureNoun}`;
  const warningNoun = advisoryWarnings.length === 1 ? "warning" : "warnings";
  const advisorySummary =
    advisoryWarnings.length > 0
      ? `${advisoryWarnings.length} advisory ${warningNoun} on boundaries, indicators and parts harvested from these pages. Each depends on context WCAG leaves to the design.`
      : "Boundaries, indicators and every harvested part clear their ratio too.";

  return (
    <div className="grid gap-10" data-testid="theme-accessibility-audit">
      <section className="grid gap-5" aria-labelledby="active-theme-audit">
        <div className="flex flex-wrap items-start justify-between gap-4 border-y border-border py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full",
                requiredFailures.length > 0
                  ? "bg-red-500/15 text-red-700 dark:text-red-400"
                  : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
              )}
            >
              {requiredFailures.length > 0 ? (
                <AlertTriangleIcon aria-hidden className="size-4" />
              ) : (
                <ShieldCheckIcon aria-hidden className="size-4" />
              )}
            </span>
            <div>
              <h2 id="active-theme-audit" className="text-balance text-heading-4 font-semibold tabular-nums text-foreground">
                {auditSummary}
              </h2>
              <p className="mt-1 max-w-2xl text-caption leading-5 text-pretty text-muted-foreground">
                Resolves contract colors and rendered active-tab paint, including alpha layers and sampled gradient stops. Switch modes to
                inspect light and dark independently.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeModeSwitch />
            <ButtonLink variant="surface" size="sm" render={<Link href="/theme-editor" />}>
              <PaintbrushIcon aria-hidden className="size-3.5" /> Edit theme
            </ButtonLink>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-caption tabular-nums text-muted-foreground">{advisorySummary}</p>
          <Button variant="quiet" size="sm" active={issuesOnly} onClick={() => setIssuesOnly((current) => !current)}>
            {issuesOnly ? "Show all pairs" : "Show issues only"}
          </Button>
        </div>
      </section>

      <AuditResults loading={results.length === 0} results={displayedResults} />

      <section className="grid gap-4 border-t border-border pt-8" aria-labelledby="optional-cli-check">
        <div className="max-w-2xl">
          <h2 id="optional-cli-check" className="text-balance text-heading-4 font-semibold text-foreground">
            Optional CLI check
          </h2>
          <p className="mt-1.5 text-body leading-6 text-pretty text-muted-foreground">
            Audit any skin <code>theme.css</code> in light and dark. A sibling <code>skin.css</code> is loaded when present; slot classes
            from <code>skin.config</code> remain a live-preview check. Required failures or unresolved paints exit non-zero.
          </p>
        </div>
        <div className="flex max-w-2xl flex-wrap items-center gap-2 border-y border-border py-3">
          <code className="min-w-0 flex-1 overflow-x-auto font-mono text-caption text-foreground">{CLI_COMMAND}</code>
          <Button variant="surface" size="sm" onClick={commandCopy.handleCopy}>
            {commandCopy.isCopied ? <CheckCircle2Icon aria-hidden className="size-3.5" /> : <CopyIcon aria-hidden className="size-3.5" />}
            {commandCopy.isCopied ? "Copied" : "Copy command"}
          </Button>
        </div>
        <p className="flex max-w-2xl items-start gap-2 text-caption leading-5 text-muted-foreground">
          <CircleHelpIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" /> Run without a path to audit every built-in skin pack. Add
          <code className="font-mono"> --json</code> for machine-readable output in an agent or CI workflow.
        </p>
      </section>
    </div>
  );
}
