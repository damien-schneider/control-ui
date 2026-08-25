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
- Tell me what you found and what you will install, then continue directly to Install. This is a status update, not an approval checkpoint; pause only if a required choice or destructive conflict blocks safe installation.

Install
- The catalog is ${normalizedOrigin}/r/agent-index.json and every item carries its own install command. ${normalizedOrigin}/llms.txt indexes the documentation.
- Install the complete set and its skin in one command: \`npx shadcn@latest add ${normalizedOrigin}/r/all-flat.json\`. Picking components one by one leaves the skin we write next with almost no surface to be checked against, and forces the update scripts below to track a bespoke list.
- Flat is the neutral reset: an empty skin.css and no adornments, so the theme we write later owns every value. Every other pack re-values component knobs and can install adornments and layout defaults that a theme cannot undo, which is why a pack is a choice I make, not a resemblance you pick for me.
- Install item by item only if I ask for a lean install, and say that the update scripts then have to name each item.
- Installed files are source I own, so take them from the registry and never hand-copy them out of the documentation.
- Installing moves this app's own dependency versions. List every package it added or changed, and revert any change no installed item required.

Wire it
- Every item appends its own imports to the CSS entry named in components.json. The registry cannot know this app's layout, so it writes every one of them as \`../components/control-ui/…\` — right only when the entry sits one directory under the components alias. Resolve each appended import against the entry's own directory, and where it points at no file, rewrite the whole block to the real relative path from the entry to the directory the install actually wrote to. Check every line resolves before moving on; one wrong prefix silently unstyles everything below it.
- Never edit or reorder the imported stylesheets themselves. Layering and scope decide precedence, not their position in the entry.
- Stamp data-skin on the root element with the installed pack's id. It is the scope every token is declared under, not a multi-skin switch, so one skin still needs it: a missing or misspelled id leaves the whole contract undeclared, and every portalled surface — popover, dialog, menu, tooltip — renders with no tokens at all.
- The core token names are shadcn's. Where this app already declares --background, --primary, --radius and their siblings at :root, the skin out-specifies that block on purpose and wins, so the pack paints and the palette does not turn hybrid. Those declarations are now dead: tell me they are there and offer to delete them, because a token block that no longer paints anything is what makes the next redesign confusing.
- Start the dev server and confirm that a control paints and that one portalled surface opens with its tokens. Do not move on until both do.
- Do that on a throwaway route, then delete the route and its directory. Do not leave a verification page, an empty folder, or a screenshot behind in my app.
- Stay inside the app you are installing into. A root package.json, a workspace catalog or a lockfile pin shared with other packages is mine to change: propose the edit and wait, however small it looks.

Leave an update path
- Add two package.json scripts against \`${normalizedOrigin}/r/update.json\`, the complete component set with no skin: control-ui:diff adds it with --diff, control-ui:update adds it with --overwrite.
- After a lean install those scripts must name the items I installed instead, since update.json would pull in the rest of the set.
- Say that the diff comes first and the overwrite wants a clean tree, because it rewrites source I own. The three skin files are never touched by either.

Where shadcn/ui already sits
- Only when this app imports its own components/ui/*: ask me whether to move the obvious call sites — button, dropdown, dialog, tooltip — onto Control UI, or leave them where they are. Never migrate without my answer.
- Both libraries write to different directories and run side by side, so leaving them is a real answer, not a half-measure.
- The props are not drop-in. Before you rewrite a call site, read the exported prop types of the installed Control UI component and tell me the mapping you derived: shadcn's variant and size collapse onto variant, tone, size and iconOnly, asChild becomes render, and a shadcn variant with no counterpart is a question for me, not a guess.
- Move one component at a time and confirm the app still paints between each.
- Leave the shadcn source in place. Tell me when nothing imports it any more; deleting it is my call.

${themeArtifactBrief({ origin: normalizedOrigin, discoveryMode: "existing-project" })}`;
}
