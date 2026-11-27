import { IntentLink } from "@/app/(features)/client/intent-link";
import { CodeSnippet } from "@/app/(features)/components/source";
import { ArrowLink } from "@/app/(features)/home/shared/arrow-link";
import { fullInstallCommand } from "@/app/(features)/model/registry";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { Separator } from "@/components/control-ui/ui/separator";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { SetupPromptCopy } from "./setup-prompt-copy";
import { SkinStamp } from "./skin-stamp";

const installCommand = fullInstallCommand("none") ?? "";

export function Start() {
  return (
    <section id="start" aria-labelledby="start-title" className="grid min-w-0 gap-10 @4xl/home:gap-14">
      <SkinStamp />
      <Separator />
      <div className="grid min-w-0 gap-10 @4xl/home:grid-cols-[minmax(0,1.24fr)_minmax(0,1fr)_minmax(0,1fr)] @4xl/home:gap-14">
        <div className="grid min-w-0 content-start gap-7">
          <div className="grid min-w-0 gap-3">
            <Text as="p" size="display" weight="medium" tone="foreground" className="text-pretty">
              Start from an empty folder, or from a preset you rewrite.
            </Text>
            <Text as="p" size="body-lg" tone="muted" className="text-pretty">
              Either way the three skin files are yours, and no update will ever list them.
            </Text>
          </div>
          <div className="flex min-w-0 flex-wrap gap-2">
            <ButtonLink
              variant="solid"
              size="lg"
              className="h-11 flex-1 @4xl/home:h-9 @4xl/home:flex-none"
              render={<IntentLink href="/get-started" />}
            >
              Get started
            </ButtonLink>
            <ButtonLink
              variant="surface"
              size="lg"
              className="h-11 flex-1 @4xl/home:h-9 @4xl/home:flex-none"
              render={<IntentLink href="/components" />}
            >
              Browse components
            </ButtonLink>
          </div>
        </div>
        <div className="grid min-w-0 content-start gap-3.5 @4xl/home:pt-1">
          <Heading level={3} size="caption" weight="normal" tone="muted" mono>
            run it yourself
          </Heading>
          <CodeSnippet code={installCommand} highlight="none" />
          <Text as="p" tone="muted" className="text-pretty">
            Everything, as source, with no preset. The defaults work without a skin.
          </Text>
        </div>
        <div className="grid min-w-0 content-start gap-3.5 @4xl/home:pt-1">
          <Heading level={3} size="caption" weight="normal" tone="muted" mono>
            or hand it to your agent
          </Heading>
          <Text as="p" tone="muted" className="text-pretty">
            One setup prompt makes the agent already in your project read the repo, install from the registry, wire the CSS, run the doctor
            and design the theme with you.
          </Text>
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <SetupPromptCopy />
            <ArrowLink href="/setup-prompt" className="min-h-10 @4xl/home:min-h-8">
              Read it first
            </ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}
