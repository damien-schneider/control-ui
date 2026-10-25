"use client";

import { DownloadIcon, FileTextIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/control-ui/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/control-ui/ui/dropdown-menu";
import { Reveal, RevealScope } from "@/components/control-ui/ui/reveal";
import { Text } from "@/components/control-ui/ui/typography";

const files = ["Quarterly report.pdf", "Launch notes.md"];

export function PrimitiveRevealExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ul className="flex flex-col gap-1">
        {files.map((file) => (
          <RevealScope key={file} render={<li />} className="flex min-h-10 items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <FileTextIcon aria-hidden="true" className="size-4 text-muted-foreground" />
              <Text>{file}</Text>
            </span>
            <Reveal className="flex items-center gap-1">
              <Button variant="ghost" size="sm" iconOnly aria-label={`Rename ${file}`}>
                <PencilIcon />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger variant="ghost" size="sm" iconOnly aria-label={`${file} actions`}>
                  <MoreHorizontalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Download</DropdownMenuItem>
                  <DropdownMenuItem>Move to trash</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Reveal>
          </RevealScope>
        ))}
      </ul>
      <RevealScope className="relative w-72 max-w-full">
        <img
          src="/dynamic-notification/sequoia-sunrise.png"
          alt="Sequoia grove at sunrise"
          className="aspect-video w-full rounded-[var(--radius-lg)] object-cover"
        />
        <Reveal className="absolute top-2 right-2 flex gap-1.5">
          <Button variant="scrim" size="sm" iconOnly aria-label="Download photo">
            <DownloadIcon />
          </Button>
          <Button variant="scrim" size="sm" iconOnly aria-label="Delete photo">
            <Trash2Icon />
          </Button>
        </Reveal>
      </RevealScope>
    </div>
  );
}
