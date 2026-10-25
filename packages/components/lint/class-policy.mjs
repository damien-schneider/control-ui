const controlUiImportPath = `(?:@ctrl-ui/react|[^'"]*components/control-ui)/`;

export const paintFreeComponents = ["RevealScope"];

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

const paintProperties = [
  "padding",
  "background",
  "color",
  "font",
  "line-height",
  "letter-spacing",
  "border",
  "outline",
  "box-shadow",
  "text-shadow",
  "text-decoration",
  "text-underline",
  "text-transform",
  "opacity",
  "filter",
  "backdrop-filter",
  "fill",
  "stroke",
  "caret-color",
  "accent-color",
  "mask",
  "-webkit-mask",
  "-webkit-font-smoothing",
  "-moz-osx-font-smoothing",
];

const camelCase = (property) =>
  property.replace(/^-(\w)/, (_, first) => first.toUpperCase()).replace(/-(\w)/g, (_, letter) => letter.toUpperCase());

export const paintProperty = String.raw`(?:${paintProperties.join("|")})(?:-[\w-]*)?`;

export const componentStyleKey = String.raw`["']?(?:(?:${paintProperties.map(camelCase).join("|")})(?:[A-Z]\w*)?|${paintProperty})["']?`;

const partAttribute = String.raw`data-(?:control|slot)\b`;

export const componentPartClass = String.raw`\[&[^${classDelimiter}]*?${partAttribute}|(?:^|[${classDelimiter}:])\*{1,2}:data-\[(?:control|slot)\b`;

export const componentPartSelector = String.raw`(?s).*\[${partAttribute}[^\s>+~]*\s*`;

export const componentStyleClass = String.raw`[^${classDelimiter}]!${classEnd}|(?:^|[${classDelimiter}])![\w\[-]|(?:^|[^\w-])(?:p[xytrblse]?-|bg-[\w\[]|text-${classSuffixOtherThan(textLayoutSuffixes)}|font-|leading-|tracking-|border|divide-|rounded|shadow|inset-shadow|drop-shadow|ring\b|ring-|inset-ring|outline|opacity-|backdrop-|fill-|stroke-|caret-|accent-|scheme-|mask-|decoration-|underline|no-underline|overline|line-through|italic|not-italic|uppercase|lowercase|capitalize|normal-case|antialiased|subpixel-antialiased|ordinal|slashed-zero|(?:normal|lining|oldstyle|proportional|tabular)-nums|(?:diagonal|stacked)-fractions|blur(?:-|${classEnd})|brightness-|contrast-[\d\[]|grayscale|hue-rotate-|invert|saturate-|sepia|(?:hover|focus|focus-visible|focus-within|active|disabled|enabled|open|checked|indeterminate|visited|target|invalid|valid|user-invalid|user-valid|required|optional|read-only|autofill|placeholder-shown|in-range|out-of-range|inert|starting|dark|placeholder|selection|marker|file|first-letter|first-line|backdrop|details-content|aria-[^:\s]*|data-[^:\s]*|group-[^:\s]*|peer-[^:\s]*|has-[^:\s]*|\*|\[&[^\s]*?\]):)|(?:^|[^\w-])\[${paintProperty}:`;

export const rawTypeClass = String.raw`(?:^|[^\w-])text-(?:micro|caption|label|body|body-lg|heading-[1-4]|display|xs|sm|base|lg|xl|[2-9]xl)\b|(?:^|[^\w-])text-\[\d[^\]]*\]`;

export const componentStyleMessage =
  "Control UI component styled through className: color, type, padding, borders, radius, shadows, state styles and !important belong to the component. Use its props or a --cui-* knob; keep className for layout (flex, gap, width, margin, placement).";

export const rawTypeMessage =
  "Text size in className: render text through <Text>/<Heading> on the type scale, or size the control with its size prop or --cui-*-font-size knob.";

export const componentPartMessage =
  "className styles a Control UI component's parts from outside through a data-slot or data-control selector. The component owns its parts: use its props, compose its parts, or set a --cui-* knob on it.";

export const componentStylePropMessage =
  "Control UI component painted through style: color, type, padding, borders, radius, shadows and opacity belong to the component. Set a --cui-* knob in style or use its props; keep other style keys for layout.";

export const componentPartCssMessage =
  "Stylesheet paints a Control UI part: color, type, padding, borders, radius, shadows and opacity belong to the component recipe. Set the part's --cui-* knobs here instead, or use the component's props.";
