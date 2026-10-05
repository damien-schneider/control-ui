import { type HeadingLevel, headingClassName } from "@/components/control-ui/ui/typography";

const headingSizes = {
  1: "heading-2",
  2: "heading-3",
  3: "heading-4",
  4: "body",
  5: "body",
  6: "body",
} as const;

export function markdownHeadingAttributes(level: HeadingLevel) {
  return {
    "data-control-ui": "markdown",
    "data-control-family": "markdown",
    "data-slot": `h${level}`,
    class: headingClassName({
      level,
      size: headingSizes[level],
      weight: level >= 4 ? "semibold" : undefined,
      className: level >= 4 ? "leading-tight" : undefined,
    }),
  };
}
