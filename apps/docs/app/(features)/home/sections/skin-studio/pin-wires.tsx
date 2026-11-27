"use client";

import { type CSSProperties, type ReactNode, type RefObject, useEffect, useRef, useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { type PinId, pins } from "./acme-skin";
import { PinProvider, usePins } from "./pin-context";

type Mark = { kind: "edge" | "ring" | "corner"; offset: number; radius: number };

type Box = { x: number; y: number; width: number; height: number; radius: number };

type Wire = { id: PinId; kind: Mark["kind"]; box: Box; dotX: number; dotY: number; path: string };

const marks: Record<PinId, Mark> = {
  1: { kind: "edge", offset: 6, radius: 8 },
  2: { kind: "edge", offset: 6, radius: 8 },
  3: { kind: "corner", offset: 5, radius: 6 },
  4: { kind: "edge", offset: 7, radius: 8 },
  5: { kind: "ring", offset: 5, radius: 8 },
  6: { kind: "ring", offset: 3, radius: 7 },
  7: { kind: "ring", offset: 5, radius: Number.POSITIVE_INFINITY },
  8: { kind: "ring", offset: 5, radius: Number.POSITIVE_INFINITY },
};

const cornerReach = 26;
const cornerDrop = 11;
const bend = 8;

function snap(value: number): number {
  return Math.round(value * 2) / 2;
}

function wirePath(startX: number, startY: number, lane: number, endX: number, endY: number): string {
  const rise = endY - startY;
  const radius = Math.min(bend, Math.abs(rise) / 2);
  if (radius < 1) return `M${startX} ${startY}H${endX}`;
  const turn = Math.sign(rise) * radius;
  return `M${startX} ${startY}H${lane - radius}Q${lane} ${startY} ${lane} ${startY + turn}V${endY - turn}Q${lane} ${endY} ${lane + radius} ${endY}H${endX}`;
}

function cornerPath({ x, y, width, radius }: Box): string {
  const right = x + width;
  return `M${right - cornerReach} ${y}H${right - radius}Q${right} ${y} ${right} ${y + radius}V${y + cornerReach}`;
}

function measure(host: HTMLElement): Wire[] {
  const origin = host.getBoundingClientRect();
  const from = host.querySelector('[data-pin-lane="from"]')?.getBoundingClientRect();
  const to = host.querySelector('[data-pin-lane="to"]')?.getBoundingClientRect();
  if (!from || !to || to.left <= from.right) return [];
  const laneStart = from.right - origin.left;
  const laneStep = (to.left - from.right) / (pins.length + 1);
  const wires: Wire[] = [];
  for (const [index, pin] of pins.entries()) {
    const anchor = host.querySelector<HTMLElement>(`[data-pin-anchor="${pin.id}"]`);
    const end = host.querySelector(`[data-pin-end="${pin.id}"]`)?.getBoundingClientRect();
    const part = anchor?.dataset.pinPart;
    const element = part ? anchor?.querySelector(part) : anchor;
    const target = element?.getBoundingClientRect();
    if (!element || !target || !end || target.width === 0) continue;
    const mark = marks[pin.id];
    const height = target.height + mark.offset * 2;
    const corner = Number.parseFloat(getComputedStyle(element).borderTopRightRadius) || 0;
    const box: Box = {
      x: snap(target.left - origin.left - mark.offset),
      y: snap(target.top - origin.top - mark.offset),
      width: snap(target.width + mark.offset * 2),
      height: snap(height),
      radius: Math.min(Math.max(mark.radius, corner + mark.offset), height / 2),
    };
    const dotX = box.x + box.width;
    const dotY = snap(mark.kind === "corner" ? box.y + cornerDrop : box.y + box.height / 2);
    const endX = snap(end.left - origin.left - 3);
    const endY = snap(end.top - origin.top + end.height / 2);
    const lane = snap(laneStart + laneStep * (index + 1));
    wires.push({ id: pin.id, kind: mark.kind, box, dotX, dotY, path: wirePath(dotX, dotY, lane, endX, endY) });
  }
  return wires;
}

function PinWires({ hostRef }: { hostRef: RefObject<HTMLDivElement | null> }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [wires, setWires] = useState<Wire[]>([]);
  const { active } = usePins();

  useEffect(() => {
    const host = hostRef.current;
    const svg = svgRef.current;
    if (!host || !svg) return;
    let frame = 0;
    let signature = "";
    const update = () => {
      frame = 0;
      const next = svg.getBoundingClientRect().width === 0 ? [] : measure(host);
      const nextSignature = JSON.stringify(next);
      if (nextSignature === signature) return;
      signature = nextSignature;
      setWires(next);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    const resizes = new ResizeObserver(schedule);
    resizes.observe(host);
    for (const element of host.querySelectorAll("[data-pin-anchor], [data-pin-end], [data-pin-lane]")) resizes.observe(element);
    const mutations = new MutationObserver(schedule);
    for (const element of host.querySelectorAll("[data-pin-part]")) mutations.observe(element, { childList: true, subtree: true });
    document.fonts.addEventListener("loadingdone", schedule);
    document.fonts.ready.then(schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resizes.disconnect();
      mutations.disconnect();
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, [hostRef]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden size-full overflow-visible text-(--home-skin-studio-pin) @4xl/home:block"
    >
      {wires.map((wire) => {
        const isActive = active === wire.id;
        const isResting = wire.kind !== "ring" && !isActive;
        return (
          <g
            key={wire.id}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={isActive ? 2 : 1.5}
            className={cn(
              "transition-[opacity,stroke-width] duration-(--duration-fast) ease-(--ease-standard)",
              active !== null && !isActive && "opacity-30",
            )}
          >
            <rect
              x={wire.box.x}
              y={wire.box.y}
              width={wire.box.width}
              height={wire.box.height}
              rx={wire.box.radius}
              fill="currentColor"
              fillOpacity={isActive ? 0.08 : 0}
              className={cn(
                "transition-[opacity,fill-opacity] duration-(--duration-fast) ease-(--ease-standard)",
                isResting && "opacity-0",
              )}
            />
            {wire.kind === "corner" ? <path d={cornerPath(wire.box)} /> : null}
            <path d={wire.path} />
            <circle cx={wire.dotX} cy={wire.dotY} r={3} fill="currentColor" stroke="none" />
          </g>
        );
      })}
    </svg>
  );
}

export function PinBoard({ accent, className, children }: { accent: string; className?: string; children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const style: CSSProperties & Record<`--${string}`, string> = { "--home-skin-studio-pin": accent };
  return (
    <PinProvider>
      <div ref={hostRef} style={style} className={cn("relative", className)}>
        {children}
        <PinWires hostRef={hostRef} />
      </div>
    </PinProvider>
  );
}
