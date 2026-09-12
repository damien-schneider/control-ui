import type { CSSProperties } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import styles from "./control-ui-logo.module.css";
import { controlUiLogoCutouts, controlUiLogoReferenceRadiusPx, controlUiLogoSize, controlUiLogoStrands } from "./logo";

export function ControlUiLogo({ className, size = 16 }: { className?: string; size?: number }) {
  function partStyle(part: (typeof controlUiLogoStrands)[number]): CSSProperties {
    const radiusScale = (part.radius * size) / (controlUiLogoSize * controlUiLogoReferenceRadiusPx);
    return {
      left: `${(part.x / controlUiLogoSize) * 100}%`,
      top: `${(part.y / controlUiLogoSize) * 100}%`,
      width: `${(part.width / controlUiLogoSize) * 100}%`,
      height: `${(part.height / controlUiLogoSize) * 100}%`,
      borderRadius: `calc(var(--radius-control) * ${radiusScale})`,
    };
  }
  return (
    <span data-slot="control-ui-logo" aria-hidden="true" style={{ width: size, height: size }} className={cn(styles.logo, className)}>
      {controlUiLogoStrands.map((part) => (
        <span key={`${part.x}-${part.y}`} className={styles.strand} style={partStyle(part)} />
      ))}
      {controlUiLogoCutouts.map((part) => (
        <span key={`${part.x}-${part.y}`} className={styles.cutout} style={partStyle(part)} />
      ))}
    </span>
  );
}
