import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import postcss from "postcss";
import { isSkinId } from "@/components/theme-drawer/presets";
import { validateThemeArtifact, validateTokenEntry } from "@/components/theme-drawer/theme-artifact";
import { isColorValuedToken } from "@/components/theme-drawer/token-metadata";
import type { ControlUiThemeArtifactV1, SkinId, TokenValues } from "@/components/theme-drawer/types";
import { THEME_CONTRACT_NAMES } from "@/src/registry/lib/theme-contract";

const packsRoot = "src/registry/skin-packs";

export function packThemeArtifacts(cwd = process.cwd()): ControlUiThemeArtifactV1[] {
  const packsDir = path.join(cwd, packsRoot);
  return readdirSync(packsDir)
    .filter((entry) => statSync(path.join(packsDir, entry)).isDirectory())
    .sort()
    .map((id) => {
      if (!isSkinId(id)) throw new Error(`${id} is a skin pack directory but not a SkinId`);
      return representable(packThemeArtifact(path.join(packsDir, id, "theme.css"), id));
    });
}

/** A pack may hold values the artifact format cannot carry (a 260-character `linear()` easing); drop those, keep the rest. */
function representable(artifact: ControlUiThemeArtifactV1): ControlUiThemeArtifactV1 {
  const keep = (bucket: "shared" | "light" | "dark") =>
    Object.fromEntries(
      Object.entries(artifact.tokens[bucket]).filter(([name, value]) => validateTokenEntry(name, value, bucket, []) !== null),
    );
  const result = validateThemeArtifact({ ...artifact, tokens: { shared: keep("shared"), light: keep("light"), dark: keep("dark") } });
  if (!result.ok) throw new Error(`${artifact.baseSkin} theme.css: ${result.errors.join("; ")}`);
  return result.artifact;
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
