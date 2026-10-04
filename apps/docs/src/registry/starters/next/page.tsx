import { ButtonLink } from "@/components/control-ui/ui/button";
import { Text } from "@/components/control-ui/ui/typography";

export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="w-full max-w-xl space-y-8">
        <div className="space-y-3">
          <Text as="p" size="label" weight="medium" tone="muted">
            Control UI
          </Text>
          <h1 className="text-display">Project ready.</h1>
          <Text as="p" size="body-lg" tone="muted" className="max-w-md">
            Every agent component, block, and primitive is installed as editable source in components/control-ui.
          </Text>
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
            View Control UI on GitHub
            <span className="sr-only"> (opens in a new tab)</span>
          </ButtonLink>
          <Text as="code" size="caption" tone="muted">
            components/control-ui
          </Text>
        </div>
      </section>
    </main>
  );
}
