import { themeArtifactBrief } from "@/components/theme-drawer/theme-artifact";
import { createAppCommand } from "./command";

const PLACEHOLDER_PROJECT_NAME = "my-app";

export function buildSetupPrompt({ origin }: { origin: string }) {
  const normalizedOrigin = origin.replace(/\/+$/, "");
  const scaffold = createAppCommand({
    packageManager: "npm",
    projectName: PLACEHOLDER_PROJECT_NAME,
    registryBaseUrl: normalizedOrigin,
  });

  return `You are setting up Control UI in this repository, then designing its skin with me.

Read the project first
- If this directory has no package.json, scaffold a new app instead: \`${scaffold}\` — replace ${PLACEHOLDER_PROJECT_NAME} with the name I give you, and npx shadcn@latest with the runner for my package manager.
- Otherwise read package.json, the framework and its version, the Tailwind version, the CSS entry, and components.json if one already exists.
- Tell me what you found and what you will install, then continue directly to Install. This is a status update, not an approval checkpoint; pause only if a required choice or destructive conflict blocks safe installation.

Install
- The catalog is ${normalizedOrigin}/r/agent-index.json and every item carries its own install command. ${normalizedOrigin}/llms.txt indexes the documentation.
- Install exactly one skin pack, and unless I ask for a stock pack by name, install \`${normalizedOrigin}/r/skin-flat.json\`. Core owns the mechanics and the skin owns every token value, so with no pack installed there is no fallback to render against.
- Flat is the neutral reset: an empty skin.css and no adornments, so the theme we write later owns every value. Every other pack re-values component knobs and can install adornments and layout defaults that a theme cannot undo, which is why a pack is a choice I make, not a resemblance you pick for me.
- Install only the components this application needs. Installed files are source I own, so take them from the registry and never hand-copy them out of the documentation.
- Installing moves this app's own dependency versions. List every package it added or changed, and revert any change no installed item required.

Wire it
- Every item appends its own imports to the CSS entry named in components.json. Read that entry afterwards and confirm they landed.
- The registry writes \`../components/…\`. When the CSS entry does not sit beside components/ — app/globals.css with the components under src/ — correct the prefix to \`../src/components/…\` or none of it resolves.
- Stamp data-skin on the root element with the installed pack's id. A missing or misspelled id fails silently: the page keeps its tokens while every portalled surface — popover, dialog, menu, tooltip — renders with none.
- Start the dev server and confirm that a control paints and that one portalled surface opens with its tokens. Do not move on until both do.

Leave an update path
- Add two package.json scripts so refreshing installed source is one command later: control-ui:diff runs the install command again with --diff, control-ui:update runs it with --overwrite.
- Both list exactly the items you installed. ${normalizedOrigin}/r/update.json is the complete component set, so it belongs in the scripts only if you installed the complete set.
- Say that the diff comes first and the overwrite wants a clean tree, because it rewrites source I own. The three skin files are never touched by either.

Where shadcn/ui already sits
- Only when this app imports its own components/ui/*: ask me whether to move the obvious call sites — button, dropdown, dialog, tooltip — onto Control UI, or leave them where they are. Never migrate without my answer.
- Both libraries write to different directories and run side by side, so leaving them is a real answer, not a half-measure.
- The props are not drop-in. Before you rewrite a call site, read the exported prop types of the installed Control UI component and tell me the mapping you derived: shadcn's variant and size collapse onto variant, tone, size and iconOnly, asChild becomes render, and a shadcn variant with no counterpart is a question for me, not a guess.
- Move one component at a time and confirm the app still paints between each.
- Leave the shadcn source in place. Tell me when nothing imports it any more; deleting it is my call.

${themeArtifactBrief({ origin: normalizedOrigin, discoveryMode: "existing-project" })}`;
}
