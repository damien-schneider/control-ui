export function shouldAcceptComboboxValueChange<Value>(value: Value | null, disabledValues: ReadonlySet<unknown>, multiple = false) {
  if (multiple && Array.isArray(value)) return value.every((item) => !disabledValues.has(item));
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
