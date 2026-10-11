"use client";

import { ArrowUpRightIcon, CheckCircle2Icon, ChevronDownIcon, FileTextIcon, SparklesIcon, TerminalIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buildPagePrompt } from "@/app/(features)/create/page-prompt";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { Button } from "@/components/control-ui/ui/button";
import { ButtonGroup } from "@/components/control-ui/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/control-ui/ui/dropdown-menu";
import { Text } from "@/components/control-ui/ui/typography";
import { siteConfig } from "@/lib/site-config";

const idleLabel = "Copy prompt";
const copiedLabels = { prompt: "Prompt copied", install: "Command copied" } as const;
const sizingLabels = [idleLabel, ...Object.values(copiedLabels)];

type CopyTarget = keyof typeof copiedLabels;

export function AgentActions({ name, installCommand, manifestUrl }: { name: string; installCommand?: string; manifestUrl?: string }) {
  const pathname = usePathname();
  const [lastTarget, setLastTarget] = useState<CopyTarget>("prompt");
  const { status, copyToClipboard } = useCopyToClipboard();

  function copy(target: CopyTarget, value: string) {
    setLastTarget(target);
    void copyToClipboard(value);
  }

  const copied = status === "copied";

  return (
    <div className="shrink-0">
      <ButtonGroup aria-label="Page actions for agents">
        <Button
          type="button"
          size="sm"
          variant="surface"
          onClick={() => copy("prompt", buildPagePrompt({ origin: siteConfig.url.origin, name, pathname }))}
        >
          {copied ? <CheckCircle2Icon aria-hidden className="size-3.5" /> : <SparklesIcon aria-hidden className="size-3.5" />}
          <span className="grid">
            {sizingLabels.map((sizingLabel) => (
              <span key={sizingLabel} aria-hidden className="invisible col-start-1 row-start-1">
                {sizingLabel}
              </span>
            ))}
            <span aria-live="polite" className="col-start-1 row-start-1">
              {copied ? copiedLabels[lastTarget] : idleLabel}
            </span>
          </span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger size="sm" variant="surface" iconOnly aria-label="More page actions">
            <ChevronDownIcon aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {installCommand ? (
              <DropdownMenuItem onClick={() => copy("install", installCommand)}>
                <TerminalIcon aria-hidden />
                Copy install command
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem render={<a href={`/api/markdown${pathname}`} target="_blank" rel="noopener noreferrer" />}>
              <FileTextIcon aria-hidden />
              View as Markdown
            </DropdownMenuItem>
            {manifestUrl ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <a
                      href={`https://v0.dev/chat/api/open?url=${encodeURIComponent(manifestUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <ArrowUpRightIcon aria-hidden />
                  Open in v0
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      {status === "failed" ? (
        <Text role="alert" as="p" size="caption" tone="destructive" className="mt-2">
          Copy failed. Check clipboard permissions and try again.
        </Text>
      ) : null}
    </div>
  );
}
