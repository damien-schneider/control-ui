"use client";

import { CheckCircle2Icon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { Button } from "@/components/control-ui/ui/button";
import { Code, CodeActions, CodeContent, CodeHeader, CodeTitle } from "@/components/control-ui/ui/code";
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
    isCopied: promptCopy.isCopied,
    copy: () => {
      setCopyError(null);
      void promptCopy.handleCopy();
    },
  };
}

export function SetupPromptCopyButton({ className, compact }: { className?: string; compact?: boolean }) {
  const { copyError, isCopied, copy } = useSetupPromptCopy();
  const idleLabel = compact ? "Copy prompt" : "Copy setup prompt";
  const copiedLabel = compact ? "Copied" : "Prompt copied";

  return (
    <div className={className}>
      <Button size={compact ? "xs" : "sm"} variant="solid" tone="primary" onClick={copy}>
        {isCopied ? <CheckCircle2Icon aria-hidden className="size-3.5" /> : <CopyIcon aria-hidden className="size-3.5" />}
        {isCopied ? copiedLabel : idleLabel}
      </Button>
      {copyError ? (
        <p role="alert" className="mt-2 text-caption text-destructive-text">
          {copyError}
        </p>
      ) : null}
    </div>
  );
}

export function AgentSetup() {
  const { copyError, isCopied, copy } = useSetupPromptCopy();

  return (
    <div className="mt-4 grid max-w-2xl gap-2">
      <Code overflow="wrap" className="my-0">
        <CodeHeader>
          <CodeTitle>Agent setup prompt</CodeTitle>
          <CodeActions>
            <Button size="sm" variant="solid" tone="primary" onClick={copy}>
              {isCopied ? <CheckCircle2Icon aria-hidden className="size-3.5" /> : <CopyIcon aria-hidden className="size-3.5" />}
              {isCopied ? "Agent prompt copied" : "Copy agent prompt"}
            </Button>
          </CodeActions>
        </CodeHeader>
        <CodeContent code={setupPrompt} lang="markdown" maxHeight="24rem" />
      </Code>
      {copyError ? (
        <p role="alert" className="text-caption text-destructive-text">
          {copyError}
        </p>
      ) : null}
    </div>
  );
}
