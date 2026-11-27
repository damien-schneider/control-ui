"use client";

import { lazy, Suspense, useState } from "react";
import { IntentLink } from "@/app/(features)/client/intent-link";
import { type ComponentCategory, capitalize, countWord } from "@/app/(features)/home/home-content";
import { annotationTagClassName } from "@/app/(features)/home/shared/annotation-tag";
import { MountWhenNear } from "@/app/(features)/home/shared/mount-when-near";
import { cn } from "@/components/control-ui/lib/cn";
import { Text } from "@/components/control-ui/ui/typography";
import { AtlasIndex, InViewDot } from "./atlas-index";
import { ATLAS_DEFAULT_VIEW, ATLAS_OPENING_VIEWPORT, buildAtlasNodes, nodeIdsWithin, visibleWorld } from "./atlas-layout";

const AtlasCanvas = lazy(() => import("./canvas/atlas-canvas").then((module) => ({ default: module.AtlasCanvas })));

export function AtlasExplorer({
  categories,
  kitCount,
  templateCount,
}: {
  categories: readonly ComponentCategory[];
  kitCount: number;
  templateCount: number;
}) {
  const nodes = buildAtlasNodes(categories.flatMap((category) => category.items));
  const [inView, setInView] = useState<ReadonlySet<string>>(
    () => new Set(nodeIdsWithin(nodes, visibleWorld(ATLAS_DEFAULT_VIEW, ATLAS_OPENING_VIEWPORT))),
  );

  function followInView(ids: string[]) {
    setInView((current) => (ids.length === current.size && ids.every((id) => current.has(id)) ? current : new Set(ids)));
  }

  return (
    <div className="grid min-w-0 gap-10 @3xl/home:gap-12">
      <div className="grid min-w-0 gap-3.5">
        <div className="relative min-w-0">
          <MountWhenNear className="h-[min(72svh,36rem)] overflow-hidden rounded-2xl border border-border bg-muted/50 @3xl/home:h-190">
            <Suspense fallback={null}>
              <AtlasCanvas nodes={nodes} inView={inView} onInViewChange={followInView} />
            </Suspense>
          </MountWhenNear>
          <IntentLink
            href="/components/infinite-canvas"
            className={cn(
              annotationTagClassName,
              "absolute top-3 left-3 outline-none transition-opacity duration-(--duration-fast) ease-(--ease-standard) hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring @3xl/home:top-4 @3xl/home:left-4",
            )}
          >
            <Text size="caption" weight="medium" mono>
              InfiniteCanvas
            </Text>
          </IntentLink>
        </div>
        <div className="flex min-w-0 flex-col gap-2 @3xl/home:flex-row @3xl/home:items-center @3xl/home:justify-between">
          <Text as="p" size="label" tone="muted">
            {capitalize(countWord(inView.size))} of {nodes.length} in view. The canvas and its toolbar are two more.
          </Text>
          <span className="inline-flex items-center gap-2">
            <InViewDot />
            <Text size="label" tone="muted">
              in view on the canvas
            </Text>
          </span>
        </div>
      </div>
      <AtlasIndex categories={categories} inView={inView} kitCount={kitCount} templateCount={templateCount} />
    </div>
  );
}
