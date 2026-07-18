export function shouldAcceptComboboxValueChange<Value>(value: Value | null, disabledValues: ReadonlySet<unknown>) {
  return value === null || !disabledValues.has(value);
}

export function emitComboboxValueChange<Value>(
  value: Value | null,
  disabledValues: ReadonlySet<unknown>,
  onValueChange: (value: Value | null) => void,
) {
  if (!shouldAcceptComboboxValueChange(value, disabledValues)) return false;
  onValueChange(value);
  return true;
}
