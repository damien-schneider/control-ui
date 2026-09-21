import type { ReactNode } from "react";
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

export type EmailVariant = "contained" | "plain";
export type EmailFooterPlacement = "inside" | "outside";

export function surfaceColors(theme: EmailTheme, variant: EmailVariant) {
  if (variant === "contained") return theme.colors;
  return { ...theme.colors, card: theme.colors.background, "card-foreground": theme.colors.foreground };
}

function tailwindTheme(theme: EmailTheme, variant: EmailVariant): TailwindConfig {
  return {
    presets: [pixelBasedPreset],
    theme: {
      extend: {
        colors: surfaceColors(theme, variant),
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
  footer,
  footerPlacement = "inside",
  head,
  lang = "en",
  dir = "ltr",
  variant = "contained",
}: {
  theme: EmailTheme;
  preview: string;
  children: ReactNode;
  footer?: ReactNode;
  footerPlacement?: EmailFooterPlacement;
  head?: ReactNode;
  lang?: string;
  dir?: "ltr" | "rtl";
  variant?: EmailVariant;
}) {
  const contained = variant === "contained";
  const outside = contained && footerPlacement === "outside";
  const backdrop = theme.colorScheme === "light" ? "bg-muted" : "bg-background";
  return (
    <Html lang={lang} dir={dir}>
      <Tailwind config={tailwindTheme(theme, variant)}>
        <Head>
          <meta name="color-scheme" content={theme.colorScheme} />
          <meta name="supported-color-schemes" content={theme.colorScheme} />
          {head}
        </Head>
        <Body className={`m-0 font-body text-body text-foreground ${contained ? `${backdrop} px-4 py-8` : "bg-background p-0"}`}>
          <Preview>{preview}</Preview>
          <Container
            className={`mx-auto w-full max-w-[600px] bg-card text-card-foreground ${contained ? "rounded-panel border border-border border-solid p-6" : "px-6 py-8"}`}
          >
            {children}
            {outside ? null : footer}
          </Container>
          {outside ? <Container className="mx-auto w-full max-w-[600px] px-6">{footer}</Container> : null}
        </Body>
      </Tailwind>
    </Html>
  );
}

export type EmailAlign = "left" | "center" | "right";

const alignClasses = { left: "text-left", center: "text-center", right: "text-right" };

function alignClass(align?: EmailAlign) {
  return align ? alignClasses[align] : "";
}

const headingSizeClasses = {
  display: "text-display",
  "heading-1": "text-heading-1",
  "heading-2": "text-heading-2",
  "heading-3": "text-heading-3",
  "heading-4": "text-heading-4",
};

type EmailHeadingSize = keyof typeof headingSizeClasses;

const headingSizeForTag = { h1: "heading-1", h2: "heading-2", h3: "heading-3", h4: "heading-4" } as const;

export function EmailHeading({
  as = "h1",
  size,
  align,
  className = "",
  ...props
}: Omit<HeadingProps, "as"> & { as?: keyof typeof headingSizeForTag; size?: EmailHeadingSize; align?: EmailAlign }) {
  const sizeClass = headingSizeClasses[size ?? headingSizeForTag[as]];
  return (
    <Heading {...props} as={as} className={`mb-4 mt-0 font-display text-card-foreground ${sizeClass} ${alignClass(align)} ${className}`} />
  );
}

export function EmailSection({ align, className = "", ...props }: SectionProps & { align?: EmailAlign }) {
  return <Section {...props} className={`${alignClass(align)} ${className}`} />;
}

export function EmailText({
  tone = "default",
  align,
  className = "",
  style,
  ...props
}: TextProps & { tone?: "default" | "muted"; align?: EmailAlign }) {
  const textColor = tone === "muted" ? "text-muted-foreground" : "text-card-foreground";
  return (
    <Text
      {...props}
      style={{ overflowWrap: "break-word", ...style }}
      className={`mb-4 mt-0 font-body text-body ${textColor} ${alignClass(align)} ${className}`}
    />
  );
}

export function EmailButton({ width = "auto", className = "", ...props }: ButtonProps & { width?: "auto" | "full" }) {
  const widthClass = width === "full" ? "block w-full" : "inline-block";
  return (
    <Button
      {...props}
      className={`box-border min-h-control rounded-control bg-primary px-control-x py-control-y text-center font-body text-control font-medium text-primary-foreground no-underline ${widthClass} ${className}`}
    />
  );
}

export function EmailLink({ className = "", ...props }: LinkProps) {
  return <Link {...props} className={`font-body text-primary-text underline ${className}`} />;
}

export function EmailCaption({ className = "", ...props }: TextProps & { align?: EmailAlign }) {
  return <EmailText tone="muted" {...props} className={`text-caption ${className}`} />;
}

export function EmailMutedLink({ className = "", ...props }: LinkProps) {
  return <EmailLink {...props} className={`text-caption text-muted-foreground ${className}`} />;
}

export function EmailDivider({ className = "", ...props }: HrProps) {
  return <Hr {...props} className={`my-6 border-0 border-t border-solid border-t-border ${className}`} />;
}

export function EmailPanel({ className = "", ...props }: SectionProps) {
  return <Section {...props} className={`my-6 rounded-panel bg-muted p-5 ${className}`} />;
}

export function EmailOneTimeCode({ children, className = "" }: { children: ReactNode; className?: string }) {
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

export function EmailColumns({
  children,
  widths,
  gap = 20,
  verticalAlign = "top",
  className = "",
}: {
  children: ReactNode[];
  widths?: string[];
  gap?: number;
  verticalAlign?: "top" | "middle" | "bottom";
  className?: string;
}) {
  if (children.length === 0) return null;
  const evenWidth = `${(100 / children.length).toFixed(4)}%`;
  return (
    <Row className={`mb-6 table-fixed ${className}`}>
      {children.map((child, index) => (
        <Column
          // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional slots with no stable identity.
          key={index}
          width={widths?.[index] ?? evenWidth}
          className={`max-[480px]:block max-[480px]:w-full max-[480px]:pl-0 ${index === 0 ? "" : `max-[480px]:pt-[${gap}px]`}`}
          style={{ verticalAlign, paddingLeft: index === 0 ? 0 : gap }}
        >
          {child}
        </Column>
      ))}
    </Row>
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
