"use client";

import { useEffect, useState } from "react";
import { SourceTabs } from "@/app/(features)/components/source";
import type { DocsSkinPage, SkinMetaId, SourceFile } from "@/app/(features)/model/types";
import { Button } from "@/components/control-ui/ui/button";
import {
  DockablePanel,
  DockablePanelActions,
  DockablePanelClose,
  DockablePanelContent,
  DockablePanelDock,
  DockablePanelDragHandle,
  DockablePanelHeader,
  DockablePanelTitle,
  DockablePanelToggle,
} from "@/components/control-ui/ui/dockable-panel";
import { Spinner } from "@/components/control-ui/ui/spinner";
import { useThemeDrawer } from "@/components/theme-drawer-context";

type SourceLoad =
  | { skin: SkinMetaId; requestVersion: number; status: "ready"; files: SourceFile[] }
  | { skin: SkinMetaId; requestVersion: number; status: "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readSourceFile(value: unknown): SourceFile | null {
  if (!isRecord(value) || typeof value.label !== "string" || typeof value.path !== "string" || typeof value.code !== "string") return null;
  if (value.slot !== undefined && typeof value.slot !== "string") return null;
  return { label: value.label, path: value.path, code: value.code, slot: value.slot };
}

function readCoreSkinFiles(payload: unknown): SourceFile[] | null {
  if (!isRecord(payload) || payload.type !== "item" || !isRecord(payload.data) || !Array.isArray(payload.data.files)) return null;

  const files = payload.data.files.map(readSourceFile);
  if (files.some((file) => file === null)) return null;

  return files.filter(
    (file): file is SourceFile => file !== null && (file.slot === "theme" || file.slot === "skin" || file.slot === "config"),
  );
}

async function fetchCoreSkinFiles(skin: SkinMetaId, bypassCache: boolean, signal: AbortSignal) {
  const response = await fetch(`/api/registry/${skin}`, {
    signal,
    cache: bypassCache ? "no-store" : "default",
  });
  if (!response.ok) throw new Error("Source request failed");

  const payload: unknown = await response.json();
  signal.throwIfAborted();
  const files = readCoreSkinFiles(payload);
  if (!files || files.length === 0) throw new Error("Source response was invalid");
  return files;
}

export function SkinSourcePanel({ skins }: { skins: DocsSkinPage[] }) {
  const { skinSource, closeSkinSource, skinSourcePlacement, setSkinSourcePlacement } = useThemeDrawer();
  const [load, setLoad] = useState<SourceLoad | null>(null);
  const [retry, setRetry] = useState<{ skin: SkinMetaId; count: number } | null>(null);
  const requestVersion = retry?.skin === skinSource ? retry.count : 0;
  const skin = skins.find((item) => item.id === skinSource);

  useEffect(() => {
    if (!skinSource) return;
    const requestedSkin = skinSource;

    const controller = new AbortController();

    async function loadSource() {
      try {
        const files = await fetchCoreSkinFiles(requestedSkin, requestVersion > 0, controller.signal);
        setLoad({ skin: requestedSkin, requestVersion, status: "ready", files });
      } catch (error) {
        if (controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
        setLoad({ skin: requestedSkin, requestVersion, status: "error" });
      }
    }

    void loadSource();
    return () => controller.abort();
  }, [skinSource, requestVersion]);

  const currentLoad = load?.skin === skinSource && load.requestVersion === requestVersion ? load : null;

  function retrySource() {
    if (!skinSource) return;
    setRetry((current) => ({
      skin: skinSource,
      count: current?.skin === skinSource ? current.count + 1 : 1,
    }));
  }

  return (
    <DockablePanel
      open={skinSource !== null}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeSkinSource();
      }}
      placement={skinSourcePlacement}
      onPlacementChange={setSkinSourcePlacement}
      aria-label={`${skin?.label ?? "Skin"} source`}
      className="md:w-[min(44rem,calc(70%_-_1.125rem))]"
    >
      <DockablePanelHeader>
        <DockablePanelDragHandle>
          <DockablePanelTitle>{skin?.label ?? "Skin"} source</DockablePanelTitle>
        </DockablePanelDragHandle>
        <DockablePanelActions>
          <DockablePanelDock placement="left" />
          <DockablePanelDock placement="right" />
          <DockablePanelToggle />
          <DockablePanelClose />
        </DockablePanelActions>
      </DockablePanelHeader>
      <DockablePanelContent padding="none">
        {currentLoad?.status === "ready" ? <SourceTabs files={currentLoad.files} /> : null}
        {!currentLoad ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-label text-muted-foreground">
            <Spinner />
            Loading source
          </div>
        ) : null}
        {currentLoad?.status === "error" ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-label text-muted-foreground">The skin source could not be loaded.</p>
            <Button variant="surface" size="sm" onClick={retrySource}>
              Try again
            </Button>
          </div>
        ) : null}
      </DockablePanelContent>
    </DockablePanel>
  );
}
