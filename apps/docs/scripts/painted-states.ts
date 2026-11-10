export type PaintedState = { name: string; value?: string };

const STATE_ATTRIBUTES =
  "data-(?:checked|unchecked|indeterminate|invalid|disabled|readonly|pressed|highlighted|selected|dragging|resizing|popup-open|open|active|current|state|status)|aria-(?:invalid|disabled|selected|expanded|checked|current|pressed)";
const PAINTED_STATE = new RegExp(
  `:(hover|active|focus-visible|focus-within|focus)(?![\\w-])|\\[(${STATE_ATTRIBUTES})(?:[~|^$*]?=["']?([^"'\\]]*)["']?)?\\]`,
  "g",
);

/** A state the rule excludes with :not() is not a state it paints. */
function withoutNegations(selector: string): string {
  let kept = "";
  let index = 0;
  while (index < selector.length) {
    if (!selector.startsWith(":not(", index)) {
      kept += selector[index];
      index += 1;
      continue;
    }
    let depth = 1;
    index += ":not(".length;
    while (index < selector.length && depth > 0) {
      if (selector[index] === "(") depth += 1;
      if (selector[index] === ")") depth -= 1;
      index += 1;
    }
  }
  return kept;
}

/** Interaction pseudo-classes and emitted state attributes a selector paints for. */
export function paintedStates(selector: string): PaintedState[] {
  return Array.from(withoutNegations(selector).matchAll(PAINTED_STATE), ([, pseudoClass, attribute, value]) =>
    pseudoClass ? { name: `:${pseudoClass}` } : { name: attribute ?? "", value },
  );
}
