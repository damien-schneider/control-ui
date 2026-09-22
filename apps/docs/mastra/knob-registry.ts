// Generated from src/registry/sources/control-ui/recipes by scripts/gen-knob-registry.ts — run `bun run sync:knob-registry`.
export type RegisteredKnob = { name: string; syntax: string; defaultValue: string; selector: string };
export type RegisteredKnobFamily = { id: string; knobs: readonly RegisteredKnob[] };

export const KNOB_REGISTRY: readonly RegisteredKnobFamily[] = [
  {
    id: "accordion",
    knobs: [
      {
        name: "--cui-accordion-icon-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="accordion"][data-slot="root"])',
      },
      {
        name: "--cui-accordion-item-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="accordion"][data-slot="root"])',
      },
      {
        name: "--cui-accordion-item-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="accordion"][data-slot="root"])',
      },
      {
        name: "--cui-accordion-trigger-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="accordion"][data-slot="root"])',
      },
      {
        name: "--cui-accordion-trigger-hover-foreground",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.8)",
        selector: ':where([data-control-family="accordion"][data-slot="root"])',
      },
    ],
  },
  {
    id: "action-bar",
    knobs: [
      {
        name: "--cui-action-bar-hidden-opacity",
        syntax: "<number>",
        defaultValue: "0",
        selector: ':where([data-control-family="action-bar"][data-slot="root"])',
      },
      {
        name: "--cui-action-bar-visible-opacity",
        syntax: "<number>",
        defaultValue: "1",
        selector: ':where([data-control-family="action-bar"][data-slot="root"])',
      },
    ],
  },
  {
    id: "activity",
    knobs: [
      {
        name: "--cui-activity-code-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--muted) l c h / 0.5)",
        selector: ':where([data-control-family="activity"][data-slot="root"])',
      },
      {
        name: "--cui-activity-code-radius",
        syntax: "<length>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="activity"][data-slot="root"])',
      },
      {
        name: "--cui-activity-row-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="activity"][data-slot="root"])',
      },
      {
        name: "--cui-activity-trigger-hover-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--muted) l c h / 0.45)",
        selector: ':where([data-control-family="activity"][data-slot="root"])',
      },
      {
        name: "--cui-activity-trigger-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="activity"][data-slot="root"])',
      },
    ],
  },
  {
    id: "alert",
    knobs: [
      {
        name: "--cui-alert-background",
        syntax: "*",
        defaultValue: "var(--card)",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
      {
        name: "--cui-alert-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
      {
        name: "--cui-alert-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
      {
        name: "--cui-alert-description-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
      {
        name: "--cui-alert-description-gap",
        syntax: "<length>",
        defaultValue: "var(--spacing)",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
      {
        name: "--cui-alert-font-size",
        syntax: "<length>",
        defaultValue: "var(--text-sm)",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
      {
        name: "--cui-alert-foreground",
        syntax: "<color>",
        defaultValue: "var(--card-foreground)",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
      {
        name: "--cui-alert-gap",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 0.5)",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
      {
        name: "--cui-alert-icon-gap",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 3)",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
      {
        name: "--cui-alert-icon-size",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 4)",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
      {
        name: "--cui-alert-padding",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 3)",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
      {
        name: "--cui-alert-padding-inline",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 4)",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
      {
        name: "--cui-alert-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-lg)",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
      {
        name: "--cui-alert-shadow",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
      {
        name: "--cui-alert-title-font-weight",
        syntax: "<number>",
        defaultValue: "var(--font-weight-medium)",
        selector: ':where([data-control-family="alert"][data-slot="root"])',
      },
    ],
  },
  {
    id: "audio-recorder",
    knobs: [
      {
        name: "--cui-audio-recorder-active-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-ui="audio-recorder"][data-slot="root"])',
      },
      {
        name: "--cui-audio-recorder-error-foreground",
        syntax: "<color>",
        defaultValue: "var(--destructive-text)",
        selector: ':where([data-control-ui="audio-recorder"][data-slot="root"])',
      },
      {
        name: "--cui-audio-recorder-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-ui="audio-recorder"][data-slot="root"])',
      },
      {
        name: "--cui-audio-recorder-recording-ring-color",
        syntax: "<color>",
        defaultValue: "oklch(from var(--destructive) l c h / 0.25)",
        selector: ':where([data-control-ui="audio-recorder"][data-slot="root"])',
      },
    ],
  },
  {
    id: "audio-visualizer",
    knobs: [
      {
        name: "--cui-audio-visualizer-bar-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--primary) l c h / 0.8)",
        selector: ':where([data-control-family="audio-visualizer"][data-variant])',
      },
      {
        name: "--cui-audio-visualizer-bar-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="audio-visualizer"][data-variant])',
      },
      {
        name: "--cui-audio-visualizer-line-fill",
        syntax: "<color>",
        defaultValue: "oklch(from var(--primary) l c h / 0.18)",
        selector: ':where([data-control-family="audio-visualizer"][data-variant])',
      },
      {
        name: "--cui-audio-visualizer-line-stroke",
        syntax: "<color>",
        defaultValue: "oklch(from var(--primary) l c h / 0.8)",
        selector: ':where([data-control-family="audio-visualizer"][data-variant])',
      },
      {
        name: "--cui-audio-visualizer-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="audio-visualizer"][data-variant])',
      },
    ],
  },
  {
    id: "avatar",
    knobs: [
      {
        name: "--cui-avatar-fallback-background",
        syntax: "<color>",
        defaultValue: "var(--muted)",
        selector:
          ':where([data-control-family="avatar"][data-slot="root"]),\n  :where([data-control-family="avatar"][data-slot="favicon"]),\n  :where([data-control-family="avatar"][data-slot="source-favicon"])',
      },
      {
        name: "--cui-avatar-fallback-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector:
          ':where([data-control-family="avatar"][data-slot="root"]),\n  :where([data-control-family="avatar"][data-slot="favicon"]),\n  :where([data-control-family="avatar"][data-slot="source-favicon"])',
      },
      {
        name: "--cui-avatar-group-ring-color",
        syntax: "<color>",
        defaultValue: "var(--background)",
        selector:
          ':where([data-control-family="avatar"][data-slot="root"]),\n  :where([data-control-family="avatar"][data-slot="favicon"]),\n  :where([data-control-family="avatar"][data-slot="source-favicon"])',
      },
      {
        name: "--cui-avatar-image-outline-color",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.1)",
        selector: ':where([data-control-family="avatar"][data-slot="root"])',
      },
      {
        name: "--cui-avatar-radius",
        syntax: "<length-percentage>",
        defaultValue: "9999px",
        selector:
          ':where([data-control-family="avatar"][data-slot="root"]),\n  :where([data-control-family="avatar"][data-slot="favicon"]),\n  :where([data-control-family="avatar"][data-slot="source-favicon"])',
      },
    ],
  },
  {
    id: "badge",
    knobs: [
      {
        name: "--cui-badge-background",
        syntax: "*",
        defaultValue: "var(--_badge-color-background)",
        selector: ':where([data-control-family="badge"][data-slot="root"])',
      },
      {
        name: "--cui-badge-border-color",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="badge"][data-slot="root"])',
      },
      {
        name: "--cui-badge-foreground",
        syntax: "<color>",
        defaultValue: "var(--_badge-color-foreground)",
        selector: ':where([data-control-family="badge"][data-slot="root"])',
      },
      {
        name: "--cui-badge-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="badge"][data-slot="root"])',
      },
    ],
  },
  {
    id: "breadcrumb",
    knobs: [
      {
        name: "--cui-breadcrumb-list-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="breadcrumb"][data-slot="root"])',
      },
      {
        name: "--cui-breadcrumb-page-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="breadcrumb"][data-slot="root"])',
      },
    ],
  },
  {
    id: "button",
    knobs: [
      {
        name: "--cui-button-active-background",
        syntax: "<color>",
        defaultValue: "var(--active-fill)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-active-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-active-hover-background",
        syntax: "<color>",
        defaultValue: "var(--cui-button-active-background)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-active-shadow",
        syntax: "*",
        defaultValue: "var(--cui-button-shadow)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-background",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-background-image",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-font-size",
        syntax: "<length-percentage>",
        defaultValue: "var(--text-body)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-gap",
        syntax: "<length-percentage>",
        defaultValue: "calc(var(--spacing) * 1.5)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-height",
        syntax: "<length-percentage>",
        defaultValue: "var(--control-h-md)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-hover-background",
        syntax: "<color>",
        defaultValue: "var(--hover-fill)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-hover-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-hover-shadow",
        syntax: "*",
        defaultValue: "var(--cui-button-shadow)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-icon",
        syntax: "<length>",
        defaultValue: "1rem",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-icon-padding-inline",
        syntax: "<length-percentage>",
        defaultValue: "max(0px, calc(var(--cui-button-padding-inline) - var(--spacing) * 0.5))",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-open-background",
        syntax: "<color>",
        defaultValue: "var(--cui-button-hover-background)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-open-foreground",
        syntax: "<color>",
        defaultValue: "var(--cui-button-hover-foreground)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-open-shadow",
        syntax: "*",
        defaultValue: "var(--cui-button-shadow)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-padding-inline",
        syntax: "<length-percentage>",
        defaultValue: "var(--padding-x)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-press-background",
        syntax: "<color>",
        defaultValue: "var(--cui-button-hover-background)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-press-scale",
        syntax: "<number>",
        defaultValue: "0.98",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-press-shadow",
        syntax: "*",
        defaultValue: "var(--cui-button-hover-shadow)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
      {
        name: "--cui-button-shadow",
        syntax: "*",
        defaultValue: "0 0 transparent",
        selector: ':where([data-control-family="button"][data-control="true"])',
      },
    ],
  },
  {
    id: "button-group",
    knobs: [
      {
        name: "--cui-button-group-separator-background",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="button-group"][data-slot="root"])',
      },
      {
        name: "--cui-button-group-text-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--card) l c h / 0.72)",
        selector: ':where([data-control-family="button-group"][data-slot="root"])',
      },
      {
        name: "--cui-button-group-text-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="button-group"][data-slot="root"])',
      },
      {
        name: "--cui-button-group-text-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="button-group"][data-slot="root"])',
      },
    ],
  },
  {
    id: "calendar",
    knobs: [
      {
        name: "--cui-calendar-day-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="calendar"][data-slot="root"])',
      },
      {
        name: "--cui-calendar-range-background",
        syntax: "<color>",
        defaultValue: "var(--accent)",
        selector: ':where([data-control-family="calendar"][data-slot="root"])',
      },
      {
        name: "--cui-calendar-selected-background",
        syntax: "<color>",
        defaultValue: "var(--primary)",
        selector: ':where([data-control-family="calendar"][data-slot="root"])',
      },
      {
        name: "--cui-calendar-selected-foreground",
        syntax: "<color>",
        defaultValue: "var(--primary-foreground)",
        selector: ':where([data-control-family="calendar"][data-slot="root"])',
      },
      {
        name: "--cui-calendar-today-background",
        syntax: "<color>",
        defaultValue: "var(--accent)",
        selector: ':where([data-control-family="calendar"][data-slot="root"])',
      },
    ],
  },
  {
    id: "card",
    knobs: [
      {
        name: "--cui-card-backdrop-filter",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="card"][data-slot="root"])',
      },
      {
        name: "--cui-card-background",
        syntax: "<color>",
        defaultValue: "var(--card)",
        selector: ':where([data-control-family="card"][data-slot="root"])',
      },
      {
        name: "--cui-card-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="card"][data-slot="root"])',
      },
      {
        name: "--cui-card-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="card"][data-slot="root"])',
      },
      {
        name: "--cui-card-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-lg)",
        selector: ':where([data-control-family="card"][data-slot="root"])',
      },
      {
        name: "--cui-card-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="card"][data-slot="root"])',
      },
    ],
  },
  {
    id: "chat-composer",
    knobs: [
      {
        name: "--cui-chat-composer-input-foreground",
        syntax: "<color>",
        defaultValue: "var(--card-foreground)",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
      {
        name: "--cui-chat-composer-input-placeholder-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
      {
        name: "--cui-chat-composer-mention-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--primary) l c h / 0.1)",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
      {
        name: "--cui-chat-composer-mention-border-color",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
      {
        name: "--cui-chat-composer-mention-border-width",
        syntax: "<length>",
        defaultValue: "0px",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
      {
        name: "--cui-chat-composer-mention-icon-radius",
        syntax: "<length>",
        defaultValue: "min(var(--radius-sm), calc(var(--spacing) * 1))",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
      {
        name: "--cui-chat-composer-mention-radius",
        syntax: "<length>",
        defaultValue: "var(--radius-popup-item)",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
      {
        name: "--cui-chat-composer-root-background",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
      {
        name: "--cui-chat-composer-shell-backdrop-filter",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
      {
        name: "--cui-chat-composer-shell-background",
        syntax: "<color>",
        defaultValue: "var(--card)",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
      {
        name: "--cui-chat-composer-shell-background-image",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
      {
        name: "--cui-chat-composer-shell-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
      {
        name: "--cui-chat-composer-shell-border-width",
        syntax: "<length>",
        defaultValue: "var(--control-rim-width)",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
      {
        name: "--cui-chat-composer-shell-radius",
        syntax: "<length>",
        defaultValue: "var(--radius-field)",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
      {
        name: "--cui-chat-composer-shell-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-md)",
        selector: ':where([data-control-family="chat-composer"][data-slot="root"])',
      },
    ],
  },
  {
    id: "chat-composer-attachment",
    knobs: [
      {
        name: "--cui-chat-composer-attachment-backdrop-filter",
        syntax: "*",
        defaultValue: "blur(var(--backdrop-blur-popover))",
        selector: ':where([data-control-family="chat-composer-attachment"][data-slot="root"][data-variant])',
      },
      {
        name: "--cui-chat-composer-attachment-background",
        syntax: "<color>",
        defaultValue: "var(--popover)",
        selector: ':where([data-control-family="chat-composer-attachment"][data-slot="root"][data-variant])',
      },
      {
        name: "--cui-chat-composer-attachment-border-color",
        syntax: "<color>",
        defaultValue: "var(--control-rim)",
        selector: ':where([data-control-family="chat-composer-attachment"][data-slot="root"][data-variant])',
      },
      {
        name: "--cui-chat-composer-attachment-height",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 14)",
        selector: ':where([data-control-family="chat-composer-attachment"][data-slot="root"][data-variant])',
      },
      {
        name: "--cui-chat-composer-attachment-image-outline-color",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.1)",
        selector: ':where([data-control-family="chat-composer-attachment"][data-slot="root"][data-variant])',
      },
      {
        name: "--cui-chat-composer-attachment-list-padding",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 3)",
        selector: ':where([data-control-family="chat-composer-attachment"][data-slot="root"]:not([data-variant]))',
      },
      {
        name: "--cui-chat-composer-attachment-progress-background",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="chat-composer-attachment"][data-slot="root"][data-variant])',
      },
      {
        name: "--cui-chat-composer-attachment-progress-foreground",
        syntax: "<color>",
        defaultValue: "oklch(from var(--background) l c h / var(--overlay-opacity))",
        selector: ':where([data-control-family="chat-composer-attachment"][data-slot="root"][data-variant])',
      },
      {
        name: "--cui-chat-composer-attachment-radius",
        syntax: "<length>",
        defaultValue: "var(--radius-popover)",
        selector: ':where([data-control-family="chat-composer-attachment"][data-slot="root"][data-variant])',
      },
      {
        name: "--cui-chat-composer-attachment-shadow",
        syntax: "*",
        defaultValue: "inset 0 0 0 var(--control-rim-width) var(--cui-chat-composer-attachment-border-color), var(--shadow-sm)",
        selector: ':where([data-control-family="chat-composer-attachment"][data-slot="root"][data-variant])',
      },
    ],
  },
  {
    id: "chat-layout",
    knobs: [
      {
        name: "--cui-chat-layout-background",
        syntax: "<color>",
        defaultValue: "var(--background)",
        selector: ':where([data-control-family="chat-layout"][data-slot="root"][data-chrome])',
      },
      {
        name: "--cui-chat-layout-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="chat-layout"][data-slot="root"][data-chrome])',
      },
      {
        name: "--cui-chat-layout-border-width",
        syntax: "<length>",
        defaultValue: "var(--control-rim-width)",
        selector: ':where([data-control-family="chat-layout"][data-slot="root"][data-chrome])',
      },
      {
        name: "--cui-chat-layout-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-scene)",
        selector: ':where([data-control-family="chat-layout"][data-slot="root"][data-chrome])',
      },
      {
        name: "--cui-chat-layout-scroll-button-gap",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 3)",
        selector: ':where([data-control-family="chat-layout"][data-slot="root"][data-chrome])',
      },
      {
        name: "--cui-chat-layout-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-md)",
        selector: ':where([data-control-family="chat-layout"][data-slot="root"][data-chrome])',
      },
      {
        name: "--cui-chat-layout-turn-gap",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 2)",
        selector: ':where([data-control-family="chat-layout"][data-slot="root"][data-chrome])',
      },
    ],
  },
  {
    id: "chat-message",
    knobs: [
      {
        name: "--cui-chat-message-avatar-background",
        syntax: "<color>",
        defaultValue: "var(--card)",
        selector: ':where([data-control-family="chat-message"][data-slot="root"])',
      },
      {
        name: "--cui-chat-message-avatar-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="chat-message"][data-slot="root"])',
      },
      {
        name: "--cui-chat-message-avatar-border-width",
        syntax: "<length>",
        defaultValue: "var(--control-rim-width)",
        selector: ':where([data-control-family="chat-message"][data-slot="root"])',
      },
      {
        name: "--cui-chat-message-avatar-radius",
        syntax: "<length-percentage>",
        defaultValue: "9999px",
        selector: ':where([data-control-family="chat-message"][data-slot="root"])',
      },
      {
        name: "--cui-chat-message-background",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="chat-message"][data-slot="root"])',
      },
      {
        name: "--cui-chat-message-background-image",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="chat-message"][data-slot="root"])',
      },
      {
        name: "--cui-chat-message-border-color",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="chat-message"][data-slot="root"])',
      },
      {
        name: "--cui-chat-message-border-width",
        syntax: "<length>",
        defaultValue: "0px",
        selector: ':where([data-control-family="chat-message"][data-slot="root"])',
      },
      {
        name: "--cui-chat-message-corner-radius",
        syntax: "<length-percentage>",
        defaultValue: "0px",
        selector: ':where([data-control-family="chat-message"][data-slot="root"])',
      },
      {
        name: "--cui-chat-message-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="chat-message"][data-slot="root"])',
      },
      {
        name: "--cui-chat-message-pending-dot-color",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="chat-message"][data-slot="root"])',
      },
      {
        name: "--cui-chat-message-pending-dot-size",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 1.5)",
        selector: ':where([data-control-family="chat-message"][data-slot="root"])',
      },
      {
        name: "--cui-chat-message-radius",
        syntax: "<length-percentage>",
        defaultValue: "0px",
        selector: ':where([data-control-family="chat-message"][data-slot="root"])',
      },
      {
        name: "--cui-chat-message-shadow",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="chat-message"][data-slot="root"])',
      },
    ],
  },
  {
    id: "choice",
    knobs: [
      {
        name: "--cui-choice-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector:
          ':where([data-control-family="choice"][data-choice-kind="checkbox"][data-slot="root"]),\n  :where([data-control-family="choice"][data-choice-kind="radio-group"][data-slot="item"])',
      },
      {
        name: "--cui-choice-checked-background",
        syntax: "<color>",
        defaultValue: "var(--primary)",
        selector:
          ':where([data-control-family="choice"][data-choice-kind="checkbox"][data-slot="root"]),\n  :where([data-control-family="choice"][data-choice-kind="radio-group"][data-slot="item"])',
      },
      {
        name: "--cui-choice-checked-border-color",
        syntax: "<color>",
        defaultValue: "var(--primary)",
        selector:
          ':where([data-control-family="choice"][data-choice-kind="checkbox"][data-slot="root"]),\n  :where([data-control-family="choice"][data-choice-kind="radio-group"][data-slot="item"])',
      },
      {
        name: "--cui-choice-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-sm)",
        selector:
          ':where([data-control-family="choice"][data-choice-kind="checkbox"][data-slot="root"]),\n  :where([data-control-family="choice"][data-choice-kind="radio-group"][data-slot="item"])',
      },
      {
        name: "--cui-choice-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector:
          ':where([data-control-family="choice"][data-choice-kind="checkbox"][data-slot="root"]),\n  :where([data-control-family="choice"][data-choice-kind="radio-group"][data-slot="item"])',
      },
    ],
  },
  {
    id: "code",
    knobs: [
      {
        name: "--cui-code-background",
        syntax: "<color>",
        defaultValue: "var(--background)",
        selector: ':where([data-control-family="code"][data-slot="root"])',
      },
      {
        name: "--cui-code-border-color",
        syntax: "<color>",
        defaultValue: "var(--control-rim)",
        selector: ':where([data-control-family="code"][data-slot="root"])',
      },
      {
        name: "--cui-code-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="code"][data-slot="root"])',
      },
      {
        name: "--cui-code-line-highlight-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--primary) l c h / 0.08)",
        selector: ':where([data-control-family="code"][data-slot="root"])',
      },
      {
        name: "--cui-code-radius",
        syntax: "<length>",
        defaultValue: "var(--radius-panel)",
        selector: ':where([data-control-family="code"][data-slot="root"])',
      },
      {
        name: "--cui-code-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="code"][data-slot="root"])',
      },
      {
        name: "--cui-code-text-foreground",
        syntax: "<color>",
        defaultValue: "var(--code-foreground)",
        selector: ':where([data-control-family="code"][data-slot="root"])',
      },
      {
        name: "--cui-code-title-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="code"][data-slot="root"])',
      },
    ],
  },
  {
    id: "code-diff",
    knobs: [
      {
        name: "--cui-code-diff-add-background",
        syntax: "<color>",
        defaultValue: "var(--diff-add-line)",
        selector: ':where([data-control-family="code-diff"][data-slot="root"])',
      },
      {
        name: "--cui-code-diff-background",
        syntax: "<color>",
        defaultValue: "var(--background)",
        selector: ':where([data-control-family="code-diff"][data-slot="root"])',
      },
      {
        name: "--cui-code-diff-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="code-diff"][data-slot="root"])',
      },
      {
        name: "--cui-code-diff-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="code-diff"][data-slot="root"])',
      },
      {
        name: "--cui-code-diff-del-background",
        syntax: "<color>",
        defaultValue: "var(--diff-del-line)",
        selector: ':where([data-control-family="code-diff"][data-slot="root"])',
      },
      {
        name: "--cui-code-diff-expand-button-background",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="code-diff"][data-slot="root"])',
      },
      {
        name: "--cui-code-diff-expand-button-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="code-diff"][data-slot="root"])',
      },
      {
        name: "--cui-code-diff-expand-button-hover-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.08)",
        selector: ':where([data-control-family="code-diff"][data-slot="root"])',
      },
      {
        name: "--cui-code-diff-expand-button-hover-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="code-diff"][data-slot="root"])',
      },
      {
        name: "--cui-code-diff-expand-button-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="code-diff"][data-slot="root"])',
      },
      {
        name: "--cui-code-diff-expand-button-shadow",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="code-diff"][data-slot="root"])',
      },
      {
        name: "--cui-code-diff-foreground",
        syntax: "<color>",
        defaultValue: "var(--code-foreground)",
        selector: ':where([data-control-family="code-diff"][data-slot="root"])',
      },
      {
        name: "--cui-code-diff-radius",
        syntax: "<length>",
        defaultValue: "var(--radius-panel)",
        selector: ':where([data-control-family="code-diff"][data-slot="root"])',
      },
      {
        name: "--cui-code-diff-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="code-diff"][data-slot="root"])',
      },
    ],
  },
  { id: "collapsible", knobs: [] },
  {
    id: "color-picker",
    knobs: [
      {
        name: "--cui-color-picker-area-radius",
        syntax: "<length-percentage>+",
        defaultValue: "var(--radius-field)",
        selector:
          ':where([data-control-family="color-picker"][data-slot="trigger"]),\n  :where([data-control-family="color-picker"][data-slot="area"]),\n  :where([data-control-family="color-picker"][data-slot="hue"]),\n  :where([data-control-family="color-picker"][data-slot="alpha"]),\n  :where([data-control-family="color-picker"][data-slot="wheel"]),\n  :where([data-control-family="color-picker"][data-slot="swatch"]),\n  :where([data-control-family="color-picker"][data-slot="output"])',
      },
      {
        name: "--cui-color-picker-output-swatch-radius",
        syntax: "<length-percentage>+",
        defaultValue: "var(--radius-md)",
        selector:
          ':where([data-control-family="color-picker"][data-slot="trigger"]),\n  :where([data-control-family="color-picker"][data-slot="area"]),\n  :where([data-control-family="color-picker"][data-slot="hue"]),\n  :where([data-control-family="color-picker"][data-slot="alpha"]),\n  :where([data-control-family="color-picker"][data-slot="wheel"]),\n  :where([data-control-family="color-picker"][data-slot="swatch"]),\n  :where([data-control-family="color-picker"][data-slot="output"])',
      },
      {
        name: "--cui-color-picker-slider-thumb-background",
        syntax: "<color>",
        defaultValue: "transparent",
        selector:
          ':where([data-control-family="color-picker"][data-slot="trigger"]),\n  :where([data-control-family="color-picker"][data-slot="area"]),\n  :where([data-control-family="color-picker"][data-slot="hue"]),\n  :where([data-control-family="color-picker"][data-slot="alpha"]),\n  :where([data-control-family="color-picker"][data-slot="wheel"]),\n  :where([data-control-family="color-picker"][data-slot="swatch"]),\n  :where([data-control-family="color-picker"][data-slot="output"])',
      },
      {
        name: "--cui-color-picker-slider-thumb-radius",
        syntax: "<length-percentage>",
        defaultValue: "calc(infinity * 1px)",
        selector:
          ':where([data-control-family="color-picker"][data-slot="trigger"]),\n  :where([data-control-family="color-picker"][data-slot="area"]),\n  :where([data-control-family="color-picker"][data-slot="hue"]),\n  :where([data-control-family="color-picker"][data-slot="alpha"]),\n  :where([data-control-family="color-picker"][data-slot="wheel"]),\n  :where([data-control-family="color-picker"][data-slot="swatch"]),\n  :where([data-control-family="color-picker"][data-slot="output"])',
      },
      {
        name: "--cui-color-picker-swatch-radius",
        syntax: "<length-percentage>+",
        defaultValue: "var(--radius-md)",
        selector:
          ':where([data-control-family="color-picker"][data-slot="trigger"]),\n  :where([data-control-family="color-picker"][data-slot="area"]),\n  :where([data-control-family="color-picker"][data-slot="hue"]),\n  :where([data-control-family="color-picker"][data-slot="alpha"]),\n  :where([data-control-family="color-picker"][data-slot="wheel"]),\n  :where([data-control-family="color-picker"][data-slot="swatch"]),\n  :where([data-control-family="color-picker"][data-slot="output"])',
      },
      {
        name: "--cui-color-picker-trigger-radius",
        syntax: "<length-percentage>+",
        defaultValue: "var(--radius-control)",
        selector:
          ':where([data-control-family="color-picker"][data-slot="trigger"]),\n  :where([data-control-family="color-picker"][data-slot="area"]),\n  :where([data-control-family="color-picker"][data-slot="hue"]),\n  :where([data-control-family="color-picker"][data-slot="alpha"]),\n  :where([data-control-family="color-picker"][data-slot="wheel"]),\n  :where([data-control-family="color-picker"][data-slot="swatch"]),\n  :where([data-control-family="color-picker"][data-slot="output"])',
      },
      {
        name: "--cui-color-picker-trigger-shadow",
        syntax: "*",
        defaultValue: "inset 0 0 0 1px var(--border)",
        selector:
          ':where([data-control-family="color-picker"][data-slot="trigger"]),\n  :where([data-control-family="color-picker"][data-slot="area"]),\n  :where([data-control-family="color-picker"][data-slot="hue"]),\n  :where([data-control-family="color-picker"][data-slot="alpha"]),\n  :where([data-control-family="color-picker"][data-slot="wheel"]),\n  :where([data-control-family="color-picker"][data-slot="swatch"]),\n  :where([data-control-family="color-picker"][data-slot="output"])',
      },
    ],
  },
  {
    id: "context",
    knobs: [
      {
        name: "--cui-context-graph-radius",
        syntax: "<length>",
        defaultValue: "9999px",
        selector:
          ':where([data-control-family="context"][data-slot="root"]),\n  :where([data-control-family="context"][data-slot="content"])',
      },
      {
        name: "--cui-context-legend-indicator-radius",
        syntax: "<length>",
        defaultValue: "9999px",
        selector:
          ':where([data-control-family="context"][data-slot="root"]),\n  :where([data-control-family="context"][data-slot="content"])',
      },
      {
        name: "--cui-context-limit-marker-color",
        syntax: "<color>",
        defaultValue: "var(--destructive-text)",
        selector:
          ':where([data-control-family="context"][data-slot="root"]),\n  :where([data-control-family="context"][data-slot="content"])',
      },
      {
        name: "--cui-context-overage-fill",
        syntax: "<color>",
        defaultValue: "oklch(from var(--destructive-text) l c h / 0.22)",
        selector:
          ':where([data-control-family="context"][data-slot="root"]),\n  :where([data-control-family="context"][data-slot="content"])',
      },
      {
        name: "--cui-context-segment-cache-fill",
        syntax: "<color>",
        defaultValue: "oklch(from var(--muted-foreground) l c h / 0.55)",
        selector:
          ':where([data-control-family="context"][data-slot="root"]),\n  :where([data-control-family="context"][data-slot="content"])',
      },
      {
        name: "--cui-context-segment-message-fill",
        syntax: "<color>",
        defaultValue: "oklch(from var(--primary) l c h / 0.65)",
        selector:
          ':where([data-control-family="context"][data-slot="root"]),\n  :where([data-control-family="context"][data-slot="content"])',
      },
      {
        name: "--cui-context-segment-reasoning-fill",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.5)",
        selector:
          ':where([data-control-family="context"][data-slot="root"]),\n  :where([data-control-family="context"][data-slot="content"])',
      },
      {
        name: "--cui-context-segment-source-fill",
        syntax: "<color>",
        defaultValue: "oklch(from var(--accent-foreground) l c h / 0.65)",
        selector:
          ':where([data-control-family="context"][data-slot="root"]),\n  :where([data-control-family="context"][data-slot="content"])',
      },
      {
        name: "--cui-context-segment-system-fill",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.75)",
        selector:
          ':where([data-control-family="context"][data-slot="root"]),\n  :where([data-control-family="context"][data-slot="content"])',
      },
      {
        name: "--cui-context-segment-tool-fill",
        syntax: "<color>",
        defaultValue: "var(--primary)",
        selector:
          ':where([data-control-family="context"][data-slot="root"]),\n  :where([data-control-family="context"][data-slot="content"])',
      },
      {
        name: "--cui-context-track-fill",
        syntax: "<color>",
        defaultValue: "var(--muted)",
        selector:
          ':where([data-control-family="context"][data-slot="root"]),\n  :where([data-control-family="context"][data-slot="content"])',
      },
    ],
  },
  {
    id: "dockable-panel",
    knobs: [
      {
        name: "--cui-dockable-panel-background",
        syntax: "<color>",
        defaultValue: "var(--card)",
        selector:
          ':where([data-control-family="dockable-panel"][data-slot="root"]),\n  :where([data-control-family="popup"][data-popup-kind="drawer"][data-slot="content"][data-dockable-panel-root])',
      },
      {
        name: "--cui-dockable-panel-border-color",
        syntax: "<color>",
        defaultValue: "oklch(from var(--border) l c h / 0.8)",
        selector:
          ':where([data-control-family="dockable-panel"][data-slot="root"]),\n  :where([data-control-family="popup"][data-popup-kind="drawer"][data-slot="content"][data-dockable-panel-root])',
      },
      {
        name: "--cui-dockable-panel-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector:
          ':where([data-control-family="dockable-panel"][data-slot="root"]),\n  :where([data-control-family="popup"][data-popup-kind="drawer"][data-slot="content"][data-dockable-panel-root])',
      },
      {
        name: "--cui-dockable-panel-drop-zone-active-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--primary) l c h / 0.12)",
        selector:
          ':where([data-control-family="dockable-panel"][data-slot="root"]),\n  :where([data-control-family="popup"][data-popup-kind="drawer"][data-slot="content"][data-dockable-panel-root])',
      },
      {
        name: "--cui-dockable-panel-drop-zone-active-border-color",
        syntax: "<color>",
        defaultValue: "oklch(from var(--primary) l c h / 0.55)",
        selector:
          ':where([data-control-family="dockable-panel"][data-slot="root"]),\n  :where([data-control-family="popup"][data-popup-kind="drawer"][data-slot="content"][data-dockable-panel-root])',
      },
      {
        name: "--cui-dockable-panel-foreground",
        syntax: "<color>",
        defaultValue: "var(--card-foreground)",
        selector:
          ':where([data-control-family="dockable-panel"][data-slot="root"]),\n  :where([data-control-family="popup"][data-popup-kind="drawer"][data-slot="content"][data-dockable-panel-root])',
      },
      {
        name: "--cui-dockable-panel-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-panel)",
        selector:
          ':where([data-control-family="dockable-panel"][data-slot="root"]),\n  :where([data-control-family="popup"][data-popup-kind="drawer"][data-slot="content"][data-dockable-panel-root])',
      },
      {
        name: "--cui-dockable-panel-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-pop)",
        selector:
          ':where([data-control-family="dockable-panel"][data-slot="root"]),\n  :where([data-control-family="popup"][data-popup-kind="drawer"][data-slot="content"][data-dockable-panel-root])',
      },
    ],
  },
  {
    id: "dropzone",
    knobs: [
      {
        name: "--cui-dropzone-accept-border-color",
        syntax: "<color>",
        defaultValue: "var(--primary)",
        selector: ':where([data-control-family="dropzone"][data-slot="root"])',
      },
      {
        name: "--cui-dropzone-overlay-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--card) l c h / 0.95)",
        selector: ':where([data-control-family="dropzone"][data-slot="root"])',
      },
      {
        name: "--cui-dropzone-reject-border-color",
        syntax: "<color>",
        defaultValue: "var(--destructive)",
        selector: ':where([data-control-family="dropzone"][data-slot="root"])',
      },
      {
        name: "--cui-dropzone-surface-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="dropzone"][data-slot="root"])',
      },
      {
        name: "--cui-dropzone-surface-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="dropzone"][data-slot="root"])',
      },
      {
        name: "--cui-dropzone-surface-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="dropzone"][data-slot="root"])',
      },
      {
        name: "--cui-dropzone-surface-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-panel)",
        selector: ':where([data-control-family="dropzone"][data-slot="root"])',
      },
    ],
  },
  {
    id: "dynamic-notification",
    knobs: [
      {
        name: "--cui-dynamic-notification-content-easing",
        syntax: "*",
        defaultValue:
          "linear(\n      0,\n      0.0553 4.55%,\n      0.1795 9.09%,\n      0.328 13.64%,\n      0.4745 18.18%,\n      0.6054 22.73%,\n      0.7148 27.27%,\n      0.8017 31.82%,\n      0.868 36.36%,\n      0.9166 40.91%,\n      0.9509 45.45%,\n      0.9741 50%,\n      0.9891 54.55%,\n      0.9982 59.09%,\n      1.0032 63.64%,\n      1.0056 68.18%,\n      1.0063 72.73%,\n      1.006 77.27%,\n      1.0053 81.82%,\n      1.0044 86.36%,\n      1.0034 90.91%,\n      1.0026 95.45%,\n      1\n    )",
        selector: ':where([data-control-family="dynamic-notification"][data-slot="root"])',
      },
      {
        name: "--cui-dynamic-notification-expanded-radius",
        syntax: "<length>",
        defaultValue: "1.65rem",
        selector: ':where([data-control-family="dynamic-notification"][data-slot="root"])',
      },
      {
        name: "--cui-dynamic-notification-glass-foreground",
        syntax: "<color>",
        defaultValue: "white",
        selector: ':where([data-control-family="dynamic-notification"][data-slot="root"])',
      },
      {
        name: "--cui-dynamic-notification-glass-ring-color",
        syntax: "<color>",
        defaultValue: "oklch(1 0 0 / 0.12)",
        selector: ':where([data-control-family="dynamic-notification"][data-slot="root"])',
      },
      {
        name: "--cui-dynamic-notification-indicator-end",
        syntax: "<color>",
        defaultValue: "oklch(0.7 0.17 250)",
        selector: ':where([data-control-family="dynamic-notification"][data-slot="root"])',
      },
      {
        name: "--cui-dynamic-notification-indicator-middle",
        syntax: "<color>",
        defaultValue: "oklch(0.75 0.15 70)",
        selector: ':where([data-control-family="dynamic-notification"][data-slot="root"])',
      },
      {
        name: "--cui-dynamic-notification-indicator-start",
        syntax: "<color>",
        defaultValue: "oklch(0.62 0.19 25)",
        selector: ':where([data-control-family="dynamic-notification"][data-slot="root"])',
      },
      {
        name: "--cui-dynamic-notification-liquid-foreground",
        syntax: "<color>",
        defaultValue: "white",
        selector: ':where([data-control-family="dynamic-notification"][data-slot="root"])',
      },
      {
        name: "--cui-dynamic-notification-morph-easing",
        syntax: "*",
        defaultValue:
          "linear(\n      0,\n      0.0568 3.85%,\n      0.1888 7.69%,\n      0.351 11.54%,\n      0.5142 15.38%,\n      0.6608 19.23%,\n      0.7824 23.08%,\n      0.8767 26.92%,\n      0.9449 30.77%,\n      0.9908 34.62%,\n      1.0187 38.46%,\n      1.0332 42.31%,\n      1.0382 46.15%,\n      1.0372 50%,\n      1.0327 53.85%,\n      1.0266 57.69%,\n      1.0203 61.54%,\n      1.0145 65.38%,\n      1.0095 69.23%,\n      1.0056 73.08%,\n      1.0027 76.92%,\n      1.0008 80.77%,\n      0.9995 84.62%,\n      0.9988 88.46%,\n      0.9986 92.31%,\n      0.9985 96.15%,\n      1\n    )",
        selector: ':where([data-control-family="dynamic-notification"][data-slot="root"])',
      },
      {
        name: "--cui-dynamic-notification-surface-background",
        syntax: "<color>",
        defaultValue: "var(--popover)",
        selector: ':where([data-control-family="dynamic-notification"][data-slot="root"])',
      },
      {
        name: "--cui-dynamic-notification-surface-foreground",
        syntax: "<color>",
        defaultValue: "var(--popover-foreground)",
        selector: ':where([data-control-family="dynamic-notification"][data-slot="root"])',
      },
      {
        name: "--cui-dynamic-notification-surface-ring-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="dynamic-notification"][data-slot="root"])',
      },
      {
        name: "--cui-dynamic-notification-surface-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-pop)",
        selector: ':where([data-control-family="dynamic-notification"][data-slot="root"])',
      },
    ],
  },
  {
    id: "empty",
    knobs: [
      {
        name: "--cui-empty-background",
        syntax: "*",
        defaultValue: "transparent",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-border-color",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-border-style",
        syntax: "*",
        defaultValue: "solid",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-content-gap",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 2)",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-content-size",
        syntax: "<length>",
        defaultValue: "24rem",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-description-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-font-size",
        syntax: "<length>",
        defaultValue: "var(--text-sm)",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-gap",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 6)",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-header-gap",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 2)",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-media-background",
        syntax: "*",
        defaultValue: "var(--muted)",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-media-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-media-icon-size",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 5)",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-media-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-lg)",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-media-size",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 10)",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-padding",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 6)",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-lg)",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-shadow",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
      {
        name: "--cui-empty-title-font-weight",
        syntax: "<number>",
        defaultValue: "var(--font-weight-medium)",
        selector: ':where([data-control-family="empty"][data-slot="root"])',
      },
    ],
  },
  {
    id: "environment-variables",
    knobs: [
      {
        name: "--cui-environment-variables-error-foreground",
        syntax: "<color>",
        defaultValue: "var(--destructive-text)",
        selector: ':where([data-control-family="environment-variables"][data-slot="root"])',
      },
      {
        name: "--cui-environment-variables-message-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--destructive) l c h / 0.05)",
        selector: ':where([data-control-family="environment-variables"][data-slot="root"])',
      },
      {
        name: "--cui-environment-variables-message-border-color",
        syntax: "<color>",
        defaultValue: "oklch(from var(--destructive) l c h / 0.4)",
        selector: ':where([data-control-family="environment-variables"][data-slot="root"])',
      },
      {
        name: "--cui-environment-variables-message-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="environment-variables"][data-slot="root"])',
      },
      {
        name: "--cui-environment-variables-message-foreground",
        syntax: "<color>",
        defaultValue: "var(--destructive-text)",
        selector: ':where([data-control-family="environment-variables"][data-slot="root"])',
      },
      {
        name: "--cui-environment-variables-meta-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="environment-variables"][data-slot="root"])',
      },
      {
        name: "--cui-environment-variables-title-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="environment-variables"][data-slot="root"])',
      },
    ],
  },
  {
    id: "field",
    knobs: [
      {
        name: "--cui-field-backdrop-filter",
        syntax: "*",
        defaultValue: "blur(0px)",
        selector: ':where([data-control-family="field"][data-control="true"])',
      },
      {
        name: "--cui-field-background",
        syntax: "*",
        defaultValue: "oklch(from var(--card) l c h / 0.72)",
        selector: ':where([data-control-family="field"][data-control="true"])',
      },
      {
        name: "--cui-field-border-color",
        syntax: "<color>",
        defaultValue: "var(--control-rim)",
        selector: ':where([data-control-family="field"][data-control="true"])',
      },
      {
        name: "--cui-field-border-width",
        syntax: "<length>",
        defaultValue: "var(--control-rim-width)",
        selector: ':where([data-control-family="field"][data-control="true"])',
      },
      {
        name: "--cui-field-focus-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="field"][data-control="true"])',
      },
      {
        name: "--cui-field-font-size",
        syntax: "<length-percentage>",
        defaultValue: "var(--text-body)",
        selector: ':where([data-control-family="field"][data-control="true"])',
      },
      {
        name: "--cui-field-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="field"][data-control="true"])',
      },
      {
        name: "--cui-field-height",
        syntax: "<length-percentage>",
        defaultValue: "var(--control-h-md)",
        selector: ':where([data-control-family="field"][data-control="true"])',
      },
      {
        name: "--cui-field-padding-inline",
        syntax: "<length-percentage>",
        defaultValue: "var(--padding-x)",
        selector: ':where([data-control-family="field"][data-control="true"])',
      },
      {
        name: "--cui-field-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="field"][data-control="true"])',
      },
      {
        name: "--cui-field-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-inset)",
        selector: ':where([data-control-family="field"][data-control="true"])',
      },
    ],
  },
  {
    id: "gradient-editor",
    knobs: [
      {
        name: "--cui-gradient-editor-add-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="gradient-editor"][data-slot="root"])',
      },
      {
        name: "--cui-gradient-editor-add-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="gradient-editor"][data-slot="root"])',
      },
      {
        name: "--cui-gradient-editor-add-radius",
        syntax: "<length-percentage>",
        defaultValue: "9999px",
        selector: ':where([data-control-family="gradient-editor"][data-slot="root"])',
      },
      {
        name: "--cui-gradient-editor-preview-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-field)",
        selector: ':where([data-control-family="gradient-editor"][data-slot="root"])',
      },
      {
        name: "--cui-gradient-editor-preview-ring-color",
        syntax: "<color>",
        defaultValue: "oklch(from var(--border) l c h / 0.6)",
        selector: ':where([data-control-family="gradient-editor"][data-slot="root"])',
      },
      {
        name: "--cui-gradient-editor-stop-border-color",
        syntax: "<color>",
        defaultValue: "oklch(1 0 0)",
        selector: ':where([data-control-family="gradient-editor"][data-slot="root"])',
      },
      {
        name: "--cui-gradient-editor-stop-border-width",
        syntax: "<length>",
        defaultValue: "2px",
        selector: ':where([data-control-family="gradient-editor"][data-slot="root"])',
      },
      {
        name: "--cui-gradient-editor-stop-radius",
        syntax: "<length-percentage>",
        defaultValue: "9999px",
        selector: ':where([data-control-family="gradient-editor"][data-slot="root"])',
      },
      {
        name: "--cui-gradient-editor-stop-shadow",
        syntax: "*",
        defaultValue: "0 0 0 1px oklch(from var(--foreground) l c h / 0.4)",
        selector: ':where([data-control-family="gradient-editor"][data-slot="root"])',
      },
      {
        name: "--cui-gradient-editor-track-radius",
        syntax: "<length-percentage>",
        defaultValue: "9999px",
        selector: ':where([data-control-family="gradient-editor"][data-slot="root"])',
      },
    ],
  },
  {
    id: "infinite-canvas",
    knobs: [
      {
        name: "--cui-infinite-canvas-background",
        syntax: "<color>",
        defaultValue: "var(--canvas)",
        selector: ':where([data-control-family="infinite-canvas"][data-slot="root"])',
      },
      {
        name: "--cui-infinite-canvas-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="infinite-canvas"][data-slot="root"])',
      },
      {
        name: "--cui-infinite-canvas-controls-background",
        syntax: "<color>",
        defaultValue: "var(--card)",
        selector: ':where([data-control-family="infinite-canvas"][data-slot="root"])',
      },
      {
        name: "--cui-infinite-canvas-controls-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="infinite-canvas"][data-slot="root"])',
      },
      {
        name: "--cui-infinite-canvas-controls-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="infinite-canvas"][data-slot="root"])',
      },
      {
        name: "--cui-infinite-canvas-controls-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="infinite-canvas"][data-slot="root"])',
      },
      {
        name: "--cui-infinite-canvas-grid-dot-color",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.16)",
        selector: ':where([data-control-family="infinite-canvas"][data-slot="root"])',
      },
      {
        name: "--cui-infinite-canvas-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-panel)",
        selector: ':where([data-control-family="infinite-canvas"][data-slot="root"])',
      },
    ],
  },
  {
    id: "inline-attachment",
    knobs: [
      {
        name: "--cui-inline-attachment-background",
        syntax: "<color>",
        defaultValue: "var(--card)",
        selector: ':where([data-control-family="inline-attachment"][data-slot="root"])',
      },
      {
        name: "--cui-inline-attachment-content-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--background) l c h / 0.85)",
        selector: ':where([data-control-family="inline-attachment"][data-slot="root"])',
      },
      {
        name: "--cui-inline-attachment-content-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="inline-attachment"][data-slot="root"])',
      },
      {
        name: "--cui-inline-attachment-content-radius",
        syntax: "<length>",
        defaultValue:
          "max(\n      var(--radius-sm),\n      calc(var(--cui-inline-attachment-radius) - var(--cui-inline-attachment-padding))\n    )",
        selector: ':where([data-control-family="inline-attachment"][data-slot="root"])',
      },
      {
        name: "--cui-inline-attachment-content-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="inline-attachment"][data-slot="root"])',
      },
      {
        name: "--cui-inline-attachment-document-background",
        syntax: "<color>",
        defaultValue: "var(--muted)",
        selector: ':where([data-control-family="inline-attachment"][data-slot="root"])',
      },
      {
        name: "--cui-inline-attachment-document-background-image",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="inline-attachment"][data-slot="root"])',
      },
      {
        name: "--cui-inline-attachment-document-padding",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 5)",
        selector: ':where([data-control-family="inline-attachment"][data-slot="root"])',
      },
      {
        name: "--cui-inline-attachment-hover-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-md)",
        selector: ':where([data-control-family="inline-attachment"][data-slot="root"])',
      },
      {
        name: "--cui-inline-attachment-image-outline-color",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.1)",
        selector: ':where([data-control-family="inline-attachment"][data-slot="root"])',
      },
      {
        name: "--cui-inline-attachment-padding",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 3)",
        selector: ':where([data-control-family="inline-attachment"][data-slot="root"])',
      },
      {
        name: "--cui-inline-attachment-radius",
        syntax: "<length>",
        defaultValue: "var(--radius-field)",
        selector: ':where([data-control-family="inline-attachment"][data-slot="root"])',
      },
      {
        name: "--cui-inline-attachment-ring-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="inline-attachment"][data-slot="root"])',
      },
      {
        name: "--cui-inline-attachment-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="inline-attachment"][data-slot="root"])',
      },
    ],
  },
  {
    id: "inline-citation",
    knobs: [
      {
        name: "--cui-inline-citation-favicon-background",
        syntax: "<color>",
        defaultValue: "var(--muted)",
        selector:
          ':where([data-control-family="inline-citation"][data-slot="root"]),\n  :where([data-control-ui="inline-citation"][data-slot="content"])',
      },
      {
        name: "--cui-inline-citation-favicon-radius",
        syntax: "<length-percentage>",
        defaultValue: "9999px",
        selector:
          ':where([data-control-family="inline-citation"][data-slot="root"]),\n  :where([data-control-ui="inline-citation"][data-slot="content"])',
      },
      {
        name: "--cui-inline-citation-navigation-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--muted) l c h / 0.45)",
        selector:
          ':where([data-control-family="inline-citation"][data-slot="root"]),\n  :where([data-control-ui="inline-citation"][data-slot="content"])',
      },
      {
        name: "--cui-inline-citation-quote-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--muted) l c h / 0.55)",
        selector:
          ':where([data-control-family="inline-citation"][data-slot="root"]),\n  :where([data-control-ui="inline-citation"][data-slot="content"])',
      },
      {
        name: "--cui-inline-citation-quote-radius",
        syntax: "<length>",
        defaultValue: "var(--radius-control)",
        selector:
          ':where([data-control-family="inline-citation"][data-slot="root"]),\n  :where([data-control-ui="inline-citation"][data-slot="content"])',
      },
      {
        name: "--cui-inline-citation-trigger-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--muted) l c h / 0.55)",
        selector:
          ':where([data-control-family="inline-citation"][data-slot="root"]),\n  :where([data-control-ui="inline-citation"][data-slot="content"])',
      },
      {
        name: "--cui-inline-citation-trigger-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector:
          ':where([data-control-family="inline-citation"][data-slot="root"]),\n  :where([data-control-ui="inline-citation"][data-slot="content"])',
      },
      {
        name: "--cui-inline-citation-trigger-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector:
          ':where([data-control-family="inline-citation"][data-slot="root"]),\n  :where([data-control-ui="inline-citation"][data-slot="content"])',
      },
      {
        name: "--cui-inline-citation-trigger-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector:
          ':where([data-control-family="inline-citation"][data-slot="root"]),\n  :where([data-control-ui="inline-citation"][data-slot="content"])',
      },
      {
        name: "--cui-inline-citation-trigger-hover-background",
        syntax: "<color>",
        defaultValue: "var(--muted)",
        selector:
          ':where([data-control-family="inline-citation"][data-slot="root"]),\n  :where([data-control-ui="inline-citation"][data-slot="content"])',
      },
      {
        name: "--cui-inline-citation-trigger-hover-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector:
          ':where([data-control-family="inline-citation"][data-slot="root"]),\n  :where([data-control-ui="inline-citation"][data-slot="content"])',
      },
      {
        name: "--cui-inline-citation-trigger-radius",
        syntax: "<length>",
        defaultValue: "9999px",
        selector:
          ':where([data-control-family="inline-citation"][data-slot="root"]),\n  :where([data-control-ui="inline-citation"][data-slot="content"])',
      },
    ],
  },
  {
    id: "item",
    knobs: [
      {
        name: "--cui-item-active-scale",
        syntax: "<number>",
        defaultValue: "0.99",
        selector: ':where([data-control-family="item"][data-slot="root"])',
      },
      {
        name: "--cui-item-border-width",
        syntax: "<length>",
        defaultValue: "0px",
        selector: ':where([data-control-family="item"][data-slot="root"])',
      },
      {
        name: "--cui-item-hover-background",
        syntax: "*",
        defaultValue: "transparent",
        selector: ':where([data-control-family="item"][data-slot="root"])',
      },
      {
        name: "--cui-item-hover-border-color",
        syntax: "<color>",
        defaultValue: "var(--_item-border-color)",
        selector: ':where([data-control-family="item"][data-slot="root"])',
      },
      {
        name: "--cui-item-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-lg)",
        selector: ':where([data-control-family="item"][data-slot="root"])',
      },
    ],
  },
  {
    id: "kbd",
    knobs: [
      {
        name: "--cui-kbd-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--card) l c h / 0.6)",
        selector: ':where([data-control-family="kbd"][data-slot="root"])',
      },
      {
        name: "--cui-kbd-border-color",
        syntax: "<color>",
        defaultValue: "var(--control-rim)",
        selector: ':where([data-control-family="kbd"][data-slot="root"])',
      },
      {
        name: "--cui-kbd-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="kbd"][data-slot="root"])',
      },
      {
        name: "--cui-kbd-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="kbd"][data-slot="root"])',
      },
      {
        name: "--cui-kbd-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="kbd"][data-slot="root"])',
      },
    ],
  },
  {
    id: "label",
    knobs: [
      {
        name: "--cui-label-root-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="label"][data-slot="root"])',
      },
    ],
  },
  {
    id: "markdown",
    knobs: [
      {
        name: "--cui-markdown-blockquote-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="markdown"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-blockquote-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="markdown"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-foreground",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.9)",
        selector: ':where([data-control-family="markdown"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-image-outline-color",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.1)",
        selector: ':where([data-control-family="markdown"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-inline-code-background",
        syntax: "<color>",
        defaultValue: "color-mix(in oklab, var(--foreground) 8%, transparent)",
        selector: ':where([data-control-family="markdown"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-inline-code-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="markdown"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-inline-code-radius",
        syntax: "<length-percentage>+",
        defaultValue: "0.25rem",
        selector: ':where([data-control-family="markdown"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-link-foreground",
        syntax: "<color>",
        defaultValue: "var(--primary-text)",
        selector: ':where([data-control-family="markdown"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-table-cell-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="markdown"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-table-header-background",
        syntax: "<color>",
        defaultValue: "var(--muted)",
        selector: ':where([data-control-family="markdown"][data-slot="root"])',
      },
    ],
  },
  {
    id: "markdown-block",
    knobs: [
      {
        name: "--cui-markdown-block-background",
        syntax: "<color>",
        defaultValue: "var(--background)",
        selector: ':where([data-control-family="markdown-block"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-block-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="markdown-block"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-block-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="markdown-block"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-block-header-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="markdown-block"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-block-header-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="markdown-block"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-block-icon-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.08)",
        selector: ':where([data-control-family="markdown-block"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-block-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-panel)",
        selector: ':where([data-control-family="markdown-block"][data-slot="root"])',
      },
      {
        name: "--cui-markdown-block-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="markdown-block"][data-slot="root"])',
      },
    ],
  },
  {
    id: "morphing-panel",
    knobs: [
      {
        name: "--cui-morphing-panel-background",
        syntax: "<color>",
        defaultValue: "var(--card)",
        selector: ':where([data-control-family="morphing-panel"][data-slot="root"])',
      },
      {
        name: "--cui-morphing-panel-border-color",
        syntax: "<color>",
        defaultValue: "oklch(from var(--border) l c h / 0.8)",
        selector: ':where([data-control-family="morphing-panel"][data-slot="root"])',
      },
      {
        name: "--cui-morphing-panel-foreground",
        syntax: "<color>",
        defaultValue: "var(--card-foreground)",
        selector: ':where([data-control-family="morphing-panel"][data-slot="root"])',
      },
      {
        name: "--cui-morphing-panel-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="morphing-panel"][data-slot="root"])',
      },
      {
        name: "--cui-morphing-panel-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-md)",
        selector: ':where([data-control-family="morphing-panel"][data-slot="root"])',
      },
      {
        name: "--cui-morphing-panel-trigger-hover-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.06)",
        selector: ':where([data-control-family="morphing-panel"][data-slot="root"])',
      },
    ],
  },
  {
    id: "page-layout",
    knobs: [
      {
        name: "--cui-page-layout-article-size",
        syntax: "<length>",
        defaultValue: "40rem",
        selector: ':where([data-control-family="page-layout"][data-slot="root"])',
      },
      {
        name: "--cui-page-layout-aside-size",
        syntax: "<length>",
        defaultValue: "11.25rem",
        selector: ':where([data-control-family="page-layout"][data-slot="root"])',
      },
      {
        name: "--cui-page-layout-column-gap",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 5)",
        selector: ':where([data-control-family="page-layout"][data-slot="root"])',
      },
      {
        name: "--cui-page-layout-header-column-gap",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 4)",
        selector: ':where([data-control-family="page-layout"][data-slot="root"])',
      },
      {
        name: "--cui-page-layout-header-gap",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 8)",
        selector: ':where([data-control-family="page-layout"][data-slot="root"])',
      },
      {
        name: "--cui-page-layout-header-row-gap",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 2)",
        selector: ':where([data-control-family="page-layout"][data-slot="root"])',
      },
      {
        name: "--cui-page-layout-header-start-gap",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 10)",
        selector: ':where([data-control-family="page-layout"][data-slot="root"])',
      },
      {
        name: "--cui-page-layout-padding-block",
        syntax: "*",
        defaultValue: "calc(var(--spacing) * 10) calc(var(--spacing) * 24)",
        selector: ':where([data-control-family="page-layout"][data-slot="root"])',
      },
      {
        name: "--cui-page-layout-padding-inline",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 5)",
        selector: ':where([data-control-family="page-layout"][data-slot="root"])',
      },
      {
        name: "--cui-page-layout-size",
        syntax: "*",
        defaultValue: "calc(var(--cui-page-layout-article-size) + var(--cui-page-layout-padding-inline) * 2)",
        selector: ':where([data-control-family="page-layout"][data-slot="root"])',
      },
      {
        name: "--cui-page-layout-sticky-gap",
        syntax: "<length>",
        defaultValue: "0px",
        selector: ':where([data-control-family="page-layout"][data-slot="root"])',
      },
    ],
  },
  {
    id: "pagination",
    knobs: [
      {
        name: "--cui-pagination-link-background",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="pagination"][data-slot="root"])',
      },
      {
        name: "--cui-pagination-link-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="pagination"][data-slot="root"])',
      },
      {
        name: "--cui-pagination-link-hover-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.06)",
        selector: ':where([data-control-family="pagination"][data-slot="root"])',
      },
      {
        name: "--cui-pagination-link-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="pagination"][data-slot="root"])',
      },
      {
        name: "--cui-pagination-link-shadow",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="pagination"][data-slot="root"])',
      },
    ],
  },
  {
    id: "phone-input",
    knobs: [
      {
        name: "--cui-phone-input-chevron-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="field"][data-field-kind="phone-input"][data-slot="root"])',
      },
      {
        name: "--cui-phone-input-country-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="field"][data-field-kind="phone-input"][data-slot="root"])',
      },
      {
        name: "--cui-phone-input-country-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="field"][data-field-kind="phone-input"][data-slot="root"])',
      },
      {
        name: "--cui-phone-input-metadata-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="field"][data-field-kind="phone-input"][data-slot="root"])',
      },
      {
        name: "--cui-phone-input-trigger-focus-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.06)",
        selector: ':where([data-control-family="field"][data-field-kind="phone-input"][data-slot="root"])',
      },
      {
        name: "--cui-phone-input-trigger-hover-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.06)",
        selector: ':where([data-control-family="field"][data-field-kind="phone-input"][data-slot="root"])',
      },
    ],
  },
  {
    id: "popup",
    knobs: [
      {
        name: "--cui-popup-backdrop-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / var(--overlay-opacity))",
        selector: ':where([data-control-family="popup"][data-popup-part="backdrop"])',
      },
      {
        name: "--cui-popup-backdrop-blur",
        syntax: "*",
        defaultValue: "blur(var(--backdrop-blur-overlay))",
        selector: ':where([data-control-family="popup"][data-popup-part="backdrop"])',
      },
      {
        name: "--cui-popup-backdrop-filter",
        syntax: "*",
        defaultValue: "blur(var(--backdrop-blur-popover))",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
      {
        name: "--cui-popup-background",
        syntax: "<color>",
        defaultValue: "var(--popover)",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
      {
        name: "--cui-popup-border-color",
        syntax: "<color>",
        defaultValue: "var(--control-rim)",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
      {
        name: "--cui-popup-border-width",
        syntax: "<length>",
        defaultValue: "var(--control-rim-width)",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
      {
        name: "--cui-popup-foreground",
        syntax: "<color>",
        defaultValue: "var(--popover-foreground)",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
      {
        name: "--cui-popup-item-disabled-opacity",
        syntax: "<number>",
        defaultValue: "0.4",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
      {
        name: "--cui-popup-item-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
      {
        name: "--cui-popup-item-highlight-background",
        syntax: "<color>",
        defaultValue: "var(--hover-fill)",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
      {
        name: "--cui-popup-item-highlight-foreground",
        syntax: "<color>",
        defaultValue: "var(--cui-popup-item-foreground)",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
      {
        name: "--cui-popup-item-highlight-muted-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
      {
        name: "--cui-popup-item-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-popup-item-fit)",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
      {
        name: "--cui-popup-radius",
        syntax: "*",
        defaultValue: "var(--radius-popover)",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
      {
        name: "--cui-popup-separator-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
      {
        name: "--cui-popup-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-pop)",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
      {
        name: "--cui-popup-shortcut-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector:
          ':where([data-control-family="popup"][data-popup-part="surface"]),\n  :where([data-control-family="popup"][data-popup-part="list-surface"]),\n  :where([data-control-family="popup"][data-popup-part="bar"])',
      },
    ],
  },
  {
    id: "progressive-blur",
    knobs: [
      {
        name: "--cui-progressive-blur-backdrop-blur",
        syntax: "<length>",
        defaultValue: "16px",
        selector: ':where([data-control-family="progressive-blur"][data-slot="root"])',
      },
      {
        name: "--cui-progressive-blur-fade-size",
        syntax: "<length-percentage>",
        defaultValue: "0.5rem",
        selector: ':where([data-control-family="progressive-blur"][data-slot="root"])',
      },
      {
        name: "--cui-progressive-blur-size",
        syntax: "<length-percentage>",
        defaultValue: "3rem",
        selector: ':where([data-control-family="progressive-blur"][data-slot="root"])',
      },
      {
        name: "--cui-progressive-blur-transition-delay",
        syntax: "<time>",
        defaultValue: "calc(var(--cui-progressive-blur-transition-duration) * 0.06)",
        selector: ':where([data-control-family="progressive-blur"][data-slot="root"])',
      },
      {
        name: "--cui-progressive-blur-transition-duration",
        syntax: "<time>",
        defaultValue: "var(--duration-base)",
        selector: ':where([data-control-family="progressive-blur"][data-slot="root"])',
      },
    ],
  },
  {
    id: "range",
    knobs: [
      {
        name: "--cui-range-indicator-background",
        syntax: "<color>",
        defaultValue: "var(--primary)",
        selector: ':where([data-control-family="range"][data-slot="root"])',
      },
      {
        name: "--cui-range-indicator-radius",
        syntax: "<length-percentage>",
        defaultValue: "9999px",
        selector: ':where([data-control-family="range"][data-slot="root"])',
      },
      {
        name: "--cui-range-thumb-background",
        syntax: "*",
        defaultValue: "var(--background)",
        selector: ':where([data-control-family="range"][data-slot="root"])',
      },
      {
        name: "--cui-range-thumb-border-color",
        syntax: "<color>",
        defaultValue: "var(--control-rim)",
        selector: ':where([data-control-family="range"][data-slot="root"])',
      },
      {
        name: "--cui-range-thumb-radius",
        syntax: "<length-percentage>",
        defaultValue: "9999px",
        selector: ':where([data-control-family="range"][data-slot="root"])',
      },
      {
        name: "--cui-range-thumb-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="range"][data-slot="root"])',
      },
      {
        name: "--cui-range-track-background",
        syntax: "<color>",
        defaultValue: "var(--muted)",
        selector: ':where([data-control-family="range"][data-slot="root"])',
      },
      {
        name: "--cui-range-track-radius",
        syntax: "<length-percentage>",
        defaultValue: "9999px",
        selector: ':where([data-control-family="range"][data-slot="root"])',
      },
    ],
  },
  {
    id: "resizable",
    knobs: [
      {
        name: "--cui-resizable-grip-background",
        syntax: "<color>",
        defaultValue: "var(--card)",
        selector: ':where([data-control-family="resizable"][data-slot="panel-group"])',
      },
      {
        name: "--cui-resizable-grip-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="resizable"][data-slot="panel-group"])',
      },
      {
        name: "--cui-resizable-grip-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="resizable"][data-slot="panel-group"])',
      },
      {
        name: "--cui-resizable-group-background",
        syntax: "<color>",
        defaultValue: "var(--card)",
        selector: ':where([data-control-family="resizable"][data-slot="panel-group"])',
      },
      {
        name: "--cui-resizable-group-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="resizable"][data-slot="panel-group"])',
      },
      {
        name: "--cui-resizable-group-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="resizable"][data-slot="panel-group"])',
      },
      {
        name: "--cui-resizable-group-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-panel)",
        selector: ':where([data-control-family="resizable"][data-slot="panel-group"])',
      },
      {
        name: "--cui-resizable-handle-active-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.4)",
        selector: ':where([data-control-family="resizable"][data-slot="panel-group"])',
      },
      {
        name: "--cui-resizable-handle-color",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="resizable"][data-slot="panel-group"])',
      },
      {
        name: "--cui-resizable-handle-hover-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.25)",
        selector: ':where([data-control-family="resizable"][data-slot="panel-group"])',
      },
    ],
  },
  {
    id: "rich-tooltip",
    knobs: [
      {
        name: "--cui-rich-tooltip-action-background",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="popup"][data-popup-kind="rich-tooltip"][data-slot="content"])',
      },
      {
        name: "--cui-rich-tooltip-action-foreground",
        syntax: "<color>",
        defaultValue: "currentColor",
        selector: ':where([data-control-family="popup"][data-popup-kind="rich-tooltip"][data-slot="content"])',
      },
      {
        name: "--cui-rich-tooltip-action-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="popup"][data-popup-kind="rich-tooltip"][data-slot="content"])',
      },
      {
        name: "--cui-rich-tooltip-content-background",
        syntax: "<color>",
        defaultValue: "var(--primary)",
        selector: ':where([data-control-family="popup"][data-popup-kind="rich-tooltip"][data-slot="content"])',
      },
      {
        name: "--cui-rich-tooltip-content-foreground",
        syntax: "<color>",
        defaultValue: "var(--primary-foreground)",
        selector: ':where([data-control-family="popup"][data-popup-kind="rich-tooltip"][data-slot="content"])',
      },
      {
        name: "--cui-rich-tooltip-content-radius",
        syntax: "<length-percentage>+",
        defaultValue: "var(--radius-popover)",
        selector: ':where([data-control-family="popup"][data-popup-kind="rich-tooltip"][data-slot="content"])',
      },
      {
        name: "--cui-rich-tooltip-content-shadow",
        syntax: "*",
        defaultValue:
          "inset 0 1px 0\n      oklch(from var(--shadow-highlight) l c h / calc(alpha * var(--shadow-opacity) * min(var(--shadow-size), 1))), 0 calc(\n        0.5px *\n        var(--shadow-size) *\n        var(--shadow-popover-multiplier) *\n        var(--shadow-y)\n      )\n      calc(0.75px * var(--shadow-size) * var(--shadow-popover-multiplier))\n      calc(-0.25px * var(--shadow-size) * var(--shadow-popover-multiplier))\n      oklch(from var(--shadow-color) l c h / calc(0.04 * var(--shadow-opacity))), 0 calc(\n        1.5px *\n        var(--shadow-size) *\n        var(--shadow-popover-multiplier) *\n        var(--shadow-y)\n      )\n      calc(3px * var(--shadow-size) * var(--shadow-popover-multiplier))\n      calc(-0.75px * var(--shadow-size) * var(--shadow-popover-multiplier))\n      oklch(from var(--shadow-color) l c h / calc(0.05 * var(--shadow-opacity))), 0 calc(\n        3px *\n        var(--shadow-size) *\n        var(--shadow-popover-multiplier) *\n        var(--shadow-y)\n      )\n      calc(6px * var(--shadow-size) * var(--shadow-popover-multiplier))\n      calc(-1.5px * var(--shadow-size) * var(--shadow-popover-multiplier))\n      oklch(from var(--shadow-color) l c h / calc(0.06 * var(--shadow-opacity))), 0 calc(\n        6px *\n        var(--shadow-size) *\n        var(--shadow-popover-multiplier) *\n        var(--shadow-y)\n      )\n      calc(14px * var(--shadow-size) * var(--shadow-popover-multiplier))\n      calc(-3px * var(--shadow-size) * var(--shadow-popover-multiplier))\n      oklch(from var(--shadow-color) l c h / calc(0.07 * var(--shadow-opacity)))",
        selector: ':where([data-control-family="popup"][data-popup-kind="rich-tooltip"][data-slot="content"])',
      },
      {
        name: "--cui-rich-tooltip-dot-background",
        syntax: "<color>",
        defaultValue: "currentcolor",
        selector: ':where([data-control-family="popup"][data-popup-kind="rich-tooltip"][data-slot="content"])',
      },
    ],
  },
  {
    id: "scroll-area",
    knobs: [
      {
        name: "--cui-scroll-area-corner-background",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="scroll-area"][data-slot="root"])',
      },
      {
        name: "--cui-scroll-area-thumb-background",
        syntax: "*",
        defaultValue: "oklch(from var(--foreground) l c h / 0.4)",
        selector: ':where([data-control-family="scroll-area"][data-slot="root"])',
      },
      {
        name: "--cui-scroll-area-thumb-radius",
        syntax: "<length-percentage>",
        defaultValue: "9999px",
        selector: ':where([data-control-family="scroll-area"][data-slot="root"])',
      },
    ],
  },
  {
    id: "separator",
    knobs: [
      {
        name: "--cui-separator-root-background",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="separator"][data-slot="root"])',
      },
    ],
  },
  {
    id: "sidebar",
    knobs: [
      {
        name: "--cui-sidebar-group-label-foreground",
        syntax: "<color>",
        defaultValue: "oklch(from var(--sidebar-foreground) l c h / 0.7)",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-inner-backdrop-filter",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-inner-background",
        syntax: "<color>",
        defaultValue: "var(--sidebar)",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-inner-background-image",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-inner-border-color",
        syntax: "<color>",
        defaultValue: "var(--sidebar-border)",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-inner-border-width",
        syntax: "<length>",
        defaultValue: "0px",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-inner-radius",
        syntax: "<length-percentage>",
        defaultValue: "0px",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-inner-shadow",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-inset-background",
        syntax: "<color>",
        defaultValue: "var(--background)",
        selector: ':where([data-control-family="sidebar"][data-slot="wrapper"])',
      },
      {
        name: "--cui-sidebar-inset-background-image",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="sidebar"][data-slot="wrapper"])',
      },
      {
        name: "--cui-sidebar-inset-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="sidebar"][data-slot="wrapper"])',
      },
      {
        name: "--cui-sidebar-menu-button-active-background",
        syntax: "<color>",
        defaultValue: "var(--active-fill)",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-menu-button-active-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-menu-button-active-shadow",
        syntax: "*",
        defaultValue: "0 0 transparent",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-menu-button-foreground",
        syntax: "<color>",
        defaultValue: "var(--sidebar-foreground)",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-menu-button-hover-background",
        syntax: "<color>",
        defaultValue: "var(--hover-fill)",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-menu-button-hover-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-menu-button-hover-shadow",
        syntax: "*",
        defaultValue: "0 0 transparent",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-menu-button-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-popup-item)",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-rail-divider-background",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="sidebar"][data-slot="root"])',
      },
      {
        name: "--cui-sidebar-wrapper-background",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="sidebar"][data-slot="wrapper"])',
      },
      {
        name: "--cui-sidebar-wrapper-background-image",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="sidebar"][data-slot="wrapper"])',
      },
    ],
  },
  {
    id: "skeleton",
    knobs: [
      {
        name: "--cui-skeleton-animation-duration",
        syntax: "<time>",
        defaultValue: "calc(var(--duration-slow) * 5)",
        selector: ':where([data-control-family="skeleton"][data-slot="root"])',
      },
      {
        name: "--cui-skeleton-background",
        syntax: "<color>",
        defaultValue: "var(--muted)",
        selector: ':where([data-control-family="skeleton"][data-slot="root"])',
      },
      {
        name: "--cui-skeleton-background-image",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="skeleton"][data-slot="root"])',
      },
      {
        name: "--cui-skeleton-easing",
        syntax: "*",
        defaultValue: "var(--ease-standard)",
        selector: ':where([data-control-family="skeleton"][data-slot="root"])',
      },
      {
        name: "--cui-skeleton-highlight-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.06)",
        selector: ':where([data-control-family="skeleton"][data-slot="root"])',
      },
      {
        name: "--cui-skeleton-pulse-opacity",
        syntax: "<number>",
        defaultValue: "0.5",
        selector: ':where([data-control-family="skeleton"][data-slot="root"])',
      },
      {
        name: "--cui-skeleton-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="skeleton"][data-slot="root"])',
      },
    ],
  },
  {
    id: "source-badge",
    knobs: [
      {
        name: "--cui-source-badge-background",
        syntax: "<color>",
        defaultValue: "var(--background)",
        selector: ':where([data-control-family="badge"][data-source-badge][data-slot="root"])',
      },
      {
        name: "--cui-source-badge-favicon-background",
        syntax: "<color>",
        defaultValue: "var(--muted)",
        selector: ':where([data-control-family="badge"][data-source-badge][data-slot="root"])',
      },
      {
        name: "--cui-source-badge-favicon-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-sm)",
        selector: ':where([data-control-family="badge"][data-source-badge][data-slot="root"])',
      },
      {
        name: "--cui-source-badge-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="badge"][data-source-badge][data-slot="root"])',
      },
      {
        name: "--cui-source-badge-hover-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--muted) l c h / 0.6)",
        selector: ':where([data-control-family="badge"][data-source-badge][data-slot="root"])',
      },
      {
        name: "--cui-source-badge-hover-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="badge"][data-source-badge][data-slot="root"])',
      },
    ],
  },
  {
    id: "spinner",
    knobs: [
      {
        name: "--cui-spinner-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="spinner"][data-slot="root"])',
      },
    ],
  },
  {
    id: "stepper",
    knobs: [
      {
        name: "--cui-stepper-indicator-background",
        syntax: "<color>",
        defaultValue: "var(--background)",
        selector: ':where([data-control-family="stepper"][data-slot="root"])',
      },
      {
        name: "--cui-stepper-indicator-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="stepper"][data-slot="root"])',
      },
      {
        name: "--cui-stepper-indicator-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="stepper"][data-slot="root"])',
      },
      {
        name: "--cui-stepper-indicator-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="stepper"][data-slot="root"])',
      },
      {
        name: "--cui-stepper-indicator-radius",
        syntax: "<length-percentage>",
        defaultValue: "9999px",
        selector: ':where([data-control-family="stepper"][data-slot="root"])',
      },
      {
        name: "--cui-stepper-separator-background",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="stepper"][data-slot="root"])',
      },
      {
        name: "--cui-stepper-title-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="stepper"][data-slot="root"])',
      },
    ],
  },
  {
    id: "switch",
    knobs: [
      {
        name: "--cui-switch-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.14)",
        selector: ':where([data-control-family="switch"][data-slot="root"])',
      },
      {
        name: "--cui-switch-checked-background",
        syntax: "<color>",
        defaultValue: "var(--primary)",
        selector: ':where([data-control-family="switch"][data-slot="root"])',
      },
      {
        name: "--cui-switch-checked-hover-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--primary) l c h / 0.9)",
        selector: ':where([data-control-family="switch"][data-slot="root"])',
      },
      {
        name: "--cui-switch-height",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 5)",
        selector: ':where([data-control-family="switch"][data-slot="root"])',
      },
      {
        name: "--cui-switch-hover-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.2)",
        selector: ':where([data-control-family="switch"][data-slot="root"])',
      },
      {
        name: "--cui-switch-inline-size",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 9)",
        selector: ':where([data-control-family="switch"][data-slot="root"])',
      },
      {
        name: "--cui-switch-padding",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 0.5)",
        selector: ':where([data-control-family="switch"][data-slot="root"])',
      },
      {
        name: "--cui-switch-thumb-backdrop-filter",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="switch"][data-slot="root"])',
      },
      {
        name: "--cui-switch-thumb-background",
        syntax: "<color>",
        defaultValue: "var(--background)",
        selector: ':where([data-control-family="switch"][data-slot="root"])',
      },
      {
        name: "--cui-switch-thumb-inline-size",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 4)",
        selector: ':where([data-control-family="switch"][data-slot="root"])',
      },
      {
        name: "--cui-switch-thumb-press-scale",
        syntax: "*",
        defaultValue: "1.25 1",
        selector: ':where([data-control-family="switch"][data-slot="root"])',
      },
      {
        name: "--cui-switch-thumb-radius",
        syntax: "<length-percentage>",
        defaultValue: "9999px",
        selector: ':where([data-control-family="switch"][data-slot="root"])',
      },
      {
        name: "--cui-switch-thumb-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="switch"][data-slot="root"])',
      },
    ],
  },
  {
    id: "table",
    knobs: [
      {
        name: "--cui-table-background",
        syntax: "*",
        defaultValue: "transparent",
        selector: ':where([data-control-family="table"][data-slot="root"])',
      },
      {
        name: "--cui-table-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="table"][data-slot="root"])',
      },
      {
        name: "--cui-table-footer-background",
        syntax: "*",
        defaultValue: "oklch(from var(--foreground) l c h / 0.03)",
        selector: ':where([data-control-family="table"][data-slot="root"])',
      },
      {
        name: "--cui-table-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="table"][data-slot="root"])',
      },
      {
        name: "--cui-table-header-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="table"][data-slot="root"])',
      },
      {
        name: "--cui-table-row-hover-background",
        syntax: "*",
        defaultValue: "oklch(from var(--foreground) l c h / 0.03)",
        selector: ':where([data-control-family="table"][data-slot="root"])',
      },
      {
        name: "--cui-table-row-selected-background",
        syntax: "*",
        defaultValue: "oklch(from var(--foreground) l c h / 0.05)",
        selector: ':where([data-control-family="table"][data-slot="root"])',
      },
    ],
  },
  {
    id: "table-of-contents",
    knobs: [
      {
        name: "--cui-table-of-contents-backdrop-filter",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-background",
        syntax: "<color>",
        defaultValue: "var(--card)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-highlight-background",
        syntax: "<color>",
        defaultValue: "var(--active-fill)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-highlight-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-popup-item)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-item-active-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-item-font-size",
        syntax: "<length-percentage>",
        defaultValue: "var(--text-body)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-item-font-weight",
        syntax: "<number>",
        defaultValue: "var(--font-weight-normal)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-item-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-item-hover-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-item-indent-size",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 2)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-item-line-height",
        syntax: "<number>",
        defaultValue: "var(--leading-normal)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-item-padding-block",
        syntax: "<length-percentage>",
        defaultValue: "calc(var(--spacing) * 1.5)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-item-padding-inline",
        syntax: "<length-percentage>",
        defaultValue: "calc(var(--spacing) * 3)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-item-root-font-weight",
        syntax: "<number>",
        defaultValue: "var(--font-weight-medium)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-label-font-size",
        syntax: "<length-percentage>",
        defaultValue: "var(--text-caption)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-label-font-weight",
        syntax: "<number>",
        defaultValue: "var(--font-weight-medium)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-label-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-label-gap",
        syntax: "<length-percentage>",
        defaultValue: "calc(var(--spacing) * 3)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-padding",
        syntax: "<length-percentage>",
        defaultValue: "calc(var(--spacing) * 4)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-panel)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-rail-background",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-rail-size",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-trail-background",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-trail-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--cui-table-of-contents-trail-size)",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
      {
        name: "--cui-table-of-contents-trail-size",
        syntax: "<length>",
        defaultValue: "2px",
        selector: ':where([data-control-family="table-of-contents"][data-slot="root"])',
      },
    ],
  },
  {
    id: "tabs",
    knobs: [
      {
        name: "--cui-tabs-active-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="tabs"][data-slot="root"])',
      },
      {
        name: "--cui-tabs-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="tabs"][data-slot="root"])',
      },
      {
        name: "--cui-tabs-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="tabs"][data-slot="root"])',
      },
      {
        name: "--cui-tabs-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="tabs"][data-slot="root"])',
      },
      {
        name: "--cui-tabs-indicator-background",
        syntax: "*",
        defaultValue: "var(--background)",
        selector: ':where([data-control-family="tabs"][data-slot="root"])',
      },
      {
        name: "--cui-tabs-indicator-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="tabs"][data-slot="root"])',
      },
      {
        name: "--cui-tabs-list-backdrop-filter",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="tabs"][data-slot="root"])',
      },
      {
        name: "--cui-tabs-list-background",
        syntax: "<color>",
        defaultValue: "var(--hover-fill)",
        selector: ':where([data-control-family="tabs"][data-slot="root"])',
      },
      {
        name: "--cui-tabs-list-padding",
        syntax: "<length-percentage>",
        defaultValue: "calc(var(--spacing) * 1)",
        selector: ':where([data-control-family="tabs"][data-slot="root"])',
      },
      {
        name: "--cui-tabs-list-radius",
        syntax: "<length-percentage>",
        defaultValue:
          "calc(\n      var(--cui-tabs-trigger-radius) +\n      clamp(0px, calc(var(--cui-tabs-trigger-radius) * 1000), var(--cui-tabs-list-padding))\n    )",
        selector: ':where([data-control-family="tabs"][data-slot="root"])',
      },
      {
        name: "--cui-tabs-list-shadow",
        syntax: "*",
        defaultValue: "inset 0 0 0 var(--control-rim-width) var(--control-rim), var(--shadow-inset)",
        selector: ':where([data-control-family="tabs"][data-slot="root"])',
      },
      {
        name: "--cui-tabs-trigger-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-control)",
        selector: ':where([data-control-family="tabs"][data-slot="root"])',
      },
    ],
  },
  {
    id: "task-list",
    knobs: [
      {
        name: "--cui-task-list-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--card) l c h / 0.9)",
        selector: ':where([data-control-family="task-list"][data-slot="root"])',
      },
      {
        name: "--cui-task-list-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="task-list"][data-slot="root"])',
      },
      {
        name: "--cui-task-list-border-width",
        syntax: "<length>",
        defaultValue: "var(--control-rim-width)",
        selector: ':where([data-control-family="task-list"][data-slot="root"])',
      },
      {
        name: "--cui-task-list-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="task-list"][data-slot="root"])',
      },
      {
        name: "--cui-task-list-indicator-active-foreground",
        syntax: "<color>",
        defaultValue: "var(--primary-text)",
        selector: ':where([data-control-family="task-list"][data-slot="root"])',
      },
      {
        name: "--cui-task-list-indicator-foreground",
        syntax: "<color>",
        defaultValue: "oklch(from var(--muted-foreground) l c h / 0.7)",
        selector: ':where([data-control-family="task-list"][data-slot="root"])',
      },
      {
        name: "--cui-task-list-item-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="task-list"][data-slot="root"])',
      },
      {
        name: "--cui-task-list-item-pending-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="task-list"][data-slot="root"])',
      },
      {
        name: "--cui-task-list-item-radius",
        syntax: "<length>",
        defaultValue:
          "max(\n      var(--radius-sm),\n      min(var(--radius-popup-item-fit), calc(var(--cui-task-list-radius) - var(--cui-task-list-items-padding)))\n    )",
        selector: ':where([data-control-family="task-list"][data-slot="root"])',
      },
      {
        name: "--cui-task-list-items-padding",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 2)",
        selector: ':where([data-control-family="task-list"][data-slot="root"])',
      },
      {
        name: "--cui-task-list-radius",
        syntax: "<length>",
        defaultValue: "var(--radius-field)",
        selector: ':where([data-control-family="task-list"][data-slot="root"])',
      },
      {
        name: "--cui-task-list-ring-color",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.04)",
        selector: ':where([data-control-family="task-list"][data-slot="root"])',
      },
      {
        name: "--cui-task-list-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-md)",
        selector: ':where([data-control-family="task-list"][data-slot="root"])',
      },
      {
        name: "--cui-task-list-trigger-hover-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--muted) l c h / 0.4)",
        selector: ':where([data-control-family="task-list"][data-slot="root"])',
      },
    ],
  },
  {
    id: "thread-rail",
    knobs: [
      {
        name: "--cui-thread-rail-item-background",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="thread-rail"][data-slot="root"])',
      },
      {
        name: "--cui-thread-rail-item-radius",
        syntax: "<length-percentage>",
        defaultValue: "9999px",
        selector: ':where([data-control-family="thread-rail"][data-slot="root"])',
      },
      {
        name: "--cui-thread-rail-line-radius",
        syntax: "<length-percentage>",
        defaultValue: "9999px",
        selector: ':where([data-control-family="thread-rail"][data-slot="root"])',
      },
      {
        name: "--cui-thread-rail-popover-backdrop-blur",
        syntax: "<length>",
        defaultValue: "var(--backdrop-blur-popover)",
        selector: ':where([data-control-family="thread-rail"][data-slot="root"])',
      },
      {
        name: "--cui-thread-rail-popover-background",
        syntax: "<color>",
        defaultValue: "var(--popover)",
        selector: ':where([data-control-family="thread-rail"][data-slot="root"])',
      },
      {
        name: "--cui-thread-rail-popover-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="thread-rail"][data-slot="root"])',
      },
      {
        name: "--cui-thread-rail-popover-border-width",
        syntax: "<length>",
        defaultValue: "var(--control-rim-width)",
        selector: ':where([data-control-family="thread-rail"][data-slot="root"])',
      },
      {
        name: "--cui-thread-rail-popover-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-popover)",
        selector: ':where([data-control-family="thread-rail"][data-slot="root"])',
      },
      {
        name: "--cui-thread-rail-popover-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-pop)",
        selector: ':where([data-control-family="thread-rail"][data-slot="root"])',
      },
    ],
  },
  {
    id: "timeline",
    knobs: [
      {
        name: "--cui-timeline-error-foreground",
        syntax: "<color>",
        defaultValue: "var(--destructive-text)",
        selector: ':where([data-control-family="timeline"][data-slot="root"])',
      },
      {
        name: "--cui-timeline-indicator-background",
        syntax: "<color>",
        defaultValue: "var(--background)",
        selector: ':where([data-control-family="timeline"][data-slot="root"])',
      },
      {
        name: "--cui-timeline-indicator-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="timeline"][data-slot="root"])',
      },
      {
        name: "--cui-timeline-running-foreground",
        syntax: "<color>",
        defaultValue: "var(--primary-text)",
        selector: ':where([data-control-family="timeline"][data-slot="root"])',
      },
      {
        name: "--cui-timeline-separator-background",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="timeline"][data-slot="root"])',
      },
      {
        name: "--cui-timeline-success-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="timeline"][data-slot="root"])',
      },
      {
        name: "--cui-timeline-title-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="timeline"][data-slot="root"])',
      },
    ],
  },
  {
    id: "toolbar",
    knobs: [
      {
        name: "--cui-toolbar-background",
        syntax: "<color>",
        defaultValue: "oklch(from var(--card) l c h / 0.72)",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-border-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-border-width",
        syntax: "<length>",
        defaultValue: "1px",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-item-active-background",
        syntax: "<color>",
        defaultValue: "var(--active-fill)",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-item-active-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-item-background",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-item-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-item-hover-background",
        syntax: "<color>",
        defaultValue: "var(--hover-fill)",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-item-hover-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-item-radius",
        syntax: "<length-percentage>",
        defaultValue: "min(var(--radius-sm), calc(var(--control-h-sm) / 2))",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-item-shadow",
        syntax: "*",
        defaultValue: "none",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-padding",
        syntax: "<length-percentage>",
        defaultValue: "calc(var(--spacing) * 1)",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-radius",
        syntax: "<length-percentage>",
        defaultValue:
          "calc(\n      min(var(--cui-toolbar-item-radius), calc(var(--control-h-sm) / 2)) +\n      clamp(0px, calc(min(var(--cui-toolbar-item-radius), calc(var(--control-h-sm) / 2)) * 1000), var(--cui-toolbar-padding))\n    )",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-separator-background",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
      {
        name: "--cui-toolbar-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="toolbar"][data-slot="root"])',
      },
    ],
  },
  {
    id: "track-highlight",
    knobs: [
      {
        name: "--cui-track-highlight-background",
        syntax: "<color>",
        defaultValue: "var(--card)",
        selector: ':where([data-control-family="track-highlight"][data-slot="root"])',
      },
      {
        name: "--cui-track-highlight-hover-background",
        syntax: "<color>",
        defaultValue: "color-mix(in oklab, var(--card) 92%, var(--foreground) 8%)",
        selector: ':where([data-control-family="track-highlight"][data-slot="root"])',
      },
      {
        name: "--cui-track-highlight-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-popup-item)",
        selector: ':where([data-control-family="track-highlight"][data-slot="root"])',
      },
      {
        name: "--cui-track-highlight-ring-color",
        syntax: "<color>",
        defaultValue: "oklch(from var(--foreground) l c h / 0.05)",
        selector: ':where([data-control-family="track-highlight"][data-slot="root"])',
      },
      {
        name: "--cui-track-highlight-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-sm)",
        selector: ':where([data-control-family="track-highlight"][data-slot="root"])',
      },
      {
        name: "--cui-track-highlight-transition-duration",
        syntax: "<time>",
        defaultValue: "var(--duration-fast)",
        selector: ':where([data-control-family="track-highlight"][data-slot="root"])',
      },
    ],
  },
  {
    id: "transcript-divider",
    knobs: [
      {
        name: "--cui-transcript-divider-danger-foreground",
        syntax: "<color>",
        defaultValue: "var(--destructive-text)",
        selector: ':where([data-control-family="transcript-divider"][data-slot="root"])',
      },
      {
        name: "--cui-transcript-divider-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="transcript-divider"][data-slot="root"])',
      },
      {
        name: "--cui-transcript-divider-line-color",
        syntax: "<color>",
        defaultValue: "var(--border)",
        selector: ':where([data-control-family="transcript-divider"][data-slot="root"])',
      },
      {
        name: "--cui-transcript-divider-success-foreground",
        syntax: "<color>",
        defaultValue: "var(--badge-green-foreground)",
        selector: ':where([data-control-family="transcript-divider"][data-slot="root"])',
      },
      {
        name: "--cui-transcript-divider-warning-foreground",
        syntax: "<color>",
        defaultValue: "var(--badge-yellow-foreground)",
        selector: ':where([data-control-family="transcript-divider"][data-slot="root"])',
      },
    ],
  },
  {
    id: "tree",
    knobs: [
      {
        name: "--cui-tree-item-trigger-font-size",
        syntax: "<length-percentage>",
        defaultValue: "var(--text-body)",
        selector: ':where([data-control-family="tree"][data-slot="root"])',
      },
      {
        name: "--cui-tree-item-trigger-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="tree"][data-slot="root"])',
      },
      {
        name: "--cui-tree-item-trigger-hover-background",
        syntax: "<color>",
        defaultValue: "var(--hover-fill)",
        selector: ':where([data-control-family="tree"][data-slot="root"])',
      },
      {
        name: "--cui-tree-item-trigger-hover-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="tree"][data-slot="root"])',
      },
      {
        name: "--cui-tree-item-trigger-radius",
        syntax: "<length-percentage>",
        defaultValue: "var(--radius-popup-item)",
        selector: ':where([data-control-family="tree"][data-slot="root"])',
      },
      {
        name: "--cui-tree-item-trigger-selected-background",
        syntax: "<color>",
        defaultValue: "var(--active-fill)",
        selector: ':where([data-control-family="tree"][data-slot="root"])',
      },
      {
        name: "--cui-tree-item-trigger-selected-font-weight",
        syntax: "<number>",
        defaultValue: "var(--font-weight-normal)",
        selector: ':where([data-control-family="tree"][data-slot="root"])',
      },
      {
        name: "--cui-tree-item-trigger-selected-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="tree"][data-slot="root"])',
      },
    ],
  },
  {
    id: "user-ask",
    knobs: [
      {
        name: "--cui-user-ask-backdrop-filter",
        syntax: "*",
        defaultValue: "blur(var(--backdrop-blur-popover))",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-background",
        syntax: "<color>",
        defaultValue: "var(--popover)",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-border-color",
        syntax: "<color>",
        defaultValue: "var(--control-rim)",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-border-width",
        syntax: "<length>",
        defaultValue: "var(--control-rim-width)",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-foreground",
        syntax: "<color>",
        defaultValue: "var(--popover-foreground)",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-indicator-background",
        syntax: "<color>",
        defaultValue: "var(--muted)",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-indicator-foreground",
        syntax: "<color>",
        defaultValue: "var(--muted-foreground)",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-indicator-multiple-radius",
        syntax: "<length>",
        defaultValue: "var(--radius-sm)",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-indicator-radius",
        syntax: "<length>",
        defaultValue: "9999px",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-input-background",
        syntax: "<color>",
        defaultValue: "transparent",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-input-foreground",
        syntax: "<color>",
        defaultValue: "var(--foreground)",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-option-hover-background",
        syntax: "<color>",
        defaultValue: "var(--hover-fill)",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-option-radius",
        syntax: "<length>",
        defaultValue:
          "max(\n      var(--radius-sm),\n      min(var(--radius-popup-item-fit), calc(var(--cui-user-ask-radius) - var(--cui-user-ask-padding)))\n    )",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-option-selected-background",
        syntax: "<color>",
        defaultValue: "var(--active-fill)",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-padding",
        syntax: "<length>",
        defaultValue: "calc(var(--spacing) * 3)",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-radius",
        syntax: "<length>",
        defaultValue: "var(--radius-popover)",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
      {
        name: "--cui-user-ask-shadow",
        syntax: "*",
        defaultValue: "var(--shadow-pop)",
        selector: ':where([data-control-family="user-ask"][data-slot="root"])',
      },
    ],
  },
];
