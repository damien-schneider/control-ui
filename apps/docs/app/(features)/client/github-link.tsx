import { ButtonLink } from "@/components/control-ui/ui/button";
import { siteConfig } from "@/lib/site-config";

const starsFormatter = new Intl.NumberFormat("en-US");

function GithubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function StarMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 -translate-y-px">
      <defs>
        <linearGradient id="docs-github-star-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.95 0.13 100)" />
          <stop offset="52%" stopColor="oklch(0.87 0.17 88)" />
          <stop offset="100%" stopColor="oklch(0.75 0.17 72)" />
        </linearGradient>
        <filter id="docs-github-star-depth" x="-25%" y="-25%" width="150%" height="150%">
          <feOffset in="SourceAlpha" dy="-1" result="raised" />
          <feGaussianBlur in="raised" stdDeviation="0.7" result="raisedBlur" />
          <feComposite in="SourceAlpha" in2="raisedBlur" operator="out" result="lowerEdge" />
          <feFlood floodColor="oklch(0.52 0.14 62)" floodOpacity="0.55" result="shade" />
          <feComposite in="shade" in2="lowerEdge" operator="in" result="innerShade" />
          <feOffset in="SourceAlpha" dy="1" result="lowered" />
          <feGaussianBlur in="lowered" stdDeviation="0.6" result="loweredBlur" />
          <feComposite in="SourceAlpha" in2="loweredBlur" operator="out" result="upperEdge" />
          <feFlood floodColor="oklch(0.99 0.04 104)" floodOpacity="0.7" result="light" />
          <feComposite in="light" in2="upperEdge" operator="in" result="innerLight" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="innerShade" />
            <feMergeNode in="innerLight" />
          </feMerge>
        </filter>
      </defs>
      <path
        fill="url(#docs-github-star-fill)"
        filter="url(#docs-github-star-depth)"
        d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
      />
    </svg>
  );
}

export function DocsGithubLink({ stars }: { stars: number | null }) {
  const formattedStars = stars == null ? null : starsFormatter.format(stars);
  const label =
    formattedStars == null ? "Control UI on GitHub" : `Control UI on GitHub, ${formattedStars} ${stars === 1 ? "star" : "stars"}`;

  return (
    <ButtonLink
      href={`https://github.com/${siteConfig.registry.githubRepo}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      variant="solid"
      tone="primary"
      size="sm"
    >
      <GithubMark />
      <span>GitHub</span>
      {formattedStars == null ? null : (
        <span className="inline-flex items-center gap-1 border-current/30 border-s ps-2 font-mono text-caption tabular-nums">
          {formattedStars}
          <StarMark />
        </span>
      )}
    </ButtonLink>
  );
}
