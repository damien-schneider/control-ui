"use client";

import { useState } from "react";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { Button } from "@/components/control-ui/ui/button";
import { Code, CodeActions, CodeContent, CodeHeader, CodeTitle } from "@/components/control-ui/ui/code";
import { Text } from "@/components/control-ui/ui/typography";
import { CopySwap } from "@/components/copy-swap";
import { siteConfig } from "@/lib/site-config";
import { buildSetupPrompt } from "./setup-prompt";

const setupPrompt = buildSetupPrompt({ origin: siteConfig.url.origin });

function useSetupPromptCopy() {
  const [copyError, setCopyError] = useState<string | null>(null);
  const promptCopy = useCopyToClipboard({
    text: setupPrompt,
    onCopyError: () => setCopyError("The prompt could not be copied. Check clipboard permissions and try again."),
  });

  return {
    copyError,
    copied: promptCopy.status === "copied",
    copy: () => {
      setCopyError(null);
      void promptCopy.handleCopy();
    },
  };
}

export function SetupPromptCopyButton({ className, compact }: { className?: string; compact?: boolean }) {
  const { copyError, copied, copy } = useSetupPromptCopy();

  return (
    <div className={className}>
      <Button size={compact ? "xs" : "sm"} variant="solid" tone="primary" onClick={copy}>
        <CopySwap
          copied={copied}
          idleLabel={compact ? "Copy prompt" : "Copy setup prompt"}
          copiedLabel={compact ? "Copied" : "Prompt copied"}
        />
      </Button>
      {copyError ? (
        <Text role="alert" as="p" size="caption" tone="destructive" className="mt-2">
          {copyError}
        </Text>
      ) : null}
    </div>
  );
}

export function AgentSetup() {
  const { copyError, copied, copy } = useSetupPromptCopy();

  return (
    <div className="mt-4 grid gap-2">
      <Code overflow="wrap">
        <CodeHeader>
          <CodeTitle>Agent setup prompt</CodeTitle>
          <CodeActions>
            <Button size="sm" variant="solid" tone="primary" onClick={copy}>
              <CopySwap copied={copied} idleLabel="Copy agent prompt" copiedLabel="Agent prompt copied" />
            </Button>
          </CodeActions>
        </CodeHeader>
        <CodeContent code={setupPrompt} lang="markdown" maxHeight="24rem" />
      </Code>
      {copyError ? (
        <Text role="alert" as="p" size="caption" tone="destructive">
          {copyError}
        </Text>
      ) : null}
    </div>
  );
}
