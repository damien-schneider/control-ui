You are setting up Control UI in this repository, then designing its skin with me.

Read the project first
- Every command here and in the catalog is written for npm. Read the lockfile and run mine instead — pnpm → pnpm dlx shadcn@latest, yarn → yarn dlx shadcn@latest, bun → bunx --bun shadcn@latest — and the same for npm run: the scripts you add later are written with my runner too.
- If this directory has no package.json, scaffold a new app instead: `npx shadcn@latest init --template next --defaults --name my-app --no-monorepo --force http://127.0.0.1:3000/r/next-app.json && cd my-app && npm run dev -- --port 3001` — replace my-app with the name I give you.
- Otherwise read package.json, the framework and its version, the Tailwind version, the CSS entry, and components.json if one already exists.
- In a workspace, one app is the target: run every command from that app's directory and read that app's manifest and CSS entry, not the root's. If more than one app could be the target and I did not name one, ask which before touching anything.
- A second Control UI install in the same workspace is an architecture decision, so ask me once before making it: per app, where each app owns its source and skin and they drift apart on purpose — the layout everything here is tested against — or one shared workspace package, which locks every consumer to the same skin and needs each consumer's CSS entry to @source the package, since Tailwind never scans past its own app. Recommend per app and wait for my answer: moving later means rewriting every call site.
- Tell me what you found and what you will install, then continue directly to Install. This is a status update, not an approval checkpoint; pause only if a required choice or destructive conflict blocks safe installation.

Install
- The catalog is http://127.0.0.1:3000/r/agent-index.json and every item carries its own install command. http://127.0.0.1:3000/llms.txt indexes the documentation.
- Install the complete set and its skin in one command: `npx shadcn@latest add http://127.0.0.1:3000/r/all-flat.json`. Picking components one by one leaves the skin we write next with almost no surface to be checked against, and forces the update scripts below to track a bespoke list.
- Flat is the neutral reset: an empty skin.css and no adornments, so the theme we write later owns every value. Every other pack re-values component knobs and can install adornments and layout defaults that a theme cannot undo, which is why a pack is a choice I make, not a resemblance you pick for me.
- The pack re-themes every existing screen that reads these token names the moment it lands, and flat is deliberately the blank slate: squared corners, hairline borders. Between this install and the theme below, the app looks rougher than before — say so when you report the install, and carry the theme through in this same run. The reset is scaffolding, never the state you leave me in.
- Install item by item only if I ask for a lean install, and say that the update scripts then have to name each item.
- Installed files are source I own, so take them from the registry and never hand-copy them out of the documentation.
- Installing moves this app's own dependency versions. List every package it added or changed, and revert any change no installed item required.

Wire it
- Every item appends its own imports to the CSS entry named in components.json. The registry cannot know this app's layout, so it writes every one of them as `../components/control-ui/…` — right only when the entry sits one directory under the components alias. Resolve each appended import against the entry's own directory, and where it points at no file, rewrite the whole block to the real relative path from the entry to the directory the install actually wrote to. Check every line resolves before moving on; one wrong prefix silently unstyles everything below it.
- Never edit or reorder the imported stylesheets themselves. Layering and scope decide precedence, not their position in the entry.
- Stamp data-skin on the root element with the installed pack's id. It is the scope every token is declared under, not a multi-skin switch, so one skin still needs it: a missing or misspelled id leaves the whole contract undeclared, and every portalled surface — popover, dialog, menu, tooltip — renders with no tokens at all.
- The core token names are shadcn's, and an app that used shadcn declares them in two places with two different fates. At :root and .dark, the skin out-specifies that block on purpose and wins, so those declarations go dead — except the names the skin never declares, --chart-* and friends, which keep painting a second palette beside the skin. In an @theme or @theme inline block nothing goes dead: Tailwind merges every @theme in the build and the last declaration wins, so an app block sitting after the Control UI imports silently rewires utilities away from the skin — shadcn's additive radius scale seeded by the skin's --radius collapses every corner, and a hardcoded font family splits the app into two typefaces. Delete the dead :root declarations, reduce the app's @theme to keys Control UI does not map, and re-point the surviving app-specific names at skin tokens instead of keeping a parallel value; each deletion is a change to source I own, so show me the sweep as one diff.
- Run `node <installed control-ui directory>/scripts/control-ui-doctor.mjs` and settle what it reports before styling anything. It is read-only and checks exactly the wiring above: imports that resolve, the theme import last, app @theme blocks redeclaring Control UI keys, dead or hybrid :root palettes, and the data-skin stamp. Errors block; warnings are the deletion offers above, brought to me with file and token names.
- Start the dev server and confirm that a control paints and that one portalled surface opens with its tokens. Do not move on until both do.
- Do that on a throwaway route, then delete the route and its directory. Do not leave a verification page, an empty folder, or a screenshot behind in my app.
- Stay inside the app you are installing into. In a workspace the install writes the shared lockfile itself — that is the install doing its job, so let it, and report what moved with the rest of the version changes. Hand-editing a shared file is the other thing: a root package.json, a workspace catalog, a pinned override is mine to change, so propose the edit and wait, however small it looks.

