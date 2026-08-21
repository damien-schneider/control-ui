import Link from "next/link";
import { skinsOverview } from "@/app/(features)/catalog/skins";
import { CodeBlock } from "@/app/(features)/components/source";
import { generatedSkinContract } from "@/app/(features)/model/generated-skin-contract";
import { fullInstallCommand, fullInstallManifestHref, packInstallCommand } from "@/app/(features)/model/registry";
import type { DocsSkinPage } from "@/app/(features)/model/types";
import { Badge } from "@/components/control-ui/ui/badge";
import { InstallPanel, PageHeader, SectionStack, SectionTitle } from "./shared";
import { TokenContractTable } from "./token-contract";

const knobCascadeExample = `/* app-wide: a token, on :root */
:root { --radius-field: 0.75rem; }

/* one family, everywhere: a knob, on the family root */
[data-control-family="chat-composer"] { --cui-chat-composer-shell-radius: 0; }

/* one instance, on the root element:
   className="[--cui-chat-composer-shell-radius:0]"  or  style={{ "--cui-chat-composer-shell-radius": "0" }} */`;

export function SkinPage({ skin }: { skin: DocsSkinPage }) {
  const install = packInstallCommand(skin.id);
  const fullInstall = fullInstallCommand(skin.id);
  const manifestHref = fullInstallManifestHref(skin.id);
  const kindLabel = skin.kind === "advanced" ? "Advanced pack" : "Theme pack";
  const unavailable = skin.docsOnly || skin.files.length === 0;

  return (
    <section className="mx-auto min-w-0 w-full max-w-3xl px-5 py-12">
      <PageHeader label={`Skin / ${kindLabel}`} title={skin.label} summary={skin.description} />
      <SectionStack>
        {unavailable ? (
          <div
            id="install"
            className="min-w-0 scroll-mt-20 rounded-xl border border-dashed bg-muted/20 p-6 text-body leading-6 text-muted-foreground"
          >
            <Badge variant="outline" size="sm">
              Docs demonstration
            </Badge>
            <p className="mt-3 max-w-2xl">
              {skin.label} is demonstrated live in these docs through the theme editor, but is not shipped as an installable pack — so there
              is no pack source to install here. Open the theme editor (paintbrush, top-right) to preview it over any page.
            </p>
          </div>
        ) : null}
        {!unavailable && install && fullInstall && manifestHref ? (
          <InstallPanel
            commands={[
              { label: "Complete project", value: fullInstall },
              { label: "Skin only", value: install },
            ]}
            manifestHref={manifestHref}
            subtitle={`Start complete or add only ${skin.label}`}
            requiresSkin={false}
          >
            Complete project installs the canonical Control UI component set and this skin in one step. Skin only replaces the active{" "}
            <code>skin.config.tsx</code>, <code>skin-theme.css</code>, and <code>skin.css</code> targets without changing component source
            {skin.kind === "advanced" ? ", and includes the pack's declared runtimes or extensions" : ""}.
          </InstallPanel>
        ) : null}
      </SectionStack>
    </section>
  );
}

const SKIN_VALUE_RULES = [
  {
    label: "theme token",
    body: "Global semantic color, radius, type, and motion values live in theme.css and feed every recipe.",
  },
  {
    label: "component knob",
    body: "A component-specific visual is re-valued through its registered --component-* property in scoped skin.css.",
  },
  {
    label: "custom CSS",
    body: "Use scoped skin.css for pseudo-elements, keyframes, native chrome, relational selectors, and uniform semantic families.",
  },
  {
    label: "never",
    body: "Do not repaint a recipe-owned property directly or invent a second variable for a value the component knob contract already exposes.",
  },
] as const;

