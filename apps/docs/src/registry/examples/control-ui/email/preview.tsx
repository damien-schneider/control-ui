"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/control-ui/ui/button";
import { Skeleton } from "@/components/control-ui/ui/skeleton";
import { downloadFile } from "@/components/theme-drawer/download";
import { useThemeRuntime } from "@/components/theme-drawer/theme-runtime-context";
import { type EmailLayoutId, type EmailPreviewResult, emailPreviewResult } from "./options";

type PreviewState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; result: EmailPreviewResult };
const errorResponse = z.object({ error: z.string() });

async function requestPreview(body: string, signal: AbortSignal) {
  const response = await fetch("/api/email-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal,
  });
  const payload: unknown = await response.json();
  if (!response.ok) {
    const error = errorResponse.safeParse(payload);
    throw new Error(error.success ? error.data.error : `Email rendering failed (${response.status}).`);
  }
  return emailPreviewResult.parse(payload);
}

function RenderedEmail({
  layout,
  mobile,
  requestBody,
  onRetry,
}: {
  layout: EmailLayoutId;
  mobile: boolean;
  requestBody: string;
  onRetry: () => void;
}) {
  const [state, setState] = useState<PreviewState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadPreview() {
      try {
        const result = await requestPreview(requestBody, AbortSignal.any([controller.signal, AbortSignal.timeout(30_000)]));
        if (!controller.signal.aborted) setState({ status: "ready", result });
      } catch (error) {
        if (!controller.signal.aborted)
          setState({ status: "error", message: error instanceof Error ? error.message : "Email rendering failed." });
      }
    }

    void loadPreview();
    return () => controller.abort();
  }, [requestBody]);

  return (
    <div className="min-w-0 w-full" aria-busy={state.status === "loading"}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="surface"
          disabled={state.status !== "ready"}
          onClick={() => {
            if (state.status === "ready") downloadFile(`${layout}.html`, state.result.html, "text/html");
          }}
        >
          Download HTML
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={state.status !== "ready"}
          onClick={() => {
            if (state.status === "ready") downloadFile(`${layout}.txt`, state.result.text, "text/plain");
          }}
        >
          Plain text
        </Button>
      </div>
      {state.status === "loading" && (
        <div role="status" className="min-h-[580px] space-y-5 rounded-lg border border-border p-8">
          <span className="sr-only">Rendering email</span>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}
      {state.status === "error" && (
        <div role="alert" className="min-h-40 space-y-3 rounded-lg border border-border p-6">
          <p className="text-body">{state.message}</p>
          <Button size="sm" onClick={onRetry}>
            Retry preview
          </Button>
        </div>
      )}
      {state.status === "ready" && (
        <iframe
          title={`${layout} email preview`}
          sandbox="allow-same-origin"
          srcDoc={state.result.html}
          className="mx-auto block h-[640px] max-w-full rounded-lg border border-border bg-background transition-[width] duration-[var(--duration-base)]"
          style={{ width: mobile ? 375 : "100%" }}
        />
      )}
    </div>
  );
}

export function EmailPreview({ layout }: { layout: EmailLayoutId }) {
  const [mobile, setMobile] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { t, isDark } = useThemeRuntime();
  const requestBody = JSON.stringify({
    layout,
    skin: t.skin,
    mode: isDark ? "dark" : "light",
    tokens: { ...t.overrides, ...(isDark ? t.dark : t.light), ...t.textFixes },
  });

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-caption text-muted-foreground">React Email · current Control UI theme</p>
        <fieldset className="flex gap-1" aria-label={`${layout} preview width`}>
          <Button size="sm" variant={!mobile ? "surface" : "ghost"} aria-pressed={!mobile} onClick={() => setMobile(false)}>
            Desktop
          </Button>
          <Button size="sm" variant={mobile ? "surface" : "ghost"} aria-pressed={mobile} onClick={() => setMobile(true)}>
            Mobile
          </Button>
        </fieldset>
      </div>
      <RenderedEmail
        key={`${requestBody}:${attempt}`}
        layout={layout}
        mobile={mobile}
        requestBody={requestBody}
        onRetry={() => setAttempt((value) => value + 1)}
      />
    </div>
  );
}

export function EmailInvitationPreview() {
  return <EmailPreview layout="invitation" />;
}

export function EmailAnnouncementPreview() {
  return <EmailPreview layout="product" />;
}

export function EmailReleaseNotesPreview() {
  return <EmailPreview layout="release" />;
}

export function EmailEditorialPreview() {
  return <EmailPreview layout="editorial" />;
}

export function EmailNewsletterPreview() {
  return <EmailPreview layout="newsletter" />;
}

export function EmailSummaryPreview() {
  return <EmailPreview layout="summary" />;
}

export function EmailVerificationPreview() {
  return <EmailPreview layout="verification" />;
}

export function EmailReceiptPreview() {
  return <EmailPreview layout="receipt" />;
}
