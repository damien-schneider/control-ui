import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { IntentLink } from "@/app/(features)/client/intent-link";
import { cn } from "@/components/control-ui/lib/cn";
import { Text, TextLink } from "@/components/control-ui/ui/typography";

const arrows = {
  right: { Icon: ArrowRightIcon, nudge: "group-hover/arrow:translate-x-0.5 group-focus-visible/arrow:translate-x-0.5" },
  down: { Icon: ArrowDownIcon, nudge: "group-hover/arrow:translate-y-0.5 group-focus-visible/arrow:translate-y-0.5" },
} as const;

export function ArrowLink({
  href,
  direction = "right",
  className,
  children,
}: {
  href: string;
  direction?: keyof typeof arrows;
  className?: string;
  children: ReactNode;
}) {
  const { Icon, nudge } = arrows[direction];

  return (
    <TextLink
      href={href}
      render={href.startsWith("#") ? undefined : <IntentLink href={href} />}
      className={cn("group/arrow inline-flex min-h-8 items-center gap-1.5", className)}
    >
      <Text>{children}</Text>
      <Icon aria-hidden="true" className={cn("size-3.5 transition-transform duration-(--duration-fast) ease-(--ease-standard)", nudge)} />
    </TextLink>
  );
}
