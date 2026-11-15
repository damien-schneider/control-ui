"use client";

import { ChevronRightIcon } from "lucide-react";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { Button } from "@/components/control-ui/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { Code, CodeContent } from "@/components/control-ui/ui/code";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
import { Text } from "@/components/control-ui/ui/typography";
import { CopySwap } from "@/components/copy-swap";
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
    <Card size="sm" role="region" aria-label="Use this theme">
      <CardHeader>
        <CardTitle render={(props) => <h2 {...props} />}>Use this theme</CardTitle>
        <CardDescription>
          Copy a prompt with the {skin.label} skin and your current edits to paste into your coding agent, or export just your CSS
          overrides.
        </CardDescription>
        <CardAction className="flex flex-wrap gap-2">
          <Button variant="quiet" size="sm" onClick={cssCopy.handleCopy}>
            <CopySwap copied={cssCopy.status === "copied"} idleLabel="Copy CSS overrides" copiedLabel="CSS copied" />
          </Button>
          <Button variant="surface" size="sm" onClick={promptCopy.handleCopy}>
            <CopySwap copied={promptCopy.status === "copied"} idleLabel="Copy theme prompt" copiedLabel="Prompt copied" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {cssCopy.status === "failed" || promptCopy.status === "failed" ? (
          <Text role="alert" as="p" size="caption" tone="danger">
            Could not copy {cssCopy.status === "failed" ? "CSS overrides" : "the theme prompt"}. Try again or allow clipboard access.
          </Text>
        ) : null}
        <Collapsible>
          <CollapsibleTrigger>
            <ChevronRightIcon aria-hidden />
            <Text size="caption">Preview agent prompt</Text>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Code className="mt-3" overflow="wrap">
              <CodeContent code={prompt} lang="markdown" />
            </Code>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
