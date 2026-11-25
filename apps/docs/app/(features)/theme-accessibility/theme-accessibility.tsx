"use client";

import { AlertTriangleIcon, CheckCircle2Icon, CircleHelpIcon, PaintbrushIcon, ShieldCheckIcon } from "lucide-react";
import { useState } from "react";
import { IntentLink } from "@/app/(features)/client/intent-link";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/control-ui/ui/alert";
import { Badge } from "@/components/control-ui/ui/badge";
import { Button, ButtonLink } from "@/components/control-ui/ui/button";
import { Code, CodeContent } from "@/components/control-ui/ui/code";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/control-ui/ui/empty";
import { Separator } from "@/components/control-ui/ui/separator";
import { Skeleton } from "@/components/control-ui/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/control-ui/ui/table";
import { Heading, Text } from "@/components/control-ui/ui/typography";
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
  let color: "green" | "red" | "yellow" | "neutral" = "neutral";
  if (result.status === "pass") color = "green";
  else if (result.status === "fail") color = result.severity === "warning" ? "yellow" : "red";

  return (
    <Badge size="sm" color={color}>
      {statusLabel[result.status]}
    </Badge>
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
        className="grid size-full place-items-center"
        style={{
          color: result.resolvedForeground ?? `var(${result.foreground})`,
          background: result.resolvedBackground ?? result.backgroundPaint ?? `var(${result.background})`,
        }}
      >
        <Text size="caption" weight="semibold">
          Aa
        </Text>
      </span>
    </span>
  );
}

function AuditTable({ category, results }: { category: ThemeAuditCategory; results: ThemeAuditResult[] }) {
  const issueCount = results.filter((result) => result.status !== "pass").length;

  return (
    <section className="grid grid-cols-1 gap-3" aria-labelledby={`audit-${category.replaceAll(" ", "-").toLowerCase()}`}>
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <Heading level={2} size="heading-4" id={`audit-${category.replaceAll(" ", "-").toLowerCase()}`}>
          {category}
        </Heading>
        <Text size="caption" tone="muted" numeric>
          {issueCount === 0 ? `${results.length} passed` : `${issueCount} ${issueCount === 1 ? "issue" : "issues"}`}
        </Text>
      </header>
      <Table aria-label={`${category} theme contrast results`} className="min-w-3xl">
        <TableHeader>
          <TableRow>
            <TableHead scope="col" className="w-14">
              Sample
            </TableHead>
            <TableHead scope="col">Pairing</TableHead>
            <TableHead scope="col">Tokens</TableHead>
            <TableHead scope="col" className="text-right">
              Ratio
            </TableHead>
            <TableHead scope="col" className="text-right">
              Result
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.id}>
              <TableCell>
                <ContrastSample result={result} />
              </TableCell>
              <TableCell className="whitespace-normal">
                <Text as="div" size="caption" weight="medium" tone="foreground">
                  {result.label}
                </Text>
                <Text as="div" size="caption" tone="muted" className="mt-0.5">
                  {result.severity === "warning" ? "Advisory" : "Required"} {result.threshold >= 4.5 ? "text" : "non-text"} contrast
                </Text>
              </TableCell>
              <TableCell className="whitespace-normal">
                <Text size="micro" tone="muted" mono>
                  <code>{result.foreground}</code>
                  <span aria-hidden> / </span>
                  <code>{result.background}</code>
                </Text>
              </TableCell>
              <TableCell className="text-right">
                <Text as="div" size="caption" mono numeric>
                  {result.ratio === null ? "—" : `${result.ratio.toFixed(2)}:1`}
                </Text>
                <Text as="div" size="micro" tone="muted" className="mt-0.5">
                  min {result.threshold}:1
                </Text>
              </TableCell>
              <TableCell className="text-right">
                <AuditOutcome result={result} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

function AuditResultsSkeleton() {
  return (
    <div className="grid gap-9">
      <Text as="p" role="status" className="sr-only">
        Resolving theme tokens…
      </Text>
      {[0, 1].map((group) => (
        <div key={group} className="grid gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-16" />
          </div>
          <div className="grid gap-2">
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
      <Empty variant="outline">
        <EmptyHeader>
          <EmptyMedia>
            <CheckCircle2Icon aria-hidden />
          </EmptyMedia>
          <EmptyTitle>No contrast issues in this mode</EmptyTitle>
          <EmptyDescription>
            Every required and advisory pairing clears its ratio here. Change a token and the audit re-runs against the live theme.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <ButtonLink variant="surface" size="sm" render={<IntentLink href="/theme-editor" />}>
            <PaintbrushIcon aria-hidden /> Open the token editor
          </ButtonLink>
        </EmptyContent>
      </Empty>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-9">
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
  const requiredResults = results.filter((result) => result.severity === "error");
  const requiredFailures = requiredResults.filter((result) => result.status !== "pass");
  const failing = requiredFailures.length > 0;
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
    <div className="grid grid-cols-1 gap-10" data-testid="theme-accessibility-audit">
      <section className="grid grid-cols-1 gap-5" aria-labelledby="active-theme-audit">
        <Alert tone={failing ? "danger" : "success"}>
          {failing ? <AlertTriangleIcon aria-hidden /> : <ShieldCheckIcon aria-hidden />}
          <AlertTitle render={(props) => <h2 {...props} id="active-theme-audit" />}>{auditSummary}</AlertTitle>
          <AlertDescription>
            Resolves contract colors and rendered active-tab paint, including alpha layers and sampled gradient stops. Switch modes to
            inspect light and dark independently.
          </AlertDescription>
          <AlertAction className="flex-wrap gap-2">
            <ThemeModeSwitch />
            <ButtonLink variant="surface" size="sm" render={<IntentLink href="/theme-editor" />}>
              <PaintbrushIcon aria-hidden /> Edit theme
            </ButtonLink>
          </AlertAction>
        </Alert>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text as="p" size="caption" tone="muted" numeric>
            {advisorySummary}
          </Text>
          <Button variant="quiet" size="sm" active={issuesOnly} onClick={() => setIssuesOnly((current) => !current)}>
            {issuesOnly ? "Show all pairs" : "Show issues only"}
          </Button>
        </div>
      </section>

      <AuditResults loading={results.length === 0} results={displayedResults} />

      <Separator />

      <section className="grid gap-4" aria-labelledby="optional-cli-check">
        <div className="max-w-2xl">
          <Heading level={2} size="heading-4" id="optional-cli-check">
            Optional CLI check
          </Heading>
          <Text as="p" tone="muted" className="mt-1.5 text-pretty">
            Audit any skin <code>theme.css</code> in light and dark. A sibling <code>skin.css</code> is loaded when present; slot classes
            from <code>skin.config</code> remain a live-preview check. Required failures or unresolved paints exit non-zero.
          </Text>
        </div>
        <Code className="max-w-2xl">
          <CodeContent code={CLI_COMMAND} lang="bash" copyLabel="Copy command" />
        </Code>
        <Text as="p" size="caption" tone="muted" className="flex max-w-2xl items-start gap-2">
          <CircleHelpIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" /> Run without a path to audit every built-in skin pack. Add
          <code> --json</code> for machine-readable output in an agent or CI workflow.
        </Text>
      </section>
    </div>
  );
}
