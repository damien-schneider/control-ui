import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { render, toPlainText } from "react-email";
import { skinMetas } from "@/app/(features)/catalog/skins";
import { emailLayouts } from "@/src/registry/examples/control-ui/email/options";
import { renderEmailExample } from "@/src/registry/examples/control-ui/email/render-example";
import { EmailLayout, EmailSocialLinks } from "./email";
import { type EmailFooterContent, InvitationEmail } from "./templates";
import { emailThemeFromCss } from "./theme";

const coreCss = readFileSync(new URL("../theme.css", import.meta.url), "utf8");
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
      expect(text).toContain("FIELDWORK");
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

  test("social links render hosted icons with their network name as alt text", async () => {
    const html = await render(
      <EmailLayout theme={emailThemeFromCss([coreCss, refinedCss])} preview="Footer">
        <EmailSocialLinks
          links={[{ label: "LinkedIn", href: "https://example.com/linkedin", iconUrl: "https://example.com/icons/linkedin.png" }]}
        />
      </EmailLayout>,
    );
    expect(html).toMatch(/<img[^>]+src="https:\/\/example\.com\/icons\/linkedin\.png"[^>]*>/);
    expect(html).toContain('alt="LinkedIn"');
    expect(html).toContain('href="https://example.com/linkedin"');
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
