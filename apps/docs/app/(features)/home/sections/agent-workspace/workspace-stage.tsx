"use client";

import { lazy, Suspense } from "react";
import { MountWhenNear } from "@/app/(features)/home/shared/mount-when-near";
import { Skeleton } from "@/components/control-ui/ui/skeleton";
import { LevelMark } from "./level-mark";

const WorkspaceScene = lazy(() => import("./workspace-scene").then((mod) => ({ default: mod.WorkspaceScene })));

export function WorkspaceStage() {
  return (
    <LevelMark level={1} label="CodingAgentBlock" shape="frame" className="mx-2 mt-6 @4xl/home:mt-2">
      <MountWhenNear className="flex h-208 overflow-hidden rounded-2xl bg-background outline outline-border @4xl/home:h-218">
        <Suspense fallback={<Skeleton className="size-full" />}>
          <WorkspaceScene />
        </Suspense>
      </MountWhenNear>
    </LevelMark>
  );
}
