import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { render, toPlainText } from "react-email";
import { skinMetas } from "@/app/(features)/catalog/skins";
import { emailLayouts } from "@/src/registry/examples/control-ui/email/options";
import { renderEmailExample } from "@/src/registry/examples/control-ui/email/render-example";
import { EmailLayout } from "./email";
import type { EmailFooterContent } from "./email-brand";
import { EmailSocialLinks } from "./email-footer";
import { InvitationEmail, ReleaseNotesEmail } from "./templates";
import { emailThemeFromCss } from "./theme";

const coreCss = readFileSync(new URL("../theme.css", import.meta.url), "utf8");
const codeCss = readFileSync(new URL("../code.css", import.meta.url), "utf8");
const refinedCss = readFileSync(new URL("../../../skin-packs/refined/theme.css", import.meta.url), "utf8");
const footer: EmailFooterContent = {
  tagline: "Made by the Studio team.",
  socialLinks: [{ label: "LinkedIn", href: "https://example.com/linkedin" }],
  helpLinks: [{ label: "Privacy", href: "https://example.com/privacy" }],
  sender: { company: "Studio, Inc.", addressLines: ["1 Market Street", "San Francisco, CA 94105"] },
  reason: "You receive this email because a teammate invited you.",
  legal: "© 2026 Studio, Inc.",
  mailing: "transactional",
};
const invitation = {
  brand: { name: "Studio", homeUrl: "https://example.com" },
  footer,
  inviter: "Alex & Sam",
  workspace: "Research <Lab>",
  inviteUrl: "https://example.com/join?team=lab&token=123",
};
const release = {
  brand: { name: "Studio", homeUrl: "https://example.com" },
  footer,
  version: "2.4",
  summary: "A quieter canvas and faster search.",
  sections: [{ title: "New", changes: ["Shared spaces"] }],
  migration: { notes: "### Upgrading\n\nTokens move to a scoped id.", language: "javascript" as const, code: "const id = 1;" },
  changelogUrl: "https://example.com/changelog",
};

