import { Fragment, type ReactNode } from "react";
import { Img, Section } from "react-email";
import { EmailCaption, EmailDivider, type EmailFooterPlacement, EmailMutedLink } from "./email";

export type EmailNavLink = { label: string; href: string };

export const emailSocialPlatformNames = {
  x: "X",
  bluesky: "Bluesky",
  threads: "Threads",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  github: "GitHub",
  discord: "Discord",
  slack: "Slack",
  mastodon: "Mastodon",
} as const;

export type EmailSocialPlatform = keyof typeof emailSocialPlatformNames;
export type EmailSocialLink = { href: string; iconAlt?: string } & (
  | { platform: EmailSocialPlatform; label?: string; iconUrl?: string }
  | { platform?: undefined; label: string; iconUrl?: string }
);
export type EmailFooterAlign = "start" | "center";

function separatedLinks(links: EmailNavLink[]) {
  return links.map((link, index) => (
    <Fragment key={link.href}>
      {index > 0 ? " · " : null}
      <EmailMutedLink href={link.href}>{link.label}</EmailMutedLink>
    </Fragment>
  ));
}

export function EmailFooter({
  children,
  align = "start",
  placement = "inside",
}: {
  children: ReactNode;
  align?: EmailFooterAlign;
  placement?: EmailFooterPlacement;
}) {
  return (
    <>
      {placement === "inside" ? <EmailDivider /> : null}
      <Section className={`${placement === "inside" ? "" : "pt-6"} ${align === "center" ? "text-center" : "text-left"}`}>
        {children}
      </Section>
    </>
  );
}

export function EmailFooterLegal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <Section className={`mt-6 ${className}`}>{children}</Section>;
}

function resolveSocialLink(link: EmailSocialLink, iconBaseUrl?: string) {
  const label = link.platform ? (link.label ?? emailSocialPlatformNames[link.platform]) : link.label;
  const base = iconBaseUrl?.replace(/\/$/, "");
  const iconUrl = link.iconUrl ?? (link.platform && base ? `${base}/${link.platform}.png` : undefined);
  return { label, iconUrl, alt: link.iconAlt ?? label };
}

export function EmailSocialLinks({
  links,
  iconBaseUrl,
  iconSize = 24,
}: {
  links: EmailSocialLink[];
  iconBaseUrl?: string;
  iconSize?: number;
}) {
  if (links.length === 0) return null;
  return (
    <Section className="mb-4">
      {links.map((link, index) => {
        const { label, iconUrl, alt } = resolveSocialLink(link, iconBaseUrl);
        const spacing = index < links.length - 1 ? "mr-3" : "";
        return (
          <Fragment key={link.href}>
            {index > 0 ? " " : null}
            <EmailMutedLink href={link.href} className={`${iconUrl ? "no-underline" : "underline"} ${spacing}`}>
              {iconUrl ? <Img src={iconUrl} alt={alt} width={iconSize} height={iconSize} className="inline-block align-middle" /> : label}
            </EmailMutedLink>
          </Fragment>
        );
      })}
    </Section>
  );
}

export function EmailFooterLinks({ links }: { links: EmailNavLink[] }) {
  if (links.length === 0) return null;
  return <EmailCaption className="mb-2">{separatedLinks(links)}</EmailCaption>;
}

export function EmailAddress({ company, lines }: { company: string; lines: string[] }) {
  return (
    <EmailCaption className="mb-2">
      <strong className="font-semibold">{company}</strong>
      {lines.map((line) => (
        <Fragment key={line}>
          <br />
          {line}
        </Fragment>
      ))}
    </EmailCaption>
  );
}

export function EmailUnsubscribe({
  unsubscribeUrl,
  preferencesUrl,
  unsubscribeLabel = "Unsubscribe",
  preferencesLabel = "Manage preferences",
}: {
  unsubscribeUrl: string;
  preferencesUrl?: string;
  unsubscribeLabel?: string;
  preferencesLabel?: string;
}) {
  const unsubscribe = { label: unsubscribeLabel, href: unsubscribeUrl };
  const links = preferencesUrl ? [unsubscribe, { label: preferencesLabel, href: preferencesUrl }] : [unsubscribe];
  return <EmailCaption className="mb-2">{separatedLinks(links)}</EmailCaption>;
}
