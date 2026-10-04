import type { ComponentProps, HTMLAttributes, Ref } from "react";

import { cn } from "@/components/control-ui/lib/cn";

const sizeClassNames = {
  display: "text-display",
  "heading-1": "text-heading-1",
  "heading-2": "text-heading-2",
  "heading-3": "text-heading-3",
  "heading-4": "text-heading-4",
  "body-lg": "text-body-lg",
  body: "text-body",
  label: "text-label",
  caption: "text-caption",
  micro: "text-micro",
} as const;

const toneClassNames = {
  default: undefined,
  foreground: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary-text",
  destructive: "text-destructive-text",
} as const;

const weightClassNames = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
} as const;

export type TypeSize = keyof typeof sizeClassNames;
export type TypeTone = keyof typeof toneClassNames;
export type TextWeight = keyof typeof weightClassNames;
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const headingSizeByLevel = {
  1: "heading-1",
  2: "heading-2",
  3: "heading-3",
  4: "heading-4",
  5: "heading-4",
  6: "heading-4",
} as const satisfies Record<HeadingLevel, TypeSize>;

export type HeadingProps = ComponentProps<"h1"> & { level: HeadingLevel; size?: TypeSize; tone?: TypeTone };

export function Heading({ level, size = headingSizeByLevel[level], tone = "default", className, ...props }: HeadingProps) {
  const Tag: `h${HeadingLevel}` = `h${level}`;
  return (
    <Tag
      data-control-ui="typography"
      data-control-family="typography"
      data-slot="heading"
      className={cn(sizeClassNames[size], toneClassNames[tone], className)}
      {...props}
    />
  );
}

export type TextTag =
  | "p"
  | "span"
  | "div"
  | "small"
  | "strong"
  | "em"
  | "code"
  | "li"
  | "dt"
  | "dd"
  | "figcaption"
  | "legend"
  | "blockquote";

export type TextProps = HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>;
  as?: TextTag;
  size?: TypeSize;
  weight?: TextWeight;
  tone?: TypeTone;
};

// Each tag's element type narrows the ref type; a callback ref is contravariant so it fits every tag in the union.
function attachRef(ref: Ref<HTMLElement> | undefined, node: HTMLElement | null) {
  if (typeof ref === "function") return ref(node);
  if (ref) ref.current = node;
}

export function Text({ as: Tag = "span", size = "body", weight, tone = "default", className, ref, ...props }: TextProps) {
  return (
    <Tag
      ref={ref ? (node: HTMLElement | null) => attachRef(ref, node) : undefined}
      data-control-ui="typography"
      data-control-family="typography"
      data-slot="text"
      className={cn(sizeClassNames[size], weight ? weightClassNames[weight] : undefined, toneClassNames[tone], className)}
      {...props}
    />
  );
}
