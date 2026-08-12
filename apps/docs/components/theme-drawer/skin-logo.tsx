"use client";

import Image from "next/image";
import { cn } from "@/components/control-ui/lib/cn";
import type { SkinId } from "./types";

type SkinLogoSize = "sm" | "lg";

const skinLogoClassNames = {
  sm: "size-4 shrink-0",
  lg: "mt-0.5 size-7 shrink-0",
} satisfies Record<SkinLogoSize, string>;

function AppleLogo({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <path fill="currentColor" d="M16.1 6.5c.6-.8 1-1.8.9-2.8-1 .1-2.1.7-2.8 1.5-.6.7-1.1 1.7-1 2.7 1.1.1 2.2-.6 2.9-1.4Z" />
      <path
        fill="currentColor"
        d="M22.5 18.6c-.5 1.1-.8 1.6-1.4 2.6-.9 1.4-2.1 3.2-3.7 3.2-1.3 0-1.7-.9-3.6-.9s-2.3.9-3.7.9c-1.5 0-2.7-1.6-3.6-3-2.5-3.9-2.8-8.5-1.2-11 1.1-1.8 2.9-2.8 4.6-2.8 1.8 0 2.9 1 4.3 1 1.4 0 2.3-1 4.3-1 1.5 0 3.1.8 4.2 2.2-3.7 2-3.1 7.2-.2 8.8Z"
      />
    </svg>
  );
}

function WindowsXpLogo({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <path d="M3.5 6.2 12.4 4.5v8.2H3.5Z" fill="oklch(64% 0.2 145)" />
      <path d="M14 4.2 24.5 2.5v10.2H14Z" fill="oklch(62% 0.23 28)" />
      <path d="M3.5 14.2h8.9v8.2l-8.9-1.6Z" fill="oklch(72% 0.17 85)" />
      <path d="M14 14.2h10.5v10.3L14 22.7Z" fill="oklch(61% 0.19 250)" />
      <path d="M12.9 4.5v18.1M3.5 13.4h21" stroke="oklch(100% 0 0 / 0.75)" strokeWidth="1.1" />
    </svg>
  );
}

function LiquidMetalLogo({ className }: { className: string }) {
  return (
    <span
      className={cn(className, "rounded-full shadow-[inset_0_1px_2px_oklch(100%_0_0_/_0.8),inset_0_-2px_4px_oklch(35%_0.03_250_/_0.35)]")}
      style={{
        background:
          "conic-gradient(from 145deg, oklch(92% 0.04 245), oklch(62% 0.08 270), oklch(99% 0 0), oklch(52% 0.06 230), oklch(92% 0.04 245))",
      }}
      aria-hidden="true"
    />
  );
}

function RigLogo({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <path d="M5 6h18v16H5Z" fill="oklch(96% 0.01 95)" stroke="oklch(18% 0.02 60)" strokeWidth="2" />
      <path d="M8 9h12M8 14h12M8 19h7" stroke="oklch(62% 0.2 25)" strokeLinecap="square" strokeWidth="2" />
    </svg>
  );
}

function FlatLogo({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <path d="M6 6h16v16H6Z" fill="oklch(92% 0.01 250)" stroke="oklch(22% 0.02 250)" strokeWidth="2" />
      <path d="M10 10h8v8h-8Z" fill="oklch(22% 0.02 250)" />
    </svg>
  );
}

function LinearLogo({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect x="2" y="2" width="24" height="24" rx="6.5" fill="oklch(0.5674 0.1585 275.206)" />
      <g stroke="oklch(1 0 0)" strokeLinecap="round" strokeWidth="1.9">
        <path d="M6 15.5 12.5 22" />
        <path d="M6 10.5 17.5 22" />
        <path d="M6.5 6 22 21.5" />
      </g>
    </svg>
  );
}

function CuicuiLogo({ className }: { className: string }) {
  return (
    <Image src="/logos/cuicui-logo.png" alt="" aria-hidden="true" width={28} height={28} className={cn(className, "object-contain")} />
  );
}

function RefinedLogo({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <path d="M7 14h14M14 7v14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M9 9h10v10H9Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function SkinLogo({ id, size = "lg" }: { id: SkinId; size?: SkinLogoSize }) {
  const className = skinLogoClassNames[size];
  if (id === "modern-apple") return <AppleLogo className={className} />;
  if (id === "xp") return <WindowsXpLogo className={className} />;
  if (id === "liquid-metal") return <LiquidMetalLogo className={className} />;
  if (id === "rig") return <RigLogo className={className} />;
  if (id === "flat") return <FlatLogo className={className} />;
  if (id === "cuicui") return <CuicuiLogo className={className} />;
  if (id === "linear") return <LinearLogo className={className} />;
  if (id === "refined") return <RefinedLogo className={className} />;
  return null;
}