// Consolidated skin do-not list; every rule is ENFORCED (referenced test fails build on violation) — this documents guardrails, doesn't replace them.
const SKIN_REQUIREMENTS = [
  {
    label: "contract only in theme.css",
    body: "theme.css declares every contract name and nothing else; an invented var belongs in skin.css. Enforced by theme-contract-coverage.test.ts against lib/theme-contract.ts.",
  },
  {
    label: "no @theme in a pack",
    body: "@theme merges globally across co-compiled packs, so a pack can never own bindings — scale intent is authored as raw scoped tokens; the @theme block belongs to Control UI core alone. Enforced per pack.",
  },
  {
    label: "complete in both modes",
    body: "Every contract token resolves in light and dark, either from one shared declaration or explicit mode declarations. A skin never inherits a missing value from Refined or core. Enforced per pack.",
  },
  {
    label: "no component CSS in theme.css",
    body: "@layer components, @utility, @keyframes, and anatomy selectors live in skin.css — theme.css stays a pure token block. Enforced per pack.",
  },
  {
    label: "skin.css never redeclares the contract",
    body: "A contract name re-valued in skin.css hides the change from the theme editor and this token reference; contract names are theme.css territory. Enforced per pack.",
  },
  {
    label: "scope anatomy, never host elements",
    body: 'Component selectors in skin.css key the generated [data-slot="part"][data-control-family="family"] pair, narrowed by [data-<family>-kind] when several components share a family; never skin bare host elements (code, button, input) under [data-skin]. Enforced per pack.',
  },
  {
    label: "declared intents, mirrored",
    body: 'colorScheme locks the page mode to a fixed-scheme skin and motion: "reduced" collapses --duration-* through data-motion — never animation: none on finite animations. Both flags are mirrored in components/theme.ts for the pre-paint script; theme-color-scheme-lock.test.ts fails on drift.',
  },
  {
    label: "extensions attach by anatomy",
    body: "A root runtime discovers interactive parts through data-control, gates its observers on the active skin, and tears down cleanly. Root runtimes stay out of skin.config and mount once in the app layout. Anchored adornment extensions are different: skin.config may import their component and render it through a typed adornment anchor while the config itself remains RSC-pure.",
  },
] as const;

