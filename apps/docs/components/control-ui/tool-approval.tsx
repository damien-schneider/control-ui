"use client";

import { useRender } from "@base-ui/react/use-render";
import { Check, Clock, ShieldAlert, X } from "lucide-react";
import type { ComponentProps, CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { createContext, useContext, useEffect, useId, useRef } from "react";

import type { RenderProp } from "@/components/control-ui/control-props";
import type { ToolApprovalKnobStyle } from "@/components/control-ui/knob-contracts/tool-approval-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import type { BadgeColor } from "@/components/control-ui/ui/badge";
import { Badge } from "@/components/control-ui/ui/badge";
import { Button } from "@/components/control-ui/ui/button";
import { Kbd } from "@/components/control-ui/ui/kbd";
import { LiveStatus } from "@/components/control-ui/ui/live-status";

export type ToolApprovalState = "pending" | "approved" | "denied" | "expired";

export type ToolApprovalRiskLevel = "low" | "medium" | "high";

type ToolApprovalStyleProps<Props> = Omit<Props, "style"> & { style?: CSSProperties & ToolApprovalKnobStyle };

export type ToolApprovalProps = ToolApprovalStyleProps<ComponentProps<"section">> & {
  state?: ToolApprovalState;
  risk?: ToolApprovalRiskLevel;
  onApprove?: () => void;
  onDeny?: () => void;
  autoFocus?: boolean;
  /** Screen-reader announcement made once the request is decided. */
  announcements?: Partial<Record<Exclude<ToolApprovalState, "pending">, string>>;
};

type ToolApprovalContextValue = {
  state: ToolApprovalState;
  risk: ToolApprovalRiskLevel;
  titleId: string;
  approve: () => void;
  deny: () => void;
};

const ToolApprovalContext = createContext<ToolApprovalContextValue | null>(null);

function useToolApprovalContext() {
  const context = useContext(ToolApprovalContext);
  if (!context) throw new Error("ToolApproval compound components must be rendered inside <ToolApproval>.");
  return context;
}

const decisionAnnouncements = {
  approved: "Action approved",
  denied: "Action denied",
  expired: "Approval request expired",
} satisfies Record<Exclude<ToolApprovalState, "pending">, string>;

export function ToolApproval({
  state = "pending",
  risk = "medium",
  onApprove,
  onDeny,
  autoFocus = false,
  announcements,
  className,
  children,
  onKeyDown,
  ref,
  ...props
}: ToolApprovalProps) {
  const titleId = useId();
  const rootRef = useRef<HTMLElement | null>(null);
  const decidedFromInside = useRef(false);
  const isPending = state === "pending";
  const announcement = isPending ? "" : (announcements?.[state] ?? decisionAnnouncements[state]);

  const decide = (callback: (() => void) | undefined) => {
    if (!isPending) return;
    decidedFromInside.current = rootRef.current?.contains(document.activeElement) === true;
    callback?.();
  };
  const approve = () => decide(onApprove);
  const deny = () => decide(onDeny);

  // deciding unmounts the footer, so a focused Approve/Deny would drop keyboard focus to <body>
  useEffect(() => {
    if (isPending || !decidedFromInside.current) return;
    decidedFromInside.current = false;
    const active = document.activeElement;
    if (!active || active === document.body) rootRef.current?.focus();
  }, [isPending]);

  // native autofocus only fires at document load, and this card mounts mid-run
  useEffect(() => {
    if (autoFocus) rootRef.current?.focus();
  }, [autoFocus]);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || !isPending || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
    if (event.key === "Escape") {
      event.preventDefault();
      deny();
      return;
    }
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      // A held composer-submit chord must not approve the card that just took focus.
      if (!event.repeat) approve();
    }
  }

  return (
    <ToolApprovalContext.Provider value={{ state, risk, titleId, approve, deny }}>
      <section
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-control-ui="tool-approval"
        data-control-family="tool-approval"
        data-slot="root"
        data-state={state}
        data-risk={risk}
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn("relative w-full min-w-0", className)}
        {...props}
      >
        {children}
        <LiveStatus message={announcement} />
      </section>
    </ToolApprovalContext.Provider>
  );
}

export type ToolApprovalBodyProps = ToolApprovalStyleProps<ComponentProps<"div">>;

export function ToolApprovalBody({ className, ...props }: ToolApprovalBodyProps) {
  return (
    <div
      data-control-ui="tool-approval"
      data-control-family="tool-approval"
      data-slot="body"
      className={cn("min-w-0", className)}
      {...props}
    />
  );
}

export type ToolApprovalHeaderProps = ToolApprovalStyleProps<ComponentProps<"div">>;

export function ToolApprovalHeader({ className, ...props }: ToolApprovalHeaderProps) {
  return (
    <div
      data-control-ui="tool-approval"
      data-control-family="tool-approval"
      data-slot="header"
      className={cn("flex items-start gap-2", className)}
      {...props}
    />
  );
}

export type ToolApprovalIconProps = ToolApprovalStyleProps<ComponentProps<"span">>;

export function ToolApprovalIcon({ className, children, ...props }: ToolApprovalIconProps) {
  return (
    <span
      data-control-ui="tool-approval"
      data-control-family="tool-approval"
      data-slot="icon"
      aria-hidden="true"
      className={cn("inline-flex size-5 shrink-0 items-center justify-center", className)}
      {...props}
    >
      {children ?? <ShieldAlert />}
    </span>
  );
}

export type ToolApprovalTitleProps = ToolApprovalStyleProps<ComponentProps<"div">> & {
  render?: RenderProp<ComponentProps<"div">>;
};

