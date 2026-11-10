"use client";

import { type ComponentProps, type CSSProperties, createContext, isValidElement, type JSX, type ReactNode, use, useId } from "react";
import type { MarkdownKnobStyle } from "@/components/control-ui/knob-contracts/markdown-knobs";

import { cn } from "@/components/control-ui/lib/cn";
import { Checkbox } from "@/components/control-ui/ui/checkbox";
import { markdownHeadingAttributes } from "@/components/control-ui/ui/markdown-heading";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Heading } from "@/components/control-ui/ui/typography";

export type MarkdownCodeProps = ComponentProps<"code"> & {
  node?: unknown;
} & { style?: CSSProperties & MarkdownKnobStyle };

type MarkdownElementProps<Tag extends keyof JSX.IntrinsicElements> = ComponentProps<Tag> & {
  node?: unknown;
} & { style?: CSSProperties & MarkdownKnobStyle };

export type MarkdownRootProps = Omit<ComponentProps<"div">, "style"> & {
  style?: CSSProperties & MarkdownKnobStyle;
};

export function MarkdownRoot({ className, ...props }: MarkdownRootProps) {
  return (
    <div
      data-control-ui="markdown"
      data-control-family="markdown"
      data-slot="root"
      className={cn("[&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}
      {...props}
    />
  );
}

export function MarkdownFlow(props: MarkdownRootProps) {
  return <div data-control-ui="markdown" data-control-family="markdown" data-slot="flow" {...props} />;
}

const MarkdownTaskLabelContext = createContext<string | undefined>(undefined);

export function MarkdownInput({ type, checked, className, "aria-label": ariaLabel, node: _node, ...props }: MarkdownElementProps<"input">) {
  const labelId = use(MarkdownTaskLabelContext);
  if (type !== "checkbox") return <input type={type} checked={checked} className={className} aria-label={ariaLabel} {...props} />;
  return (
    <Checkbox
      checked={Boolean(checked)}
      readOnly
      className={className}
      aria-label={labelId ? undefined : (ariaLabel ?? "Task item")}
      aria-labelledby={labelId}
    />
  );
}

export function MarkdownInlineCode({ className, children, node: _node, ...props }: MarkdownCodeProps) {
  return (
    <code data-control-ui="markdown" data-control-family="markdown" data-slot="inline-code" className={className} {...props}>
      {children}
    </code>
  );
}

export function MarkdownPre({ children, node: _node }: MarkdownElementProps<"pre">) {
  return <>{children}</>;
}

export function MarkdownH1({ className, node: _node, ...props }: MarkdownElementProps<"h1">) {
  const { class: headingClass } = markdownHeadingAttributes(1);
  return (
    <Heading
      level={1}
      data-control-ui="markdown"
      data-control-family="markdown"
      data-slot="h1"
      className={cn(headingClass, className)}
      {...props}
    />
  );
}

export function MarkdownH2({ className, node: _node, ...props }: MarkdownElementProps<"h2">) {
  const { class: headingClass } = markdownHeadingAttributes(2);
  return (
    <Heading
      level={2}
      data-control-ui="markdown"
      data-control-family="markdown"
      data-slot="h2"
      className={cn(headingClass, className)}
      {...props}
    />
  );
}

export function MarkdownH3({ className, node: _node, ...props }: MarkdownElementProps<"h3">) {
  const { class: headingClass } = markdownHeadingAttributes(3);
  return (
    <Heading
      level={3}
      data-control-ui="markdown"
      data-control-family="markdown"
      data-slot="h3"
      className={cn(headingClass, className)}
      {...props}
    />
  );
}

export function MarkdownH4({ className, node: _node, ...props }: MarkdownElementProps<"h4">) {
  const { class: headingClass } = markdownHeadingAttributes(4);
  return (
    <Heading
      level={4}
      data-control-ui="markdown"
      data-control-family="markdown"
      data-slot="h4"
      className={cn(headingClass, className)}
      {...props}
    />
  );
}

export function MarkdownH5({ className, node: _node, ...props }: MarkdownElementProps<"h5">) {
  const { class: headingClass } = markdownHeadingAttributes(5);
  return (
    <Heading
      level={5}
      data-control-ui="markdown"
      data-control-family="markdown"
      data-slot="h5"
      className={cn(headingClass, className)}
      {...props}
    />
  );
}

export function MarkdownH6({ className, node: _node, ...props }: MarkdownElementProps<"h6">) {
  const { class: headingClass } = markdownHeadingAttributes(6);
  return (
    <Heading
      level={6}
      data-control-ui="markdown"
      data-control-family="markdown"
      data-slot="h6"
      className={cn(headingClass, className)}
      {...props}
    />
  );
}

// an image alone on its line sits in the flow as its own block
function isLoneImage(children: ReactNode): boolean {
  const filled = (Array.isArray(children) ? children : [children]).filter((child) => child != null && child !== "");
  const only: unknown = filled.length === 1 ? filled[0] : undefined;
  return isValidElement<{ node?: { tagName?: string } }>(only) && only.props.node?.tagName === "img";
}

export function MarkdownP({ className, children, node: _node, ...props }: MarkdownElementProps<"p">) {
  if (isLoneImage(children)) return children;
  return (
    <p data-control-ui="markdown" data-control-family="markdown" data-slot="paragraph" className={className} {...props}>
      {children}
    </p>
  );
}

export function MarkdownImg({ className, alt, node: _node, ...props }: MarkdownElementProps<"img">) {
  return (
    <img data-control-ui="markdown" data-control-family="markdown" data-slot="image" alt={alt ?? ""} className={className} {...props} />
  );
}

// the hardening pass swaps a link it refuses for a titled span carrying a palette class
export function MarkdownSpan({ className, title, node: _node, ...props }: MarkdownElementProps<"span">) {
  if (!title?.startsWith("Blocked URL: ")) return <span className={className} title={title} {...props} />;
  return <span data-control-ui="markdown" data-control-family="markdown" data-slot="blocked-link" title={title} {...props} />;
}

export function MarkdownSup({ className, node: _node, ...props }: MarkdownElementProps<"sup">) {
  return <sup data-control-ui="markdown" data-control-family="markdown" data-slot="superscript" className={className} {...props} />;
}

export function MarkdownSub({ className, node: _node, ...props }: MarkdownElementProps<"sub">) {
  return <sub data-control-ui="markdown" data-control-family="markdown" data-slot="subscript" className={className} {...props} />;
}

export function MarkdownUl({ className, node: _node, ...props }: MarkdownElementProps<"ul">) {
  return (
    <ul
      data-control-ui="markdown"
      data-control-family="markdown"
      data-slot="unordered-list"
      className={cn("list-disc", className)}
      {...props}
    />
  );
}

export function MarkdownOl({ className, node: _node, ...props }: MarkdownElementProps<"ol">) {
  return (
    <ol
      data-control-ui="markdown"
      data-control-family="markdown"
      data-slot="ordered-list"
      className={cn("list-decimal", className)}
      {...props}
    />
  );
}

export function MarkdownLi({ id, className, node: _node, ...props }: MarkdownElementProps<"li">) {
  const labelId = useId();
  return (
    <MarkdownTaskLabelContext value={id ?? labelId}>
      <li
        id={id ?? labelId}
        data-control-ui="markdown"
        data-control-family="markdown"
        data-slot="list-item"
        className={className}
        {...props}
      />
    </MarkdownTaskLabelContext>
  );
}

export function MarkdownA({ className, href, target, rel, node: _node, ...props }: MarkdownElementProps<"a">) {
  // the hardening pass opens every link in a new tab, in-page and footnote anchors included
  const isInPage = href?.startsWith("#") ?? false;
  return (
    <a
      data-control-ui="markdown"
      data-control-family="markdown"
      data-slot="link"
      className={className}
      href={href}
      target={isInPage ? undefined : target}
      rel={isInPage ? undefined : rel}
      {...props}
    />
  );
}

export function MarkdownBlockquote({ className, node: _node, ...props }: MarkdownElementProps<"blockquote">) {
  return <blockquote data-control-ui="markdown" data-control-family="markdown" data-slot="blockquote" className={className} {...props} />;
}

export function MarkdownHr({ className, node: _node, ...props }: MarkdownElementProps<"hr">) {
  return <hr data-control-ui="markdown" data-control-family="markdown" data-slot="separator" className={className} {...props} />;
}

export function MarkdownStrong({ className, node: _node, ...props }: MarkdownElementProps<"strong">) {
  return <strong data-control-ui="markdown" data-control-family="markdown" data-slot="strong" className={className} {...props} />;
}

export function MarkdownEm({ className, node: _node, ...props }: MarkdownElementProps<"em">) {
  return <em data-control-ui="markdown" data-control-family="markdown" data-slot="emphasis" className={className} {...props} />;
}

export function MarkdownTable({ className, children, node: _node, ...props }: MarkdownElementProps<"table">) {
  return (
    <div data-control-ui="markdown" data-control-family="markdown" data-slot="table-scroll">
      <ScrollArea lockAxis="y">
        <table data-control-ui="markdown" data-control-family="markdown" data-slot="table" className={cn("w-full", className)} {...props}>
          {children}
        </table>
      </ScrollArea>
    </div>
  );
}

export function MarkdownThead({ className, node: _node, ...props }: MarkdownElementProps<"thead">) {
  return <thead data-control-ui="markdown" data-control-family="markdown" data-slot="table-head" className={className} {...props} />;
}

export function MarkdownTbody({ className, node: _node, ...props }: MarkdownElementProps<"tbody">) {
  return <tbody data-control-ui="markdown" data-control-family="markdown" data-slot="table-body" className={className} {...props} />;
}

export function MarkdownTr({ className, node: _node, ...props }: MarkdownElementProps<"tr">) {
  return <tr data-control-ui="markdown" data-control-family="markdown" data-slot="table-row" className={className} {...props} />;
}

export function MarkdownTh({ className, node: _node, ...props }: MarkdownElementProps<"th">) {
  return <th data-control-ui="markdown" data-control-family="markdown" data-slot="table-header" className={className} {...props} />;
}

export function MarkdownTd({ className, node: _node, ...props }: MarkdownElementProps<"td">) {
  return <td data-control-ui="markdown" data-control-family="markdown" data-slot="table-cell" className={className} {...props} />;
}
