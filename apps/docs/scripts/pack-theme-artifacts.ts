import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import postcss from "postcss";
import { validateThemeArtifact } from "@/components/theme-drawer/theme-artifact";
import { isColorValuedToken } from "@/components/theme-drawer/token-metadata";
import type { ControlUiThemeArtifactV1, SkinId, TokenValues } from "@/components/theme-drawer/types";
import { THEME_CONTRACT_NAMES } from "@/src/registry/lib/theme-contract";

const packsRoot = "src/registry/skin-packs";

/**
 * The shipped packs as theme artifacts: the widest set of real token values in the repository — font stacks with
 * commas, relative colors, calc, hex literals — which is what makes them the fixture for artifact round-trips.
 */
export function packThemeArtifacts(cwd = process.cwd()): ControlUiThemeArtifactV1[] {
  const packsDir = path.join(cwd, packsRoot);
  return readdirSync(packsDir)
    .filter((entry) => statSync(path.join(packsDir, entry)).isDirectory())
    .sort()
    .map((id) => representable(packThemeArtifact(path.join(packsDir, id, "theme.css"), id as SkinId)));
}

/** A pack may hold values the artifact format cannot carry (a 260-character `linear()` easing); drop those, keep the rest. */
function representable(artifact: ControlUiThemeArtifactV1): ControlUiThemeArtifactV1 {
  const result = validateThemeArtifact(artifact);
  if (result.ok) return result.artifact;
  const rejected = new Set(result.errors.flatMap((error) => /^tokens\.\w+\.(--[\w-]+) /.exec(error)?.[1] ?? []));
  if (rejected.size === 0) throw new Error(`${artifact.baseSkin} theme.css: ${result.errors.join("; ")}`);
  const keep = (tokens: TokenValues) => Object.fromEntries(Object.entries(tokens).filter(([name]) => !rejected.has(name)));
  const pruned = validateThemeArtifact({
    ...artifact,
    tokens: { shared: keep(artifact.tokens.shared), light: keep(artifact.tokens.light), dark: keep(artifact.tokens.dark) },
  });
  if (!pruned.ok) throw new Error(`${artifact.baseSkin} theme.css: ${pruned.errors.join("; ")}`);
  return pruned.artifact;
}

function packThemeArtifact(themePath: string, id: SkinId): ControlUiThemeArtifactV1 {
  const shared: TokenValues = {};
  const light: TokenValues = {};
  const dark: TokenValues = {};
  postcss.parse(readFileSync(themePath, "utf8"), { from: themePath }).walkDecls((declaration) => {
    if (!THEME_CONTRACT_NAMES.has(declaration.prop)) return;
    const rule = declaration.parent?.type === "rule" ? declaration.parent : undefined;
    if (!rule || !("selector" in rule) || !rule.selector.includes("[data-skin")) return;
    if (!isColorValuedToken(declaration.prop)) shared[declaration.prop] = declaration.value.trim();
    else if (rule.selector.includes(".dark")) dark[declaration.prop] = declaration.value.trim();
    else light[declaration.prop] = declaration.value.trim();
  });
  return { format: "control-ui-theme/v1", name: `${id} pack`, baseSkin: id, reduceMotion: id === "xp", tokens: { shared, light, dark } };
}
