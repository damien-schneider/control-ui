import type { SVGProps } from "react";
import { labOfProvider } from "@/components/control-ui/lib/model-name";
import { PROVIDER_MARKS } from "@/components/control-ui/lib/provider-marks";

export type ProviderLogoProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  /** A lab or host id as APIs write it: `anthropic`, `openai.chat`, `meta-llama`. */
  provider: string;
  /** Names the logo for assistive tech; without it the logo is decorative, as beside a model name. */
  label?: string;
};

export function ProviderLogo({ provider, label, ...props }: ProviderLogoProps) {
  const lab = labOfProvider(provider) ?? provider;
  const mark = PROVIDER_MARKS[lab];
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      fillRule="evenodd"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-control-ui="provider-logo"
      data-slot="root"
      {...props}
    >
      {mark ? (
        mark.paths.map((path) => <path key={path} d={path} />)
      ) : (
        <>
          <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
          <text x="12" y="12" dy="0.35em" textAnchor="middle" fontSize="12" fontWeight="600">
            {lab.match(/[a-z0-9]/i)?.[0]?.toUpperCase()}
          </text>
        </>
      )}
    </svg>
  );
}
