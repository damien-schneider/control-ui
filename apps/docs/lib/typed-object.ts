// Object.fromEntries widens its key to `string`; the entry tuples here already carry the precise key.
export const objectFromEntries = <K extends PropertyKey, V>(entries: Iterable<readonly [K, V]>): Record<K, V> =>
  Object.fromEntries(entries) as Record<K, V>;
