import { ButtonLink } from "@/components/control-ui/ui/button";

export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="w-full max-w-xl space-y-8">
        <div className="space-y-3">
          <p className="text-label font-medium text-muted-foreground">Control UI</p>
          <h1 className="text-display font-display tracking-tight">Project ready.</h1>
          <p className="max-w-md text-body-lg text-muted-foreground">
            Every agent component, block, and primitive is installed as editable source in components/control-ui.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink
            href="https://github.com/damien-schneider/control-ui"
            target="_blank"
            rel="noreferrer"
            variant="solid"
            tone="primary"
            size="md"
          >
            Browse the registry
          </ButtonLink>
          <code className="text-caption text-muted-foreground">components/control-ui</code>
        </div>
      </section>
    </main>
  );
}
