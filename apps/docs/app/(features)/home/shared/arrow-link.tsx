import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { IntentLink } from "@/app/(features)/client/intent-link";
import { cn } from "@/components/control-ui/lib/cn";
import { Text } from "@/components/control-ui/ui/typography";

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
  const Link = href.startsWith("#") ? "a" : IntentLink;

  return (
    <Link
      href={href}
      className={cn(
        "group/arrow -mx-1.5 inline-flex min-h-8 items-center gap-1.5 rounded-md px-1.5 text-foreground outline-none transition-colors duration-(--duration-fast) ease-(--ease-standard) hover:text-foreground/70 focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Text weight="medium">{children}</Text>
      <Icon aria-hidden="true" className={cn("size-3.5 transition-transform duration-(--duration-fast) ease-(--ease-standard)", nudge)} />
    </Link>
  );
}
