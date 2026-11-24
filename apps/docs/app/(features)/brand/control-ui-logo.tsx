import type { CSSProperties } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import styles from "./control-ui-logo.module.css";
import { controlUiLogoCutouts, controlUiLogoReferenceRadiusPx, controlUiLogoSize, controlUiLogoStrands } from "./logo";

const solidMaskLayer = "linear-gradient(#000 0 0)";

export function ControlUiLogo({ className, size = 16 }: { className?: string; size?: number }) {
  function scaled(units: number) {
    return `${(units / controlUiLogoSize) * size}px`;
  }
  function strandStyle(part: (typeof controlUiLogoStrands)[number]): CSSProperties {
    const radiusScale = (part.radius * size) / (controlUiLogoSize * controlUiLogoReferenceRadiusPx);
    return {
      left: scaled(part.x),
      top: scaled(part.y),
      width: scaled(part.width),
      height: scaled(part.height),
      borderRadius: `calc(var(--radius-control) * ${radiusScale})`,
    };
  }
  const weaveStyle = {
    width: size,
    height: size,
    maskImage: [solidMaskLayer, ...controlUiLogoCutouts.map(() => solidMaskLayer)].join(", "),
    maskPosition: ["0 0", ...controlUiLogoCutouts.map((part) => `${scaled(part.x)} ${scaled(part.y)}`)].join(", "),
    maskSize: ["100% 100%", ...controlUiLogoCutouts.map((part) => `${scaled(part.width)} ${scaled(part.height)}`)].join(", "),
    maskRepeat: "no-repeat",
    maskComposite: "exclude",
  } satisfies CSSProperties;
  return (
    <span data-slot="control-ui-logo" aria-hidden="true" style={weaveStyle} className={cn(styles.logo, className)}>
      {controlUiLogoStrands.map((part) => (
        <span key={`${part.x}-${part.y}`} className={styles.strand} style={strandStyle(part)} />
      ))}
    </span>
  );
}
