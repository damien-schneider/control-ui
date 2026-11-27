"use client";

import { createContext, type ReactNode, use, useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { Text } from "@/components/control-ui/ui/typography";
import { type PinId, pins } from "./acme-skin";

export type PinAnchors = {
  get: (pin: PinId) => HTMLElement | undefined;
  register: (pin: PinId, element: HTMLElement) => () => void;
  subscribe: (listener: () => void) => () => void;
};

type PinState = {
  active: PinId | null;
  locked: PinId | null;
  preview: (pin: PinId | null) => void;
  toggle: (pin: PinId) => void;
  anchors: PinAnchors;
};

function createPinAnchors(): PinAnchors {
  const elements = new Map<PinId, HTMLElement>();
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) listener();
  };
  return {
    get: (pin) => elements.get(pin),
    register(pin, element) {
      elements.set(pin, element);
      notify();
      return () => {
        if (elements.get(pin) === element) elements.delete(pin);
        notify();
      };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const PinContext = createContext<PinState | null>(null);

export function PinProvider({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState<PinId | null>(null);
  const [locked, setLocked] = useState<PinId | null>(null);
  const [anchors] = useState(createPinAnchors);
  const state: PinState = {
    active: hovered ?? locked,
    locked,
    preview: setHovered,
    toggle: (pin) => setLocked((current) => (current === pin ? null : pin)),
    anchors,
  };
  return <PinContext value={state}>{children}</PinContext>;
}

export function usePins(): PinState {
  const state = use(PinContext);
  if (!state) throw new Error("usePins must be used within a PinProvider");
  return state;
}

function revealCounterpart(pin: PinId, side: "code" | "preview", anchors: PinAnchors) {
  const counterpart =
    side === "code" ? anchors.get(pin) : document.getElementById("skin-studio")?.querySelector(`[data-pin-line="${pin}"]`);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  counterpart?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reducedMotion ? "auto" : "smooth" });
}

export function PinButton({ pin, side, className }: { pin: PinId; side: "code" | "preview"; className?: string }) {
  const { active, locked, preview, toggle, anchors } = usePins();
  const meta = pins.find((candidate) => candidate.id === pin);
  if (!meta) return null;
  const label =
    side === "code"
      ? `Pin ${pin}: ${meta.match} in ${meta.file} sets the ${meta.part}`
      : `Pin ${pin}: ${meta.part}, set by ${meta.match} in ${meta.file}`;
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={locked === pin}
      data-active={active === pin}
      data-pin-end={side === "code" ? pin : undefined}
      onClick={() => {
        if (locked !== pin) revealCounterpart(pin, side, anchors);
        toggle(pin);
      }}
      onFocus={() => preview(pin)}
      onBlur={() => preview(null)}
      className={cn(
        "relative grid size-4.5 shrink-0 cursor-pointer place-items-center rounded-full bg-(--home-skin-studio-pin) text-white outline-0 outline-(--home-skin-studio-pin)/30 outline-solid transition-[outline-width] duration-(--duration-fast) ease-(--ease-standard) after:absolute focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[active=true]:outline-4",
        side === "code" ? "after:-inset-x-3 after:-inset-y-0.75" : "after:-inset-3",
        className,
      )}
    >
      <Text size="micro" weight="bold" numeric>
        {pin}
      </Text>
    </button>
  );
}

export function PinLine({ pin, children }: { pin: PinId; children: ReactNode }) {
  const { active, preview } = usePins();
  return (
    <li
      data-pin-line={pin}
      data-active={active === pin}
      onPointerEnter={() => preview(pin)}
      onPointerLeave={() => preview(null)}
      className="flex h-6 items-center bg-(--home-skin-studio-pin)/7 shadow-[inset_2px_0_0_transparent] transition-[background-color,box-shadow] duration-(--duration-fast) ease-(--ease-standard) data-[active=true]:bg-(--home-skin-studio-pin)/16 data-[active=true]:shadow-[inset_2px_0_0_var(--home-skin-studio-pin)] @md/skin-editor:pr-4"
    >
      {children}
    </li>
  );
}

export function PinTarget({
  pin,
  part,
  anchor = true,
  hover = true,
  className,
  children,
}: {
  pin: PinId;
  part?: string;
  anchor?: boolean;
  hover?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const { active, preview, anchors } = usePins();
  return (
    <div
      ref={anchor ? (element) => (element ? anchors.register(pin, element) : undefined) : undefined}
      data-pin-part={part}
      data-active={active === pin}
      onPointerOver={hover ? () => preview(pin) : undefined}
      onPointerOut={
        hover
          ? (event) => {
              const next = event.relatedTarget;
              if (!(next instanceof Node && event.currentTarget.contains(next))) preview(null);
            }
          : undefined
      }
      className={cn("relative", className)}
    >
      {children}
    </div>
  );
}
