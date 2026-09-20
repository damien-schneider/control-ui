import { Fragment, type ReactNode } from "react";
import {
  Body,
  Button,
  type ButtonProps,
  Column,
  Container,
  Head,
  Heading,
  type HeadingProps,
  Hr,
  type HrProps,
  Html,
  Img,
  Link,
  type LinkProps,
  Preview,
  pixelBasedPreset,
  Row,
  Section,
  type SectionProps,
  Tailwind,
  type TailwindConfig,
  Text,
  type TextProps,
} from "react-email";
import type { EmailTheme } from "./theme";

function tailwindTheme(theme: EmailTheme): TailwindConfig {
  return {
    presets: [pixelBasedPreset],
    theme: {
      extend: {
        colors: theme.colors,
        borderRadius: theme.radii,
        minHeight: { control: theme.button.height },
        padding: { "control-x": theme.button.paddingInline, "control-y": theme.button.paddingBlock },
        fontFamily: { body: theme.fonts.body, display: theme.fonts.display, mono: theme.fonts.mono },
        fontSize: {
          ...Object.fromEntries(Object.entries(theme.text).map(([name, { fontSize, ...options }]) => [name, [fontSize, options]])),
          control: [theme.button.fontSize, { lineHeight: theme.button.lineHeight }],
        },
      },
    },
  };
}

export function EmailLayout({
  theme,
  preview,
  children,
  head,
  lang = "en",
  dir = "ltr",
}: {
  theme: EmailTheme;
  preview: string;
  children: ReactNode;
  head?: ReactNode;
  lang?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <Html lang={lang} dir={dir}>
      <Tailwind config={tailwindTheme(theme)}>
        <Head>
          <meta name="color-scheme" content={theme.colorScheme} />
          <meta name="supported-color-schemes" content={theme.colorScheme} />
          {head}
        </Head>
        <Body className="m-0 bg-background p-4 font-body text-body text-foreground">
          <Preview>{preview}</Preview>
          <Container className="mx-auto w-full max-w-[600px] rounded-panel bg-card p-6 text-card-foreground">{children}</Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

const headingClasses = { h1: "text-heading-1", h2: "text-heading-2", h3: "text-heading-3", h4: "text-heading-4" };

export function EmailHeading({ as = "h1", className = "", ...props }: Omit<HeadingProps, "as"> & { as?: keyof typeof headingClasses }) {
  return <Heading {...props} as={as} className={`mb-4 mt-0 font-display text-card-foreground ${headingClasses[as]} ${className}`} />;
}

export function EmailText({ tone = "default", className = "", style, ...props }: TextProps & { tone?: "default" | "muted" }) {
  const textColor = tone === "muted" ? "text-muted-foreground" : "text-card-foreground";
  return (
    <Text
      {...props}
      style={{ overflowWrap: "break-word", ...style }}
      className={`mb-4 mt-0 font-body text-body ${textColor} ${className}`}
    />
  );
}

export function EmailButton({ className = "", ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={`box-border min-h-control rounded-control bg-primary px-control-x py-control-y text-center font-body text-control font-medium text-primary-foreground no-underline ${className}`}
    />
  );
}

export function EmailLink({ className = "", ...props }: LinkProps) {
  return <Link {...props} className={`font-body text-primary-text underline ${className}`} />;
}

export function EmailCaption({ className = "", ...props }: TextProps) {
  return <EmailText tone="muted" {...props} className={`text-caption ${className}`} />;
}

export function EmailDivider({ className = "", ...props }: HrProps) {
  return <Hr {...props} className={`my-6 border-0 border-t border-solid border-t-border ${className}`} />;
}

export function EmailPanel({ className = "", ...props }: SectionProps) {
  return <Section {...props} className={`my-6 rounded-panel bg-muted p-5 ${className}`} />;
}

export function EmailCode({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <EmailPanel className={`text-center ${className}`}>
      <EmailText className="mb-0 text-center font-mono text-heading-2 font-semibold tracking-[0.25em]">{children}</EmailText>
    </EmailPanel>
  );
}

export function EmailBulletList({ items, className = "" }: { items: ReactNode[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <ul className={`mb-4 mt-0 list-disc pl-5 font-body text-body text-card-foreground ${className}`}>
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: list entries are positional content with no stable identity.
        <li key={index} className="mb-1 font-body text-body text-card-foreground">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function EmailDetailRow({ label, value, emphasis = false }: { label: ReactNode; value: ReactNode; emphasis?: boolean }) {
  const valueWeight = emphasis ? "font-semibold" : "";
  return (
    <Row className="table-fixed">
      <Column className="align-top">
        <EmailText className="mb-2">{label}</EmailText>
      </Column>
      <Column align="right" className="align-top">
        <EmailText className={`mb-2 ${valueWeight}`}>{value}</EmailText>
      </Column>
    </Row>
  );
}

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

export function EmailHeader({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
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

export type EmailNavLink = { label: string; href: string };
export type EmailSocialLink = EmailNavLink & { iconUrl?: string; iconAlt?: string };

const captionLinkClasses = "text-caption text-muted-foreground";

function separatedLinks(links: EmailNavLink[]) {
  return links.map((link, index) => (
    <Fragment key={link.href}>
      {index > 0 ? " · " : null}
      <EmailLink href={link.href} className={captionLinkClasses}>
        {link.label}
      </EmailLink>
    </Fragment>
  ));
}

export function EmailBrowserLink({ href, children = "View in browser" }: { href: string; children?: ReactNode }) {
  return (
    <EmailLink href={href} className={captionLinkClasses}>
      {children}
    </EmailLink>
  );
}

export function EmailFooter({ children }: { children: ReactNode }) {
  return (
    <>
      <EmailDivider />
      <Section>{children}</Section>
    </>
  );
}

export function EmailSocialLinks({ links, iconSize = 20 }: { links: EmailSocialLink[]; iconSize?: number }) {
  if (links.length === 0) return null;
  return (
    <Section className="mb-4">
      {links.map((link, index) => {
        const spacing = index < links.length - 1 ? "mr-4" : "";
        const decoration = link.iconUrl ? "no-underline" : "underline";
        return (
          <Fragment key={link.href}>
            {index > 0 ? " " : null}
            <EmailLink href={link.href} className={`${captionLinkClasses} ${decoration} ${spacing}`}>
              {link.iconUrl ? (
                <Img src={link.iconUrl} alt={link.iconAlt ?? link.label} width={iconSize} height={iconSize} className="inline-block" />
              ) : (
                link.label
              )}
            </EmailLink>
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
      {company}
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
