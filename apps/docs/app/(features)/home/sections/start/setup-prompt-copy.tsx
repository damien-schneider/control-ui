"use client";

import { useSetupPromptCopy } from "@/app/(features)/create/agent-setup";
import { Button } from "@/components/control-ui/ui/button";
import { Text } from "@/components/control-ui/ui/typography";
import { CopySwap } from "@/components/copy-swap";

export function SetupPromptCopy() {
  const { copyError, copied, copy } = useSetupPromptCopy();

  return (
    <>
      <Button variant="surface" size="lg" className="h-10 @4xl/home:h-9" onClick={copy}>
        <CopySwap copied={copied} idleLabel="Copy the setup prompt" copiedLabel="Prompt copied" />
      </Button>
      {copyError ? (
        <Text role="alert" as="p" size="caption" tone="danger" className="order-last w-full">
          {copyError}
        </Text>
      ) : null}
    </>
  );
}
