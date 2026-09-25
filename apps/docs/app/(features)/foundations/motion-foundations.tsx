"use client";

import { PlayIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { contractTokenNames, SpecimenGroup, TokenValueList } from "./specimen/specimen";

const MOTION_TOKENS = contractTokenNames("motion");
const DURATIONS = MOTION_TOKENS.filter((name) => name.startsWith("--duration-"));
const EASINGS = MOTION_TOKENS.filter((name) => name.startsWith("--ease-"));

function MotionTrack({ duration, easing, arrived }: { duration: string; easing: string; arrived: boolean }) {
  return (
    <div className="grid gap-1.5">
      <span className="font-mono text-micro text-muted-foreground">
        {duration} · {easing}
      </span>
      <div className="relative h-6 rounded-full bg-muted">
        <span
          className="absolute top-1 size-4 rounded-full bg-primary"
          style={{
            insetInlineStart: arrived ? "calc(100% - 1.25rem)" : "0.25rem",
            transitionProperty: "inset-inline-start",
            transitionDuration: `var(${duration})`,
            transitionTimingFunction: `var(${easing})`,
          }}
        />
      </div>
    </div>
  );
}

export function MotionFoundations() {
  const [arrived, setArrived] = useState(false);
  return (
    <div className="grid min-w-0">
      <SpecimenGroup title="Tempo × curve">
        <div className="docs-panel grid gap-4 p-4">
          <div>
            <Button onClick={() => setArrived((current) => !current)}>
              <PlayIcon />
              Play
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {EASINGS.flatMap((easing) =>
              DURATIONS.map((duration) => (
                <MotionTrack key={`${easing}${duration}`} duration={duration} easing={easing} arrived={arrived} />
              )),
            )}
          </div>
        </div>
      </SpecimenGroup>
      <SpecimenGroup title="Values">
        <TokenValueList names={MOTION_TOKENS} />
      </SpecimenGroup>
    </div>
  );
}
