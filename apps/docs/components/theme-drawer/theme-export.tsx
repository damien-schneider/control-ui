"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { Button } from "@/components/control-ui/ui/button";
import { Code, CodeContent } from "@/components/control-ui/ui/code";
import { Text } from "@/components/control-ui/ui/typography";
import { siteConfig } from "@/lib/site-config";
import { SKIN_META_BY_ID } from "./presets";
import { useThemeRuntime } from "./theme-runtime-context";
import { toCss } from "./write-vars";

export function ThemeExport() {
  const { t } = useThemeRuntime();
  const css = toCss(t);
  const skin = SKIN_META_BY_ID[t.skin];
  const prompt = `Apply this Control UI theme to my project.

Read ${siteConfig.url.origin}/skins/${t.skin} for the ${skin.label} skin and its setup instructions. Use the registry's install command with this project's package manager.
${t.skin === "none" ? "Use the unstyled Control UI base (No skin)." : `Install and activate the ${skin.label} skin (data-skin="${t.skin}").`}
${t.reduceMotion ? 'Enable reduced motion with data-motion="reduced".' : "Respect the skin's motion defaults and the user's reduced-motion preference."}
Apply the following CSS after the Control UI styles, preserving its light/dark scopes, font imports, and component rules:

\`\`\`css
${css}
\`\`\`

Explain the proposed changes before editing, then verify the theme in the application.`;
  const cssCopy = useCopyToClipboard({ text: css });
  const promptCopy = useCopyToClipboard({ text: prompt });

  return (
    <section aria-label="Use this theme" className="rounded-(--radius-panel) border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-xl">
          <h2 className="text-heading-4">Use this theme</h2>
          <Text as="p" size="caption" tone="muted" className="mt-1 text-pretty">
            Copy a prompt with the {skin.label} skin and your current edits to paste into your coding agent, or export just your CSS
            overrides.
          </Text>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="quiet" size="sm" onClick={cssCopy.handleCopy}>
            {cssCopy.status === "copied" ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
            <span aria-live="polite">{cssCopy.status === "copied" ? "CSS copied" : "Copy CSS overrides"}</span>
          </Button>
          <Button variant="surface" size="sm" onClick={promptCopy.handleCopy}>
            {promptCopy.status === "copied" ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
            <span aria-live="polite">{promptCopy.status === "copied" ? "Prompt copied" : "Copy theme prompt"}</span>
          </Button>
        </div>
      </div>
      {cssCopy.status === "failed" || promptCopy.status === "failed" ? (
        <Text role="alert" as="p" size="caption" tone="destructive" className="mt-3">
          Could not copy {cssCopy.status === "failed" ? "CSS overrides" : "the theme prompt"}. Try again or allow clipboard access.
        </Text>
      ) : null}
      <details className="mt-3">
        <summary className="cursor-pointer text-caption text-muted-foreground">Preview agent prompt</summary>
        <Code className="mt-3" overflow="wrap">
          <CodeContent code={prompt} lang="markdown" />
        </Code>
      </details>
    </section>
  );
}
