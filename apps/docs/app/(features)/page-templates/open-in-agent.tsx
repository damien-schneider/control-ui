"use client";

import { CheckCircle2Icon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { buildPagePrompt } from "@/app/(features)/create/page-prompt";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { Button } from "@/components/control-ui/ui/button";
import { siteConfig } from "@/lib/site-config";

export function OpenInAgent({ name, pathname }: { name: string; pathname: string }) {
  const [copyError, setCopyError] = useState<string | null>(null);
  const { isCopied, handleCopy } = useCopyToClipboard({
    text: buildPagePrompt({ origin: siteConfig.url.origin, name, pathname }),
    onCopyError: () => setCopyError("The prompt could not be copied. Check clipboard permissions and try again."),
  });

  return (
    <div className="shrink-0">
      <Button
        type="button"
        size="sm"
        variant="surface"
        onClick={() => {
          setCopyError(null);
          void handleCopy();
        }}
      >
        {isCopied ? <CheckCircle2Icon aria-hidden className="size-3.5" /> : <CopyIcon aria-hidden className="size-3.5" />}
        <span className="grid">
          <span aria-hidden className="invisible col-start-1 row-start-1">
            Open in your agent
          </span>
          <span aria-hidden className="invisible col-start-1 row-start-1">
            Prompt copied
          </span>
          <span aria-live="polite" className="col-start-1 row-start-1">
            {isCopied ? "Prompt copied" : "Open in your agent"}
          </span>
        </span>
      </Button>
      {copyError ? (
        <p role="alert" className="mt-2 text-caption text-destructive-text">
          {copyError}
        </p>
      ) : null}
    </div>
  );
}
