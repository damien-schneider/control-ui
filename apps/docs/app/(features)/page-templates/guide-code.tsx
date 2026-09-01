"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { CodeBlock } from "@/app/(features)/components/source";
import { SetupPromptCopyButton } from "@/app/(features)/create/agent-setup";
import { guideCodeForKind } from "@/app/(features)/model/registry";
import type { GuideSection as GuideSectionData, IntegrationId } from "@/app/(features)/model/types";
import { cn } from "@/components/control-ui/lib/cn";

type GuideCodeKind = NonNullable<GuideSectionData["code"]>;
export type GuideCodeMdxProps = { kind: GuideCodeKind; lang?: string };

function languageForGuideCode(kind: GuideCodeKind) {
  if (kind === "skin-install" || kind === "component-install" || kind === "block-install" || kind === "update-install") return "bash";
  if (kind.startsWith("agent-")) return "bash";
  return "tsx";
}

export function GuideCode({ kind, lang, integration }: GuideCodeMdxProps & { integration: IntegrationId }) {
  const code = guideCodeForKind(kind, integration);
  if (!code) return null;

  return (
    <div className="mt-4 min-w-0">
      <CodeBlock code={code} lang={lang ?? languageForGuideCode(kind)} />
    </div>
  );
}

export function GuideSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="min-w-0 scroll-mt-20">
      <h2 className="max-w-2xl text-heading-2 font-display text-balance">{title}</h2>
      <div className="mt-2 min-w-0 text-body leading-6 text-muted-foreground [&>p]:max-w-2xl [&>p]:text-pretty">{children}</div>
    </section>
  );
}

export function AgentShortcut() {
  return (
    <div className="flex max-w-2xl flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-border/70 bg-card px-4 py-3">
      <p className="min-w-0 flex-1 text-body text-muted-foreground">Your agent can run all four steps from one prompt.</p>
      <div className="flex shrink-0 items-center gap-3">
        <SetupPromptCopyButton />
        <Link href="/setup-prompt" className="text-label underline decoration-border underline-offset-4 hover:text-foreground">
          What it does
        </Link>
      </div>
    </div>
  );
}

export function GuideCheck({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 grid max-w-2xl gap-1 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
      <span className="text-caption font-medium text-primary-text">What you should see now</span>
      <div className="text-body leading-6 text-foreground [&>p]:text-pretty">{children}</div>
    </div>
  );
}

export function GuidePoints({ children }: { children: ReactNode }) {
  return <div className="mt-4 grid max-w-2xl divide-y divide-border/60 border-border/70 border-y">{children}</div>;
}

export function GuidePoint({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative py-3 pr-2 pl-5 text-body leading-6 before:absolute before:top-[1.35rem] before:left-0 before:size-1.5 before:rounded-full before:bg-primary/70",
        className,
      )}
      {...props}
    />
  );
}
