import Link from "next/link";
import { Badge } from "@/components/control-ui/ui/badge";
import { Text } from "@/components/control-ui/ui/typography";
import { siteConfig } from "@/lib/site-config";
import { ControlUiLogo } from "./control-ui-logo";

export function DocsBrand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <Link href="/" onClick={onNavigate} className="flex min-w-0 items-center gap-1.5">
        <ControlUiLogo />
        <Text size="heading-4" className="block truncate">
          {siteConfig.name}
        </Text>
      </Link>
      <Badge size="sm">alpha</Badge>
    </span>
  );
}
