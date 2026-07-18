import type { Metadata } from "next";
import Link from "next/link";
import { blockEntries } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { primitiveEntries } from "@/app/(features)/catalog/primitives";
import { CreateCommand } from "@/app/(features)/create/create-command";
import { ControlUiLogo } from "@/app/(features)/sidebar/control-ui-logo";
import { Badge } from "@/components/control-ui/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { env } from "@/env";

export const metadata: Metadata = {
  title: "Create a Control UI app",
  description: "Create a Next.js app with every Control UI component installed as editable source.",
  alternates: { canonical: "/create" },
};

const installableComponentCount = componentEntries.length + blockEntries.length + primitiveEntries.length;

export default function CreatePage() {
  return (
    <main className="min-h-svh bg-canvas text-foreground">
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/overview"
            className="flex items-center gap-2.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
          >
            <ControlUiLogo className="size-6" />
            <span className="text-body font-semibold tracking-tight">Control UI</span>
          </Link>
          <Link
            href="/overview"
            className="text-label text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
          >
            Documentation
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:items-center lg:gap-20 lg:py-28">
        <section className="space-y-8">
          <Badge variant="secondary">Next.js starter</Badge>

          <div className="space-y-5">
            <h1 className="max-w-xl text-display font-display tracking-tight sm:text-[3rem] sm:leading-[1.03]">
              Start with everything installed.
            </h1>
            <p className="max-w-lg text-body-lg leading-relaxed text-muted-foreground">
              A clean shadcn Next.js app with every Control UI component copied into your project as editable source.
            </p>
          </div>

          <dl className="grid max-w-lg grid-cols-3 divide-x divide-border/70 border-y border-border/70 py-5">
            <div className="pr-5">
              <dt className="text-caption text-muted-foreground">Components</dt>
              <dd className="mt-1 font-mono text-heading-3 font-semibold">{installableComponentCount}</dd>
            </div>
            <div className="px-5">
              <dt className="text-caption text-muted-foreground">Skin</dt>
              <dd className="mt-1 text-body font-semibold">Refined</dd>
            </div>
            <div className="pl-5">
              <dt className="text-caption text-muted-foreground">Source</dt>
              <dd className="mt-1 text-body font-semibold">Owned</dd>
            </div>
          </dl>
        </section>

        <Card variant="sectioned" className="min-w-0">
          <CardHeader>
            <CardTitle>Create your app</CardTitle>
            <CardDescription>One command creates the project, installs every package, and starts Next.js.</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <CreateCommand registryBaseUrl={env.NEXT_PUBLIC_REGISTRY_URL} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
