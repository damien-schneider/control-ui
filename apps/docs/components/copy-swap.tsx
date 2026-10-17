import { CheckCircle2Icon, CopyIcon } from "lucide-react";
import { Swap, SwapItem } from "@/components/control-ui/ui/swap";

export function CopySwap({ copied, idleLabel, copiedLabel }: { copied: boolean; idleLabel: string; copiedLabel: string }) {
  return (
    <Swap value={copied ? "copied" : "idle"} aria-live="polite">
      <SwapItem value="idle">
        <CopyIcon aria-hidden />
        {idleLabel}
      </SwapItem>
      <SwapItem value="copied">
        <CheckCircle2Icon aria-hidden />
        {copiedLabel}
      </SwapItem>
    </Swap>
  );
}
