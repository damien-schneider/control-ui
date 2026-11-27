import { ArrowRightIcon } from "lucide-react";
import { IntentLink } from "@/app/(features)/client/intent-link";
import { ArrowLink } from "@/app/(features)/home/shared/arrow-link";
import { fullInstallCommand } from "@/app/(features)/model/registry";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { siteConfig } from "@/lib/site-config";
import { type InstallMethod, InstallSwitch } from "./install-switch";
import { SkinStage } from "./skin-stage";

const installMethods = [
  {
    id: "package",
    label: "Package",
    command: `bun add ${siteConfig.npmPackage}`,
    note: "The versioned npm package. Updates with bun update.",
  },
  {
    id: "source",
    label: "Source",
    command: fullInstallCommand("none") ?? "",
    note: "The same set copied into your repo with the shadcn CLI, yours to edit.",
  },
] as const satisfies readonly [InstallMethod, ...InstallMethod[]];

export function Hero() {
  return (
    <section id="top" aria-labelledby="home-title" className="grid min-w-0 gap-12 @3xl/home:gap-18">
      <div className="grid min-w-0 gap-8 @3xl/home:gap-10">
        <div className="grid min-w-0 gap-5 @3xl/home:gap-6">
          <Heading level={1} id="home-title" size="hero" tone="foreground" className="text-balance">
            <span className="block">App components,</span>
            <span className="block text-muted-foreground">in your own skin.</span>
          </Heading>
          <Text as="p" size="heading-2" weight="normal" tone="muted" className="max-w-160 text-pretty">
            React components for app screens, from form controls to AI chat. The look is a skin you write in CSS.
          </Text>
        </div>
        <div className="flex min-w-0 flex-col gap-3 @3xl/home:flex-row @3xl/home:items-start @3xl/home:gap-5.5">
          <InstallSwitch methods={installMethods} />
          <ArrowLink href="/get-started" className="hidden @3xl/home:mt-9 @3xl/home:inline-flex">
            Get started
          </ArrowLink>
          <ButtonLink variant="surface" size="lg" className="w-full @3xl/home:hidden" render={<IntentLink href="/get-started" />}>
            Get started
            <ArrowRightIcon aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
      <SkinStage />
    </section>
  );
}
