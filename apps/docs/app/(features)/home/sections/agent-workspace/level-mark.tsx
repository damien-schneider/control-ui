import type { ReactNode } from "react";
import { annotationTagClassName } from "@/app/(features)/home/shared/annotation-tag";
import { cn } from "@/components/control-ui/lib/cn";
import { Text } from "@/components/control-ui/ui/typography";

export type InstallLevel = 1 | 2 | 3;

const shapes = {
  frame: { inset: "-inset-2", radius: "rounded-[calc(var(--radius)*2.4)] rounded-tl-none", fill: "", tag: "start-0 rounded-b-none" },
  card: {
    inset: "-inset-1.5",
    radius: "rounded-[calc(var(--radius)*2)] rounded-tl-none",
    fill: "bg-info/6",
    tag: "start-0 rounded-b-none",
  },
  pill: {
    inset: "-inset-1.5",
    radius: "rounded-[calc(var(--radius)*2.2)] rounded-tl-none",
    fill: "bg-info/6",
    tag: "start-0 rounded-b-none",
  },
  control: { inset: "-inset-1", radius: "rounded-xl rounded-tr-none", fill: "bg-info/10", tag: "end-0 rounded-b-none" },
} as const;

export function LevelBadge({ level, className }: { level: InstallLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-3.5 shrink-0 items-center justify-center rounded-[calc(var(--radius-sm)/2)] bg-white text-info",
        className,
      )}
    >
      <Text size="micro" weight="bold" mono>
        {level}
      </Text>
    </span>
  );
}

export function LevelMark({
  level,
  label,
  shape,
  className,
  children,
}: {
  level: InstallLevel;
  label: string;
  shape: keyof typeof shapes;
  className?: string;
  children: ReactNode;
}) {
  const { inset, radius, fill, tag } = shapes[shape];

  return (
    <div data-mark={level} className={cn("relative min-w-0", className)}>
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "home-agent-workspace-outline pointer-events-none absolute z-1 border-[1.5px] border-info transition-[opacity,background-color,box-shadow] duration-(--duration-fast) ease-(--ease-standard)",
          inset,
          radius,
          fill,
        )}
      >
        <span className={cn(annotationTagClassName, "absolute bottom-full -mx-[1.5px] gap-1.5 ps-1 pe-2", tag)}>
          <LevelBadge level={level} />
          <Text size="caption" weight="medium" mono className="whitespace-nowrap">
            {label}
          </Text>
        </span>
      </span>
    </div>
  );
}