Leave an update path
- Add two package.json scripts against `http://127.0.0.1:3000/r/update.json`, the complete component set with no skin: control-ui:diff adds it with --diff, control-ui:update adds it with --overwrite.
- Chain `&& node <installed control-ui directory>/scripts/fix-css-imports.mjs` onto control-ui:update, with the real path. The overwrite re-appends the CSS import block under the canonical prefix the registry assumes, and the script folds those lines onto this app's real paths, drops the duplicates, and keeps the theme import last. In the canonical layout it is a no-op; leave it chained anyway.
- Add a third script, control-ui:doctor, running `node <installed control-ui directory>/scripts/control-ui-doctor.mjs` with the same real path. It is the read-only audit from Wire it, kept runnable so any later session — or I — can check the wiring after an update or a migration without this prompt.
- After a lean install those scripts must name the items I installed instead, since update.json would pull in the rest of the set.
- Say that the diff comes first and the overwrite wants a clean tree, because it rewrites source I own. The three skin files are never touched by either.
- The install already wrote .claude/skills/control-ui/SKILL.md: the Control UI skill rides every all pack and every update, so control-ui:update keeps it current and hand-edits there do not survive. It carries the token contract and the working rules, so later sessions in this repository build with the library without this prompt — tell me it landed. Only a lean install skips it; add http://127.0.0.1:3000/r/control-ui-skill.json to the items those scripts name to bring it along.

