import type { ControlUiSkin } from "@/components/control-ui/skin";

/*
 * "Rig" is THEME skin: brand lives in theme.css tokens (coral/near-black, core-default square radius, grotesque)
 * + presentational skin.css. Config only names id, which scopes theme.css/skin.css — no per-slot
 * classes needed.
 */
export const skin: ControlUiSkin = { id: "rig" };
