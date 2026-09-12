# Email

Compose branded emails with `react-email`. `EmailLayout` supplies a resolved Control UI theme to React Email's Tailwind renderer. `EmailHeading`, `EmailText`, `EmailButton`, and `EmailLink` apply semantic styles; compose them with React Email's `Section`, `Row`, `Column`, `Img`, and `Hr`.

## Resolve the theme on the server

Read the installed `styles/theme.css` and `styles/skin-theme.css` as strings, then pass them in that order to `emailThemeFromCss([coreCss, skinCss, overrideCss], "light")`. Include any Tailwind palette CSS before core if your theme references its variables. App overrides must use the same `[data-skin]` selectors as the theme. Pass only one skin's CSS, not the whole site's bundled stylesheet. Generate the theme at build time or reuse it across messages. Rebuild it when the theme changes.

`createEmailTheme(tokens)` also accepts a map of resolved token values, for example from a theme editor. Both APIs return serializable `EmailTheme` data without browser dependencies. The default root size is 16px; pass the app's root pixel size as the last argument if different.

Colors use the existing Control UI evaluator: OKLCH, relative OKLCH, hex, and token aliases. Unresolved or unsupported values throw an error naming the token. Sizes convert from px/rem to px. Font families, heading weights, line heights, and letter spacing come from the theme. Body text uses `--text-body-lg`; secondary text uses `--text-body`. Email paragraph line height is 1.6 for reading.

Buttons use `--radius-control`, `--control-h-md` (derived from `--control-h`), `--padding-x`, and `--text-body`, matching the default Control UI button dimensions. Vertical padding is calculated from the target height and React Email's 120% label line height; wrapped labels can grow taller. Containers and inset panels use `--radius-panel`, and images use `--radius-scene`. Lengths support px/rem, zero, aliases, and nested binary `calc()` arithmetic; unsupported expressions fail before export. Email corners use standard `border-radius`; skin-specific corner shapes and effects remain web-only.

The outer background must be opaque. Translucent card and button fills, text, and borders are flattened against their email surfaces. Override a token with an opaque color when a custom composition puts it on a different surface. This output shares the theme's colors and typography; interactive effects and skin decorations do not transfer to email.

## Compose and render

Render an `EmailLayout` with a required `theme` and inbox `preview`, then put the themed components inside it. Use `className` for React Email utilities or `style` for per-instance adjustments. Layouts use table-backed `Row` and `Column`; use explicit percentage widths for side-by-side content. The container is fluid up to 600px.

The five included templates are `InvitationEmail`, `ProductEmail`, `EditorialEmail`, `NewsletterEmail`, and `SummaryEmail`. Their content, links, brand, images, and theme are supplied by props. Each can be copied and adapted independently. Keep summary metrics to a short row; use repeated rows for larger datasets.

Call `await render(<YourEmail />)` from `react-email`, then `toPlainText(html)` for the plain-text alternative. Pass both to your existing delivery provider. This module does not send mail or require Resend. In Next.js, keep the rendering path on the server; if needed, add `react-email` to `serverExternalPackages`.

## Fonts, images, and verification

Keep fallback fonts in the theme. For a custom web font, pass React Email's `Font` through `EmailLayout`'s `head` prop and supply a publicly accessible font URL; recipients whose client cannot load it use the fallback. Supply public HTTPS image URLs and descriptive alt text. Prefer PNG or JPEG; GIF is suitable for animation. The gallery uses external sample photos and example.com links, which must be replaced before sending.

The chosen light or dark palette is baked into the generated HTML. Mail clients can still recolor it in their own dark mode. Browser previews show the generated email document, but do not emulate Gmail or Outlook. Verify actual deliveries in Gmail, Outlook, and Apple Mail, including mobile, blocked images, and dark mode, before using a template in production.
