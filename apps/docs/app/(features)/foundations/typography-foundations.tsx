"use client";

import { contractDescription, contractTokenNames, contractTokensNamed, Specimen, SpecimenGroup } from "./specimen/specimen";
import { formatPx, useComputedReadout } from "./specimen/theme-readouts";

const FONT_ROLES = ["--font-sans", "--font-mono", "--font-body", "--font-display"];

const TYPE_RUNGS = contractTokenNames("typography").filter((name) => name.startsWith("--text-") && !name.slice(2).includes("--"));

function readFirstFontFamily(style: CSSStyleDeclaration) {
  return style.fontFamily.split(",")[0].replaceAll('"', "").trim();
}

function readTypeMetrics(style: CSSStyleDeclaration) {
  const lineHeight = style.lineHeight === "normal" ? "normal" : formatPx(style.lineHeight);
  return `${formatPx(style.fontSize)} / ${lineHeight} · ${style.fontWeight}`;
}

function isHeadingRung(rung: string) {
  return rung.includes("heading") || rung.includes("display");
}

function FontSpecimen({ role }: { role: string }) {
  const [ref, family] = useComputedReadout<HTMLParagraphElement>(readFirstFontFamily);
  return (
    <Specimen token={role} readout={family} description={contractDescription(role)}>
      <p ref={ref} className="truncate text-heading-2 text-foreground" style={{ fontFamily: `var(${role})` }}>
        Aa Bb Gg 0123
      </p>
    </Specimen>
  );
}

function TypeRung({ rung }: { rung: string }) {
  const [ref, metrics] = useComputedReadout<HTMLParagraphElement>(readTypeMetrics);
  return (
    <Specimen
      token={rung}
      companionTokens={contractTokensNamed([`${rung}--line-height`, `${rung}--font-weight`, `${rung}--letter-spacing`])}
      readout={metrics}
    >
      <p
        ref={ref}
        className="truncate text-foreground"
        style={{
          fontFamily: isHeadingRung(rung) ? "var(--font-display)" : "var(--font-body)",
          fontSize: `var(${rung})`,
          lineHeight: `var(${rung}--line-height)`,
          fontWeight: `var(${rung}--font-weight)`,
          letterSpacing: `var(${rung}--letter-spacing)`,
        }}
      >
        Ship the interface your agent deserves
      </p>
    </Specimen>
  );
}

export function TypographyFoundations() {
  return (
    <div className="grid min-w-0">
      <SpecimenGroup title="Font roles">
        <div className="grid gap-4 sm:grid-cols-2">
          {FONT_ROLES.map((role) => (
            <FontSpecimen key={role} role={role} />
          ))}
        </div>
      </SpecimenGroup>
      <SpecimenGroup title="Type scale">
        <div className="docs-panel grid gap-5 p-4">
          {TYPE_RUNGS.map((rung) => (
            <TypeRung key={rung} rung={rung} />
          ))}
        </div>
      </SpecimenGroup>
    </div>
  );
}
