// Object.fromEntries widens its key to `string`; the entry tuples here already carry the precise key. TS has no
// signature that keeps it, so this is the one audited assertion in the app — call it instead of asserting inline.
export const objectFromEntries = <K extends PropertyKey, V>(entries: Iterable<readonly [K, V]>): Record<K, V> =>
  Object.fromEntries(entries) as Record<K, V>;
