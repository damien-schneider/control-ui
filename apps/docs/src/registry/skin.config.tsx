import type { ControlUiSkin } from "./skin";

/*
 * YOUR skin — user-owned; installing a pack replaces this file + theme.css, library updates never touch it.
 * Components read `skin` only via skin.ts — swapping this file rebrands every slot.
 * Never "use client" here — interactive adornments live in a separate client component the pack references.
 */
export const skin: ControlUiSkin = { id: "refined" };
