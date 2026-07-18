import type { ControlUiSkin } from "@/components/control-ui/skin";

/*
 * "Rig" is a THEME skin: brand lives in theme.css tokens (coral/near-black, --radius:0, grotesque)
 * + presentational skin.css. Config only names id, which scopes theme.css/skin.css — no per-slot
 * classes needed.
 */
export const skin: ControlUiSkin = { id: "rig" };
