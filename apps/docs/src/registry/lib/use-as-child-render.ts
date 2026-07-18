import { useRender } from "@base-ui/react/use-render";
import type { ReactElement, ReactNode } from "react";
import { Children, isValidElement } from "react";

type AsChildTagName = "span" | "div" | "a" | "button";
type RenderOption = Parameters<typeof useRender>[0]["render"];

export function resolveAsChildElement(asChild: boolean | undefined, children: ReactNode): ReactElement | null {
  if (!asChild) return null;
  if (isValidElement(children)) return children;

  const candidates = Children.toArray(children);
  if (candidates.length !== 1) return null;
  return isValidElement(candidates[0]) ? candidates[0] : null;
}

// shared Base UI wiring for slots rendering a plain host tag directly (Button composes a Base UI component instead — see button.tsx)
// resolves legacy `asChild` convention + typed `render` prop onto same element via useRender, no @radix-ui/react-slot dependency
// asChild's child already carries its own children (passed as-is); render (element/fn) still needs children merged into props
export function useAsChildRender(options: {
  defaultTagName: AsChildTagName;
  asChild?: boolean;
  render?: RenderOption;
  children?: ReactNode;
  props: Record<string, unknown>;
}): ReactElement {
  const { defaultTagName, asChild, render, children, props } = options;
  const child = resolveAsChildElement(asChild, children);
  return useRender({
    defaultTagName,
    render: child ?? render,
    props: child ? props : { ...props, children },
  });
}
