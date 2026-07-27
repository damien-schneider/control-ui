import { type ComponentType, type LazyExoticComponent, lazy } from "react";

// shadcn compatibility is contract over shared tokens and APIs, not parallel source tree; skin is separate axis and never ships component source.
export const integrationIds = ["mastra", "ai-sdk"] as const;
export const registryKindIds = [
  "chat",
  "chat-message",
  "chat-composer",
  "chat-composer-attachment",
  "activity",
  "context",
  "inline-citation",
  "source-badge",
  "action-bar",
  "inline-attachment",
  "markdown-block",
  "code-block-editor",
  "chat-layout",
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
  "timeline",
  "skeleton",
  "slider",
  "select",
  "dropdown-menu",
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
  "dropzone",
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
  "infinite-canvas",
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

// Absence IS "stable", so no item can drift into claiming stability it never declared.
const catalogStatusIds = ["beta", "experimental"] as const;

export type CatalogIntegrationId = (typeof integrationIds)[number];
export type CatalogRegistryKind = (typeof registryKindIds)[number];
export type CatalogStatus = (typeof catalogStatusIds)[number];
export type CatalogSourceFile = {
  label: string;
  path: string;
  slot?: string;
};

export type IntegrationPreviewProps = { integration?: CatalogIntegrationId };

// `integration` is the only prop renderer passes and it is optional, so preview ignoring props stays assignable and no generic needs asserting away.
type PreviewLoader = () => Promise<{ default: ComponentType<IntegrationPreviewProps> }>;
export type CatalogPreview = {
  Component: LazyExoticComponent<ComponentType<IntegrationPreviewProps>>;
  load: PreviewLoader;
};

export type CatalogNamedPreview = {
  id: string;
  title: string;
  description?: string;
  source: CatalogSourceFile;
  preview: CatalogPreview;
  previewClassName?: string;
};

export type CatalogCompositionExample = {
  title: string;
  description?: string;
  code: string;
};

export function includesString<T extends string>(values: readonly T[], value: string): value is T {
  return values.some((item) => item === value);
}

// tier where no entry declares status drops it from whole union, so an `in` narrow would type it `unknown`.
// `id` is required only to anchor parameter — all-optional type would reject every entry as weak.
export function catalogStatus(entry: { id: string; status?: CatalogStatus }): CatalogStatus | undefined {
  return entry.status;
}

export function sourceFile(label: string, path: string, slot?: string): CatalogSourceFile {
  return { label, path, slot };
}

export function preview(load: PreviewLoader): CatalogPreview {
  return { Component: lazy(load), load };
}

export function isCatalogIntegrationId(value: string): value is CatalogIntegrationId {
  return includesString(integrationIds, value);
}
