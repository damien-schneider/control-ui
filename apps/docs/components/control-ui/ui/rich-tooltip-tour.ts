export type TourPosition = {
  index: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
};

export function tourPosition(steps: readonly string[], activeStep: string | null): TourPosition {
  const index = activeStep === null ? -1 : steps.indexOf(activeStep);
  return {
    index,
    total: steps.length,
    isFirst: index <= 0,
    isLast: index >= 0 && index === steps.length - 1,
  };
}

// null ends the tour — callers persist completion and close every step.
export function stepAfter(steps: readonly string[], index: number): string | null {
  if (index < 0) return null;
  return steps[index + 1] ?? null;
}

export function stepBefore(steps: readonly string[], index: number): string | null {
  if (index < 0) return null;
  return steps[Math.max(0, index - 1)] ?? null;
}
