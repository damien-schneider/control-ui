import { ButtonLink } from "@/components/control-ui/ui/button";
import { siteConfig } from "@/lib/site-config";

export function DocsBylineLink({ className }: { className?: string }) {
  return (
    <ButtonLink href={siteConfig.author.href} target="_blank" rel="noopener noreferrer" variant="quiet" size="xs" className={className}>
      by {siteConfig.author.name}
    </ButtonLink>
  );
}

export function DocsResourceLinks() {
  return (
    <>
      <ButtonLink href="/llms.txt" variant="quiet" size="xs">
        llms.txt
      </ButtonLink>
      <ButtonLink
        href={`https://github.com/${siteConfig.registry.githubRepo}/blob/main/LICENSE`}
        target="_blank"
        rel="noopener noreferrer"
        variant="quiet"
        size="xs"
      >
        MIT license
      </ButtonLink>
    </>
  );
}
