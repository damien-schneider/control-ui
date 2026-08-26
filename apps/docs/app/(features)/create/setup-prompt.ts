import { themeArtifactBrief } from "@/components/theme-drawer/theme-artifact";
import { createAppCommand, packageRunnerHints } from "./command";

const PLACEHOLDER_PROJECT_NAME = "my-app";

export function buildSetupPrompt({ origin }: { origin: string }) {
  const normalizedOrigin = origin.replace(/\/+$/, "");
  const writtenPackageManager = "npm";
  const scaffold = createAppCommand({
    packageManager: writtenPackageManager,
    projectName: PLACEHOLDER_PROJECT_NAME,
    registryBaseUrl: normalizedOrigin,
  });

  return `You are setting up Control UI in this repository, then designing its skin with me.

Read the project first
- Every command here and in the catalog is written for npm. Read the lockfile and run mine instead — ${packageRunnerHints(writtenPackageManager)} — and the same for npm run: the scripts you add later are written with my runner too.
- If this directory has no package.json, scaffold a new app instead: \`${scaffold}\` — replace ${PLACEHOLDER_PROJECT_NAME} with the name I give you.
- Otherwise read package.json, the framework and its version, the Tailwind version, the CSS entry, and components.json if one already exists.
- In a workspace, one app is the target: run every command from that app's directory and read that app's manifest and CSS entry, not the root's. If more than one app could be the target and I did not name one, ask which before touching anything.
- A second Control UI install in the same workspace is an architecture decision, so ask me once before making it: per app, where each app owns its source and skin and they drift apart on purpose — the layout everything here is tested against — or one shared workspace package, which locks every consumer to the same skin and needs each consumer's CSS entry to @source the package, since Tailwind never scans past its own app. Recommend per app and wait for my answer: moving later means rewriting every call site.
- Tell me what you found and what you will install, then continue directly to Install. This is a status update, not an approval checkpoint; pause only if a required choice or destructive conflict blocks safe installation.

Install
- The catalog is ${normalizedOrigin}/r/agent-index.json and every item carries its own install command. ${normalizedOrigin}/llms.txt indexes the documentation.
- Install the complete set and its skin in one command: \`npx shadcn@latest add ${normalizedOrigin}/r/all-flat.json\`. Picking components one by one leaves the skin we write next with almost no surface to be checked against, and forces the update scripts below to track a bespoke list.
- Flat is the neutral reset: an empty skin.css and no adornments, so the theme we write later owns every value. Every other pack re-values component knobs and can install adornments and layout defaults that a theme cannot undo, which is why a pack is a choice I make, not a resemblance you pick for me.
- The pack re-themes every existing screen that reads these token names the moment it lands, and flat is deliberately the blank slate: squared corners, hairline borders. Between this install and the theme below, the app looks rougher than before — say so when you report the install, and carry the theme through in this same run. The reset is scaffolding, never the state you leave me in.
- Install item by item only if I ask for a lean install, and say that the update scripts then have to name each item.
- Installed files are source I own, so take them from the registry and never hand-copy them out of the documentation.
- Installing moves this app's own dependency versions. List every package it added or changed, and revert any change no installed item required.

Wire it
- Every item appends its own imports to the CSS entry named in components.json. The registry cannot know this app's layout, so it writes every one of them as \`../components/control-ui/…\` — right only when the entry sits one directory under the components alias. Resolve each appended import against the entry's own directory, and where it points at no file, rewrite the whole block to the real relative path from the entry to the directory the install actually wrote to. Check every line resolves before moving on; one wrong prefix silently unstyles everything below it.
- Never edit or reorder the imported stylesheets themselves. Layering and scope decide precedence, not their position in the entry.
- Stamp data-skin on the root element with the installed pack's id. It is the scope every token is declared under, not a multi-skin switch, so one skin still needs it: a missing or misspelled id leaves the whole contract undeclared, and every portalled surface — popover, dialog, menu, tooltip — renders with no tokens at all.
- The core token names are shadcn's, and an app that used shadcn declares them in two places with two different fates. At :root and .dark, the skin out-specifies that block on purpose and wins, so those declarations go dead — except the names the skin never declares, --chart-* and friends, which keep painting a second palette beside the skin. In an @theme or @theme inline block nothing goes dead: Tailwind merges every @theme in the build and the last declaration wins, so an app block sitting after the Control UI imports silently rewires utilities away from the skin — shadcn's additive radius scale seeded by the skin's --radius collapses every corner, and a hardcoded font family splits the app into two typefaces. Delete the dead :root declarations, reduce the app's @theme to keys Control UI does not map, and re-point the surviving app-specific names at skin tokens instead of keeping a parallel value; each deletion is a change to source I own, so show me the sweep as one diff.
- Run \`node <installed control-ui directory>/scripts/control-ui-doctor.mjs\` and settle what it reports before styling anything. It is read-only and checks exactly the wiring above: imports that resolve, the theme import last, app @theme blocks redeclaring Control UI keys, dead or hybrid :root palettes, and the data-skin stamp. Errors block; warnings are the deletion offers above, brought to me with file and token names.
- Start the dev server and confirm that a control paints and that one portalled surface opens with its tokens. Do not move on until both do.
- Do that on a throwaway route, then delete the route and its directory. Do not leave a verification page, an empty folder, or a screenshot behind in my app.
- Stay inside the app you are installing into. In a workspace the install writes the shared lockfile itself — that is the install doing its job, so let it, and report what moved with the rest of the version changes. Hand-editing a shared file is the other thing: a root package.json, a workspace catalog, a pinned override is mine to change, so propose the edit and wait, however small it looks.

Leave an update path
- Add two package.json scripts against \`${normalizedOrigin}/r/update.json\`, the complete component set with no skin: control-ui:diff adds it with --diff, control-ui:update adds it with --overwrite.
- Chain \`&& node <installed control-ui directory>/scripts/fix-css-imports.mjs\` onto control-ui:update, with the real path. The overwrite re-appends the CSS import block under the canonical prefix the registry assumes, and the script folds those lines onto this app's real paths, drops the duplicates, and keeps the theme import last. In the canonical layout it is a no-op; leave it chained anyway.
- Add a third script, control-ui:doctor, running \`node <installed control-ui directory>/scripts/control-ui-doctor.mjs\` with the same real path. It is the read-only audit from Wire it, kept runnable so any later session — or I — can check the wiring after an update or a migration without this prompt.
- After a lean install those scripts must name the items I installed instead, since update.json would pull in the rest of the set.
- Say that the diff comes first and the overwrite wants a clean tree, because it rewrites source I own. The three skin files are never touched by either.
- Offer once to install the Control UI skill: fetch ${normalizedOrigin}/r/control-ui-skill.md and write it to .claude/skills/control-ui/SKILL.md. It carries the token contract and the working rules, so later sessions in this repository build with the library without this prompt.

Where shadcn/ui already sits
- Only when this app imports its own components/ui/*: inventory that directory, look every component up in the catalog index, and show me the mapping — the Control UI counterpart, or none. A tree or a scroll area counts as much as a button or a dialog; the inventory exists so nothing gets skipped for looking unusual. Then ask me once which mapped call sites to move. Never migrate without my answer.
- Both libraries write to different directories and run side by side, so leaving them is a real answer, not a half-measure.
- The props are not drop-in. Before you rewrite a call site, read the exported prop types of the installed Control UI component and tell me the mapping you derived: shadcn's variant and size collapse onto variant, tone, size and iconOnly, asChild becomes render, and a shadcn variant with no counterpart is a question for me, not a guess.
- A migrated call site keeps its layout classes — width, flex, grid, gap — and sheds its styling ones. The border, radius, background and padding utilities the old component needed now fight the recipe underneath, and carrying them over is what reads as a broken install afterwards.
- Move one component at a time and confirm the app still paints between each.
- Migrating the call sites without migrating the token plumbing is what leaves the app looking broken afterwards: the old system's :root palette and @theme mappings keep fighting the skin from the entry stylesheet. When the last agreed call site has moved, sweep them under the same rule as in Wire it, and run control-ui:doctor until it reports no errors — a migration I said yes to ends clean, not hybrid.
- Leave the shadcn source in place. Tell me when nothing imports it any more; deleting it is my call.

${themeArtifactBrief({ origin: normalizedOrigin, discoveryMode: "existing-project" })}`;
}
