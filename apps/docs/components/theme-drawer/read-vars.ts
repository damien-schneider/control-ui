"use client";

import { THEME_CONTRACT } from "@/src/registry/lib/theme-contract";
import type { TokenValues } from "./types";

// Reads EVERY contract token off <html>'s computed style — active skin's theme.css (folded over base :root) + editor's inline overrides, resolved for current light/dark mode.
// Controls display live theme WITHOUT duplicating skin values in JS — CSS stays single source of truth.
// Absent tokens omitted; their control falls back to raw text input.

// getComputedStyle returns a custom property's SPECIFIED value (unregistered props aren't fully resolved): lengths keep authored unit, derived tokens can come back as calc() with var() substituted.
// resolveLengthPx below turns those into a concrete pixel number for sliders.
export function readContractTokens(): TokenValues {
  if (typeof window === "undefined") return {};
  const cs = getComputedStyle(document.documentElement);
  const out: TokenValues = {};
  for (const token of THEME_CONTRACT) {
    const value = cs.getPropertyValue(token.name).trim();
    if (value) out[token.name] = value;
  }
  return out;
}

let lengthProbe: HTMLDivElement | null = null;

// Resolves any CSS <length> (12px, 0.75rem, calc() chain a derived token hydrates as) to concrete pixels for slider display.
// Plain numbers/px parse directly; everything else goes through a hidden probe element whose width the browser computes.
// Returns null for non-lengths (keyword, color, negative), caller falls back to text input.
export function resolveLengthPx(value: string): number | null {
  const v = value.trim();
  if (!v) return null;
  const direct = v.match(/^(-?\d*\.?\d+)(px)?$/);
  if (direct) return Number.parseFloat(direct[1]);
  if (typeof document === "undefined") return null;
  const rem = v.match(/^(-?\d*\.?\d+)rem$/);
  if (rem) {
    const rootPx = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return Number.parseFloat(rem[1]) * rootPx;
  }
  if (!lengthProbe) {
    lengthProbe = document.createElement("div");
    lengthProbe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;height:0";
    document.body.appendChild(lengthProbe);
  }
  lengthProbe.style.width = "";
  lengthProbe.style.width = v;
  if (!lengthProbe.style.width) return null; // browser rejected the value — not a length
  const px = Number.parseFloat(getComputedStyle(lengthProbe).width);
  return Number.isNaN(px) ? null : px;
}
