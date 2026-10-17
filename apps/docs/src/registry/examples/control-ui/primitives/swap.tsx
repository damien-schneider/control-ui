"use client";

import { CheckIcon, CopyIcon, PlayIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { Button } from "@/components/control-ui/ui/button";
import { Spinner } from "@/components/control-ui/ui/spinner";
import { Swap, SwapItem } from "@/components/control-ui/ui/swap";

type RunState = "idle" | "running" | "done";

const runStateDurations: Record<Exclude<RunState, "idle">, number> = { running: 1600, done: 1800 };

function useRunDemo() {
  const [state, setState] = useState<RunState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState(state === "running" ? "done" : "idle"), runStateDurations[state]);
    return () => window.clearTimeout(timer);
  }, [state]);

  return { state, run: () => setState("running") };
}

export function PrimitiveSwapExample() {
  const { status, handleCopy } = useCopyToClipboard({ text: "npx shadcn@latest add @control-ui/swap" });
  const { state, run } = useRunDemo();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="surface" size="sm" onClick={handleCopy}>
        <Swap value={status === "copied" ? "copied" : "idle"} aria-live="polite">
          <SwapItem value="idle">
            <CopyIcon aria-hidden />
            Copy install command
          </SwapItem>
          <SwapItem value="copied">
            <CheckIcon aria-hidden />
            Copied
          </SwapItem>
        </Swap>
      </Button>
      <Button variant="solid" tone="primary" size="sm" disabled={state === "running"} onClick={run}>
        <Swap value={state}>
          <SwapItem value="idle">
            <PlayIcon aria-hidden />
            Run evals
          </SwapItem>
          <SwapItem value="running">
            <Spinner size="sm" label="Running evals" />
            Running…
          </SwapItem>
          <SwapItem value="done">
            <CheckIcon aria-hidden />
            Passed
          </SwapItem>
        </Swap>
      </Button>
    </div>
  );
}
