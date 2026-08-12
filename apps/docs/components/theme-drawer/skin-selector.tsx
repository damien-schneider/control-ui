"use client";

import { CopyIcon, DownloadIcon, FileCode2Icon, MoreHorizontalIcon, PaletteIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { packInstallCommand } from "@/app/(features)/model/registry";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/control-ui/ui/alert-dialog";
import { Badge } from "@/components/control-ui/ui/badge";
import { Button } from "@/components/control-ui/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/control-ui/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/control-ui/ui/dropdown-menu";
import { Input } from "@/components/control-ui/ui/input";
import { Toggle, ToggleGroup } from "@/components/control-ui/ui/toggle";
import { SKIN_CONFIGS } from "@/components/skin-registry";
import { ALL_SKIN_IDS, isSkinId, SKIN_META_BY_ID } from "./presets";
import { SkinLogo } from "./skin-logo";
import type { CustomThemeProfile, SkinId } from "./types";

function SkinOption({ id }: { id: SkinId }) {
  const meta = SKIN_META_BY_ID[id];
  const forcedScheme = SKIN_CONFIGS[id]?.colorScheme;
  const badge = forcedScheme ? `${forcedScheme}-only` : undefined;

  return (
    <span className="relative flex w-full min-w-0 items-center gap-2.5 text-left">
      {badge ? (
        <Badge variant="outline" size="sm" className="pointer-events-none absolute right-2 -bottom-2">
          {badge}
        </Badge>
      ) : null}
      <SkinLogo id={id} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-medium">{meta.label}</span>
        </span>
      </span>
    </span>
  );
}

function SkinGroup({
  ids,
  skin,
  customThemeId,
  onSelect,
}: {
  ids: readonly SkinId[];
  skin: SkinId;
  customThemeId: string | null;
  onSelect: (skin: SkinId) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <ToggleGroup
        aria-label="Skin"
        value={customThemeId ? [] : [skin]}
        onValueChange={(value) => {
          const next = value[value.length - 1];
          if (isSkinId(next)) onSelect(next);
        }}
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {ids.map((id) => {
          const active = customThemeId === null && skin === id;
          return (
            <Toggle
              key={id}
              value={id}
              variant="surface"
              size="lg"
              active={active}
              className="w-full justify-start text-left [&_[data-slot=control-content]]:w-full"
            >
              <SkinOption id={id} />
            </Toggle>
          );
        })}
      </ToggleGroup>
    </div>
  );
}

type CustomThemeActions = {
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onExport: (id: string) => void;
  onDelete: (id: string) => void;
};

function CustomThemeLibrary({
  themes,
  activeId,
  onSelect,
  onRename,
  onDuplicate,
  onExport,
  onDelete,
}: { themes: CustomThemeProfile[]; activeId: string | null } & CustomThemeActions) {
  const [renameTarget, setRenameTarget] = useState<CustomThemeProfile | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CustomThemeProfile | null>(null);

  if (themes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium text-muted-foreground">Custom</span>
      <div className="flex flex-col gap-1.5">
        {themes.map((theme) => (
          <div key={theme.id} className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="surface"
              size="sm"
              active={theme.id === activeId}
              className="min-w-0 flex-1 justify-start"
              onClick={() => onSelect(theme.id)}
            >
              <PaletteIcon aria-hidden className="size-3.5 shrink-0" />
              <span className="truncate">{theme.name}</span>
              <span className="ml-auto shrink-0 text-[9px] text-muted-foreground">{SKIN_META_BY_ID[theme.baseSkin].label}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger size="sm" iconOnly aria-label={`Actions for ${theme.name}`}>
                <MoreHorizontalIcon aria-hidden className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => {
                    setRenameValue(theme.name);
                    setRenameTarget(theme);
                  }}
                >
                  <PencilIcon aria-hidden className="size-3.5" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(theme.id)}>
                  <CopyIcon aria-hidden className="size-3.5" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport(theme.id)}>
                  <DownloadIcon aria-hidden className="size-3.5" /> Export JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(theme)}>
                  <Trash2Icon aria-hidden className="size-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename custom theme</DialogTitle>
            <DialogDescription>Names are kept unique in this browser.</DialogDescription>
          </DialogHeader>
          <div className="px-4">
            <Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} maxLength={60} aria-label="Theme name" />
          </div>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <DialogClose
              variant="solid"
              tone="primary"
              disabled={!renameValue.trim()}
              onClick={() => renameTarget && onRename(renameTarget.id, renameValue)}
            >
              Save
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the local copy. If it is active, the editor returns to its clean{" "}
              {deleteTarget ? SKIN_META_BY_ID[deleteTarget.baseSkin].label : "base"} skin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <AlertDialogClose tone="danger" variant="solid" onClick={() => deleteTarget && onDelete(deleteTarget.id)}>
              Delete
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Small transient-copy button for active skin's pack install command.
function CommandCopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="quiet"
      size="xs"
      className="shrink-0"
      onClick={async () => {
        try {
          await navigator.clipboard?.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        } catch {
          /* clipboard denied — ignore */
        }
      }}
    >
      {copied ? "✓" : "Copy"}
    </Button>
  );
}

export function SkinSelector({
  skin,
  customThemeId,
  customThemes,
  sourceOpen,
  onSelect,
  onSelectCustom,
  onRenameCustom,
  onDuplicateCustom,
  onExportCustom,
  onDeleteCustom,
  onViewSource,
}: {
  skin: SkinId;
  customThemeId: string | null;
  customThemes: CustomThemeProfile[];
  sourceOpen: boolean;
  onSelect: (skin: SkinId) => void;
  onSelectCustom: (id: string) => void;
  onRenameCustom: (id: string, name: string) => void;
  onDuplicateCustom: (id: string) => void;
  onExportCustom: (id: string) => void;
  onDeleteCustom: (id: string) => void;
  onViewSource: () => void;
}) {
  const installCommand = packInstallCommand(skin);
  const activeMeta = SKIN_META_BY_ID[skin];

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] font-medium text-muted-foreground">Built-in skins</span>
      <SkinGroup ids={ALL_SKIN_IDS} skin={skin} customThemeId={customThemeId} onSelect={onSelect} />
      <CustomThemeLibrary
        themes={customThemes}
        activeId={customThemeId}
        onSelect={onSelectCustom}
        onRename={onRenameCustom}
        onDuplicate={onDuplicateCustom}
        onExport={onExportCustom}
        onDelete={onDeleteCustom}
      />
      {installCommand ? (
        <div className="grid gap-2 md:grid-cols-[minmax(12rem,0.45fr)_minmax(0,1fr)]">
          <Button type="button" variant="surface" size="sm" active={sourceOpen} className="w-full" onClick={onViewSource}>
            <FileCode2Icon aria-hidden className="size-3.5" />
            View {activeMeta.label} source
          </Button>
          <div className="flex min-w-0 items-center gap-2 rounded-[var(--radius-control)] border border-border bg-muted/35 px-3 py-2">
            <span className="shrink-0 text-[10px] font-medium text-muted-foreground">Install</span>
            <code className="min-w-0 flex-1 truncate font-mono text-[10px] text-foreground">{installCommand}</code>
            <CommandCopyButton value={installCommand} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
