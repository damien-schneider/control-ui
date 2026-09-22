"use client";

import { WandSparklesIcon, XIcon } from "lucide-react";

import { Button } from "@/components/control-ui/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/control-ui/ui/drawer";
import { ThemeGenerator } from "./theme-generator";

export function ThemeGeneratorDrawer() {
  return (
    // The whole point is watching tokens land in the editor, so this drawer never dims the page behind it
    // — the scrim reads --overlay-opacity and --backdrop-blur-overlay, both of which a generated theme
    // rewrites — and editing a token must not dismiss it: Base UI closes a non-modal drawer on any outside
    // press or focus move, which would unmount a generation mid-stream and take the log with it.
    <Drawer side="right" modal={false} disablePointerDismissal>
      <DrawerTrigger
        render={
          <Button variant="surface" size="sm">
            <WandSparklesIcon aria-hidden className="size-3.5" />
            Generate a theme
          </Button>
        }
      />
      <DrawerContent
        side="right"
        variant="floating"
        surface="card"
        className="flex w-full max-w-md flex-col"
        style={{ "--cui-popup-backdrop-background": "transparent", "--cui-popup-backdrop-blur": "none" }}
      >
        <DrawerHeader className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0">
            <DrawerTitle>Generate a theme</DrawerTitle>
            <DrawerDescription>
              Describe a mood. Every token group — colour, shape, type, depth, motion, density — is written into the editor as it streams.
            </DrawerDescription>
          </div>
          <DrawerClose
            render={
              <Button variant="quiet" size="sm" aria-label="Close">
                <XIcon aria-hidden className="size-4" />
              </Button>
            }
          />
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <ThemeGenerator />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
