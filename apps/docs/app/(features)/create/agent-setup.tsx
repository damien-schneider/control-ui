"use client";

import { CheckCircle2Icon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { Button } from "@/components/control-ui/ui/button";
import { env } from "@/env";
import { buildSetupPrompt } from "./setup-prompt";

export function AgentSetup() {
  const [copyError, setCopyError] = useState<string | null>(null);
  const promptCopy = useCopyToClipboard({
    text: buildSetupPrompt({ origin: env.NEXT_PUBLIC_REGISTRY_URL }),
    onCopyError: () => setCopyError("The prompt could not be copied. Check clipboard permissions and try again."),
  });

  return (
    <div className="mt-4 grid max-w-2xl gap-2">
      <Button
        variant="solid"
        tone="primary"
        onClick={() => {
          setCopyError(null);
          promptCopy.handleCopy();
        }}
      >
        {promptCopy.isCopied ? <CheckCircle2Icon aria-hidden className="size-3.5" /> : <CopyIcon aria-hidden className="size-3.5" />}
        {promptCopy.isCopied ? "Agent prompt copied" : "Copy agent prompt"}
      </Button>
      {copyError ? (
        <p role="alert" className="text-caption text-destructive-text">
          {copyError}
        </p>
      ) : null}
    </div>
  );
}