export function ToolApprovalTitle({ render, className, ...props }: ToolApprovalTitleProps) {
  const { titleId } = useToolApprovalContext();
  return useRender({
    defaultTagName: "div",
    render,
    props: {
      ...props,
      id: titleId,
      "data-control-ui": "tool-approval",
      "data-control-family": "tool-approval",
      "data-slot": "title",
      className: cn("min-w-0 flex-1", className),
    },
  });
}

const riskColors = {
  low: "neutral",
  medium: "yellow",
  high: "red",
} satisfies Record<ToolApprovalRiskLevel, BadgeColor>;

const riskLabels = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
} satisfies Record<ToolApprovalRiskLevel, string>;

export type ToolApprovalRiskProps = Omit<ComponentProps<typeof Badge>, "color"> & {
  labels?: Partial<Record<ToolApprovalRiskLevel, string>>;
};

export function ToolApprovalRisk({ labels, children, ...props }: ToolApprovalRiskProps) {
  const { state, risk } = useToolApprovalContext();
  if (state !== "pending") return null;
  return (
    <Badge data-control-ui="tool-approval" data-slot="risk" size="sm" color={riskColors[risk]} {...props}>
      {children ?? labels?.[risk] ?? riskLabels[risk]}
    </Badge>
  );
}

const decisionLabels = {
  approved: "Approved",
  denied: "Denied",
  expired: "Expired",
} satisfies Record<Exclude<ToolApprovalState, "pending">, string>;

const decisionIcons = { approved: Check, denied: X, expired: Clock } as const;

export type ToolApprovalStatusProps = ToolApprovalStyleProps<ComponentProps<"div">> & {
  labels?: Partial<Record<Exclude<ToolApprovalState, "pending">, string>>;
};

export function ToolApprovalStatus({ labels, className, children, ...props }: ToolApprovalStatusProps) {
  const { state } = useToolApprovalContext();
  if (state === "pending") return null;
  const StatusIcon = decisionIcons[state];
  return (
    <div
      data-control-ui="tool-approval"
      data-control-family="tool-approval"
      data-slot="status"
      className={cn("shrink-0", className)}
      {...props}
    >
      <span data-control-ui="tool-approval" data-control-family="tool-approval" data-slot="status-icon" aria-hidden="true">
        <StatusIcon />
      </span>
      {children ?? labels?.[state] ?? decisionLabels[state]}
    </div>
  );
}

export type ToolApprovalDescriptionProps = ToolApprovalStyleProps<ComponentProps<"p">>;

export function ToolApprovalDescription({ className, ...props }: ToolApprovalDescriptionProps) {
  const { state } = useToolApprovalContext();
  if (state !== "pending") return null;
  return <p data-control-ui="tool-approval" data-control-family="tool-approval" data-slot="description" className={className} {...props} />;
}

export type ToolApprovalPreviewProps = ToolApprovalStyleProps<ComponentProps<"dl">>;

export function ToolApprovalPreview({ className, ...props }: ToolApprovalPreviewProps) {
  const { state } = useToolApprovalContext();
  if (state !== "pending") return null;
  return (
    <dl
      data-control-ui="tool-approval"
      data-control-family="tool-approval"
      data-slot="preview"
      className={cn("min-w-0", className)}
      {...props}
    />
  );
}

export type ToolApprovalFieldProps = Omit<ToolApprovalStyleProps<ComponentProps<"div">>, "children"> & {
  label: ReactNode;
  children: ReactNode;
};

export function ToolApprovalField({ label, children, className, ...props }: ToolApprovalFieldProps) {
  return (
    <div data-control-ui="tool-approval" data-control-family="tool-approval" data-slot="field" className={className} {...props}>
      <dt data-control-ui="tool-approval" data-control-family="tool-approval" data-slot="field-label">
        {label}
      </dt>
      <dd data-control-ui="tool-approval" data-control-family="tool-approval" data-slot="field-value" className="min-w-0 break-words">
        {children}
      </dd>
    </div>
  );
}

export type ToolApprovalFooterProps = ToolApprovalStyleProps<ComponentProps<"div">>;

export function ToolApprovalFooter({ className, ...props }: ToolApprovalFooterProps) {
  const { state } = useToolApprovalContext();
  if (state !== "pending") return null;
  return <div data-control-ui="tool-approval" data-control-family="tool-approval" data-slot="footer" className={className} {...props} />;
}

export type ToolApprovalDenyProps = ComponentProps<typeof Button> & { label?: string };

export function ToolApprovalDeny({ label = "Deny", children, onClick, ...props }: ToolApprovalDenyProps) {
  const { deny } = useToolApprovalContext();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) deny();
  }

  return (
    <Button
      data-control-ui="tool-approval"
      data-slot="deny"
      type="button"
      variant="quiet"
      size="xs"
      aria-keyshortcuts="Escape"
      onClick={handleClick}
      {...props}
    >
      {children ?? (
        <>
          {label}
          <Kbd aria-hidden="true">Esc</Kbd>
        </>
      )}
    </Button>
  );
}

export type ToolApprovalApproveProps = ComponentProps<typeof Button> & { label?: string };

export function ToolApprovalApprove({ label = "Approve", children, onClick, ...props }: ToolApprovalApproveProps) {
  const { approve } = useToolApprovalContext();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) approve();
  }

  return (
    <Button
      data-control-ui="tool-approval"
      data-slot="approve"
      type="button"
      variant="solid"
      tone="primary"
      size="xs"
      aria-keyshortcuts="Meta+Enter Control+Enter"
      onClick={handleClick}
      {...props}
    >
      {children ?? (
        <>
          {label}
          <Kbd aria-hidden="true">⌘⏎</Kbd>
        </>
      )}
    </Button>
  );
}
