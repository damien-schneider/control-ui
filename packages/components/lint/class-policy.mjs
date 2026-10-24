export const controlUiImportPath = `(?:@ctrl-ui/react|[^'"]*components/control-ui)/`;

export const componentStyleClass = String.raw`[^\s"'\x60]!(?:[\s"'\x60]|$)|(?:^|[\s"'\x60])![\w\[-]|(?:^|[^\w-])(?:p[xytrblse]?-|bg-[\w\[]|text-(?:foreground|muted|primary|secondary|accent|destructive|success|warning|info|card|popover|sidebar|background|canvas|current|inherit|transparent|white|black|[a-z]+-\d{2,3}|\[(?:#|oklch|rgb|hsl|lab|lch|color|var))|font-|leading-|tracking-|border|divide-|rounded|shadow|ring\b|ring-|outline|opacity-|backdrop-|fill-|stroke-|decoration-|underline|line-through|italic|uppercase|lowercase|capitalize|tabular-nums|(?:hover|focus|focus-visible|focus-within|active|disabled|open|checked|dark|placeholder|aria-[^:\s]*|data-[^:\s]*|group-[^:\s]*|peer-[^:\s]*|has-[^:\s]*|\*|\[&[^\s]*?\]):)`;

export const rawTypeClass = String.raw`(?:^|[^\w-])text-(?:micro|caption|label|body|body-lg|heading-[1-4]|display|xs|sm|base|lg|xl|[2-9]xl)\b|(?:^|[^\w-])text-\[\d[^\]]*\]`;

export const componentStyleMessage =
  "Control UI component styled through className: color, type, padding, borders, radius, shadows, state styles and !important belong to the component. Use its props or a --cui-* knob; keep className for layout (flex, gap, width, margin, placement).";

export const rawTypeMessage =
  "Text size in className: render text through <Text>/<Heading> on the type scale, or size the control with its size prop or --cui-*-font-size knob.";
