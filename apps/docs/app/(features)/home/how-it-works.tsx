"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CodeBlock, CodeSnippet } from "@/app/(features)/components/source";
import { packInstallCommand, registryInstallCommand } from "@/app/(features)/model/registry";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { SKIN_META_BY_ID } from "@/components/theme-drawer/presets";
import { useThemeRuntime } from "@/components/theme-drawer/theme-runtime-context";
import { createASkinGuide, inlineLinkClassName } from "./showcase";

const colorPickerUsage = `<ColorPicker value={color} onValueChange={setColor}>
  <ColorPickerTrigger />
  <ColorPickerContent>
    <ColorPickerArea>
      <ColorPickerAreaThumb />
    </ColorPickerArea>
    <ColorPickerHue />
  </ColorPickerContent>
</ColorPicker>`;

const tokenOverride = `:root {
  --primary: oklch(0.45 0.18 260);
  --radius: 4px;
}`;

function Step({ number, title, children, code }: { number: number; title: string; children: ReactNode; code: ReactNode }) {
  return (
    <li className="grid min-w-0 gap-4 border-border/70 border-t pt-6 @3xl/home:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] @3xl/home:gap-8">
      <div className="grid content-start gap-1.5">
        <Heading level={3} size="heading-3" tone="foreground" className="flex items-baseline gap-3">
          <span className="text-muted-foreground tabular-nums">{number}</span>
          {title}
        </Heading>
        <Text as="p" tone="muted" className="text-pretty">
          {children}
        </Text>
      </div>
      <div className="min-w-0">{code}</div>
    </li>
  );
}

function SkinStep() {
  const { t } = useThemeRuntime();
  const skin = SKIN_META_BY_ID[t.skin];
  const installCommand = packInstallCommand(t.skin);

  if (!installCommand) {
    return (
      <Step number={3} title="Own the theme" code={<CodeBlock code={tokenOverride} lang="css" />}>
        Without a skin you get the library baseline. Core declares its tokens at zero specificity, so your values win.
      </Step>
    );
  }

  return (
    <Step number={3} title={`Add the ${skin.label} skin`} code={<CodeSnippet code={installCommand} />}>
      Adds its tokens, component CSS, and config. Pass the config to <code>SkinProvider</code> and set its id as <code>data-skin</code> on
      your theme boundary.{" "}
      <Link href={`/${createASkinGuide.id}`} className={inlineLinkClassName}>
        Or make your own
      </Link>
      .
    </Step>
  );
}

export function HowItWorks() {
  return (
    <ol className="grid min-w-0 gap-6">
      <Step number={1} title="Add a component" code={<CodeSnippet code={registryInstallCommand("color-picker")} />}>
        The shadcn CLI writes the source into <code>components/control-ui</code>, next to your <code>components/ui</code>.
      </Step>
      <Step number={2} title="Compose it" code={<CodeBlock code={colorPickerUsage} />}>
        Plain props, children, and callbacks. Your app keeps the state, the data, and the model calls.
      </Step>
      <SkinStep />
    </ol>
  );
}
