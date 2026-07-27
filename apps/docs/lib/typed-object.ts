// Object.fromEntries widens its key to `string` and TS has no signature that keeps tuple's own key,
// so this is app's one audited assertion — call it instead of asserting inline.
export const objectFromEntries = <K extends PropertyKey, V>(entries: Iterable<readonly [K, V]>): Record<K, V> =>
  Object.fromEntries(entries) as Record<K, V>;
