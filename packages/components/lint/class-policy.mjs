const controlUiImportPath = `(?:@ctrl-ui/react|[^'"]*components/control-ui)/`;

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function controlUiImportPattern(importSources = []) {
  return `(?:${[controlUiImportPath, ...importSources.map(escapeRegExp)].join("|")})`;
}

const classDelimiter = String.raw`\s"'\x60`;
const classEnd = `(?:[${classDelimiter}]|$)`;

function classSuffixOtherThan(suffixes) {
  const firsts = [...new Set(suffixes.filter(Boolean).map((suffix) => suffix[0]))];
  const alternatives = [
    ...(suffixes.includes("") ? [] : [classEnd]),
    `[^${firsts.join("")}${classDelimiter}]`,
    ...firsts.map(
      (first) => first + classSuffixOtherThan(suffixes.filter((suffix) => suffix[0] === first).map((suffix) => suffix.slice(1))),
    ),
  ];
  return `(?:${alternatives.join("|")})`;
}

const textLayoutSuffixes = [
  "left",
  "center",
  "right",
  "justify",
  "start",
  "end",
  "wrap",
  "nowrap",
  "balance",
  "pretty",
  "ellipsis",
  "clip",
];

export const componentStyleClass = String.raw`[^${classDelimiter}]!${classEnd}|(?:^|[${classDelimiter}])![\w\[-]|(?:^|[^\w-])(?:p[xytrblse]?-|bg-[\w\[]|text-${classSuffixOtherThan(textLayoutSuffixes)}|font-|leading-|tracking-|border|divide-|rounded|shadow|inset-shadow|drop-shadow|ring\b|ring-|inset-ring|outline|opacity-|backdrop-|fill-|stroke-|caret-|accent-|scheme-|mask-|decoration-|underline|no-underline|overline|line-through|italic|not-italic|uppercase|lowercase|capitalize|normal-case|antialiased|subpixel-antialiased|ordinal|slashed-zero|(?:normal|lining|oldstyle|proportional|tabular)-nums|(?:diagonal|stacked)-fractions|(?:hover|focus|focus-visible|focus-within|active|disabled|enabled|open|checked|indeterminate|visited|target|invalid|valid|user-invalid|user-valid|required|optional|read-only|autofill|placeholder-shown|in-range|out-of-range|inert|starting|dark|placeholder|selection|marker|file|first-letter|first-line|backdrop|details-content|aria-[^:\s]*|data-[^:\s]*|group-[^:\s]*|peer-[^:\s]*|has-[^:\s]*|\*|\[&[^\s]*?\]):)`;

export const rawTypeClass = String.raw`(?:^|[^\w-])text-(?:micro|caption|label|body|body-lg|heading-[1-4]|display|xs|sm|base|lg|xl|[2-9]xl)\b|(?:^|[^\w-])text-\[\d[^\]]*\]`;

export const componentStyleMessage =
  "Control UI component styled through className: color, type, padding, borders, radius, shadows, state styles and !important belong to the component. Use its props or a --cui-* knob; keep className for layout (flex, gap, width, margin, placement).";

export const rawTypeMessage =
  "Text size in className: render text through <Text>/<Heading> on the type scale, or size the control with its size prop or --cui-*-font-size knob.";
