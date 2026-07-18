"use client";

import type { ComponentProps, ReactNode } from "react";
import { CodeBlock } from "@/app/(features)/components/source";
import { guideCodeForKind } from "@/app/(features)/model/registry";
import type { GuideSection as GuideSectionData, IntegrationId } from "@/app/(features)/model/types";
import { cn } from "@/components/control-ui/lib/cn";

type GuideCodeKind = NonNullable<GuideSectionData["code"]>;
export type GuideCodeMdxProps = { kind: GuideCodeKind; lang?: string };

function languageForGuideCode(kind: GuideCodeKind) {
  if (kind === "skin-install" || kind === "component-install" || kind === "block-install" || kind.startsWith("agent-")) return "bash";
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
