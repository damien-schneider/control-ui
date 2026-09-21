import type { ReactNode } from "react";
import { Column, Img, Link, Row } from "react-email";
import { EmailCaption, type EmailFooterPlacement, EmailMutedLink, EmailSection } from "./email";
import {
  EmailAddress,
  EmailFooter,
  type EmailFooterAlign,
  EmailFooterLegal,
  EmailFooterLinks,
  type EmailNavLink,
  type EmailSocialLink,
  EmailSocialLinks,
  EmailUnsubscribe,
} from "./email-footer";
import type { EmailColorScheme } from "./theme";

export type EmailBrand = {
  name: string;
  homeUrl: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
};

export type EmailFooterContent = {
  tagline: string;
  socialLinks: EmailSocialLink[];
  socialIconBaseUrl?: string;
  helpLinks: EmailNavLink[];
  sender: { company: string; addressLines: string[] };
  reason: string;
  legal: string;
  align?: EmailFooterAlign;
  placement?: EmailFooterPlacement;
} & ({ mailing: "transactional" } | { mailing: "marketing"; unsubscribeUrl: string; preferencesUrl?: string });

export function EmailLogo({
  name,
  src,
  width = 120,
  height = 32,
  href,
}: {
  name: string;
  src?: string;
  width?: number;
  height?: number;
  href?: string;
}) {
  const mark = src ? (
    <Img src={src} alt={name} width={width} height={height} className="inline-block" />
  ) : (
    <span className="font-display text-heading-4 font-semibold text-card-foreground">{name}</span>
  );
  return href ? (
    <Link href={href} className="text-card-foreground no-underline">
      {mark}
    </Link>
  ) : (
    mark
  );
}

export function EmailBrowserLink({ href, children = "View in browser" }: { href: string; children?: ReactNode }) {
  return <EmailMutedLink href={href}>{children}</EmailMutedLink>;
}

export type EmailHeaderAlign = "split" | "center";

export function EmailHeader({ children, aside, align = "split" }: { children: ReactNode; aside?: ReactNode; align?: EmailHeaderAlign }) {
  if (align === "center")
    return (
      <EmailSection align="center" className="mb-8">
        {children}
        {aside ? (
          <EmailSection align="center" className="mt-3">
            {aside}
          </EmailSection>
        ) : null}
      </EmailSection>
    );
  return (
    <Row className="mb-8">
      <Column className="align-middle">{children}</Column>
      {aside ? (
        <Column align="right" className="align-middle">
          {aside}
        </Column>
      ) : null}
    </Row>
  );
}

export function EmailBrandHeader({
  brand,
  browserUrl,
  colorScheme = "light",
  align = "split",
}: {
  brand: EmailBrand;
  browserUrl?: string;
  colorScheme?: EmailColorScheme;
  align?: EmailHeaderAlign;
}) {
  const logoUrl = colorScheme === "dark" ? (brand.logoDarkUrl ?? brand.logoUrl) : brand.logoUrl;
  return (
    <EmailHeader align={align} aside={browserUrl ? <EmailBrowserLink href={browserUrl} /> : null}>
      <EmailLogo name={brand.name} src={logoUrl} width={brand.logoWidth} height={brand.logoHeight} href={brand.homeUrl} />
    </EmailHeader>
  );
}

export function EmailBrandFooter({ footer }: { footer: EmailFooterContent }) {
  return (
    <EmailFooter align={footer.align} placement={footer.placement}>
      <EmailSocialLinks links={footer.socialLinks} iconBaseUrl={footer.socialIconBaseUrl} />
      <EmailFooterLinks links={footer.helpLinks} />
      <EmailCaption className="mb-0">{footer.tagline}</EmailCaption>
      <EmailFooterLegal>
        <EmailAddress company={footer.sender.company} lines={footer.sender.addressLines} />
        <EmailCaption className="mb-2">{footer.reason}</EmailCaption>
        {footer.mailing === "marketing" ? (
          <EmailUnsubscribe unsubscribeUrl={footer.unsubscribeUrl} preferencesUrl={footer.preferencesUrl} />
        ) : null}
        <EmailCaption className="mb-0">{footer.legal}</EmailCaption>
      </EmailFooterLegal>
    </EmailFooter>
  );
}
