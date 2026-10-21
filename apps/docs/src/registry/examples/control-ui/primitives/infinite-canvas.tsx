"use client";

import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import {
  InfiniteCanvas,
  InfiniteCanvasContent,
  InfiniteCanvasControls,
  InfiniteCanvasItem,
  InfiniteCanvasItemHandle,
  type InfiniteCanvasPoint,
} from "@/components/control-ui/ui/infinite-canvas";
import { Input } from "@/components/control-ui/ui/input";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Text } from "@/components/control-ui/ui/typography";

type PreviewKind = "sign-in" | "release-notes" | "handoff";

const initialCards: { id: PreviewKind; title: string; x: number; y: number }[] = [
  { id: "sign-in", title: "Sign-in form", x: 0, y: 0 },
  { id: "release-notes", title: "Release notes", x: 256, y: 72 },
  { id: "handoff", title: "Build handoff", x: 32, y: 272 },
];

const releaseNotes = Array.from({ length: 12 }, (_, index) => `Release 1.${12 - index} shipped`);

function CardPreview({ kind }: { kind: PreviewKind }) {
  if (kind === "sign-in") {
    return (
      <form className="flex flex-col gap-2" onSubmit={(event) => event.preventDefault()}>
        <Input aria-label="Email" type="email" placeholder="you@example.com" />
        <Button type="submit" size="sm" variant="solid" tone="primary">
          Continue
        </Button>
      </form>
    );
  }
  if (kind === "release-notes") {
    return (
      <ScrollArea className="h-32">
        <ul className="flex flex-col gap-1 pe-3">
          {releaseNotes.map((note) => (
            <Text as="li" key={note} size="caption">
              {note}
            </Text>
          ))}
        </ul>
      </ScrollArea>
    );
  }
  return (
    <Text as="p" size="caption" tone="muted">
      Contracts, states, and acceptance checks for the first build.
    </Text>
  );
}

export function PrimitiveInfiniteCanvasExample() {
  const [cards, setCards] = useState(initialCards);

  function moveCard(id: PreviewKind, position: InfiniteCanvasPoint) {
    setCards((current) => current.map((card) => (card.id === id ? { ...card, ...position } : card)));
  }

  return (
    <div className="w-full sm:p-6">
      <InfiniteCanvas className="h-140 w-full sm:h-150" defaultTransform={{ x: 24, y: 72, scale: 1 }}>
        <InfiniteCanvasContent>
          {cards.map((card) => (
            <InfiniteCanvasItem key={card.id} x={card.x} y={card.y} className="flex w-56 flex-col gap-1.5">
              <div className="flex items-center gap-1">
                <InfiniteCanvasItemHandle aria-label={`Move ${card.title}`} onPositionChange={(position) => moveCard(card.id, position)} />
                <Text as="span" size="caption" tone="muted" className="truncate">
                  {card.title}
                </Text>
              </div>
              <div className="rounded-[var(--radius-panel)] bg-card p-4 text-card-foreground shadow-sm ring-1 ring-border">
                <CardPreview kind={card.id} />
              </div>
            </InfiniteCanvasItem>
          ))}
        </InfiniteCanvasContent>
        <Text
          as="div"
          size="caption"
          tone="muted"
          className="pointer-events-none absolute top-(--cui-infinite-canvas-padding) left-(--cui-infinite-canvas-padding) rounded-[var(--radius-sm)] bg-card/90 px-2.5 py-1.5 shadow-sm ring-1 ring-border backdrop-blur-sm"
        >
          Drag the background or hold Space to pan · ⌘-scroll or pinch to zoom · 1 to fit
        </Text>
        <InfiniteCanvasControls />
      </InfiniteCanvas>
    </div>
  );
}