export function SkinsOverviewPage({ skins }: { skins: DocsSkinPage[] }) {
  return (
    <section className="mx-auto min-w-0 w-full max-w-4xl px-5 py-12">
      <PageHeader label="Skins" title={skinsOverview.label} summary={skinsOverview.description} wide />

      <SectionStack>
        <p className="max-w-2xl text-body leading-6 text-muted-foreground">
          Not sure a skin is even the right tool? The{" "}
          <Link href="/architecture#customization-ladder" className="font-medium text-foreground underline underline-offset-4">
            customization ladder
          </Link>{" "}
          in the Architecture guide places every &quot;make it different&quot; request on one of eight rungs — with what each rung costs an
          app that never uses it. This page picks up once the answer is a skin.
        </p>

        <section id="skin-values" className="min-w-0 scroll-mt-20">
          <SectionTitle title="Where skin values live" description="One owner for each visual decision." />
          <div className="grid gap-2">
            {SKIN_VALUE_RULES.map((rule) => (
              <div
                key={rule.label}
                className="flex gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 text-body leading-6 shadow-sm"
              >
                <Badge variant="outline" size="sm">
                  {rule.label}
                </Badge>
                <span className="text-foreground">{rule.body}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="tokens" className="min-w-0 scroll-mt-20">
          <SectionTitle
            title="The token contract"
            description="Every custom property a skin may re-value, rendered straight from lib/theme-contract.ts — the same module the coverage test enforces, so this reference can never drift from the CSS."
          />
          <TokenContractTable />
        </section>

        <section id="anatomy" className="min-w-0 scroll-mt-20">
          <SectionTitle
            title="The anatomy contract"
            description="Generated from canonical component DOM. Family is the selector key; slot names the part; scope identifies the component."
          />
          <p className="mb-4 max-w-2xl text-body leading-6 text-muted-foreground">
            Copy a selector as{" "}
            <code>[data-skin=&quot;brand&quot;] [data-slot=&quot;shell&quot;][data-control-family=&quot;chat-composer&quot;]</code>.
            Optional adornment anchors are listed separately in the{" "}
            <Link href="/r/skin-contract.json" className="font-medium text-foreground underline underline-offset-4">
              full machine-readable contract
            </Link>
            , so they cannot be mistaken for DOM parts.
          </p>
          <div className="grid gap-2">
            {Object.entries(generatedSkinContract.scopes).map(([scope, anatomy]) => (
              <details key={scope} className="rounded-xl border border-border/70 bg-card px-4 py-3 text-body shadow-sm">
                <summary className="cursor-pointer font-mono text-label font-medium">
                  {scope} <span className="text-muted-foreground">({Object.keys(anatomy.parts).length})</span>
                </summary>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Object.keys(anatomy.parts).map((part) => (
                    <code key={part} className="rounded-md border bg-background px-1.5 py-0.5 text-caption">
                      {part}
                    </code>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section id="requirements" className="min-w-0 scroll-mt-20">
          <SectionTitle
            title="Skin requirements — the do-not list"
            description="What a pack must and must not do. Every rule is enforced by a test, so a violating pack fails the build before it ships."
          />
          <div className="grid gap-2">
            {SKIN_REQUIREMENTS.map((rule) => (
              <div
                key={rule.label}
                className="flex gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 text-body leading-6 shadow-sm"
              >
                <Badge variant="outline" size="sm" className="self-start">
                  {rule.label}
                </Badge>
                <span className="text-foreground">{rule.body}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="adornments" className="min-w-0 scroll-mt-20">
          <SectionTitle title="Adornments" description="JSX at named anchors — decorative chrome, or behavioral fx layers." />
          <p className="max-w-2xl text-body leading-6 text-muted-foreground">
            Additive, render zero DOM when absent, never gate library behavior. Decorative anchors (window titlebars, window controls) take
            plain <code>aria-hidden</code> JSX. Behavioral anchors (like <code>chat-composer:send-layer</code>) take a{" "}
            <code>(ctx) =&gt; JSX</code> render prop whose ctx carries plain render-time values — this is how a pack activates an anchored
            extension (send-aurora). Adornments are nested by scope and part in skin.config. Interactive values live in a separate{" "}
            <code>&quot;use client&quot;</code> file the pack ships, so skin.config itself stays RSC-pure.
          </p>
        </section>

        <section id="motion" className="min-w-0 scroll-mt-20">
          <SectionTitle title="Motion flag" description="One boolean, zero JavaScript." />
          <p className="max-w-2xl text-body leading-6 text-muted-foreground">
            <code>motion: &quot;reduced&quot;</code> stamps <code>data-motion=&quot;reduced&quot;</code>, which collapses{" "}
            <code>--duration-fast/base/slow</code> to 0 — every cva transition, Base UI enter/exit and the shimmer/ripple keyframes flatten
            at once. The theme editor also exposes a manual &quot;Reduce motion&quot; toggle.
          </p>
        </section>

        <section id="component-knobs" className="min-w-0 scroll-mt-20">
          <SectionTitle
            title="Component knobs and the cascade"
            description="Tokens theme the whole app from :root. Knobs theme one family and live on its root element — every slot inherits."
          />
          <CodeBlock lang="css" code={knobCascadeExample} />
          <p className="mt-3 max-w-2xl text-body leading-6 text-muted-foreground">
            The recipe declares each knob's default on the family root at zero specificity, so a value set on that element always wins:{" "}
            <code>style</code> beats a skin, a skin beats the recipe, a utility class beats both. Setting a knob on <code>:root</code> does
            nothing — the family root re-declares it; re-value the token it derives from instead. Portaled surfaces are their own root: set{" "}
            <code>--popup-*</code> on the popup content, not on the trigger. Each component page lists its knobs with type and default.
          </p>
        </section>

        <section id="packs" className="min-w-0 scroll-mt-20">
          <SectionTitle title="Skins" description="Each pack's tokens, skin.css and config, ready to read and install." />
          <div className="grid gap-2">
            {skins.map((skin) => {
              let kindLabel = "Theme";
              if (skin.docsOnly) kindLabel = "Docs only";
              else if (skin.kind === "advanced") kindLabel = "Advanced";

              return (
                <Link
                  key={skin.id}
                  href={`/skins/${skin.id}`}
                  className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-border/70 bg-card px-4 py-3 text-body shadow-sm transition hover:border-foreground/20 hover:bg-muted/30"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="font-medium">{skin.label}</span>
                    <span className="min-w-0 truncate text-label text-muted-foreground">{skin.description}</span>
                  </span>
                  <Badge variant="outline" size="sm">
                    {kindLabel}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </section>
      </SectionStack>
    </section>
  );
}
