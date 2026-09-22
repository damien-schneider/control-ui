"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { useId, useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { ProgressiveBlur, type ProgressiveBlurSide } from "@/components/control-ui/ui/progressive-blur";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Switch } from "@/components/control-ui/ui/switch";

const blurSides: { side: ProgressiveBlurSide; label: string }[] = [
  { side: "top", label: "Top" },
  { side: "bottom", label: "Bottom" },
  { side: "inline-start", label: "Start" },
  { side: "inline-end", label: "End" },
];

const destinations = [
  "Kyoto, Japan",
  "Bergen, Norway",
  "Porto, Portugal",
  "Vancouver, Canada",
  "Copenhagen, Denmark",
  "Seoul, South Korea",
  "Edinburgh, Scotland",
  "Ljubljana, Slovenia",
  "Wellington, New Zealand",
  "Marrakesh, Morocco",
  "Buenos Aires, Argentina",
  "Stockholm, Sweden",
];

export function PrimitiveProgressiveBlurExample() {
  const visibilityId = useId();
  const [side, setSide] = useState<ProgressiveBlurSide>("bottom");
  const [visible, setVisible] = useState(true);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <fieldset className="flex gap-1">
          <legend className="sr-only">Blur edge</legend>
          {blurSides.map((option) => (
            <Button
              key={option.side}
              active={side === option.side}
              aria-pressed={side === option.side}
              onClick={() => setSide(option.side)}
            >
              {option.label}
            </Button>
          ))}
        </fieldset>
        <label htmlFor={visibilityId} className="flex items-center gap-2 text-caption">
          <Switch id={visibilityId} checked={visible} onCheckedChange={setVisible} aria-label="Show blur" />
          Blur
        </label>
      </div>
      <div className="relative isolate overflow-hidden rounded-(--radius-panel) border border-border bg-background">
        <div className="flex flex-col gap-4 p-6">
          <p className="text-heading">A little further away.</p>
          <p className="text-body text-muted-foreground">Details soften as they approach the edge. The surface stays transparent.</p>
          <div
            aria-hidden="true"
            className="h-40 bg-[repeating-conic-gradient(var(--primary)_0%_25%,var(--muted)_0%_50%)] bg-size-[48px_48px]"
          />
          <p className="text-caption text-muted-foreground">Soft light. Sharp details. Room to breathe.</p>
        </div>
        <ProgressiveBlur side={side} visible={visible} style={{ "--cui-progressive-blur-size": "50%" }} />
      </div>
    </div>
  );
}

export function ProgressiveBlurScrollExample() {
  const blurId = useId();
  const maskId = useId();
  const [blur, setBlur] = useState(true);
  const [mask, setMask] = useState(true);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex gap-5">
        <label htmlFor={blurId} className="flex items-center gap-2 text-caption">
          <Switch id={blurId} checked={blur} onCheckedChange={setBlur} aria-label="Progressive blur" />
          Blur
        </label>
        <label htmlFor={maskId} className="flex items-center gap-2 text-caption">
          <Switch id={maskId} checked={mask} onCheckedChange={setMask} aria-label="Edge fade" />
          Fade
        </label>
      </div>
      <ScrollArea blur={blur} mask={mask} lockAxis="x" maxHeight="260px" viewportProps={{ "aria-label": "Places to explore" }}>
        <ol className="flex flex-col gap-1 p-4">
          {destinations.map((destination, index) => (
            <li key={destination}>
              <Button className="w-full justify-start gap-3" variant="ghost">
                <span className="tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                {destination}
              </Button>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </div>
  );
}

export function ProgressiveBlurHorizontalExample() {
  return (
    <DirectionProvider direction="rtl">
      <ScrollArea dir="rtl" blur lockAxis="y" className="w-full max-w-md" viewportProps={{ "aria-label": "Right-to-left destinations" }}>
        <div className="flex w-max gap-3 p-4">
          {destinations.map((destination) => (
            <Button key={destination} variant="surface" className="shrink-0">
              {destination}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </DirectionProvider>
  );
}
