"use client";

import { useEffect, useState } from "react";

import { cn } from "@/components/control-ui/lib/cn";
import { rgbToHex } from "./color-utils";
import {
  analyzeContrast,
  type ContrastRow,
  fixTextForeground,
  maxForegroundRatio,
  offeredFixLevel,
  readVarRgb,
  TARGET_RATIO,
  type WcagLevel,
  type WcagLevels,
} from "./contrast";
import { VarTag } from "./controls";
import type { ThemeState } from "./types";

// Status semantics not theme — fixed pass/fail hues (light/dark aware); AA/AAA pill: green=cleared, red=failed, muted=unreadable.
function LevelBadge({ level, state }: { level: WcagLevel; state: "pass" | "fail" | "unknown" }) {
  return (
    <span
      title={level === "AA" ? "WCAG AA · 4.5:1" : "WCAG AAA · 7:1"}
      className={cn(
        "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide tabular-nums",
        state === "pass" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
        state === "fail" && "bg-red-500/15 text-red-700 dark:text-red-400",
        state === "unknown" && "bg-muted text-muted-foreground",
      )}
    >
      {level}
    </span>
  );
}

// Per-row fix affordance: "→ AA" (prominent) below AA; "→ AAA" (quiet upgrade) when AA clears but not AAA.
function FixChip({ level, onClick }: { level: WcagLevel; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={level === "AA" ? "Fix this pairing to WCAG AA (4.5:1)" : "Upgrade this pairing to WCAG AAA (7:1)"}
      className={cn(
        "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        level === "AA"
          ? "bg-foreground text-background hover:opacity-90"
          : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      →&nbsp;{level}
    </button>
  );
}

function levelState(levels: WcagLevels, ratio: number | null, key: WcagLevel): "pass" | "fail" | "unknown" {
  if (ratio === null) return "unknown";
  return levels[key] ? "pass" : "fail";
}

// Best ratio each row's fix can reach on its OWN surface, so a chip is only offered for a target it can actually hit (see offeredFixLevel).
// One rule for every row: how far the text token can be driven (lighter/darker) against its live background.
// Why AAA appears on near-black surface but not mid-tone — no dead buttons, no per-skin special-casing.
function computeReach(rows: ContrastRow[]): Record<string, number> {
  const reach: Record<string, number> = {};
  for (const r of rows) {
    const fg = readVarRgb(r.fg);
    const bg = readVarRgb(r.bg);
    reach[r.label] = fg && bg ? maxForegroundRatio(rgbToHex(fg), [bg]) : 0;
  }
  return reach;
}

// Live WCAG readout + single abstract fix; reads resolved tokens off <html> (readVarRgb) so it's truthful for every skin/mode.
// Every row fixed the SAME way: nudge that pair's text token lighter/darker until it clears target.
// Override written to textFixes, which writeVars applies last so fix lands on any skin/mode; no knob-specific logic.
export function ContrastPanel({ t, onFix }: { t: ThemeState; onFix: (textFixes: Record<string, string>) => void }) {
  const [rows, setRows] = useState<ContrastRow[]>([]);
  const reach = computeReach(rows);

  // `t` drives writeVars synchronously before re-render, so vars read here are fresh; observer covers `.dark` toggle (writeVars also reacts to it).
  // biome-ignore lint/correctness/useExhaustiveDependencies: `t` is a deliberate recompute trigger.
  useEffect(() => {
    const recompute = () => setRows(analyzeContrast(readVarRgb));
    const frame = requestAnimationFrame(recompute);
    const observer = new MutationObserver(recompute);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [t]);

  // The one fix for any row: reads live text+background, searches text token lightness to clear target, records as per-token override.
  function applyFix(row: ContrastRow, level: WcagLevel) {
    const fg = readVarRgb(row.fg);
    const bg = readVarRgb(row.bg);
    if (!fg || !bg) return;
    const next = fixTextForeground(rgbToHex(fg), [bg], TARGET_RATIO[level]);
    if (next) onFix({ ...t.textFixes, [row.fg]: next });
  }

  const rowFixLevel = (r: ContrastRow): WcagLevel | null => (r.ratio !== null ? offeredFixLevel(r.levels, reach[r.label] ?? 0) : null);

  // Footer hint — the single most relevant next step.
  const anyOfferAA = rows.some((r) => rowFixLevel(r) === "AA");
  const anyOfferAAA = rows.some((r) => rowFixLevel(r) === "AAA");
  const allReadableAAA = rows.length > 0 && rows.every((r) => r.ratio !== null && r.levels.AAA);
  let hint: string;
  if (anyOfferAA) hint = "Rows below AA are red — tap → AA on each to correct it.";
  else if (anyOfferAAA) hint = "All text clears AA (4.5:1). Tap → AAA on a row to push it to 7:1.";
  else if (allReadableAAA) hint = "Every pairing clears AAA (7:1). ✓";
  else hint = "All text clears AA (4.5:1). Some pairings can't reach AAA on this surface.";

  return (
    <div className="flex flex-col gap-3">
      <span className="flex items-baseline justify-between gap-2.5">
        <span className="text-[11px] font-medium text-muted-foreground">Accessibility · contrast</span>
        <VarTag>WCAG AA 4.5 · AAA 7</VarTag>
      </span>
      <div className="flex flex-col gap-1 rounded-[8px] border border-border p-1.5">
        {rows.map((r) => {
          const fixLevel = rowFixLevel(r);
          return (
            <div key={r.label} className="flex items-center gap-2.5 rounded-[6px] px-2 py-1.5">
              <span
                aria-hidden
                className="grid size-8 shrink-0 place-items-center rounded-[5px] border border-border text-[11px] font-semibold"
                style={{ color: `var(${r.fg})`, background: `var(${r.bg})` }}
              >
                Aa
              </span>
              <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">{r.label}</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {r.ratio === null ? "—" : `${r.ratio.toFixed(2)}:1`}
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                <LevelBadge level="AA" state={levelState(r.levels, r.ratio, "AA")} />
                <LevelBadge level="AAA" state={levelState(r.levels, r.ratio, "AAA")} />
                {fixLevel ? <FixChip level={fixLevel} onClick={() => applyFix(r, fixLevel)} /> : null}
              </span>
            </div>
          );
        })}
      </div>
      <span className="text-[10px] text-muted-foreground">{hint}</span>
    </div>
  );
}
