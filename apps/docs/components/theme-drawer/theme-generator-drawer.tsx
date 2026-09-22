"use client";

import { PlusIcon, Trash2Icon, WandSparklesIcon, XIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/control-ui/ui/alert-dialog";
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
import { setDrawerOpen } from "./generation-store";
import { ThemeGenerator } from "./theme-generator";
import { useThemeConversation } from "./use-theme-conversation";

function DeleteCustomSkinButton({ name, disabled, onDelete }: { name: string; disabled: boolean; onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={disabled}
        render={
          <Button variant="quiet" size="sm" iconOnly aria-label={`Delete ${name}`} title="Delete skin">
            <Trash2Icon aria-hidden className="size-4" />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            The skin and its conversation are removed from this browser. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose>Cancel</AlertDialogClose>
          <AlertDialogClose variant="solid" tone="danger" onClick={onDelete}>
            Delete
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ThemeGeneratorDrawer() {
  const { isOpen, isRunning, activeCustomSkin, generations, startNewTheme, deleteActiveCustomSkin } = useThemeConversation();

  return (
    // The whole point is watching tokens land in the editor, so this drawer never dims the page behind it
    // — the scrim reads --overlay-opacity and --backdrop-blur-overlay, both of which a generated theme
    // rewrites — and editing a token must not dismiss it: Base UI closes a non-modal drawer on any outside
    // press or focus move, which would unmount a generation mid-stream and take the log with it.
    // Open state lives in the store because selecting a page-scrolled skin remounts this whole subtree.
    <Drawer side="right" modal={false} disablePointerDismissal open={isOpen} onOpenChange={setDrawerOpen}>
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
        padding="none"
        className="w-full max-w-md"
        style={{ "--cui-popup-backdrop-background": "transparent", "--cui-popup-backdrop-blur": "none" }}
      >
        <DrawerHeader className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0">
            <DrawerTitle>{activeCustomSkin?.name ?? "Generate a theme"}</DrawerTitle>
            <DrawerDescription>
              Describe a mood. Every token group — colour, shape, type, depth, motion, density — is written into the editor as it streams.
            </DrawerDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="quiet"
              size="sm"
              iconOnly
              aria-label="New theme"
              title="New theme"
              disabled={isRunning || generations.length === 0}
              onClick={startNewTheme}
            >
              <PlusIcon aria-hidden className="size-4" />
            </Button>
            {activeCustomSkin ? (
              <DeleteCustomSkinButton name={activeCustomSkin.name} disabled={isRunning} onDelete={deleteActiveCustomSkin} />
            ) : null}
            <DrawerClose
              render={
                <Button variant="quiet" size="sm" aria-label="Close">
                  <XIcon aria-hidden className="size-4" />
                </Button>
              }
            />
          </div>
        </DrawerHeader>
        <ThemeGenerator />
      </DrawerContent>
    </Drawer>
  );
}
