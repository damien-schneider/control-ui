"use client";

import { CopyIcon, DownloadIcon, FileCode2Icon, MoreHorizontalIcon, PaletteIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { packInstallCommand } from "@/app/(features)/model/registry";
import { cn } from "@/components/control-ui/lib/cn";
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
import { Input } from "@/components/control-ui/ui/input";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/control-ui/ui/menu";
import { Toggle, ToggleGroup } from "@/components/control-ui/ui/toggle";
import { SKIN_CONFIGS } from "@/components/skin-registry";
import { ALL_SKIN_IDS, isSkinId, SKIN_META_BY_ID } from "./presets";
import type { CustomThemeProfile, SkinId } from "./types";

const logoClassName = "mt-0.5 size-7 shrink-0";

function AppleLogo() {
  return (
    <svg viewBox="0 0 28 28" className={cn(logoClassName, "text-foreground")} aria-hidden="true">
      <title>Apple logo</title>
      <path fill="currentColor" d="M16.1 6.5c.6-.8 1-1.8.9-2.8-1 .1-2.1.7-2.8 1.5-.6.7-1.1 1.7-1 2.7 1.1.1 2.2-.6 2.9-1.4Z" />
      <path
        fill="currentColor"
        d="M22.5 18.6c-.5 1.1-.8 1.6-1.4 2.6-.9 1.4-2.1 3.2-3.7 3.2-1.3 0-1.7-.9-3.6-.9s-2.3.9-3.7.9c-1.5 0-2.7-1.6-3.6-3-2.5-3.9-2.8-8.5-1.2-11 1.1-1.8 2.9-2.8 4.6-2.8 1.8 0 2.9 1 4.3 1 1.4 0 2.3-1 4.3-1 1.5 0 3.1.8 4.2 2.2-3.7 2-3.1 7.2-.2 8.8Z"
      />
    </svg>
  );
}

function WindowsXpLogo() {
  return (
    <svg viewBox="0 0 28 28" className={logoClassName} aria-hidden="true">
      <title>Windows XP logo</title>
      <path d="M3.5 6.2 12.4 4.5v8.2H3.5Z" fill="oklch(64% 0.2 145)" />
      <path d="M14 4.2 24.5 2.5v10.2H14Z" fill="oklch(62% 0.23 28)" />
      <path d="M3.5 14.2h8.9v8.2l-8.9-1.6Z" fill="oklch(72% 0.17 85)" />
      <path d="M14 14.2h10.5v10.3L14 22.7Z" fill="oklch(61% 0.19 250)" />
      <path d="M12.9 4.5v18.1M3.5 13.4h21" stroke="oklch(100% 0 0 / 0.75)" strokeWidth="1.1" />
    </svg>
  );
}

function LiquidMetalLogo() {
  return (
    <span
      className={cn(
        logoClassName,
        "rounded-full shadow-[inset_0_1px_2px_oklch(100%_0_0_/_0.8),inset_0_-2px_4px_oklch(35%_0.03_250_/_0.35)]",
      )}
      style={{
        background:
          "conic-gradient(from 145deg, oklch(92% 0.04 245), oklch(62% 0.08 270), oklch(99% 0 0), oklch(52% 0.06 230), oklch(92% 0.04 245))",
      }}
      aria-hidden
    />
  );
}

function RigLogo() {
  return (
    <svg viewBox="0 0 28 28" className={logoClassName} aria-hidden="true">
      <title>Rig logo</title>
      <path d="M5 6h18v16H5Z" fill="oklch(96% 0.01 95)" stroke="oklch(18% 0.02 60)" strokeWidth="2" />
      <path d="M8 9h12M8 14h12M8 19h7" stroke="oklch(62% 0.2 25)" strokeLinecap="square" strokeWidth="2" />
    </svg>
  );
}

function FlatLogo() {
  return (
    <svg viewBox="0 0 28 28" className={logoClassName} aria-hidden="true">
      <title>Flat logo</title>
      <path d="M6 6h16v16H6Z" fill="oklch(92% 0.01 250)" stroke="oklch(22% 0.02 250)" strokeWidth="2" />
      <path d="M10 10h8v8h-8Z" fill="oklch(22% 0.02 250)" />
    </svg>
  );
}

function LinearLogo() {
  return (
    <svg viewBox="0 0 28 28" className={logoClassName} aria-hidden="true">
      <title>Linear logo</title>
      <rect x="2" y="2" width="24" height="24" rx="6.5" fill="oklch(0.5674 0.1585 275.206)" />
      <g stroke="oklch(1 0 0)" strokeLinecap="round" strokeWidth="1.9">
        <path d="M6 15.5 12.5 22" />
        <path d="M6 10.5 17.5 22" />
        <path d="M6.5 6 22 21.5" />
      </g>
    </svg>
  );
}

function CuicuiLogo() {
  return <Image src="/logos/cuicui-logo.png" alt="" aria-hidden width={28} height={28} className={cn(logoClassName, "object-contain")} />;
}

function RefinedLogo() {
  return (
    <svg viewBox="0 0 28 28" className={logoClassName} aria-hidden="true">
      <title>Refined logo</title>
      <path d="M7 14h14M14 7v14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M9 9h10v10H9Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SkinLogo({ id }: { id: SkinId }) {
  if (id === "modern-apple") return <AppleLogo />;
  if (id === "xp") return <WindowsXpLogo />;
  if (id === "liquid-metal") return <LiquidMetalLogo />;
  if (id === "rig") return <RigLogo />;
  if (id === "flat") return <FlatLogo />;
  if (id === "cuicui") return <CuicuiLogo />;
  if (id === "linear") return <LinearLogo />;
  if (id === "refined") return <RefinedLogo />;
  return null;
}

function SkinOption({ id }: { id: SkinId }) {
  const meta = SKIN_META_BY_ID[id];
  const forcedScheme = SKIN_CONFIGS[id]?.colorScheme;
  const isRefined = id === "refined";
  let badge: string | undefined;
  if (isRefined) badge = "Default";
  else if (forcedScheme) badge = `${forcedScheme}-only`;

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
        className="grid grid-cols-2 gap-x-2 gap-y-4"
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
              showCheck
              className="w-full justify-start text-left [&_[data-slot=control-content]]:w-full [&_[data-slot=toggle-check]]:absolute [&_[data-slot=toggle-check]]:top-2 [&_[data-slot=toggle-check]]:right-2 [&_[data-slot=toggle-check]]:z-10"
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
            <Menu>
              <MenuTrigger size="sm" iconOnly aria-label={`Actions for ${theme.name}`}>
                <MoreHorizontalIcon aria-hidden className="size-4" />
              </MenuTrigger>
              <MenuContent>
                <MenuItem
                  onClick={() => {
                    setRenameValue(theme.name);
                    setRenameTarget(theme);
                  }}
                >
                  <PencilIcon aria-hidden className="size-3.5" /> Rename
                </MenuItem>
                <MenuItem onClick={() => onDuplicate(theme.id)}>
                  <CopyIcon aria-hidden className="size-3.5" /> Duplicate
                </MenuItem>
                <MenuItem onClick={() => onExport(theme.id)}>
                  <DownloadIcon aria-hidden className="size-3.5" /> Export JSON
                </MenuItem>
                <MenuSeparator />
                <MenuItem className="text-destructive" onClick={() => setDeleteTarget(theme)}>
                  <Trash2Icon aria-hidden className="size-3.5" /> Delete
                </MenuItem>
              </MenuContent>
            </Menu>
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

// Small transient-copy button for the active skin's pack install command.
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
      <span className="text-[11px] font-medium text-muted-foreground">Skin</span>
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
        <Button type="button" variant="surface" size="sm" active={sourceOpen} className="w-full" onClick={onViewSource}>
          <FileCode2Icon aria-hidden className="size-3.5" />
          View {activeMeta.label} source
        </Button>
      ) : null}
      {installCommand ? (
        <div className="flex flex-col gap-2 rounded-[8px] border border-border bg-muted/35 p-3">
          <span className="text-[10px] font-medium text-muted-foreground">Install {activeMeta.label} as a pack</span>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate font-mono text-[10px] text-foreground">{installCommand}</code>
            <CommandCopyButton value={installCommand} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
