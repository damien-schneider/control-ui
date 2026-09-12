import type { ReactNode } from "react";
import {
  Body,
  Button,
  type ButtonProps,
  Container,
  Head,
  Heading,
  type HeadingProps,
  Html,
  Link,
  type LinkProps,
  Preview,
  pixelBasedPreset,
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
        fontFamily: { body: theme.fonts.body, display: theme.fonts.display },
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
        <Head>{head}</Head>
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