describe("email rendering", () => {
  for (const skin of skinMetas) {
    for (const mode of ["light", "dark"] as const) {
      test(`${skin.id} ${mode} renders without app CSS`, async () => {
        const skinCss =
          skin.id === "none" ? "" : readFileSync(new URL(`../../../skin-packs/${skin.id}/theme.css`, import.meta.url), "utf8");
        const theme = emailThemeFromCss([coreCss, skinCss], mode);
        const html = await render(<InvitationEmail {...invitation} theme={theme} />);
        expect(html).toContain('role="presentation"');
        expect(html).toContain("Research &lt;Lab&gt;");
        expect(html).not.toMatch(/var\(|oklch\(|\drem\b/);
        expect(html).toContain(theme.colors.primary.replaceAll(" ", ""));
        expect(toPlainText(html)).toContain(invitation.inviteUrl);
        expect(Buffer.byteLength(html)).toBeLessThan(102_400);
      });
    }
  }

  for (const layout of emailLayouts) {
    test(`${layout.label} exports complete HTML and plain text`, async () => {
      const { html, text } = await renderEmailExample(layout.id, emailThemeFromCss([coreCss, refinedCss]));
      expect(html).toContain("<!DOCTYPE html");
      expect(html).toContain("<h1");
      expect(html).not.toMatch(/var\(|oklch\(|\drem\b|display:(flex|grid)/);
      expect(html).toContain('alt="FIELDWORK"');
      expect(text).toContain("https://example.com/");
      expect(text).toContain("Fieldwork, Inc.");
      expect(text).toContain("San Francisco, CA 94114");
      if (["product", "editorial", "newsletter"].includes(layout.id)) {
        expect(html).toMatch(/<img[^>]+alt="[^"]+"/);
        expect(html).toContain("https://images.unsplash.com/");
      }
      expect(Buffer.byteLength(html)).toBeLessThan(102_400);
    });
  }

  test("theme edits change subsequent email output without changing the original theme", async () => {
    const original = emailThemeFromCss([coreCss, refinedCss]);
    const changed = emailThemeFromCss([
      coreCss,
      refinedCss,
      '[data-skin="refined"] { --primary: oklch(0.45 0.12 240); --text-heading-1: 2rem; }',
    ]);
    const originalHtml = await render(<InvitationEmail {...invitation} theme={original} />);
    const changedHtml = await render(<InvitationEmail {...invitation} theme={changed} />);
    expect(changedHtml).toContain("font-size:32px");
    expect(changedHtml).toContain(changed.colors.primary.replaceAll(" ", ""));
    expect(originalHtml).not.toContain(changed.colors.primary.replaceAll(" ", ""));
  });

  test("marketing footers carry the unsubscribe, preference center, and reason lines", async () => {
    const { html, text } = await renderEmailExample("newsletter", emailThemeFromCss([coreCss, refinedCss]));
    expect(html).toContain('href="https://example.com/unsubscribe"');
    expect(html).toContain('href="https://example.com/email-preferences"');
    expect(text).toContain("Unsubscribe");
    expect(text).toContain("Manage preferences");
    expect(text).toContain("You receive this email because you subscribed to Fieldwork updates.");
  });

  test("transactional footers identify the sender without a marketing unsubscribe link", async () => {
    const { html, text } = await renderEmailExample("verification", emailThemeFromCss([coreCss, refinedCss]));
    expect(html).not.toContain("https://example.com/unsubscribe");
    expect(text).not.toContain("Unsubscribe");
    expect(text).toContain("You receive this email because you have a Fieldwork account.");
    expect(text).toContain("418 902");
  });

  test("known social platforms resolve to hosted icons and degrade to their label without a base URL", async () => {
    const theme = emailThemeFromCss([coreCss, refinedCss]);
    const withIcons = await render(
      <EmailLayout theme={theme} preview="Footer">
        <EmailSocialLinks
          iconBaseUrl="https://example.com/email/social/"
          links={[
            { platform: "linkedin", href: "https://example.com/linkedin" },
            { platform: "youtube", href: "https://example.com/youtube", iconUrl: "https://cdn.example.com/yt.png" },
          ]}
        />
      </EmailLayout>,
    );
    expect(withIcons).toMatch(/<img[^>]+src="https:\/\/example\.com\/email\/social\/linkedin\.png"[^>]*>/);
    expect(withIcons).toContain('alt="LinkedIn"');
    expect(withIcons).toContain('src="https://cdn.example.com/yt.png"');
    expect(withIcons).toContain('href="https://example.com/linkedin"');

    const withoutBase = await render(
      <EmailLayout theme={theme} preview="Footer">
        <EmailSocialLinks links={[{ platform: "linkedin", href: "https://example.com/linkedin" }]} />
      </EmailLayout>,
    );
    expect(withoutBase).not.toContain("<img");
    expect(toPlainText(withoutBase)).toContain("LinkedIn");
  });

  test("the plain variant drops the card so the message sits on the page background", async () => {
    const theme = emailThemeFromCss([
      coreCss,
      codeCss,
      refinedCss,
      '[data-skin="refined"] { --background: oklch(0.2 0 0); --foreground: oklch(0.98 0 0); --card: oklch(1 0 0); --card-foreground: oklch(0.1 0 0); }',
    ]);
    const containerStyle = (html: string) => html.match(/style="([^"]*max-width:600px[^"]*)"/)?.[1] ?? "";
    const contained = containerStyle(await render(<InvitationEmail {...invitation} theme={theme} />));
    const plain = containerStyle(await render(<InvitationEmail {...invitation} theme={theme} variant="plain" />));
    const cardSurface = theme.colors.card.replaceAll(" ", "");
    expect(contained).toContain(`background-color:${cardSurface}`);
    expect(contained).toContain(`border-radius:${theme.radii.panel}`);
    expect(contained).toContain("border-style:solid");
    expect(contained).toContain(`color:${theme.colors["card-foreground"].replaceAll(" ", "")}`);
    expect(plain).not.toContain(`background-color:${cardSurface}`);
    expect(plain).not.toContain("border-radius");
    expect(plain).not.toContain("border-style");
    expect(plain).toContain(`color:${theme.colors.foreground.replaceAll(" ", "")}`);

    const plainMarkdown = await render(<ReleaseNotesEmail {...release} theme={theme} variant="plain" />);
    expect(plainMarkdown).not.toContain(`color:${theme.colors["card-foreground"].replaceAll(" ", "")}`);
  });

  test("the footer groups the sender identity below the brand block", async () => {
    const { text } = await renderEmailExample("newsletter", emailThemeFromCss([coreCss, refinedCss]));
    const order = ["Help center", "Made for the way you work", "Fieldwork, Inc.", "United States", "You receive this email", "Unsubscribe"];
    const positions = order.map((line) => text.indexOf(line));
    expect(positions).not.toContain(-1);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
  });

  test("an outside footer leaves the card and sits on the page backdrop", async () => {
    const theme = emailThemeFromCss([coreCss, refinedCss]);
    const secondContainer = (html: string) => html.indexOf("max-width:600px", html.indexOf("max-width:600px") + 1);

    const { html: outside } = await renderEmailExample("newsletter", theme);
    expect(secondContainer(outside)).toBeGreaterThan(-1);
    expect(outside.slice(0, secondContainer(outside))).not.toContain("Unsubscribe");
    expect(outside).toContain("Unsubscribe");

    const { html: inside } = await renderEmailExample("product", theme);
    expect(secondContainer(inside)).toBe(-1);
    expect(inside).toContain("Unsubscribe");
  });

  test("markdown and code blocks take their colors from the active syntax palette", async () => {
    const theme = emailThemeFromCss([coreCss, codeCss, refinedCss]);
    const { html, text } = await renderEmailExample("release", theme);
    expect(html).toContain("Upgrading");
    expect(html).toContain('href="https://example.com/changelog/2-4"');
    expect(html).toContain(theme.code.keyword);
    expect(html).toContain(theme.code.comment);
    expect(text).toContain("fieldwork.workspaces.get");
  });

  test("declares the baked color scheme so clients stop inverting the palette", async () => {
    for (const mode of ["light", "dark"] as const) {
      const html = await render(<InvitationEmail {...invitation} theme={emailThemeFromCss([coreCss, refinedCss], mode)} />);
      expect(html).toContain(`<meta name="color-scheme" content="${mode}"`);
      expect(html).toContain(`<meta name="supported-color-schemes" content="${mode}"`);
    }
  });

  test("release notes keep every changelog bullet in the plain-text alternative", async () => {
    const { html, text } = await renderEmailExample("release", emailThemeFromCss([coreCss, refinedCss]));
    expect(html).toContain("<ul");
    expect(text).toContain("Shared spaces");
    expect(text).toContain("Recurring reminders no longer skip the first week of a new month.");
  });
});

describe("email theme boundary", () => {
  test("shared geometry overrides reach the exported button and surface styles", async () => {
    const theme = emailThemeFromCss([
      coreCss,
      refinedCss,
      '[data-skin="refined"] { --radius: calc(0.25rem * 3); --radius-control: var(--radius); --radius-panel: calc(var(--radius) + 4px); --radius-scene: calc(var(--radius) * 2); --control-h: calc(2rem + 12px); --padding-x: 18px; --text-body: 1rem; }',
    ]);
    expect(theme.radii).toEqual({ control: "12px", panel: "16px", scene: "24px" });
    const html = await render(<InvitationEmail {...invitation} theme={theme} />);
    const button = html.match(/<a\b[^>]*href="[^"]*\/join[^"]*"[^>]*>/)?.[0];
    expect(button).toContain("border-radius:12px");
    expect(button).toContain("min-height:44px");
    expect(button).toContain("padding-left:18px");
    expect(button).toContain("font-size:16px");
    expect(html).not.toMatch(/var\(|calc\(|\drem\b/);
  });

  test("zero radius stays square and invalid dimensions fail before rendering", () => {
    const square = emailThemeFromCss([coreCss, refinedCss, '[data-skin="refined"] { --radius: 0; --padding-x: 0; }']);
    expect(square.radii).toEqual({ control: "0px", panel: "0px", scene: "0px" });
    expect(square.button.paddingInline).toBe("0px");
    for (const declaration of ["--radius: -1px", "--radius: calc(2px * 3px)", "--control-h: 0px", "--padding-x: calc(1rem / 0)"]) {
      expect(() => emailThemeFromCss([coreCss, refinedCss, `[data-skin="refined"] { ${declaration}; }`])).toThrow("px/rem length");
    }
  });

  test("flattens translucent borders against the card", () => {
    const theme = emailThemeFromCss([coreCss, refinedCss, '[data-skin="refined"] { --card: oklch(1 0 0); --border: oklch(0 0 0 / 0.2); }']);
    expect(theme.colors.border).toBe("rgb(204, 204, 204)");
  });

  test("resolves font aliases and converts sizes using the supplied root size", () => {
    const theme = emailThemeFromCss(
      [
        coreCss,
        refinedCss,
        '[data-skin="refined"] { --font-body: var(--font-sans); --font-sans: "Test Sans", sans-serif; --text-body-lg: 1rem; }',
      ],
      "light",
      20,
    );
    expect(theme.fonts.body).toBe('"Test Sans", sans-serif');
    expect(theme.text.body.fontSize).toBe("20px");
  });

  test("reports missing, circular, and unsupported tokens instead of exporting broken CSS", () => {
    expect(() => emailThemeFromCss([refinedCss])).toThrow("Include core theme.css");
    expect(() =>
      emailThemeFromCss([
        coreCss,
        refinedCss,
        '[data-skin="refined"] { --font-body: var(--font-display); --font-display: var(--font-body); }',
      ]),
    ).toThrow("circular reference");
    expect(() => emailThemeFromCss([coreCss, refinedCss, '[data-skin="refined"] { --primary: color-mix(in oklch, red, blue); }'])).toThrow(
      "--primary",
    );
    expect(() => emailThemeFromCss([coreCss, refinedCss, '[data-skin="refined"] { --text-body-lg: clamp(14px, 1vw, 20px); }'])).toThrow(
      "--text-body-lg",
    );
  });
});
