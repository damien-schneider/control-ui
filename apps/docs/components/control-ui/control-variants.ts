export type ControlSize = "xs" | "sm" | "md" | "lg";

export const controlVariants = ["solid", "surface", "ghost", "quiet"] as const;

export type ControlVariant = (typeof controlVariants)[number];

export const controlTones = ["neutral", "primary", "danger"] as const;

export type ControlTone = (typeof controlTones)[number];
