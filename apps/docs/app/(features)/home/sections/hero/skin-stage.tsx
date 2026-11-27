"use client";

import { ChevronsUpDownIcon, GripHorizontalIcon } from "lucide-react";
import { type KeyboardEvent, type PointerEvent, startTransition, useEffect, useRef, useState } from "react";
import { BlockPreview } from "@/app/(features)/components/previews";
import { stageSceneId } from "@/app/(features)/home/home-content";
import { AnnotationTag, annotationTagClassName } from "@/app/(features)/home/shared/annotation-tag";
import { ArrowLink } from "@/app/(features)/home/shared/arrow-link";
import { IsolatedSkinScope } from "@/app/(features)/home/shared/isolated-skin-scope";
import type { SkinMetaId } from "@/app/(features)/model/types";
import { useDocsIntegration } from "@/app/(features)/page-templates/integration";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";
import { Text } from "@/components/control-ui/ui/typography";
import { DEFAULT_SKIN_ID } from "@/components/theme";
import { SKIN_META_BY_ID } from "@/components/theme-drawer/presets";
import { useThemeRuntime } from "@/components/theme-drawer/theme-runtime-context";

const lensSkinIds = ["refined", "modern-apple"] as const satisfies readonly SkinMetaId[];

type LensSkinId = (typeof lensSkinIds)[number];

const KEY_STEP = 0.08;

const keySteps: Partial<Record<string, { x: number; y: number }>> = {
  ArrowLeft: { x: -KEY_STEP, y: 0 },
  ArrowRight: { x: KEY_STEP, y: 0 },
  ArrowUp: { x: 0, y: -KEY_STEP },
  ArrowDown: { x: 0, y: KEY_STEP },
};

function isLensSkinId(value: string): value is LensSkinId {
  return lensSkinIds.some((id) => id === value);
}

function unitFraction(offset: number, range: number) {
  return range > 0 ? Math.min(1, Math.max(0, offset / range)) : 0;
}

type LensDrag = { originX: number; originY: number; rangeX: number; rangeY: number };

function useLens() {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<LensDrag | null>(null);

  function place(x: number, y: number) {
    stageRef.current?.style.setProperty("--lens-fx", String(x));
    stageRef.current?.style.setProperty("--lens-fy", String(y));
  }

  function measure() {
    const stage = stageRef.current?.getBoundingClientRect();
    const frame = frameRef.current?.getBoundingClientRect();
    if (!(stage && frame)) return null;
    return { stage, frame, rangeX: stage.width - frame.width, rangeY: stage.height - frame.height };
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    const box = measure();
    if (!box || event.button !== 0 || (event.target instanceof Element && event.target.closest("label"))) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    stageRef.current?.toggleAttribute("data-dragging", true);
    drag.current = {
      originX: box.stage.left + event.clientX - box.frame.left,
      originY: box.stage.top + event.clientY - box.frame.top,
      rangeX: box.rangeX,
      rangeY: box.rangeY,
    };
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const active = drag.current;
    if (!active) return;
    place(unitFraction(event.clientX - active.originX, active.rangeX), unitFraction(event.clientY - active.originY, active.rangeY));
  }

  function endDrag() {
    drag.current = null;
    stageRef.current?.removeAttribute("data-dragging");
  }

  function nudge(event: KeyboardEvent<HTMLButtonElement>) {
    const step = keySteps[event.key];
    const box = measure();
    if (!(step && box)) return;
    event.preventDefault();
    const scale = event.shiftKey ? 3 : 1;
    place(
      unitFraction(box.frame.left - box.stage.left + step.x * scale * box.rangeX, box.rangeX),
      unitFraction(box.frame.top - box.stage.top + step.y * scale * box.rangeY, box.rangeY),
    );
  }

  return {
    stageRef,
    frameProps: {
      ref: frameRef,
      onPointerDown: startDrag,
      onPointerMove: moveDrag,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onLostPointerCapture: endDrag,
    },
    nudge,
  };
}