Where shadcn/ui already sits
- Only when this app imports its own components/ui/*: inventory that directory, look every component up in the catalog index, and show me the mapping — the Control UI counterpart, or none. A tree or a scroll area counts as much as a button or a dialog; the inventory exists so nothing gets skipped for looking unusual. Then ask me once which mapped call sites to move. Never migrate without my answer.
- Both libraries write to different directories and run side by side, so leaving them is a real answer, not a half-measure.
- The props are not drop-in. Before you rewrite a call site, read the exported prop types of the installed Control UI component and tell me the mapping you derived: shadcn's variant and size collapse onto variant, tone, size and iconOnly, asChild becomes render, and a shadcn variant with no counterpart is a question for me, not a guess.
- A migrated call site keeps its layout classes — width, flex, grid, gap — and sheds its styling ones. The border, radius, background and padding utilities the old component needed now fight the recipe underneath, and carrying them over is what reads as a broken install afterwards.
- Move one component at a time and confirm the app still paints between each.
- Migrating the call sites without migrating the token plumbing is what leaves the app looking broken afterwards: the old system's :root palette and @theme mappings keep fighting the skin from the entry stylesheet. When the last agreed call site has moved, sweep them under the same rule as in Wire it, and run control-ui:doctor until it reports no errors — a migration I said yes to ends clean, not hybrid.
- Leave the shadcn source in place. Tell me when nothing imports it any more; deleting it is my call.

Discovery
- Do not start discovery until every Install and Wire it step above has completed successfully.
- Then ask me this, and wait for my answer:
  "Should Control UI match this app's existing look, or do you want a new direction?
   A — Match: I read your current styles and build a skin that sits beside them.
   B — New: tell me the style you want, and attach reference images if you have any."
- If this project had no interface, skip the question, treat it as B, and ask me for the style and any references.
- On A, read the existing theme tokens, CSS, typography, spacing, components, and representative screens. Tell me what you found and use it as the visual brief; do not ask me to describe what the code already shows.
- On B, work from my description and my reference images, covering color, typography, density, corners, elevation, and motion.
- Stay on the neutral reset pack and let the theme carry the direction. Only when I name a stock pack for its own character do you install it with --overwrite and update data-skin.
- Resemblance is not a reason to switch packs: a pack's knob overrides and adornments outlive any theme written on top of it.
- Ask one focused question at a time, with at most four questions total.
- If I have attached no reference images yet, ask for them in this coding-agent conversation. If I have none, continue from the description.
- Use reference images for their visual language, not their literal content.
- Do not ask me to choose individual CSS variables. Infer a coherent system from my answers.
- Once the direction is clear, create the theme without asking me to restate the brief.

Implementation
- Read the canonical contract from http://127.0.0.1:3000/r/theme-contract.json. The registry that served the install serves this list too.
- Write exactly one file named <short-name>.control-ui-theme.json in the current working directory.
- Application source stays untouched until the artifact is finished; Apply it below names the only writes beyond the artifact itself.
- Set baseSkin to the id of the skin pack you installed.
- Use format "control-ui-theme/v1".
- Choose a concise human name, 60 characters or fewer.
- Put color-valued tokens in both light and dark. Put every other token in shared.
- Prefer oklch() for authored colors and preserve accessible foreground/background contrast.
- Output only variables from the canonical theme contract.
- Omit tokens that should inherit from the base skin.

Accessibility gate
- Treat contrast as a required part of the theme, not a follow-up.
- Calculate resolved foreground/background contrast after alpha compositing in both light and dark. Sample gradients across every stop and interpolation, not one convenient point.
- Keep normal and small text at 4.5:1 or higher for body, muted fills, cards, popovers, popup highlights, semantic text, filled controls, selected tabs, and filled or outline badge states.
- Check focus indicators and control boundaries at 3:1 or higher against adjacent surfaces. A boundary is advisory when it is not required to identify the control.
- If a saturated fill needs light text, darken the fill until the pair clears 4.5:1; do not swap text color by visual guesswork alone.
- Do not claim the theme passes without checking the ratios.

What the components actually paint
- Every painted knob with what the browser actually paints behind it, one file per paint family: `http://127.0.0.1:3000/r/contract/<family>.contrast.json`, harvested from rendered components and verified against the browser. `http://127.0.0.1:3000/r/contract/index.json` names the families and how many probes each has.
- A probe's `anatomy` indexes into the file's `anatomies`: the paint stack under the part, back to front, its ancestors but also a sibling indicator that slides beneath it. The last node is the part itself.
- A part's contrast is decided by the knob it paints from **and** by every knob in that stack, never by theme tokens alone: re-valuing a surface knob changes the contrast of text you did not touch.
- For each probe: rebuild `anatomy` as nested elements, resolve `knobs.text` on the last one, composite the stack's fills behind it, and clear `rendersText ? 4.5 : 3`:1.
- `state: true` means the paint waits on an interaction, so force `knobs.fill` onto the part instead of expecting it to paint itself.
- A knob you leave alone still paints — it keeps its recipe default and still has to clear the ratio under your surfaces.
- The family's `/r/contract/<family>.json` slice lists `uncovered`: the knobs no documented route renders. Nothing measured them, so treat them as unverified rather than passing.

Artifact shape

{
  "format": "control-ui-theme/v1",
  "name": "Theme name",
  "baseSkin": "<installed skin id>",
  "reduceMotion": false,
  "tokens": {
    "shared": {},
    "light": {},
    "dark": {}
  }
}

Apply it
- The artifact is the source of record; each app consumes it as one derived CSS file.
- Run `node <install>/scripts/control-ui-doctor.mjs --emit-css <short-name>.control-ui-theme.json` to write <short-name>.control-ui-theme.css beside the artifact — that exact suffix is how the update tooling recognises the theme import. Never hand-write the selectors: the emitted `[data-skin="<baseSkin>"][data-skin]` doubles the attribute to match the pack's own weight, which is what hands the win to source order.
- Import that file on the last line of the entry's import block, after every Control UI import. Being last is what makes it win.
- If reduceMotion is true, stamp data-motion="reduced" on the root element beside data-skin; remove the attribute when a later theme turns it back off.
- Every app this run installed into gets the same theme this same way. One app themed while another rests on the raw reset is the bug, not a smaller scope.
- Reload and confirm a changed token paints — a radius, the primary — before you call it applied.

When finished, tell me the artifact path and where each app imports its CSS. To review the result myself, I import the artifact at http://127.0.0.1:3000/theme-ai-builder and check it at http://127.0.0.1:3000/theme-accessibility.
