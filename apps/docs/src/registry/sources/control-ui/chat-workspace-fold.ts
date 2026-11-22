import { prefersReducedMotion, readDurationMs } from "@/components/control-ui/lib/motion";

const running = new WeakMap<HTMLElement, Animation>();

export function foldPanel(root: HTMLElement | null, panel: HTMLElement | null, apply: () => void) {
  const duration = panel && !prefersReducedMotion(panel) ? readDurationMs(panel, "--duration-slow") : 0;
  if (!root || !panel || duration <= 0) {
    apply();
    return;
  }
  const before = panel.getBoundingClientRect().height;
  running.get(panel)?.cancel();
  root.removeAttribute("data-folding");
  apply();
  const after = panel.getBoundingClientRect().height;
  if (Math.abs(before - after) < 0.5) return;
  root.setAttribute("data-folding", "");
  const easing = getComputedStyle(panel).getPropertyValue("--ease-emphasized").trim() || "ease";
  const animation = panel.animate({ blockSize: [`${before}px`, `${after}px`] }, { duration, easing });
  running.set(panel, animation);
  const settle = () => {
    if (running.get(panel) !== animation) return;
    running.delete(panel);
    root.removeAttribute("data-folding");
  };
  animation.finished.then(settle, settle);
}
