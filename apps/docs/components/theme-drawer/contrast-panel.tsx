"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/control-ui/ui/badge";
import { Button } from "@/components/control-ui/ui/button";
import { Card } from "@/components/control-ui/ui/card";
import { Item, ItemActions, ItemContent, ItemGroup, ItemMedia, ItemTitle } from "@/components/control-ui/ui/item";
import { Text } from "@/components/control-ui/ui/typography";
import { TARGET_RATIO, type WcagLevel, type WcagLevels } from "./color-math";
import { rgbToHex } from "./color-utils";
import { analyzeContrast, type ContrastRow, fixTextForeground, maxForegroundRatio, offeredFixLevel, readVarRgb } from "./contrast";
import { VarTag } from "./controls";
import type { ThemeState } from "./types";

const LEVEL_BADGE_COLOR = { pass: "green", fail: "red", unknown: "neutral" } as const;

function LevelBadge({ level, state }: { level: WcagLevel; state: "pass" | "fail" | "unknown" }) {
  return (
    <Badge size="sm" color={LEVEL_BADGE_COLOR[state]} title={level === "AA" ? "WCAG AA · 4.5:1" : "WCAG AAA · 7:1"}>
      {level}
    </Badge>
  );
}

function FixChip({ level, onClick }: { level: WcagLevel; onClick: () => void }) {
  return (
    <Button
      variant={level === "AA" ? "solid" : "ghost"}
      size="xs"
      onClick={onClick}
      title={level === "AA" ? "Fix this pairing to WCAG AA (4.5:1)" : "Upgrade this pairing to WCAG AAA (7:1)"}
      className="shrink-0"
    >
      →&nbsp;{level}
    </Button>
  );
}

function levelState(levels: WcagLevels, ratio: number | null, key: WcagLevel): "pass" | "fail" | "unknown" {
  if (ratio === null) return "unknown";
  return levels[key] ? "pass" : "fail";
}

// chip is only offered for target row can hit, which is why AAA shows on near-black surface but not mid-tone one.
function computeReach(rows: ContrastRow[]): Record<string, number> {
  const reach: Record<string, number> = {};
  for (const r of rows) {
    const fg = readVarRgb(r.fg);
    const bg = readVarRgb(r.bg);
    reach[r.label] = fg && bg ? maxForegroundRatio(rgbToHex(fg), [bg]) : 0;
  }
  return reach;
}

// Reads resolved tokens off <html>, so readout is truthful for every skin and mode.
// Every row is fixed same way and override lands in textFixes, which writeVars applies last.
export function ContrastPanel({ t, onFix }: { t: ThemeState; onFix: (textFixes: Record<string, string>) => void }) {
  const [rows, setRows] = useState<ContrastRow[]>([]);
  const reach = computeReach(rows);

  // `t` drives writeVars synchronously before re-render, so vars read here are fresh
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

  function applyFix(row: ContrastRow, level: WcagLevel) {
    const fg = readVarRgb(row.fg);
    const bg = readVarRgb(row.bg);
    if (!fg || !bg) return;
    const next = fixTextForeground(rgbToHex(fg), [bg], TARGET_RATIO[level]);
    if (next) onFix({ ...t.textFixes, [row.fg]: next });
  }

  const rowFixLevel = (r: ContrastRow): WcagLevel | null => (r.ratio !== null ? offeredFixLevel(r.levels, reach[r.label] ?? 0) : null);

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
        <Text size="caption" weight="medium" tone="muted">
          Accessibility · contrast
        </Text>
        <VarTag>WCAG AA 4.5 · AAA 7</VarTag>
      </span>
      <Card size="sm">
        <ItemGroup>
          {rows.map((r) => {
            const fixLevel = rowFixLevel(r);
            return (
              <Item key={r.label}>
                <ItemMedia>
                  <span
                    aria-hidden
                    className="grid size-8 shrink-0 place-items-center rounded-sm border border-border"
                    style={{ color: `var(${r.fg})`, background: `var(${r.bg})` }}
                  >
                    <Text size="caption" weight="semibold">
                      Aa
                    </Text>
                  </span>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{r.label}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Text size="caption" tone="muted" mono numeric>
                    {r.ratio === null ? "—" : `${r.ratio.toFixed(2)}:1`}
                  </Text>
                  <LevelBadge level="AA" state={levelState(r.levels, r.ratio, "AA")} />
                  <LevelBadge level="AAA" state={levelState(r.levels, r.ratio, "AAA")} />
                  {fixLevel ? <FixChip level={fixLevel} onClick={() => applyFix(r, fixLevel)} /> : null}
                </ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
      </Card>
      <Text size="micro" tone="muted">
        {hint}
      </Text>
    </div>
  );
}
