import { type ComponentType, type LazyExoticComponent, lazy, type ReactNode } from "react";

// ONE source ships code: Control UI. shadcn compat = CONTRACT (shared tokens+APIs), not a parallel source tree — see shadcn-compatibility guide.
// Skins (skinMetas) are a separate axis: restyle library globally via tokens+skin.config, never their own component source.
export const integrationIds = ["mastra", "ai-sdk"] as const;
export const registryKindIds = [
  "chat",
  "chat-message",
  "chat-input",
  "chat-input-attachment",
  "activity",
  "source-badge",
  "action-bar",
  "inline-attachment",
  "markdown-block",
  "code-block-editor",
  "chat-scene",
  "thread-rail",
  "user-ask",
  "task-list",
  "audio-recorder",
  "audio-visualizer",
  "audio-visualizer-line",
  "dynamic-notification",
  "environment-variables",
  "chat-block",
  "coding-agent-block",
  "file-explorer-block",
  "theme-toggle-block",
  "settings-block",
  "button",
  "collapsible",
  "tabs",
  "sidebar",
  "scroll-area",
  "table-of-contents",
  "stepper",
  "skeleton",
  "slider",
  "select",
  "menu",
  "context-menu",
  "toggle",
  "switch",
  "dialog",
  "popover",
  "tooltip",
  "drawer",
  "responsive-dialog",
  "toast",
  "input",
  "input-group",
  "phone-input",
  "command",
  "trigger-menu",
  "kbd",
  "checkbox",
  "radio-group",
  "accordion",
  "avatar",
  "progress",
  "hover-card",
  "alert-dialog",
  "menubar",
  "navigation-menu",
  "field",
  "form",
  "native-select",
  "textarea",
  "input-otp",
  "combobox",
  "alert",
  "badge",
  "card",
  "table",
  "aspect-ratio",
  "button-group",
  "empty",
  "item",
  "pagination",
  "spinner",
  "meter",
  "checkbox-group",
  "autocomplete",
  "number-field",
  "toolbar",
  "dockable-panel",
  "morphing-panel",
  "color-picker",
  "gradient-editor",
  "resizable",
  "calendar",
  "typography",
  "tree",
  "code",
  "code-diff",
  "markdown",
  "view-transition",
  "control-effects",
  "send-aurora",
] as const;

// Release status of a catalog item. Absence IS "stable": the default never gets a badge, so a
// stable item carries no field and no item can drift into claiming stability it never declared.
const catalogStatusIds = ["beta", "experimental"] as const;

export type CatalogIntegrationId = (typeof integrationIds)[number];
export type CatalogRegistryKind = (typeof registryKindIds)[number];
export type CatalogStatus = (typeof catalogStatusIds)[number];
export type CatalogSourceFile = {
  label: string;
  path: string;
  slot?: string;
};

type PreviewLoader<TProps extends object> = () => Promise<{ default: ComponentType<TProps> }>;
type LoosePreviewComponent<TProps extends object> = ComponentType<TProps> | ComponentType<never> | (() => ReactNode);
type LoosePreviewLoader<TProps extends object> = () => Promise<{ default: LoosePreviewComponent<TProps> }>;
export type CatalogPreview<TProps extends object = object> = {
  Component: LazyExoticComponent<ComponentType<TProps>>;
  load: PreviewLoader<TProps>;
};

export type CatalogNamedPreview<TProps extends object = object> = {
  id: string;
  title: string;
  description?: string;
  source: CatalogSourceFile;
  preview: CatalogPreview<TProps>;
  previewClassName?: string;
};

export type CatalogCompositionExample = {
  title: string;
  description?: string;
  code: string;
};

// Optional `integration` prop swaps provider usage code; most previews ignore it, kept for a uniform loader signature.
export type IntegrationPreviewProps = { integration?: CatalogIntegrationId };

export function includesString<T extends string>(values: readonly T[], value: string): value is T {
  return values.some((item) => item === value);
}

// Reads an entry's status. A tier where no entry declares one infers `status` as absent from the whole
// union, so an `in` narrow would type it `unknown` — this typed accessor keeps the read honest instead.
// `id` is required only to anchor the parameter: an all-optional type would reject every entry as a weak type.
export function catalogStatus(entry: { id: string; status?: CatalogStatus }): CatalogStatus | undefined {
  return entry.status;
}

export function sourceFile(label: string, path: string, slot?: string): CatalogSourceFile {
  return { label, path, slot };
}

export function preview<TProps extends object = object>(load: LoosePreviewLoader<TProps>): CatalogPreview<TProps> {
  // Loose caller loader signature vs strict internal one differ by design (loose omits ignored props); no annotation/satisfies fits.
  const typedLoad = load as PreviewLoader<TProps>;
  return { Component: lazy(typedLoad), load: typedLoad };
}

export function isCatalogIntegrationId(value: string): value is CatalogIntegrationId {
  return includesString(integrationIds, value);
}
