export type ControlSize = "xs" | "sm" | "md" | "lg";

export const buttonVariants = ["solid", "surface", "ghost", "quiet", "dashed", "link"] as const;

export type ButtonVariant = (typeof buttonVariants)[number];

export const controlTones = ["neutral", "primary", "danger"] as const;

export type ControlTone = (typeof controlTones)[number];
