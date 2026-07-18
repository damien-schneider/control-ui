import { cn } from "@/components/control-ui/lib/cn";
import styles from "./control-ui-logo.module.css";

export function ControlUiLogo({ className }: { className?: string }) {
  return (
    <div data-slot="control-ui-logo" aria-hidden="true" className={cn(styles.logo, className)}>
      <div data-part="shell" className={cn(styles.shell, styles.top)}>
        <div data-part="bar" className={cn(styles.bar, styles.shortBar)} />
      </div>
      <div data-part="shell" className={cn(styles.shell, styles.bottom)}>
        <div data-part="bar" className={cn(styles.bar, styles.fullBar)}>
          <div data-part="notch" className={styles.notch} />
        </div>
      </div>
    </div>
  );
}
