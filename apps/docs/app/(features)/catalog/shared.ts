import { type ComponentType, type LazyExoticComponent, lazy } from "react";

export const integrationIds = ["mastra", "ai-sdk"] as const;
export const registryKindIds = [
  "email",
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
  "markdown-editor",
  "chat-layout",
  "thread-rail",
  "transcript-divider",
  "user-ask",
  "task-list",
  "audio-device-select",
  "audio-recorder",
  "audio-visualizer",
  "audio-visualizer-line",
  "audio-visualizer-bar",
  "dynamic-notification",
  "filter-bar",
  "chat-block",
  "coding-agent-block",
  "file-explorer-block",
  "design-canvas-block",
  "theme-toggle-block",
  "settings-block",
  "team-chat-block",
  "discussion-block",
  "button",
  "collapsible",
  "tabs",
  "track-highlight",
  "sidebar",
  "app-shell",
  "page-layout",
  "scroll-area",
  "progressive-blur",
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
  "rich-tooltip",
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
  "breadcrumb",
  "separator",
  "live-status",
  "spinner",
  "meter",
  "checkbox-group",
  "autocomplete",
  "number-field",
  "toolbar",
  "dockable-panel",
  "infinite-canvas",
  "flow",
  "resize-handle",
  "morphing-panel",
  "color-picker",
  "emoji-picker",
  "icon-picker",
  "emoji-icon-picker",
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

type PreviewLoader = () => Promise<{ default: ComponentType<IntegrationPreviewProps> }>;
export type PreviewLayout = "full" | "centered" | "stack" | "grid" | "contained";
type PreviewOptions = {
  layout?: PreviewLayout;
  description?: string;
};
export type CatalogPreview = PreviewOptions & {
  Component: LazyExoticComponent<ComponentType<IntegrationPreviewProps>>;
  load: PreviewLoader;
};

export type CatalogNamedPreview = {
  id: string;
  title: string;
  description?: string;
  source: CatalogSourceFile;
  preview: CatalogPreview;
  previewModule?: string;
  previewClassName?: string;
};

export type CatalogComponentVariant = {
  id: string;
  label: string;
  description: string;
  paths: {
    example: CatalogSourceFile;
    usage: Record<CatalogIntegrationId, CatalogSourceFile>;
  };
  preview: CatalogPreview;
};

export type CatalogComponentAlternative = Omit<CatalogComponentVariant, "paths"> & {
  registryKind: CatalogRegistryKind;
  paths: CatalogComponentVariant["paths"] & {
    source: CatalogSourceFile;
    supportFiles?: readonly CatalogSourceFile[];
  };
};

export function includesString<T extends string>(values: readonly T[], value: string): value is T {
  return values.some((item) => item === value);
}

export function catalogStatus(entry: { id: string; status?: CatalogStatus }): CatalogStatus | undefined {
  return entry.status;
}

export function sourceFile(label: string, path: string, slot?: string): CatalogSourceFile {
  return { label, path, slot };
}

export function preview(load: PreviewLoader, options: PreviewOptions = {}): CatalogPreview {
  return { Component: lazy(load), load, ...options };
}

export function isCatalogIntegrationId(value: string): value is CatalogIntegrationId {
  return includesString(integrationIds, value);
}
