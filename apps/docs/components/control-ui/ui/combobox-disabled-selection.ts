export function shouldAcceptComboboxValueChange(next: unknown, previous: unknown, disabledValues: ReadonlySet<unknown>) {
  if (Array.isArray(next)) {
    const kept = new Set<unknown>(Array.isArray(previous) ? previous : []);
    return next.every((item) => kept.has(item) || !disabledValues.has(item));
  }
  return next === null || next === previous || !disabledValues.has(next);
}