function LensSkinPicker({ value, onChange }: { value: LensSkinId; onChange: (id: LensSkinId) => void }) {
  return (
    <label
      className={cn(
        annotationTagClassName,
        "absolute bottom-full left-6 mb-1.5 cursor-pointer transition-[filter] duration-(--duration-fast) ease-(--ease-standard) hover:brightness-110 has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",
      )}
    >
      <Text size="caption" weight="medium" mono className="whitespace-nowrap">
        data-skin="{value}"
      </Text>
      <ChevronsUpDownIcon aria-hidden="true" className="size-3 opacity-80" />
      <select
        aria-label="Skin inside the lens"
        value={value}
        onChange={(event) => {
          if (isLensSkinId(event.target.value)) onChange(event.target.value);
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {lensSkinIds.map((id) => (
          <option key={id} value={id}>
            {SKIN_META_BY_ID[id].label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SkinStage() {
  const integration = useDocsIntegration();
  const pageSkin = useThemeRuntime().t.skin;
  const lens = useLens();
  const hostsLens = pageSkin === DEFAULT_SKIN_ID;
  const [lensMounted, setLensMounted] = useState(false);
  const [lensSkin, setLensSkin] = useState<LensSkinId>(lensSkinIds[0]);

  useEffect(() => {
    startTransition(() => setLensMounted(true));
  }, []);

  return (
    <figure className="grid min-w-0 gap-4">
      <div ref={lens.stageRef} className="home-lens-stage relative isolate mt-7 min-w-0">
        <AnnotationTag className="absolute bottom-full left-0 mb-1.5">data-skin="{pageSkin}"</AnnotationTag>
        <div inert className="grid min-h-[max(37.5rem,min(45rem,80vh))] select-none">
          <BlockPreview blockId={stageSceneId} integration={integration} />
        </div>
        {hostsLens && lensMounted ? (
          <>
            <div
              aria-hidden="true"
              className="home-lens-halo pointer-events-none absolute z-10 bg-background/60 backdrop-blur-xs transition-opacity duration-(--duration-slow) ease-(--ease-standard) starting:opacity-0"
            />
            <IsolatedSkinScope
              skinId={lensSkin}
              inert
              className="home-lens-view pointer-events-none absolute inset-0 z-10 select-none transition-opacity duration-(--duration-slow) ease-(--ease-standard) starting:opacity-0"
            >
              <BlockPreview blockId={stageSceneId} integration={integration} />
            </IsolatedSkinScope>
            <div
              {...lens.frameProps}
              className="home-lens-frame absolute z-10 cursor-grab touch-pan-y shadow-pop outline-[1.5px] outline-info transition-[opacity,box-shadow] duration-(--duration-slow) ease-(--ease-standard) in-data-dragging:cursor-grabbing in-data-dragging:shadow-modal starting:opacity-0"
            >
              <LensSkinPicker value={lensSkin} onChange={setLensSkin} />
              <Button
                variant="surface"
                size="xs"
                iconOnly
                aria-label="Move the skin lens"
                aria-description="Drag, or use the arrow keys."
                aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"
                className="absolute top-full left-1/2 w-11 -translate-x-1/2 -translate-y-1/2 cursor-[inherit] touch-none"
                onKeyDown={lens.nudge}
              >
                <GripHorizontalIcon aria-hidden="true" />
              </Button>
            </div>
          </>
        ) : null}
      </div>
      <figcaption className="flex min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <Text size="label" tone="muted">
          {hostsLens ? (
            <>
              The Team chat template, rendered twice. Inside the lens, only{" "}
              <Text as="code" size="label" mono>
                data-skin
              </Text>{" "}
              changes.
            </>
          ) : (
            "The Team chat template in this page's skin. Pick another skin in the header and every component follows."
          )}
        </Text>
        <ArrowLink href={`/templates/${stageSceneId}`}>Open Team chat</ArrowLink>
      </figcaption>
    </figure>
  );
}
