# Email

Compose branded emails with `react-email`. `EmailLayout` supplies a resolved Control UI theme to React Email's Tailwind renderer. `EmailHeading`, `EmailText`, `EmailCaption`, `EmailBulletList`, `EmailButton`, and `EmailLink` apply semantic styles; `EmailHeader`, `EmailLogo`, `EmailBrowserLink`, `EmailPanel`, `EmailDivider`, `EmailCode`, and `EmailDetailRow` cover the recurring message parts; `EmailFooter`, `EmailSocialLinks`, `EmailFooterLinks`, `EmailAddress`, and `EmailUnsubscribe` cover the footer. Compose them with React Email's `Section`, `Row`, `Column`, and `Img`.

## Resolve the theme on the server

Read the installed `styles/theme.css` and `styles/skin-theme.css` as strings, then pass them in that order to `emailThemeFromCss([coreCss, skinCss, overrideCss], "light")`. Include any Tailwind palette CSS before core if your theme references its variables. App overrides must use the same `[data-skin]` selectors as the theme. Pass only one skin's CSS, not the whole site's bundled stylesheet. Generate the theme at build time or reuse it across messages. Rebuild it when the theme changes.

`createEmailTheme(tokens, { rootFontSize, colorScheme })` also accepts a map of resolved token values, for example from a theme editor. Both APIs return serializable `EmailTheme` data without browser dependencies. The default root size is 16px and the default scheme is light. `EmailLayout` declares that scheme through `color-scheme` and `supported-color-schemes` meta tags, so clients that honour them stop auto-inverting the palette baked into the HTML.

Colors use the existing Control UI evaluator: OKLCH, relative OKLCH, hex, and token aliases. Unresolved or unsupported values throw an error naming the token. Sizes convert from px/rem to px. Font families, heading weights, line heights, and letter spacing come from the theme. Body text uses `--text-body-lg`; secondary text uses `--text-body`. Email paragraph line height is 1.6 for reading.

Buttons use `--radius-control`, `--control-h-md` (derived from `--control-h`), `--padding-x`, and `--text-body`, matching the default Control UI button dimensions. Vertical padding is calculated from the target height and React Email's 120% label line height; wrapped labels can grow taller. Containers and inset panels use `--radius-panel`, and images use `--radius-scene`. Lengths support px/rem, zero, aliases, and nested binary `calc()` arithmetic; unsupported expressions fail before export. Email corners use standard `border-radius`; skin-specific corner shapes and effects remain web-only.

The outer background must be opaque. Translucent card and button fills, text, and borders are flattened against their email surfaces. Override a token with an opaque color when a custom composition puts it on a different surface. This output shares the theme's colors and typography; interactive effects and skin decorations do not transfer to email.

## Compose and render

Render an `EmailLayout` with a required `theme` and inbox `preview`, then put the themed components inside it. Use `className` for React Email utilities or `style` for per-instance adjustments. Layouts use table-backed `Row` and `Column`; use explicit percentage widths for side-by-side content. The container is fluid up to 600px.

The eight included templates are `InvitationEmail`, `ProductEmail`, `ReleaseNotesEmail`, `EditorialEmail`, `NewsletterEmail`, `SummaryEmail`, `VerificationEmail`, and `ReceiptEmail`. Their content, links, brand, images, and theme are supplied by props. `EmailBrandHeader` and `EmailBrandFooter` are the shared header and footer those templates compose; each template can be copied and adapted independently. Keep summary metrics to a short row; use repeated rows for larger datasets. `EmailCode` renders one-time codes in the theme's mono font, `EmailDetailRow` renders label and value lines for receipts and digests, and `EmailBulletList` renders changelog or feature bullets.

Call `await render(<YourEmail />)` from `react-email`, then `toPlainText(html)` for the plain-text alternative. Pass both to your existing delivery provider. This module does not send mail or require Resend. In Next.js, keep the rendering path on the server; if needed, add `react-email` to `serverExternalPackages`.

## Header and footer

`EmailHeader` takes the brand mark as children and an optional `aside`, where `EmailBrowserLink` points at the hosted copy of the message. `EmailLogo` renders a hosted image when `src` is set and the brand name as a display wordmark otherwise, so a blocked or missing image still identifies the sender.

`EmailFooter` draws the divider and holds the closing block. `EmailSocialLinks` accepts `{ label, href, iconUrl?, iconAlt? }`; with `iconUrl` it renders a hosted PNG sized by `iconSize` and falls back to the label text when the image is blocked, and without it the labels are plain links. `EmailFooterLinks` renders help, privacy, and terms links on one line. `EmailAddress` prints the legal entity and its postal address, which CAN-SPAM requires in every commercial message. `EmailUnsubscribe` renders the opt-out link plus an optional preference center; its labels are props so they can be localized.

The templates model this with `EmailFooterContent`: `mailing: "marketing"` requires an `unsubscribeUrl` and accepts a `preferencesUrl`, while `mailing: "transactional"` has neither, because a receipt or verification code must not offer to unsubscribe from the account itself. Both keep the sender identity, postal address, and the line explaining why the recipient received the message. A marketing send must also carry the `List-Unsubscribe` and `List-Unsubscribe-Post` headers at the delivery provider; the usage example returns them alongside the rendered HTML.

## Fonts, images, and verification

Keep fallback fonts in the theme. For a custom web font, pass React Email's `Font` through `EmailLayout`'s `head` prop and supply a publicly accessible font URL; recipients whose client cannot load it use the fallback. Supply public HTTPS image URLs and descriptive alt text. Prefer PNG or JPEG; GIF is suitable for animation. The gallery uses external sample photos and example.com links, which must be replaced before sending.

The chosen light or dark palette is baked into the generated HTML. Mail clients can still recolor it in their own dark mode. Browser previews show the generated email document, but do not emulate Gmail or Outlook. Verify actual deliveries in Gmail, Outlook, and Apple Mail, including mobile, blocked images, and dark mode, before using a template in production.
