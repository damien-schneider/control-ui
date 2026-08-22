import "server-only";

import type { SkinContract } from "@/scripts/skin-contract/model";

export const generatedSkinContract: SkinContract = {
  version: 6,
  selectorPattern: '[data-skin="{skin}"] :where([data-slot="{part}"][data-control-family="{family}"])',
  registryItemMapping: {
    accordion: ["accordion"],
    "action-bar": ["action-bar"],
    activity: ["activity", "chat-layout"],
    alert: ["alert"],
    "alert-dialog": ["alert-dialog"],
    "aspect-ratio": ["aspect-ratio"],
    "audio-recorder": ["audio-recorder"],
    "audio-visualizer": ["audio-visualizer", "audio-visualizer-line"],
    "audio-visualizer-line": ["audio-visualizer-line"],
    autocomplete: ["autocomplete"],
    avatar: ["avatar"],
    badge: ["badge"],
    breadcrumb: ["breadcrumb"],
    button: ["button", "dropdown-menu", "select"],
    "button-group": ["button-group"],
    calendar: ["calendar"],
    card: ["card"],
    "chat-composer": ["chat-composer"],
    "chat-composer-attachment": ["chat-composer-attachment"],
    "chat-composer-attachments": ["chat-composer-attachment"],
    "chat-composer-editor": ["chat-composer"],
    "chat-layout": ["chat-layout"],
    "chat-message": ["chat-message"],
    "chat-thought": ["chat-layout"],
    "chat-thread": ["chat-layout"],
    "chat-turn": ["chat-layout"],
    checkbox: ["checkbox"],
    "checkbox-group": ["checkbox-group"],
    code: ["code"],
    "code-block-editor": ["code-block-editor"],
    "code-diff": ["code-diff"],
    collapsible: ["collapsible"],
    "color-picker": ["color-picker"],
    combobox: ["combobox"],
    command: ["command"],
    context: ["context"],
    "context-menu": ["context-menu"],
    dialog: ["dialog"],
    "dockable-panel": ["dockable-panel"],
    drawer: ["drawer"],
    "dropdown-menu": ["dropdown-menu"],
    dropzone: ["dropzone"],
    "dynamic-notification": ["dynamic-notification"],
    empty: ["empty"],
    "environment-variables": ["environment-variables"],
    field: ["field"],
    form: ["form"],
    "gradient-editor": ["gradient-editor"],
    "hover-card": ["hover-card"],
    "infinite-canvas": ["infinite-canvas"],
    "inline-attachment": ["inline-attachment"],
    "inline-citation": ["inline-citation"],
    input: ["input"],
    "input-group": ["input-group"],
    "input-otp": ["input-otp"],
    item: ["item"],
    kbd: ["kbd"],
    label: ["label"],
    markdown: ["markdown"],
    "markdown-block": ["markdown-block"],
    menubar: ["menubar"],
    meter: ["meter"],
    "model-switcher": ["model-switcher"],
    "morphing-panel": ["morphing-panel"],
    "native-select": ["native-select"],
    "navigation-menu": ["navigation-menu"],
    "number-field": ["number-field"],
    pagination: ["pagination"],
    "phone-input": ["phone-input"],
    popover: ["popover"],
    progress: ["progress"],
    "radio-group": ["radio-group"],
    resizable: ["resizable"],
    "rich-tooltip": ["rich-tooltip"],
    "scroll-area": ["scroll-area"],
    select: ["select"],
    separator: ["separator"],
    sheet: ["sheet"],
    sidebar: ["sidebar"],
    "sidebar-layout": ["sidebar-layout-block"],
    skeleton: ["skeleton"],
    slider: ["slider"],
    "source-badge": ["source-badge"],
    spinner: ["spinner"],
    stepper: ["stepper"],
    switch: ["switch"],
    table: ["table"],
    "table-of-contents": ["table-of-contents"],
    tabs: ["tabs"],
    "task-list": ["task-list"],
    textarea: ["textarea"],
    "thread-rail": ["thread-rail"],
    timeline: ["timeline"],
    toast: ["toast"],
    toggle: ["toggle"],
    toolbar: ["toolbar"],
    tooltip: ["tooltip"],
    "track-highlight": ["track-highlight"],
    "transcript-divider": ["transcript-divider"],
    tree: ["tree"],
    "trigger-menu": ["trigger-menu"],
    "user-ask": ["user-ask"],
  },
  scopes: {
    accordion: {
      parts: {
        root: {
          family: "accordion",
          registryItems: ["accordion"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        icon: {
          family: "accordion",
          registryItems: ["accordion"],
          states: [],
        },
        item: {
          family: "accordion",
          registryItems: ["accordion"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-index",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        panel: {
          family: "accordion",
          registryItems: ["accordion"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-index",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        trigger: {
          family: "accordion",
          registryItems: ["accordion"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-panel-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["accordion"],
    },
    "action-bar": {
      parts: {
        root: {
          family: "action-bar",
          registryItems: ["action-bar"],
          states: [],
        },
      },
      registryItems: ["action-bar"],
    },
    activity: {
      parts: {
        root: {
          family: "activity",
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-activity-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "reasoning", "signal", "tool"],
            },
            {
              attribute: "data-activity-name",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
            {
              attribute: "data-activity-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "pending", "running", "success"],
            },
          ],
        },
        announcement: {
          family: "activity",
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "pending", "running", "success"],
            },
          ],
        },
        chevron: {
          family: "activity",
          registryItems: ["activity"],
          states: [],
        },
        content: {
          registryItems: ["activity"],
          states: [],
        },
        "content-viewport": {
          family: "activity",
          registryItems: ["chat-layout"],
          states: [],
        },
        detail: {
          family: "activity",
          registryItems: ["activity"],
          states: [],
        },
        "detail-content": {
          family: "activity",
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-format",
              source: "control-ui",
              valueKind: "enum",
              values: ["code", "text"],
            },
          ],
        },
        "detail-label": {
          family: "activity",
          registryItems: ["activity"],
          states: [],
        },
        icon: {
          family: "activity",
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-status-icon",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        row: {
          family: "activity",
          registryItems: ["activity"],
          states: [],
        },
        status: {
          family: "activity",
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "reasoning", "signal", "tool"],
            },
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "pending", "running", "success"],
            },
          ],
        },
        title: {
          family: "activity",
          registryItems: ["activity"],
          states: [],
        },
        trigger: {
          family: "activity",
          registryItems: ["activity"],
          states: [],
        },
      },
      registryItems: ["activity", "chat-layout"],
    },
    alert: {
      parts: {
        root: {
          family: "alert",
          registryItems: ["alert"],
          states: [
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "destructive"],
            },
          ],
        },
        description: {
          family: "alert",
          registryItems: ["alert"],
          states: [],
        },
        title: {
          family: "alert",
          registryItems: ["alert"],
          states: [],
        },
      },
      registryItems: ["alert"],
    },
    "alert-dialog": {
      parts: {
        backdrop: {
          family: "popup",
          registryItems: ["alert-dialog"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["alert-dialog"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        content: {
          family: "popup",
          registryItems: ["alert-dialog"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-nested",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-nested-dialog-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["alert-dialog"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        description: {
          family: "popup",
          registryItems: ["alert-dialog"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["alert-dialog"],
            },
          ],
        },
        footer: {
          family: "popup",
          registryItems: ["alert-dialog"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["alert-dialog"],
            },
          ],
        },
        header: {
          family: "popup",
          registryItems: ["alert-dialog"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["alert-dialog"],
            },
          ],
        },
        title: {
          family: "popup",
          registryItems: ["alert-dialog"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["alert-dialog"],
            },
          ],
        },
        trigger: {
          registryItems: ["alert-dialog"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["alert-dialog"],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["alert-dialog"],
    },
    "aspect-ratio": {
      parts: {
        root: {
          registryItems: ["aspect-ratio"],
          states: [],
        },
      },
      registryItems: ["aspect-ratio"],
    },
    "audio-recorder": {
      parts: {
        root: {
          family: "audio-recorder",
          registryItems: ["audio-recorder"],
          states: [
            {
              attribute: "data-disabled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-error",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "idle", "recorded", "recording", "requesting", "submitting"],
            },
          ],
        },
        actions: {
          family: "audio-recorder",
          registryItems: ["audio-recorder"],
          states: [],
        },
        cancel: {
          registryItems: ["audio-recorder"],
          states: [
            {
              attribute: "data-visible",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        content: {
          family: "audio-recorder",
          registryItems: ["audio-recorder"],
          states: [],
        },
        duration: {
          family: "audio-recorder",
          registryItems: ["audio-recorder"],
          states: [
            {
              attribute: "data-visible",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        status: {
          family: "audio-recorder",
          registryItems: ["audio-recorder"],
          states: [
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "neutral"],
            },
            {
              attribute: "data-visible",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        submit: {
          registryItems: ["audio-recorder"],
          states: [
            {
              attribute: "data-visible",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        trigger: {
          registryItems: ["audio-recorder"],
          states: [
            {
              attribute: "data-recorder-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "idle", "recorded", "recording", "requesting", "submitting"],
            },
            {
              attribute: "data-status-only",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        visualizer: {
          registryItems: ["audio-recorder"],
          states: [
            {
              attribute: "data-visible",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["audio-recorder"],
    },
    "audio-visualizer": {
      parts: {
        root: {
          family: "audio-visualizer",
          registryItems: ["audio-visualizer", "audio-visualizer-line"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["bars", "line"],
            },
          ],
        },
        bar: {
          family: "audio-visualizer",
          registryItems: ["audio-visualizer"],
          states: [],
        },
        "bar-track": {
          family: "audio-visualizer",
          registryItems: ["audio-visualizer"],
          states: [],
        },
        baseline: {
          family: "audio-visualizer",
          registryItems: ["audio-visualizer-line"],
          states: [],
        },
        track: {
          family: "audio-visualizer",
          registryItems: ["audio-visualizer", "audio-visualizer-line"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["audio-visualizer", "audio-visualizer-line"],
    },
    "audio-visualizer-line": {
      parts: {
        waveform: {
          family: "audio-visualizer",
          registryItems: ["audio-visualizer-line"],
          states: [],
        },
      },
      registryItems: ["audio-visualizer-line"],
    },
    autocomplete: {
      parts: {
        root: {
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["autocomplete"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-list-empty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-pressed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        clear: {
          family: "field",
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["autocomplete"],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-visible",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        content: {
          family: "popup",
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-empty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-instant",
              source: "external",
              valueKind: "enum",
              values: ["click", "dismiss"],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["autocomplete"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        empty: {
          family: "field",
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["autocomplete"],
            },
          ],
        },
        group: {
          family: "field",
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["autocomplete"],
            },
          ],
        },
        "group-label": {
          family: "popup",
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["autocomplete"],
            },
          ],
        },
        input: {
          family: "field",
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["autocomplete"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-list-empty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-pressed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg", "md", "sm", "xs"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        item: {
          family: "popup",
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-highlighted",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["autocomplete"],
            },
          ],
        },
        list: {
          family: "popup",
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["autocomplete"],
            },
          ],
        },
        positioner: {
          family: "popup",
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-anchor-hidden",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-empty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["autocomplete"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
          ],
        },
      },
      registryItems: ["autocomplete"],
    },
    avatar: {
      parts: {
        root: {
          family: "avatar",
          registryItems: ["avatar"],
          states: [],
        },
        fallback: {
          family: "avatar",
          registryItems: ["avatar"],
          states: [],
        },
        group: {
          family: "avatar",
          registryItems: ["avatar"],
          states: [],
        },
        image: {
          family: "avatar",
          registryItems: ["avatar"],
          states: [
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["avatar"],
    },
    badge: {
      parts: {
        root: {
          family: "badge",
          registryItems: ["badge"],
          states: [
            {
              attribute: "data-color",
              source: "control-ui",
              valueKind: "enum",
              values: ["blue", "green", "neutral", "orange", "pink", "purple", "red", "yellow"],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["md", "sm"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "outline"],
            },
          ],
        },
      },
      registryItems: ["badge"],
    },
    breadcrumb: {
      parts: {
        root: {
          family: "breadcrumb",
          registryItems: ["breadcrumb"],
          states: [],
        },
        ellipsis: {
          family: "breadcrumb",
          registryItems: ["breadcrumb"],
          states: [],
        },
        item: {
          family: "breadcrumb",
          registryItems: ["breadcrumb"],
          states: [],
        },
        link: {
          family: "breadcrumb",
          registryItems: ["breadcrumb"],
          states: [],
        },
        list: {
          family: "breadcrumb",
          registryItems: ["breadcrumb"],
          states: [],
        },
        page: {
          family: "breadcrumb",
          registryItems: ["breadcrumb"],
          states: [],
        },
        separator: {
          family: "breadcrumb",
          registryItems: ["breadcrumb"],
          states: [],
        },
      },
      registryItems: ["breadcrumb"],
    },
    button: {
      parts: {
        root: {
          family: "button",
          registryItems: ["button"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-icon-only",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-shape",
              source: "control-ui",
              valueKind: "enum",
              values: ["circle", "default"],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg", "md", "sm", "xs"],
            },
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["danger", "neutral", "primary"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["ghost", "quiet", "solid", "surface"],
            },
          ],
        },
        content: {
          family: "button",
          registryItems: ["button", "dropdown-menu", "select"],
          states: [],
        },
      },
      registryItems: ["button", "dropdown-menu", "select"],
    },
    "button-group": {
      parts: {
        root: {
          family: "button-group",
          registryItems: ["button-group"],
          states: [
            {
              attribute: "data-orientation",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        separator: {
          family: "button-group",
          registryItems: ["button-group"],
          states: [
            {
              attribute: "data-orientation",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        text: {
          family: "button-group",
          registryItems: ["button-group"],
          states: [
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg", "md", "sm", "xs"],
            },
          ],
        },
      },
      registryItems: ["button-group"],
    },
    calendar: {
      parts: {
        root: {
          family: "calendar",
          registryItems: ["calendar"],
          states: [],
        },
        "caption-label": {
          family: "calendar",
          registryItems: ["calendar"],
          states: [],
        },
        day: {
          family: "calendar",
          registryItems: ["calendar"],
          states: [
            {
              attribute: "data-range-end",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-range-middle",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-range-start",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-selected-single",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-today",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "day-cell": {
          family: "calendar",
          registryItems: ["calendar"],
          states: [],
        },
        month: {
          family: "calendar",
          registryItems: ["calendar"],
          states: [],
        },
        "month-caption": {
          family: "calendar",
          registryItems: ["calendar"],
          states: [],
        },
        "month-grid": {
          family: "calendar",
          registryItems: ["calendar"],
          states: [],
        },
        months: {
          family: "calendar",
          registryItems: ["calendar"],
          states: [],
        },
        nav: {
          family: "calendar",
          registryItems: ["calendar"],
          states: [],
        },
        "nav-button": {
          family: "calendar",
          registryItems: ["calendar"],
          states: [],
        },
        weekday: {
          family: "calendar",
          registryItems: ["calendar"],
          states: [],
        },
      },
      registryItems: ["calendar"],
    },
    card: {
      parts: {
        root: {
          family: "card",
          registryItems: ["card"],
          states: [
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "sectioned"],
            },
          ],
        },
        action: {
          family: "card",
          registryItems: ["card"],
          states: [],
        },
        content: {
          family: "card",
          registryItems: ["card"],
          states: [],
        },
        description: {
          family: "card",
          registryItems: ["card"],
          states: [],
        },
        footer: {
          family: "card",
          registryItems: ["card"],
          states: [],
        },
        header: {
          family: "card",
          registryItems: ["card"],
          states: [],
        },
        title: {
          family: "card",
          registryItems: ["card"],
          states: [],
        },
      },
      registryItems: ["card"],
    },
    "chat-composer": {
      parts: {
        root: {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-density",
              source: "control-ui",
              valueKind: "enum",
              values: ["comfortable", "compact"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["disabled", "idle", "submitting"],
            },
          ],
        },
        accent: {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [],
        },
        footer: {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [],
        },
        mention: {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-icon",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
            {
              attribute: "data-id",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
            {
              attribute: "data-mention",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
          ],
        },
        "mention-description": {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [],
        },
        "mention-icon": {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [],
        },
        "mention-label": {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [],
        },
        shell: {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["disabled", "idle", "submitting"],
            },
          ],
        },
        submit: {
          registryItems: ["chat-composer"],
          states: [],
        },
        textarea: {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [],
        },
        toolbar: {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [],
        },
        tools: {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [],
        },
      },
      registryItems: ["chat-composer"],
    },
    "chat-composer-attachment": {
      parts: {
        root: {
          family: "chat-composer-attachment",
          registryItems: ["chat-composer-attachment"],
          states: [
            {
              attribute: "data-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["archive", "audio", "document", "file", "image", "pdf", "spreadsheet", "video"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "idle", "uploaded", "uploading"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["file", "preview"],
            },
          ],
        },
        content: {
          family: "chat-composer-attachment",
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        description: {
          family: "chat-composer-attachment",
          registryItems: ["chat-composer-attachment"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "idle", "uploaded", "uploading"],
            },
          ],
        },
        preview: {
          family: "chat-composer-attachment",
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        "preview-label": {
          family: "chat-composer-attachment",
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        progress: {
          family: "chat-composer-attachment",
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        "progress-indicator": {
          family: "chat-composer-attachment",
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        remove: {
          registryItems: ["chat-composer-attachment"],
          states: [
            {
              attribute: "data-chat-composer-attachment-remove",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        status: {
          family: "chat-composer-attachment",
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        title: {
          family: "chat-composer-attachment",
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
      },
      registryItems: ["chat-composer-attachment"],
    },
    "chat-composer-attachments": {
      parts: {
        root: {
          family: "chat-composer-attachment",
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        list: {
          family: "chat-composer-attachment",
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        scroll: {
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
      },
      registryItems: ["chat-composer-attachment"],
    },
    "chat-composer-editor": {
      parts: {
        root: {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [],
        },
        editor: {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [],
        },
        fallback: {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [],
        },
        placeholder: {
          family: "chat-composer",
          registryItems: ["chat-composer"],
          states: [],
        },
      },
      registryItems: ["chat-composer"],
    },
    "chat-layout": {
      parts: {
        root: {
          family: "chat-layout",
          registryItems: ["chat-layout"],
          states: [],
        },
      },
      registryItems: ["chat-layout"],
    },
    "chat-message": {
      parts: {
        root: {
          family: "chat-message",
          registryItems: ["chat-message"],
          states: [
            {
              attribute: "data-density",
              source: "control-ui",
              valueKind: "enum",
              values: ["comfortable", "compact"],
            },
            {
              attribute: "data-role",
              source: "control-ui",
              valueKind: "enum",
              values: ["assistant", "system", "tool", "user"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "idle", "pending", "streaming"],
            },
          ],
        },
        actions: {
          family: "chat-message",
          registryItems: ["chat-message"],
          states: [],
        },
        avatar: {
          family: "chat-message",
          registryItems: ["chat-message"],
          states: [],
        },
        body: {
          family: "chat-message",
          registryItems: ["chat-message"],
          states: [],
        },
        content: {
          family: "chat-message",
          registryItems: ["chat-message"],
          states: [
            {
              attribute: "data-role",
              source: "control-ui",
              valueKind: "enum",
              values: ["assistant", "system", "tool", "user"],
            },
            {
              attribute: "data-streaming",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        header: {
          family: "chat-message",
          registryItems: ["chat-message"],
          states: [],
        },
        row: {
          family: "chat-message",
          registryItems: ["chat-message"],
          states: [],
        },
      },
      registryItems: ["chat-message"],
    },
    "chat-thought": {
      parts: {
        root: {
          family: "chat-layout",
          registryItems: ["chat-layout"],
          states: [],
        },
        chevron: {
          family: "chat-layout",
          registryItems: ["chat-layout"],
          states: [],
        },
        details: {
          family: "chat-layout",
          registryItems: ["chat-layout"],
          states: [],
        },
        title: {
          family: "chat-layout",
          registryItems: ["chat-layout"],
          states: [],
        },
        trigger: {
          family: "chat-layout",
          registryItems: ["chat-layout"],
          states: [],
        },
      },
      registryItems: ["chat-layout"],
    },
    "chat-thread": {
      parts: {
        root: {
          family: "chat-layout",
          registryItems: ["chat-layout"],
          states: [],
        },
      },
      registryItems: ["chat-layout"],
    },
    "chat-turn": {
      parts: {
        turn: {
          family: "chat-layout",
          registryItems: ["chat-layout"],
          states: [
            {
              attribute: "data-from",
              source: "control-ui",
              valueKind: "enum",
              values: ["assistant", "user"],
            },
          ],
        },
      },
      registryItems: ["chat-layout"],
    },
    checkbox: {
      parts: {
        root: {
          family: "choice",
          registryItems: ["checkbox"],
          states: [
            {
              attribute: "data-checked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-choice-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["checkbox"],
            },
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-indeterminate",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-unchecked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        indicator: {
          family: "choice",
          registryItems: ["checkbox"],
          states: [
            {
              attribute: "data-checked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-choice-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["checkbox"],
            },
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-indeterminate",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-unchecked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["checkbox"],
    },
    "checkbox-group": {
      parts: {
        root: {
          registryItems: ["checkbox-group"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
      },
      registryItems: ["checkbox-group"],
    },
    code: {
      parts: {
        root: {
          family: "code",
          registryItems: ["code"],
          states: [
            {
              attribute: "data-chrome",
              source: "control-ui",
              valueKind: "enum",
              values: ["embedded", "standalone"],
            },
            {
              attribute: "data-density",
              source: "control-ui",
              valueKind: "enum",
              values: ["compact", "default"],
            },
            {
              attribute: "data-header",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "accessible-source": {
          family: "code",
          registryItems: ["code"],
          states: [],
        },
        actions: {
          family: "code",
          registryItems: ["code"],
          states: [],
        },
        content: {
          family: "code",
          registryItems: ["code"],
          states: [],
        },
        grid: {
          family: "code",
          registryItems: ["code"],
          states: [
            {
              attribute: "data-density",
              source: "control-ui",
              valueKind: "enum",
              values: ["compact", "default"],
            },
          ],
        },
        gutter: {
          family: "code",
          registryItems: ["code"],
          states: [],
        },
        header: {
          family: "code",
          registryItems: ["code"],
          states: [],
        },
        line: {
          family: "code",
          registryItems: ["code"],
          states: [
            {
              attribute: "data-index",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
          ],
        },
        title: {
          family: "code",
          registryItems: ["code"],
          states: [],
        },
      },
      registryItems: ["code"],
    },
    "code-block-editor": {
      parts: {
        root: {
          family: "code-block-editor",
          registryItems: ["code-block-editor"],
          states: [
            {
              attribute: "data-chrome",
              source: "control-ui",
              valueKind: "enum",
              values: ["embedded", "standalone"],
            },
            {
              attribute: "data-density",
              source: "control-ui",
              valueKind: "enum",
              values: ["compact", "default"],
            },
            {
              attribute: "data-header",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["command", "default"],
            },
          ],
        },
        actions: {
          family: "code-block-editor",
          registryItems: ["code-block-editor"],
          states: [],
        },
        content: {
          family: "code-block-editor",
          registryItems: ["code-block-editor"],
          states: [],
        },
        editor: {
          family: "code-block-editor",
          registryItems: ["code-block-editor"],
          states: [],
        },
        header: {
          family: "code-block-editor",
          registryItems: ["code-block-editor"],
          states: [],
        },
        title: {
          family: "code-block-editor",
          registryItems: ["code-block-editor"],
          states: [],
        },
      },
      registryItems: ["code-block-editor"],
    },
    "code-diff": {
      parts: {
        root: {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-diff-style",
              source: "control-ui",
              valueKind: "enum",
              values: ["split", "unified"],
            },
            {
              attribute: "data-file-count",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
            {
              attribute: "data-header",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "accessible-source": {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [],
        },
        actions: {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [],
        },
        body: {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [],
        },
        emphasis: {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-line-type",
              source: "control-ui",
              valueKind: "enum",
              values: ["add", "context", "del"],
            },
          ],
        },
        "empty-half": {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-side",
              source: "control-ui",
              valueKind: "enum",
              values: ["left", "right"],
            },
          ],
        },
        "expand-button": {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [],
        },
        expander: {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [],
        },
        "expander-label": {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [],
        },
        file: {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-file-name",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
          ],
        },
        "file-header": {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [],
        },
        "file-title": {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [],
        },
        gutter: {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-line-type",
              source: "control-ui",
              valueKind: "enum",
              values: ["add", "context", "del"],
            },
          ],
        },
        header: {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [],
        },
        line: {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-indicators",
              source: "control-ui",
              valueKind: "enum",
              values: ["bars", "classic", "none"],
            },
            {
              attribute: "data-line-type",
              source: "control-ui",
              valueKind: "enum",
              values: ["add", "context", "del"],
            },
            {
              attribute: "data-side",
              source: "control-ui",
              valueKind: "enum",
              values: ["left", "right"],
            },
          ],
        },
        marker: {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-line-type",
              source: "control-ui",
              valueKind: "enum",
              values: ["add", "context", "del"],
            },
          ],
        },
        row: {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [],
        },
        stat: {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [],
        },
        "stat-additions": {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [],
        },
        "stat-deletions": {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [],
        },
        title: {
          family: "code-diff",
          registryItems: ["code-diff"],
          states: [],
        },
      },
      registryItems: ["code-diff"],
    },
    collapsible: {
      parts: {
        root: {
          family: "collapsible",
          registryItems: ["collapsible"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["closed", "open"],
            },
          ],
        },
        content: {
          family: "collapsible",
          registryItems: ["collapsible"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["closed", "open"],
            },
          ],
        },
        trigger: {
          family: "collapsible",
          registryItems: ["collapsible"],
          states: [
            {
              attribute: "data-panel-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["collapsible"],
    },
    "color-picker": {
      parts: {
        alpha: {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dragging",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "alpha-thumb": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dragging",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-index",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "alpha-track": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dragging",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        area: {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-disabled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dragging",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "area-brightness": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "area-saturation": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "area-thumb": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        channel: {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "channel-label": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        channels: {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        content: {
          family: "popup",
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-instant",
              source: "external",
              valueKind: "enum",
              values: ["click", "dismiss", "focus", "trigger-change"],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        contrast: {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "contrast-fix": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "contrast-level": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-passing",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "contrast-ratio": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "eye-dropper": {
          registryItems: ["color-picker"],
          states: [],
        },
        format: {
          registryItems: ["color-picker"],
          states: [],
        },
        hue: {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dragging",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "hue-thumb": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dragging",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-index",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "hue-track": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dragging",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        input: {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        output: {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "output-checker": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "output-color": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "output-swatch": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "output-value": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        panel: {
          family: "popup",
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
            {
              attribute: "data-popup-static",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        positioner: {
          family: "popup",
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-anchor-hidden",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
          ],
        },
        swatch: {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-selected",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "swatch-add": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "swatch-checker": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "swatch-color": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        swatches: {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "swatches-group": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "swatches-label": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        trigger: {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-disabled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-pressed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "trigger-checker": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        "trigger-color": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
        wheel: {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-disabled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dragging",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "wheel-thumb": {
          family: "color-picker",
          registryItems: ["color-picker"],
          states: [],
        },
      },
      registryItems: ["color-picker"],
    },
    combobox: {
      parts: {
        root: {
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-list-empty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-placeholder",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-pressed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        content: {
          family: "popup",
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-empty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-instant",
              source: "external",
              valueKind: "enum",
              values: ["click", "dismiss"],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        empty: {
          family: "field",
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
          ],
        },
        group: {
          family: "field",
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
          ],
        },
        "group-label": {
          family: "popup",
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
          ],
        },
        icon: {
          family: "field",
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
          ],
        },
        input: {
          family: "field",
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-list-empty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-pressed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg", "md", "sm", "xs"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        item: {
          family: "popup",
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-disabled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-highlighted",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
            {
              attribute: "data-selected",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "item-indicator": {
          family: "popup",
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
          ],
        },
        list: {
          family: "popup",
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
          ],
        },
        positioner: {
          family: "popup",
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-anchor-hidden",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-empty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
          ],
        },
        trigger: {
          family: "field",
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-list-empty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-placeholder",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-pressed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["combobox"],
    },
    command: {
      parts: {
        root: {
          family: "popup",
          registryItems: ["command"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
            {
              attribute: "data-popup-static",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "dialog-root": {
          family: "popup",
          registryItems: ["command"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
        empty: {
          family: "popup",
          registryItems: ["command"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
        group: {
          family: "popup",
          registryItems: ["command"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
        input: {
          family: "popup",
          registryItems: ["command"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
        "input-icon": {
          family: "popup",
          registryItems: ["command"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
        "input-wrapper": {
          family: "popup",
          registryItems: ["command"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg"],
            },
          ],
        },
        item: {
          family: "popup",
          registryItems: ["command"],
          states: [
            {
              attribute: "data-disabled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
            {
              attribute: "data-selected",
              source: "external",
              valueKind: "enum",
              values: ["false", "true"],
            },
          ],
        },
        list: {
          family: "popup",
          registryItems: ["command"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
        separator: {
          family: "popup",
          registryItems: ["command"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
        shortcut: {
          family: "popup",
          registryItems: ["command"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
      },
      registryItems: ["command"],
    },
    context: {
      parts: {
        root: {
          family: "context",
          registryItems: ["context"],
          states: [
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["normal", "over-limit", "unavailable"],
            },
          ],
        },
        content: {
          family: "context",
          registryItems: ["context"],
          states: [],
        },
        description: {
          family: "context",
          registryItems: ["context"],
          states: [],
        },
        graph: {
          family: "context",
          registryItems: ["context"],
          states: [
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["normal", "over-limit", "unavailable"],
            },
          ],
        },
        header: {
          family: "context",
          registryItems: ["context"],
          states: [],
        },
        legend: {
          family: "context",
          registryItems: ["context"],
          states: [],
        },
        "legend-description": {
          family: "context",
          registryItems: ["context"],
          states: [],
        },
        "legend-indicator": {
          family: "context",
          registryItems: ["context"],
          states: [
            {
              attribute: "data-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["cache", "message", "other", "reasoning", "source", "system", "tool"],
            },
          ],
        },
        "legend-item": {
          family: "context",
          registryItems: ["context"],
          states: [
            {
              attribute: "data-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["cache", "message", "other", "reasoning", "source", "system", "tool"],
            },
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["available", "over-limit"],
            },
          ],
        },
        "legend-label": {
          family: "context",
          registryItems: ["context"],
          states: [],
        },
        "legend-value": {
          family: "context",
          registryItems: ["context"],
          states: [],
        },
        "limit-marker": {
          family: "context",
          registryItems: ["context"],
          states: [],
        },
        overage: {
          family: "context",
          registryItems: ["context"],
          states: [],
        },
        segment: {
          family: "context",
          registryItems: ["context"],
          states: [
            {
              attribute: "data-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["cache", "message", "other", "reasoning", "source", "system", "tool"],
            },
          ],
        },
        summary: {
          family: "context",
          registryItems: ["context"],
          states: [
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["normal", "over-limit", "unavailable"],
            },
          ],
        },
        "summary-value": {
          family: "context",
          registryItems: ["context"],
          states: [],
        },
        title: {
          family: "context",
          registryItems: ["context"],
          states: [],
        },
        track: {
          family: "context",
          registryItems: ["context"],
          states: [],
        },
        trigger: {
          family: "context",
          registryItems: ["context"],
          states: [
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["normal", "over-limit", "unavailable"],
            },
          ],
        },
        "trigger-indicator": {
          family: "context",
          registryItems: ["context"],
          states: [
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["normal", "over-limit", "unavailable"],
            },
          ],
        },
        "trigger-label": {
          family: "context",
          registryItems: ["context"],
          states: [],
        },
        "trigger-track": {
          family: "context",
          registryItems: ["context"],
          states: [
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["normal", "over-limit", "unavailable"],
            },
          ],
        },
        "trigger-value": {
          family: "context",
          registryItems: ["context"],
          states: [
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["normal", "over-limit", "unavailable"],
            },
          ],
        },
      },
      registryItems: ["context"],
    },
    "context-menu": {
      parts: {
        "checkbox-item": {
          family: "popup",
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-checked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-highlighted",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
            {
              attribute: "data-unchecked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        content: {
          family: "popup",
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-instant",
              source: "external",
              valueKind: "enum",
              values: ["click", "dismiss", "group", "trigger-change"],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        group: {
          family: "popup",
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
          ],
        },
        item: {
          family: "popup",
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-highlighted",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
          ],
        },
        label: {
          family: "popup",
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
          ],
        },
        "radio-group": {
          family: "popup",
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
          ],
        },
        "radio-indicator": {
          family: "popup",
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
          ],
        },
        "radio-item": {
          family: "popup",
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-checked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-highlighted",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
            {
              attribute: "data-unchecked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        separator: {
          family: "popup",
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
          ],
        },
        shortcut: {
          family: "popup",
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
          ],
        },
        "sub-content": {
          family: "popup",
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-instant",
              source: "external",
              valueKind: "enum",
              values: ["click", "dismiss", "group", "trigger-change"],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "sub-trigger": {
          family: "popup",
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-highlighted",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "sub-trigger-indicator": {
          family: "popup",
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
          ],
        },
        trigger: {
          family: "popup",
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-pressed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["context-menu"],
    },
    dialog: {
      parts: {
        backdrop: {
          family: "popup",
          registryItems: ["dialog"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["dialog"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        content: {
          family: "popup",
          registryItems: ["dialog"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-nested",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-nested-dialog-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["dialog"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        description: {
          family: "popup",
          registryItems: ["dialog"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["dialog"],
            },
          ],
        },
        footer: {
          family: "popup",
          registryItems: ["dialog"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["dialog"],
            },
          ],
        },
        header: {
          family: "popup",
          registryItems: ["dialog"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["dialog"],
            },
          ],
        },
        title: {
          family: "popup",
          registryItems: ["dialog"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["dialog"],
            },
          ],
        },
        trigger: {
          registryItems: ["dialog"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["dialog"],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["dialog"],
    },
    "dockable-panel": {
      parts: {
        root: {
          family: "dockable-panel",
          registryItems: ["dockable-panel"],
          states: [
            {
              attribute: "data-dragging",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-placement",
              source: "control-ui",
              valueKind: "enum",
              values: ["left", "right"],
            },
          ],
        },
        actions: {
          family: "dockable-panel",
          registryItems: ["dockable-panel"],
          states: [],
        },
        content: {
          family: "dockable-panel",
          registryItems: ["dockable-panel"],
          states: [
            {
              attribute: "data-padding",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "none"],
            },
          ],
        },
        "drag-handle": {
          family: "dockable-panel",
          registryItems: ["dockable-panel"],
          states: [],
        },
        "drop-zone": {
          family: "dockable-panel",
          registryItems: ["dockable-panel"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-side",
              source: "control-ui",
              valueKind: "enum",
              values: ["left", "right"],
            },
          ],
        },
        header: {
          family: "dockable-panel",
          registryItems: ["dockable-panel"],
          states: [],
        },
        title: {
          family: "dockable-panel",
          registryItems: ["dockable-panel"],
          states: [],
        },
      },
      registryItems: ["dockable-panel"],
    },
    drawer: {
      parts: {
        backdrop: {
          family: "popup",
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        close: {
          family: "popup",
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
          ],
        },
        content: {
          family: "popup",
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-expanded",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-nested-drawer-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-nested-drawer-swiping",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-padding",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "none"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
            {
              attribute: "data-side",
              source: "control-ui",
              valueKind: "enum",
              values: ["bottom", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-surface-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["background", "card"],
            },
            {
              attribute: "data-swipe-direction",
              source: "external",
              valueKind: "enum",
              values: ["down", "left", "right", "up"],
            },
            {
              attribute: "data-swipe-dismiss",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-swiping",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["edge", "floating"],
            },
          ],
        },
        description: {
          family: "popup",
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
          ],
        },
        footer: {
          family: "popup",
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
          ],
        },
        handle: {
          family: "popup",
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
          ],
        },
        header: {
          family: "popup",
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
          ],
        },
        title: {
          family: "popup",
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
          ],
        },
        trigger: {
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
          ],
        },
        viewport: {
          family: "popup",
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-nested",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["drawer"],
    },
    "dropdown-menu": {
      parts: {
        content: {
          family: "popup",
          registryItems: ["dropdown-menu"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-instant",
              source: "external",
              valueKind: "enum",
              values: ["click", "dismiss", "group", "trigger-change"],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        item: {
          family: "popup",
          registryItems: ["dropdown-menu"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-highlighted",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        label: {
          family: "popup",
          registryItems: ["dropdown-menu"],
          states: [],
        },
        separator: {
          family: "popup",
          registryItems: ["dropdown-menu"],
          states: [
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        trigger: {
          family: "button",
          registryItems: ["dropdown-menu"],
          states: [
            {
              attribute: "data-icon-only",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-pressed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-shape",
              source: "control-ui",
              valueKind: "enum",
              values: ["default"],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg", "md", "sm", "xs"],
            },
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["neutral"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["ghost", "surface"],
            },
          ],
        },
      },
      registryItems: ["dropdown-menu"],
    },
    dropzone: {
      parts: {
        root: {
          family: "dropzone",
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-disabled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-empty",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        area: {
          family: "dropzone",
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-disabled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["accept", "idle", "processing", "reject", "unknown"],
            },
          ],
        },
        feedback: {
          family: "dropzone",
          registryItems: ["dropzone"],
          states: [],
        },
        "feedback-icon": {
          family: "dropzone",
          registryItems: ["dropzone"],
          states: [],
        },
        "feedback-message": {
          family: "dropzone",
          registryItems: ["dropzone"],
          states: [],
        },
        "feedback-spinner": {
          family: "dropzone",
          registryItems: ["dropzone"],
          states: [],
        },
        file: {
          family: "dropzone",
          registryItems: ["dropzone"],
          states: [],
        },
        "file-list": {
          family: "dropzone",
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-empty",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        input: {
          family: "dropzone",
          registryItems: ["dropzone"],
          states: [],
        },
        overlay: {
          family: "dropzone",
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-scope",
              source: "control-ui",
              valueKind: "enum",
              values: ["global", "local"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["accept", "idle", "processing", "reject", "unknown"],
            },
          ],
        },
        rejection: {
          family: "dropzone",
          registryItems: ["dropzone"],
          states: [],
        },
        "rejection-list": {
          family: "dropzone",
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-empty",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        status: {
          family: "dropzone",
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["accept", "idle", "processing", "reject", "unknown"],
            },
          ],
        },
        trigger: {
          family: "dropzone",
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-disabled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["accept", "idle", "processing", "reject", "unknown"],
            },
          ],
        },
      },
      registryItems: ["dropzone"],
    },
    "dynamic-notification": {
      parts: {
        root: {
          family: "dynamic-notification",
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["collapsed", "expanded", "thinking"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["glass", "liquid", "surface"],
            },
          ],
        },
        close: {
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-dynamic-notification-close",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        content: {
          family: "dynamic-notification",
          registryItems: ["dynamic-notification"],
          states: [],
        },
        glass: {
          family: "dynamic-notification",
          registryItems: ["dynamic-notification"],
          states: [],
        },
        indicator: {
          family: "dynamic-notification",
          registryItems: ["dynamic-notification"],
          states: [],
        },
        island: {
          family: "dynamic-notification",
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["collapsed", "expanded", "thinking"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["glass", "liquid", "surface"],
            },
          ],
        },
        liquid: {
          family: "dynamic-notification",
          registryItems: ["dynamic-notification"],
          states: [],
        },
        message: {
          family: "dynamic-notification",
          registryItems: ["dynamic-notification"],
          states: [],
        },
        pill: {
          family: "dynamic-notification",
          registryItems: ["dynamic-notification"],
          states: [],
        },
        reply: {
          family: "dynamic-notification",
          registryItems: ["dynamic-notification"],
          states: [],
        },
        "reply-input": {
          family: "dynamic-notification",
          registryItems: ["dynamic-notification"],
          states: [],
        },
        "reply-submit": {
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-dynamic-notification-submit",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        title: {
          family: "dynamic-notification",
          registryItems: ["dynamic-notification"],
          states: [],
        },
        word: {
          family: "dynamic-notification",
          registryItems: ["dynamic-notification"],
          states: [],
        },
      },
      registryItems: ["dynamic-notification"],
    },
    empty: {
      parts: {
        root: {
          family: "empty",
          registryItems: ["empty"],
          states: [],
        },
        content: {
          family: "empty",
          registryItems: ["empty"],
          states: [],
        },
        description: {
          family: "empty",
          registryItems: ["empty"],
          states: [],
        },
        header: {
          family: "empty",
          registryItems: ["empty"],
          states: [],
        },
        media: {
          family: "empty",
          registryItems: ["empty"],
          states: [],
        },
        title: {
          family: "empty",
          registryItems: ["empty"],
          states: [],
        },
      },
      registryItems: ["empty"],
    },
    "environment-variables": {
      parts: {
        root: {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-disabled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        actions: {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        "column-labels": {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        description: {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        empty: {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        "field-error": {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        "field-label": {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        header: {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        hint: {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        "hint-code": {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        "key-input": {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        message: {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        "readonly-item": {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        "readonly-key": {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        "readonly-list": {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        "readonly-value": {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        row: {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        rows: {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        title: {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        toolbar: {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
        "value-group": {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-invalid",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "value-input": {
          family: "environment-variables",
          registryItems: ["environment-variables"],
          states: [],
        },
      },
      registryItems: ["environment-variables"],
    },
    field: {
      parts: {
        root: {
          family: "field",
          registryItems: ["field"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "responsive", "vertical"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        content: {
          family: "field",
          registryItems: ["field"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
          ],
        },
        control: {
          family: "field",
          registryItems: ["field"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        description: {
          family: "field",
          registryItems: ["field"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        error: {
          family: "field",
          registryItems: ["field"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        group: {
          family: "field",
          registryItems: ["field"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
          ],
        },
        item: {
          family: "field",
          registryItems: ["field"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        label: {
          family: "field",
          registryItems: ["field"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        legend: {
          family: "field",
          registryItems: ["field"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
          ],
        },
        separator: {
          family: "field",
          registryItems: ["field"],
          states: [
            {
              attribute: "data-content",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
          ],
        },
        "separator-content": {
          family: "field",
          registryItems: ["field"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
          ],
        },
        set: {
          family: "field",
          registryItems: ["field"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
          ],
        },
        title: {
          family: "field",
          registryItems: ["field"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
          ],
        },
      },
      registryItems: ["field"],
    },
    form: {
      parts: {
        root: {
          registryItems: ["form"],
          states: [],
        },
      },
      registryItems: ["form"],
    },
    "gradient-editor": {
      parts: {
        root: {
          family: "gradient-editor",
          registryItems: ["gradient-editor"],
          states: [],
        },
        preview: {
          family: "gradient-editor",
          registryItems: ["gradient-editor"],
          states: [],
        },
        stop: {
          family: "gradient-editor",
          registryItems: ["gradient-editor"],
          states: [
            {
              attribute: "data-selected",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "stop-add": {
          family: "gradient-editor",
          registryItems: ["gradient-editor"],
          states: [],
        },
        track: {
          family: "gradient-editor",
          registryItems: ["gradient-editor"],
          states: [],
        },
      },
      registryItems: ["gradient-editor"],
    },
    "hover-card": {
      parts: {
        content: {
          family: "popup",
          registryItems: ["hover-card"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["hover-card"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        positioner: {
          family: "popup",
          registryItems: ["hover-card"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-anchor-hidden",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["hover-card"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
          ],
        },
        trigger: {
          family: "popup",
          registryItems: ["hover-card"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["hover-card"],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["hover-card"],
    },
    "infinite-canvas": {
      parts: {
        root: {
          family: "infinite-canvas",
          registryItems: ["infinite-canvas"],
          states: [
            {
              attribute: "data-panning",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        content: {
          family: "infinite-canvas",
          registryItems: ["infinite-canvas"],
          states: [
            {
              attribute: "data-scale",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
          ],
        },
        controls: {
          family: "infinite-canvas",
          registryItems: ["infinite-canvas"],
          states: [],
        },
      },
      registryItems: ["infinite-canvas"],
    },
    "inline-attachment": {
      parts: {
        root: {
          family: "inline-attachment",
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "pending", "ready"],
            },
          ],
        },
        action: {
          family: "inline-attachment",
          registryItems: ["inline-attachment"],
          states: [],
        },
        actions: {
          family: "inline-attachment",
          registryItems: ["inline-attachment"],
          states: [],
        },
        content: {
          family: "inline-attachment",
          registryItems: ["inline-attachment"],
          states: [],
        },
        description: {
          family: "inline-attachment",
          registryItems: ["inline-attachment"],
          states: [],
        },
        document: {
          family: "inline-attachment",
          registryItems: ["inline-attachment"],
          states: [],
        },
        "document-heading": {
          family: "inline-attachment",
          registryItems: ["inline-attachment"],
          states: [],
        },
        "document-line": {
          family: "inline-attachment",
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-width",
              source: "control-ui",
              valueKind: "enum",
              values: ["long", "longest", "medium", "short"],
            },
          ],
        },
        "document-sheet": {
          family: "inline-attachment",
          registryItems: ["inline-attachment"],
          states: [],
        },
        "document-stamp": {
          family: "inline-attachment",
          registryItems: ["inline-attachment"],
          states: [],
        },
        image: {
          family: "inline-attachment",
          registryItems: ["inline-attachment"],
          states: [],
        },
        "media-image": {
          family: "inline-attachment",
          registryItems: ["inline-attachment"],
          states: [],
        },
        placeholder: {
          family: "inline-attachment",
          registryItems: ["inline-attachment"],
          states: [],
        },
        title: {
          family: "inline-attachment",
          registryItems: ["inline-attachment"],
          states: [],
        },
      },
      registryItems: ["inline-attachment"],
    },
    "inline-citation": {
      parts: {
        root: {
          family: "inline-citation",
          registryItems: ["inline-citation"],
          states: [],
        },
        content: {
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-slide",
              source: "control-ui",
              valueKind: "enum",
              values: ["scope"],
            },
          ],
        },
        favicon: {
          registryItems: ["inline-citation"],
          states: [],
        },
        favicons: {
          family: "inline-citation",
          registryItems: ["inline-citation"],
          states: [],
        },
        label: {
          family: "inline-citation",
          registryItems: ["inline-citation"],
          states: [],
        },
        navigation: {
          family: "inline-citation",
          registryItems: ["inline-citation"],
          states: [],
        },
        next: {
          registryItems: ["inline-citation"],
          states: [],
        },
        position: {
          family: "inline-citation",
          registryItems: ["inline-citation"],
          states: [],
        },
        previous: {
          registryItems: ["inline-citation"],
          states: [],
        },
        source: {
          family: "inline-citation",
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-activation-direction",
              source: "control-ui",
              valueKind: "enum",
              values: ["left", "right"],
            },
            {
              attribute: "data-ending-style",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-slide",
              source: "control-ui",
              valueKind: "enum",
              values: ["panel"],
            },
            {
              attribute: "data-starting-style",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "source-description": {
          family: "inline-citation",
          registryItems: ["inline-citation"],
          states: [],
        },
        "source-external-icon": {
          family: "inline-citation",
          registryItems: ["inline-citation"],
          states: [],
        },
        "source-favicon": {
          registryItems: ["inline-citation"],
          states: [],
        },
        "source-header": {
          family: "inline-citation",
          registryItems: ["inline-citation"],
          states: [],
        },
        "source-hostname": {
          family: "inline-citation",
          registryItems: ["inline-citation"],
          states: [],
        },
        "source-quote": {
          family: "inline-citation",
          registryItems: ["inline-citation"],
          states: [],
        },
        "source-title": {
          family: "inline-citation",
          registryItems: ["inline-citation"],
          states: [],
        },
        trigger: {
          family: "inline-citation",
          registryItems: ["inline-citation"],
          states: [],
        },
      },
      registryItems: ["inline-citation"],
    },
    input: {
      parts: {
        root: {
          family: "field",
          registryItems: ["input"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg", "md", "sm", "xs"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["input"],
    },
    "input-group": {
      parts: {
        root: {
          family: "field",
          registryItems: ["input-group"],
          states: [
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg", "md", "sm", "xs"],
            },
          ],
        },
        addon: {
          family: "field",
          registryItems: ["input-group"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["input-group"],
            },
          ],
        },
        input: {
          family: "field",
          registryItems: ["input-group"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["input-group"],
            },
          ],
        },
      },
      registryItems: ["input-group"],
    },
    "input-otp": {
      parts: {
        root: {
          family: "field",
          registryItems: ["input-otp"],
          states: [
            {
              attribute: "data-complete",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["input-otp"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        separator: {
          family: "field",
          registryItems: ["input-otp"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["input-otp"],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        slot: {
          family: "field",
          registryItems: ["input-otp"],
          states: [
            {
              attribute: "data-complete",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["input-otp"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["input-otp"],
    },
    item: {
      parts: {
        root: {
          family: "item",
          registryItems: ["item"],
          states: [
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "muted", "outline"],
            },
          ],
        },
        actions: {
          family: "item",
          registryItems: ["item"],
          states: [],
        },
        content: {
          family: "item",
          registryItems: ["item"],
          states: [],
        },
        description: {
          family: "item",
          registryItems: ["item"],
          states: [],
        },
        footer: {
          family: "item",
          registryItems: ["item"],
          states: [],
        },
        group: {
          family: "item",
          registryItems: ["item"],
          states: [],
        },
        header: {
          family: "item",
          registryItems: ["item"],
          states: [],
        },
        media: {
          family: "item",
          registryItems: ["item"],
          states: [],
        },
        separator: {
          registryItems: ["item"],
          states: [],
        },
        title: {
          family: "item",
          registryItems: ["item"],
          states: [],
        },
      },
      registryItems: ["item"],
    },
    kbd: {
      parts: {
        root: {
          family: "kbd",
          registryItems: ["kbd"],
          states: [],
        },
        group: {
          family: "kbd",
          registryItems: ["kbd"],
          states: [],
        },
      },
      registryItems: ["kbd"],
    },
    label: {
      parts: {
        root: {
          family: "label",
          registryItems: ["label"],
          states: [],
        },
      },
      registryItems: ["label"],
    },
    markdown: {
      parts: {
        root: {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        blockquote: {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        emphasis: {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        h1: {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        h2: {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        h3: {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        "inline-code": {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        link: {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        "list-item": {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        "ordered-list": {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        paragraph: {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        separator: {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        strong: {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        table: {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        "table-cell": {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        "table-header": {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        "table-scroll": {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
        "unordered-list": {
          family: "markdown",
          registryItems: ["markdown"],
          states: [],
        },
      },
      registryItems: ["markdown"],
    },
    "markdown-block": {
      parts: {
        root: {
          family: "markdown-block",
          registryItems: ["markdown-block"],
          states: [],
        },
        content: {
          family: "markdown-block",
          registryItems: ["markdown-block"],
          states: [],
        },
        header: {
          family: "markdown-block",
          registryItems: ["markdown-block"],
          states: [],
        },
        title: {
          family: "markdown-block",
          registryItems: ["markdown-block"],
          states: [],
        },
        "title-icon": {
          family: "markdown-block",
          registryItems: ["markdown-block"],
          states: [],
        },
      },
      registryItems: ["markdown-block"],
    },
    menubar: {
      parts: {
        root: {
          family: "popup",
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-has-submenu-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-modal",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["menubar"],
            },
          ],
        },
        content: {
          family: "popup",
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-instant",
              source: "external",
              valueKind: "enum",
              values: ["click", "dismiss", "group", "trigger-change"],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["menubar"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        group: {
          family: "popup",
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["menubar"],
            },
          ],
        },
        item: {
          family: "popup",
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-highlighted",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["menubar"],
            },
          ],
        },
        label: {
          family: "popup",
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["menubar"],
            },
          ],
        },
        separator: {
          family: "popup",
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["menubar"],
            },
          ],
        },
        shortcut: {
          family: "popup",
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["menubar"],
            },
          ],
        },
        "sub-content": {
          family: "popup",
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-instant",
              source: "external",
              valueKind: "enum",
              values: ["click", "dismiss", "group", "trigger-change"],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["menubar"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "sub-trigger": {
          family: "popup",
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-highlighted",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["menubar"],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "sub-trigger-indicator": {
          family: "popup",
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["menubar"],
            },
          ],
        },
        trigger: {
          family: "button",
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-cursor",
              source: "control-ui",
              valueKind: "enum",
              values: ["default"],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-pressed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-shape",
              source: "control-ui",
              valueKind: "enum",
              values: ["default"],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["sm"],
            },
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["neutral"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["ghost"],
            },
          ],
        },
      },
      registryItems: ["menubar"],
    },
    meter: {
      parts: {
        root: {
          family: "range",
          registryItems: ["meter"],
          states: [
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["meter"],
            },
          ],
        },
        indicator: {
          family: "range",
          registryItems: ["meter"],
          states: [
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["meter"],
            },
          ],
        },
        label: {
          family: "range",
          registryItems: ["meter"],
          states: [
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["meter"],
            },
          ],
        },
        track: {
          family: "range",
          registryItems: ["meter"],
          states: [
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["meter"],
            },
          ],
        },
        value: {
          family: "range",
          registryItems: ["meter"],
          states: [
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["meter"],
            },
          ],
        },
      },
      registryItems: ["meter"],
    },
    "model-switcher": {
      parts: {
        root: {
          family: "button",
          registryItems: ["model-switcher"],
          states: [
            {
              attribute: "data-button-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["model-switcher"],
            },
          ],
        },
        hint: {
          family: "popup",
          registryItems: ["model-switcher"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["model-switcher"],
            },
          ],
        },
        indicator: {
          family: "button",
          registryItems: ["model-switcher"],
          states: [
            {
              attribute: "data-button-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["model-switcher"],
            },
          ],
        },
        value: {
          family: "button",
          registryItems: ["model-switcher"],
          states: [
            {
              attribute: "data-button-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["model-switcher"],
            },
          ],
        },
      },
      registryItems: ["model-switcher"],
    },
    "morphing-panel": {
      parts: {
        root: {
          family: "morphing-panel",
          registryItems: ["morphing-panel"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["closed", "open"],
            },
          ],
        },
        content: {
          family: "morphing-panel",
          registryItems: ["morphing-panel"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["closed", "open"],
            },
          ],
        },
        trigger: {
          registryItems: ["morphing-panel"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["closed", "open"],
            },
          ],
        },
      },
      registryItems: ["morphing-panel"],
    },
    "native-select": {
      parts: {
        root: {
          family: "field",
          registryItems: ["native-select"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["native-select"],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg", "md", "sm", "xs"],
            },
          ],
        },
        icon: {
          family: "field",
          registryItems: ["native-select"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["native-select"],
            },
          ],
        },
      },
      registryItems: ["native-select"],
    },
    "navigation-menu": {
      parts: {
        root: {
          family: "popup",
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["navigation-menu"],
            },
          ],
        },
        content: {
          family: "popup",
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-activation-direction",
              source: "external",
              valueKind: "enum",
              values: ["down", "left", "right", "up"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["navigation-menu"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        icon: {
          family: "popup",
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["navigation-menu"],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        item: {
          family: "popup",
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["navigation-menu"],
            },
          ],
        },
        link: {
          family: "popup",
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-active",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["navigation-menu"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["compact", "default"],
            },
          ],
        },
        list: {
          family: "popup",
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["navigation-menu"],
            },
          ],
        },
        popup: {
          family: "popup",
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-anchor-hidden",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["navigation-menu"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        positioner: {
          family: "popup",
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-anchor-hidden",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-instant",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["navigation-menu"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
          ],
        },
        trigger: {
          family: "button",
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-cursor",
              source: "control-ui",
              valueKind: "enum",
              values: ["default"],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-pressed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-shape",
              source: "control-ui",
              valueKind: "enum",
              values: ["default"],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["sm"],
            },
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["neutral"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["quiet"],
            },
          ],
        },
        viewport: {
          family: "popup",
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["navigation-menu"],
            },
          ],
        },
      },
      registryItems: ["navigation-menu"],
    },
    "number-field": {
      parts: {
        decrement: {
          family: "field",
          registryItems: ["number-field"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["number-field"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-scrubbing",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "drag-icon": {
          family: "field",
          registryItems: ["number-field"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["number-field"],
            },
          ],
        },
        group: {
          family: "field",
          registryItems: ["number-field"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["number-field"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-scrubbing",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg", "md", "sm", "xs"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        increment: {
          family: "field",
          registryItems: ["number-field"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["number-field"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-scrubbing",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        input: {
          family: "field",
          registryItems: ["number-field"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["number-field"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-scrubbing",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "scrub-area": {
          family: "field",
          registryItems: ["number-field"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["number-field"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-scrubbing",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "scrub-cursor": {
          family: "field",
          registryItems: ["number-field"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["number-field"],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-scrubbing",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["number-field"],
    },
    pagination: {
      parts: {
        root: {
          family: "pagination",
          registryItems: ["pagination"],
          states: [],
        },
        content: {
          family: "pagination",
          registryItems: ["pagination"],
          states: [],
        },
        ellipsis: {
          family: "pagination",
          registryItems: ["pagination"],
          states: [],
        },
        item: {
          family: "pagination",
          registryItems: ["pagination"],
          states: [],
        },
        link: {
          family: "pagination",
          registryItems: ["pagination"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["pagination"],
    },
    "phone-input": {
      parts: {
        check: {
          family: "phone-input",
          registryItems: ["phone-input"],
          states: [
            {
              attribute: "data-visible",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        chevron: {
          family: "phone-input",
          registryItems: ["phone-input"],
          states: [
            {
              attribute: "data-open",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "country-code": {
          family: "phone-input",
          registryItems: ["phone-input"],
          states: [],
        },
        "country-trigger": {
          family: "phone-input",
          registryItems: ["phone-input"],
          states: [],
        },
        flag: {
          family: "phone-input",
          registryItems: ["phone-input"],
          states: [],
        },
        metadata: {
          family: "phone-input",
          registryItems: ["phone-input"],
          states: [],
        },
      },
      registryItems: ["phone-input"],
    },
    popover: {
      parts: {
        close: {
          family: "popup",
          registryItems: ["popover"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["popover"],
            },
          ],
        },
        content: {
          family: "popup",
          registryItems: ["popover"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-instant",
              source: "external",
              valueKind: "enum",
              values: ["click", "dismiss", "focus", "trigger-change"],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-padding",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "none"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["popover"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        description: {
          family: "popup",
          registryItems: ["popover"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["popover"],
            },
          ],
        },
        header: {
          family: "popup",
          registryItems: ["popover"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["popover"],
            },
          ],
        },
        title: {
          family: "popup",
          registryItems: ["popover"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["popover"],
            },
          ],
        },
        trigger: {
          registryItems: ["popover"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["popover"],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-pressed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["popover"],
    },
    progress: {
      parts: {
        root: {
          family: "range",
          registryItems: ["progress"],
          states: [
            {
              attribute: "data-complete",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-indeterminate",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-progressing",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["progress"],
            },
          ],
        },
        indicator: {
          family: "range",
          registryItems: ["progress"],
          states: [
            {
              attribute: "data-complete",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-indeterminate",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-progressing",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["progress"],
            },
          ],
        },
        label: {
          family: "range",
          registryItems: ["progress"],
          states: [
            {
              attribute: "data-complete",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-indeterminate",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-progressing",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["progress"],
            },
          ],
        },
        track: {
          family: "range",
          registryItems: ["progress"],
          states: [
            {
              attribute: "data-complete",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-indeterminate",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-progressing",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["progress"],
            },
          ],
        },
        value: {
          family: "range",
          registryItems: ["progress"],
          states: [
            {
              attribute: "data-complete",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-indeterminate",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-progressing",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["progress"],
            },
          ],
        },
      },
      registryItems: ["progress"],
    },
    "radio-group": {
      parts: {
        root: {
          family: "choice",
          registryItems: ["radio-group"],
          states: [
            {
              attribute: "data-choice-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["radio-group"],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        indicator: {
          family: "choice",
          registryItems: ["radio-group"],
          states: [
            {
              attribute: "data-checked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-choice-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["radio-group"],
            },
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-unchecked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        item: {
          family: "choice",
          registryItems: ["radio-group"],
          states: [
            {
              attribute: "data-checked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-choice-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["radio-group"],
            },
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-unchecked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["radio-group"],
    },
    resizable: {
      parts: {
        handle: {
          family: "resizable",
          registryItems: ["resizable"],
          states: [
            {
              attribute: "data-axis",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-separator",
              source: "external",
              valueKind: "enum",
              values: ["active", "disabled", "focus", "hover"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["hover", "solid"],
            },
          ],
        },
        "handle-grip": {
          family: "resizable",
          registryItems: ["resizable"],
          states: [
            {
              attribute: "data-axis",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["hover", "solid"],
            },
          ],
        },
        panel: {
          family: "resizable",
          registryItems: ["resizable"],
          states: [],
        },
        "panel-group": {
          family: "resizable",
          registryItems: ["resizable"],
          states: [
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["framed", "nested"],
            },
          ],
        },
      },
      registryItems: ["resizable"],
    },
    "rich-tooltip": {
      parts: {
        arrow: {
          family: "popup",
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["accent", "surface"],
            },
            {
              attribute: "data-uncentered",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        close: {
          family: "popup",
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        content: {
          family: "popup",
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-instant",
              source: "external",
              valueKind: "enum",
              values: ["click", "dismiss", "focus", "trigger-change"],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["accent", "surface"],
            },
          ],
        },
        description: {
          family: "popup",
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["accent", "surface"],
            },
          ],
        },
        dot: {
          family: "popup",
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        footer: {
          family: "popup",
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        header: {
          family: "popup",
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        media: {
          family: "popup",
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        next: {
          family: "popup",
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        positioner: {
          family: "popup",
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-anchor-hidden",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
          ],
        },
        previous: {
          family: "popup",
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        progress: {
          family: "popup",
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["accent", "surface"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["count", "dots"],
            },
          ],
        },
        title: {
          family: "popup",
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        trigger: {
          family: "popup",
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-pressed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["rich-tooltip"],
    },
    "scroll-area": {
      parts: {
        root: {
          family: "scroll-area",
          registryItems: ["scroll-area"],
          states: [
            {
              attribute: "data-has-overflow-x",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-has-overflow-y",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-x-end",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-x-start",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-y-end",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-y-start",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-scrolling",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        content: {
          family: "scroll-area",
          registryItems: ["scroll-area"],
          states: [
            {
              attribute: "data-has-overflow-x",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-has-overflow-y",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-x-end",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-x-start",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-y-end",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-y-start",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-scrolling",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        corner: {
          family: "scroll-area",
          registryItems: ["scroll-area"],
          states: [],
        },
        scrollbar: {
          family: "scroll-area",
          registryItems: ["scroll-area"],
          states: [
            {
              attribute: "data-has-overflow-x",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-has-overflow-y",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-hovering",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-overflow-x-end",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-x-start",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-y-end",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-y-start",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-scrolling",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-visibility",
              source: "control-ui",
              valueKind: "enum",
              values: ["always", "hover", "scroll"],
            },
          ],
        },
        thumb: {
          family: "scroll-area",
          registryItems: ["scroll-area"],
          states: [
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-scrolling",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        viewport: {
          family: "scroll-area",
          registryItems: ["scroll-area"],
          states: [
            {
              attribute: "data-has-overflow-x",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-has-overflow-y",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-x-end",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-x-start",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-y-end",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-overflow-y-start",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-scrolling",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["scroll-area"],
    },
    select: {
      parts: {
        content: {
          family: "popup",
          registryItems: ["select"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["select"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "none", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        icon: {
          family: "popup",
          registryItems: ["select"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["select"],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        item: {
          family: "popup",
          registryItems: ["select"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-highlighted",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["select"],
            },
            {
              attribute: "data-selected",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "item-indicator": {
          family: "popup",
          registryItems: ["select"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["select"],
            },
          ],
        },
        trigger: {
          family: "button",
          registryItems: ["select"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-placeholder",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["select"],
            },
            {
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-pressed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-shape",
              source: "control-ui",
              valueKind: "enum",
              values: ["default"],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg", "md", "sm", "xs"],
            },
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["neutral"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["ghost", "surface"],
            },
          ],
        },
      },
      registryItems: ["select"],
    },
    separator: {
      parts: {
        root: {
          family: "separator",
          registryItems: ["separator"],
          states: [
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
      },
      registryItems: ["separator"],
    },
    sheet: {
      parts: {
        backdrop: {
          family: "popup",
          registryItems: ["sheet"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["sheet"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        close: {
          family: "popup",
          registryItems: ["sheet"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["sheet"],
            },
          ],
        },
        content: {
          family: "popup",
          registryItems: ["sheet"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-nested",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-nested-dialog-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["sheet"],
            },
            {
              attribute: "data-side",
              source: "control-ui",
              valueKind: "enum",
              values: ["left", "right"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        description: {
          family: "popup",
          registryItems: ["sheet"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["sheet"],
            },
          ],
        },
        header: {
          family: "popup",
          registryItems: ["sheet"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["sheet"],
            },
          ],
        },
        title: {
          family: "popup",
          registryItems: ["sheet"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["sheet"],
            },
          ],
        },
      },
      registryItems: ["sheet"],
    },
    sidebar: {
      parts: {
        root: {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-collapsible",
              source: "control-ui",
              valueKind: "enum",
              values: ["icon", "none", "offcanvas"],
            },
            {
              attribute: "data-side",
              source: "control-ui",
              valueKind: "enum",
              values: ["left", "right"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["collapsed", "expanded"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["floating", "inset", "sidebar"],
            },
          ],
        },
        container: {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [],
        },
        content: {
          registryItems: ["sidebar"],
          states: [],
        },
        footer: {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [],
        },
        gap: {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [],
        },
        group: {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [],
        },
        "group-label": {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [],
        },
        header: {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [],
        },
        inner: {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [],
        },
        inset: {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [],
        },
        menu: {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-indicator",
              source: "control-ui",
              valueKind: "enum",
              values: ["none", "slide"],
            },
          ],
        },
        "menu-button": {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "lg", "sm"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "outline"],
            },
          ],
        },
        "menu-item": {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [],
        },
        "menu-track": {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-indicator",
              source: "control-ui",
              valueKind: "enum",
              values: ["none", "slide"],
            },
          ],
        },
        rail: {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [],
        },
        trigger: {
          registryItems: ["sidebar"],
          states: [],
        },
        wrapper: {
          family: "sidebar",
          registryItems: ["sidebar"],
          states: [],
        },
      },
      registryItems: ["sidebar"],
    },
    "sidebar-layout": {
      parts: {
        content: {
          family: "sidebar-layout",
          registryItems: ["sidebar-layout-block"],
          states: [],
        },
      },
      registryItems: ["sidebar-layout-block"],
    },
    skeleton: {
      parts: {
        root: {
          family: "skeleton",
          registryItems: ["skeleton"],
          states: [],
        },
      },
      registryItems: ["skeleton"],
    },
    slider: {
      parts: {
        root: {
          family: "range",
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dragging",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-labeled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["slider"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "plain"],
            },
          ],
        },
        control: {
          family: "range",
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dragging",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["slider"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        indicator: {
          family: "range",
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dragging",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["slider"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "plain"],
            },
          ],
        },
        label: {
          family: "range",
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["slider"],
            },
          ],
        },
        thumb: {
          family: "range",
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dragging",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-index",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["slider"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "plain"],
            },
          ],
        },
        tick: {
          family: "range",
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["slider"],
            },
          ],
        },
        track: {
          family: "range",
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dragging",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["slider"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "plain"],
            },
          ],
        },
        value: {
          family: "range",
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dragging",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["slider"],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["slider"],
    },
    "source-badge": {
      parts: {
        root: {
          registryItems: ["source-badge"],
          states: [
            {
              attribute: "data-source-badge",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-source-badge-favicon",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        label: {
          registryItems: ["source-badge"],
          states: [],
        },
      },
      registryItems: ["source-badge"],
    },
    spinner: {
      parts: {
        root: {
          family: "spinner",
          registryItems: ["spinner"],
          states: [],
        },
        indicator: {
          family: "spinner",
          registryItems: ["spinner"],
          states: [],
        },
      },
      registryItems: ["spinner"],
    },
    stepper: {
      parts: {
        root: {
          family: "stepper",
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-content-mode",
              source: "control-ui",
              valueKind: "enum",
              values: ["all", "current"],
            },
            {
              attribute: "data-orientation",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-responsive",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        content: {
          family: "stepper",
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["active", "inactive"],
            },
          ],
        },
        description: {
          family: "stepper",
          registryItems: ["stepper"],
          states: [],
        },
        indicator: {
          family: "stepper",
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-invalid",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["complete", "current", "neutral", "upcoming"],
            },
          ],
        },
        item: {
          family: "stepper",
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-disabled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["complete", "current", "neutral", "upcoming"],
            },
            {
              attribute: "data-step",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
          ],
        },
        list: {
          family: "stepper",
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-orientation",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        separator: {
          family: "stepper",
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-invalid",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["complete", "current", "neutral", "upcoming"],
            },
          ],
        },
        title: {
          family: "stepper",
          registryItems: ["stepper"],
          states: [],
        },
        trigger: {
          family: "stepper",
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-invalid",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["complete", "current", "neutral", "upcoming"],
            },
          ],
        },
      },
      registryItems: ["stepper"],
    },
    switch: {
      parts: {
        root: {
          family: "switch",
          registryItems: ["switch"],
          states: [
            {
              attribute: "data-checked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-unchecked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        thumb: {
          family: "switch",
          registryItems: ["switch"],
          states: [
            {
              attribute: "data-checked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-dirty",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-filled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focused",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-invalid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-readonly",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-required",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-touched",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-unchecked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-valid",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "thumb-icon": {
          family: "switch",
          registryItems: ["switch"],
          states: [
            {
              attribute: "data-switch-icon",
              source: "control-ui",
              valueKind: "enum",
              values: ["checked", "unchecked"],
            },
          ],
        },
      },
      registryItems: ["switch"],
    },
    table: {
      parts: {
        root: {
          family: "table",
          registryItems: ["table"],
          states: [],
        },
        body: {
          family: "table",
          registryItems: ["table"],
          states: [],
        },
        caption: {
          family: "table",
          registryItems: ["table"],
          states: [],
        },
        cell: {
          family: "table",
          registryItems: ["table"],
          states: [],
        },
        container: {
          family: "table",
          registryItems: ["table"],
          states: [],
        },
        footer: {
          family: "table",
          registryItems: ["table"],
          states: [],
        },
        head: {
          family: "table",
          registryItems: ["table"],
          states: [],
        },
        header: {
          family: "table",
          registryItems: ["table"],
          states: [],
        },
        row: {
          family: "table",
          registryItems: ["table"],
          states: [],
        },
      },
      registryItems: ["table"],
    },
    "table-of-contents": {
      parts: {
        root: {
          family: "table-of-contents",
          registryItems: ["table-of-contents"],
          states: [
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["background", "both", "trail"],
            },
          ],
        },
        item: {
          family: "table-of-contents",
          registryItems: ["table-of-contents"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-depth",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
            {
              attribute: "data-level",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["background", "both", "trail"],
            },
          ],
        },
        label: {
          family: "table-of-contents",
          registryItems: ["table-of-contents"],
          states: [],
        },
        list: {
          family: "table-of-contents",
          registryItems: ["table-of-contents"],
          states: [
            {
              attribute: "data-nested",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        rail: {
          family: "table-of-contents",
          registryItems: ["table-of-contents"],
          states: [],
        },
        track: {
          family: "table-of-contents",
          registryItems: ["table-of-contents"],
          states: [],
        },
        trail: {
          family: "table-of-contents",
          registryItems: ["table-of-contents"],
          states: [],
        },
      },
      registryItems: ["table-of-contents"],
    },
    tabs: {
      parts: {
        root: {
          family: "tabs",
          registryItems: ["tabs"],
          states: [
            {
              attribute: "data-activation-direction",
              source: "external",
              valueKind: "enum",
              values: ["down", "left", "none", "right", "up"],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-slide",
              source: "control-ui",
              valueKind: "enum",
              values: ["scope"],
            },
          ],
        },
        indicator: {
          family: "tabs",
          registryItems: ["tabs"],
          states: [
            {
              attribute: "data-activation-direction",
              source: "external",
              valueKind: "enum",
              values: ["down", "left", "none", "right", "up"],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        list: {
          family: "tabs",
          registryItems: ["tabs"],
          states: [
            {
              attribute: "data-activation-direction",
              source: "external",
              valueKind: "enum",
              values: ["down", "left", "none", "right", "up"],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-single",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg", "md", "sm", "xs"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["browser", "default"],
            },
          ],
        },
        panel: {
          family: "tabs",
          registryItems: ["tabs"],
          states: [
            {
              attribute: "data-activation-direction",
              source: "external",
              valueKind: "enum",
              values: ["down", "left", "none", "right", "up"],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-hidden",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-index",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-slide",
              source: "control-ui",
              valueKind: "enum",
              values: ["panel"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        tab: {
          family: "tabs",
          registryItems: ["tabs"],
          states: [
            {
              attribute: "aria-selected",
              source: "external",
              valueKind: "enum",
              values: ["false", "true"],
            },
            {
              attribute: "data-activation-direction",
              source: "external",
              valueKind: "enum",
              values: ["down", "left", "none", "right", "up"],
            },
            {
              attribute: "data-active",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
      },
      registryItems: ["tabs"],
    },
    "task-list": {
      parts: {
        root: {
          family: "task-list",
          registryItems: ["task-list"],
          states: [],
        },
        chevron: {
          family: "task-list",
          registryItems: ["task-list"],
          states: [],
        },
        item: {
          family: "task-list",
          registryItems: ["task-list"],
          states: [
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["active", "completed", "pending"],
            },
          ],
        },
        "item-indicator": {
          family: "task-list",
          registryItems: ["task-list"],
          states: [
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["active", "completed", "pending"],
            },
          ],
        },
        items: {
          family: "task-list",
          registryItems: ["task-list"],
          states: [],
        },
        label: {
          family: "task-list",
          registryItems: ["task-list"],
          states: [],
        },
        progress: {
          family: "task-list",
          registryItems: ["task-list"],
          states: [],
        },
        trigger: {
          family: "task-list",
          registryItems: ["task-list"],
          states: [],
        },
      },
      registryItems: ["task-list"],
    },
    textarea: {
      parts: {
        root: {
          family: "field",
          registryItems: ["textarea"],
          states: [
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["textarea"],
            },
          ],
        },
      },
      registryItems: ["textarea"],
    },
    "thread-rail": {
      parts: {
        root: {
          family: "thread-rail",
          registryItems: ["thread-rail"],
          states: [],
        },
        file: {
          family: "thread-rail",
          registryItems: ["thread-rail"],
          states: [],
        },
        "file-icon": {
          family: "thread-rail",
          registryItems: ["thread-rail"],
          states: [],
        },
        footer: {
          family: "thread-rail",
          registryItems: ["thread-rail"],
          states: [],
        },
        item: {
          family: "thread-rail",
          registryItems: ["thread-rail"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-from",
              source: "control-ui",
              valueKind: "enum",
              values: ["assistant", "system", "tool", "user"],
            },
            {
              attribute: "data-in-view",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-rail-current",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        line: {
          family: "thread-rail",
          registryItems: ["thread-rail"],
          states: [],
        },
        more: {
          family: "thread-rail",
          registryItems: ["thread-rail"],
          states: [],
        },
        popover: {
          family: "thread-rail",
          registryItems: ["thread-rail"],
          states: [],
        },
        "popover-layer": {
          family: "thread-rail",
          registryItems: ["thread-rail"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        summary: {
          family: "thread-rail",
          registryItems: ["thread-rail"],
          states: [],
        },
        title: {
          family: "thread-rail",
          registryItems: ["thread-rail"],
          states: [],
        },
      },
      registryItems: ["thread-rail"],
    },
    timeline: {
      parts: {
        root: {
          family: "timeline",
          registryItems: ["timeline"],
          states: [],
        },
        content: {
          family: "timeline",
          registryItems: ["timeline"],
          states: [],
        },
        description: {
          family: "timeline",
          registryItems: ["timeline"],
          states: [],
        },
        indicator: {
          family: "timeline",
          registryItems: ["timeline"],
          states: [],
        },
        item: {
          family: "timeline",
          registryItems: ["timeline"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "neutral", "pending", "running", "success"],
            },
          ],
        },
        meta: {
          family: "timeline",
          registryItems: ["timeline"],
          states: [],
        },
        separator: {
          family: "timeline",
          registryItems: ["timeline"],
          states: [],
        },
        title: {
          family: "timeline",
          registryItems: ["timeline"],
          states: [],
        },
      },
      registryItems: ["timeline"],
    },
    toast: {
      parts: {
        root: {
          family: "popup",
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-expanded",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-limited",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["toast"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-swipe-direction",
              source: "external",
              valueKind: "enum",
              values: ["down", "left", "right", "up"],
            },
            {
              attribute: "data-swiping",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-type",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        action: {
          family: "popup",
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["toast"],
            },
            {
              attribute: "data-type",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        close: {
          family: "popup",
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["toast"],
            },
            {
              attribute: "data-type",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        content: {
          family: "popup",
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-behind",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-expanded",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["toast"],
            },
          ],
        },
        description: {
          family: "popup",
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["toast"],
            },
            {
              attribute: "data-type",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        indicator: {
          family: "popup",
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["toast"],
            },
          ],
        },
        title: {
          family: "popup",
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["toast"],
            },
            {
              attribute: "data-type",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        viewport: {
          family: "popup",
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-expanded",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["toast"],
            },
          ],
        },
      },
      registryItems: ["toast"],
    },
    toggle: {
      parts: {
        root: {
          family: "button",
          registryItems: ["toggle"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg", "md", "sm", "xs"],
            },
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["danger", "neutral", "primary"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["ghost", "quiet", "solid", "surface"],
            },
          ],
        },
        check: {
          registryItems: ["toggle"],
          states: [],
        },
        content: {
          family: "button",
          registryItems: ["toggle"],
          states: [],
        },
        group: {
          registryItems: ["toggle"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-multiple",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
      },
      registryItems: ["toggle"],
    },
    toolbar: {
      parts: {
        root: {
          family: "toolbar",
          registryItems: ["toolbar"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "inverse"],
            },
          ],
        },
        button: {
          family: "toolbar",
          registryItems: ["toolbar"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focusable",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-icon-only",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["sm"],
            },
          ],
        },
        group: {
          family: "toolbar",
          registryItems: ["toolbar"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        input: {
          family: "toolbar",
          registryItems: ["toolbar"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-focusable",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["sm"],
            },
          ],
        },
        link: {
          family: "toolbar",
          registryItems: ["toolbar"],
          states: [
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["sm"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "track"],
            },
          ],
        },
        separator: {
          family: "toolbar",
          registryItems: ["toolbar"],
          states: [
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
      },
      registryItems: ["toolbar"],
    },
    tooltip: {
      parts: {
        arrow: {
          family: "popup",
          registryItems: ["tooltip"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-instant",
              source: "external",
              valueKind: "enum",
              values: ["delay", "dismiss", "focus"],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["tooltip"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-uncentered",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "arrow-shape": {
          family: "popup",
          registryItems: ["tooltip"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["tooltip"],
            },
          ],
        },
        content: {
          family: "popup",
          registryItems: ["tooltip"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-arrow",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-instant",
              source: "external",
              valueKind: "enum",
              values: ["delay", "dismiss", "focus"],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["tooltip"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        positioner: {
          family: "popup",
          registryItems: ["tooltip"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-anchor-hidden",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["tooltip"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
          ],
        },
      },
      registryItems: ["tooltip"],
    },
    "track-highlight": {
      parts: {
        root: {
          family: "track-highlight",
          registryItems: ["track-highlight"],
          states: [],
        },
        hover: {
          family: "track-highlight",
          registryItems: ["track-highlight"],
          states: [],
        },
      },
      registryItems: ["track-highlight"],
    },
    "transcript-divider": {
      parts: {
        root: {
          family: "transcript-divider",
          registryItems: ["transcript-divider"],
          states: [
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["danger", "neutral", "success", "warning"],
            },
          ],
        },
        label: {
          family: "transcript-divider",
          registryItems: ["transcript-divider"],
          states: [],
        },
      },
      registryItems: ["transcript-divider"],
    },
    tree: {
      parts: {
        root: {
          family: "tree",
          registryItems: ["tree"],
          states: [
            {
              attribute: "data-indicator",
              source: "control-ui",
              valueKind: "enum",
              values: ["none", "slide"],
            },
          ],
        },
        item: {
          family: "tree",
          registryItems: ["tree"],
          states: [
            {
              attribute: "data-disabled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-label",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
            {
              attribute: "data-selected",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-value",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
          ],
        },
        "item-content": {
          family: "tree",
          registryItems: ["tree"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["closed", "open"],
            },
          ],
        },
        "item-group": {
          family: "tree",
          registryItems: ["tree"],
          states: [],
        },
        "item-indicator": {
          family: "tree",
          registryItems: ["tree"],
          states: [
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["closed", "open"],
            },
          ],
        },
        "item-label": {
          family: "tree",
          registryItems: ["tree"],
          states: [],
        },
        "item-trigger": {
          family: "tree",
          registryItems: ["tree"],
          states: [
            {
              attribute: "data-selected",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["closed", "open"],
            },
          ],
        },
        track: {
          family: "tree",
          registryItems: ["tree"],
          states: [
            {
              attribute: "data-indicator",
              source: "control-ui",
              valueKind: "enum",
              values: ["none", "slide"],
            },
          ],
        },
      },
      registryItems: ["tree"],
    },
    "trigger-menu": {
      parts: {
        root: {
          family: "popup",
          registryItems: ["trigger-menu"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-ending-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-instant",
              source: "external",
              valueKind: "enum",
              values: ["click", "dismiss", "focus", "trigger-change"],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger-menu"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
            {
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        empty: {
          family: "popup",
          registryItems: ["trigger-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger-menu"],
            },
          ],
        },
        group: {
          family: "popup",
          registryItems: ["trigger-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger-menu"],
            },
          ],
        },
        "group-label": {
          family: "popup",
          registryItems: ["trigger-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger-menu"],
            },
          ],
        },
        icon: {
          family: "popup",
          registryItems: ["trigger-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger-menu"],
            },
          ],
        },
        item: {
          family: "popup",
          registryItems: ["trigger-menu"],
          states: [
            {
              attribute: "data-disabled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-highlighted",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger-menu"],
            },
          ],
        },
        list: {
          family: "popup",
          registryItems: ["trigger-menu"],
          states: [
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger-menu"],
            },
          ],
        },
        positioner: {
          family: "popup",
          registryItems: ["trigger-menu"],
          states: [
            {
              attribute: "data-align",
              source: "external",
              valueKind: "enum",
              values: ["center", "end", "start"],
            },
            {
              attribute: "data-anchor-hidden",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger-menu"],
            },
            {
              attribute: "data-side",
              source: "external",
              valueKind: "enum",
              values: ["bottom", "inline-end", "inline-start", "left", "right", "top"],
            },
          ],
        },
      },
      registryItems: ["trigger-menu"],
    },
    "user-ask": {
      parts: {
        root: {
          family: "user-ask",
          registryItems: ["user-ask"],
          states: [],
        },
        dismiss: {
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-user-ask-dismiss",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        footer: {
          family: "user-ask",
          registryItems: ["user-ask"],
          states: [],
        },
        "freeform-label": {
          family: "user-ask",
          registryItems: ["user-ask"],
          states: [],
        },
        header: {
          family: "user-ask",
          registryItems: ["user-ask"],
          states: [],
        },
        option: {
          family: "user-ask",
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-freeform",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-recommended",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-selected",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "option-description": {
          family: "user-ask",
          registryItems: ["user-ask"],
          states: [],
        },
        "option-indicator": {
          family: "user-ask",
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-selected",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "option-input": {
          family: "user-ask",
          registryItems: ["user-ask"],
          states: [],
        },
        "option-label": {
          family: "user-ask",
          registryItems: ["user-ask"],
          states: [],
        },
        pagination: {
          family: "user-ask",
          registryItems: ["user-ask"],
          states: [],
        },
        "pagination-count": {
          family: "user-ask",
          registryItems: ["user-ask"],
          states: [],
        },
        question: {
          family: "user-ask",
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        recommended: {
          family: "user-ask",
          registryItems: ["user-ask"],
          states: [],
        },
        submit: {
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-user-ask-submit",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        title: {
          family: "user-ask",
          registryItems: ["user-ask"],
          states: [],
        },
      },
      registryItems: ["user-ask"],
    },
  },
  adornments: {
    button: {
      layer: {
        context: {
          tone: "ControlTone",
          variant: "ControlVariant",
        },
      },
    },
    "chat-composer": {
      "send-layer": {
        context: {
          sendCount: "number",
        },
      },
    },
    "chat-layout": {
      titlebar: {
        context: {},
      },
    },
    "chat-thought": {
      details: {
        context: {},
      },
    },
    dialog: {
      titlebar: {
        context: {},
      },
    },
  },
  semanticFamilies: {
    popup: {
      backdrop: [
        {
          scope: "alert-dialog",
          part: "backdrop",
        },
        {
          scope: "dialog",
          part: "backdrop",
        },
        {
          scope: "drawer",
          part: "backdrop",
        },
        {
          scope: "sheet",
          part: "backdrop",
        },
      ],
      bar: [
        {
          scope: "menubar",
          part: "root",
        },
      ],
      item: [
        {
          scope: "autocomplete",
          part: "item",
        },
        {
          scope: "combobox",
          part: "item",
        },
        {
          scope: "command",
          part: "item",
        },
        {
          scope: "context-menu",
          part: "checkbox-item",
        },
        {
          scope: "context-menu",
          part: "item",
        },
        {
          scope: "context-menu",
          part: "radio-item",
        },
        {
          scope: "context-menu",
          part: "sub-trigger",
        },
        {
          scope: "dropdown-menu",
          part: "item",
        },
        {
          scope: "menubar",
          part: "item",
        },
        {
          scope: "menubar",
          part: "sub-trigger",
        },
        {
          scope: "select",
          part: "item",
        },
        {
          scope: "trigger-menu",
          part: "item",
        },
      ],
      label: [
        {
          scope: "autocomplete",
          part: "group-label",
        },
        {
          scope: "combobox",
          part: "group-label",
        },
        {
          scope: "context-menu",
          part: "label",
        },
        {
          scope: "dropdown-menu",
          part: "label",
        },
        {
          scope: "menubar",
          part: "label",
        },
        {
          scope: "trigger-menu",
          part: "group-label",
        },
      ],
      "list-content": [
        {
          scope: "autocomplete",
          part: "list",
        },
        {
          scope: "combobox",
          part: "list",
        },
        {
          scope: "trigger-menu",
          part: "list",
        },
      ],
      "list-surface": [
        {
          scope: "autocomplete",
          part: "content",
        },
        {
          scope: "combobox",
          part: "content",
        },
        {
          scope: "context-menu",
          part: "content",
        },
        {
          scope: "context-menu",
          part: "sub-content",
        },
        {
          scope: "dropdown-menu",
          part: "content",
        },
        {
          scope: "menubar",
          part: "content",
        },
        {
          scope: "menubar",
          part: "sub-content",
        },
        {
          scope: "select",
          part: "content",
        },
        {
          scope: "trigger-menu",
          part: "root",
        },
      ],
      "navigation-link": [
        {
          scope: "navigation-menu",
          part: "link",
        },
      ],
      separator: [
        {
          scope: "command",
          part: "separator",
        },
        {
          scope: "context-menu",
          part: "separator",
        },
        {
          scope: "dropdown-menu",
          part: "separator",
        },
        {
          scope: "menubar",
          part: "separator",
        },
      ],
      shortcut: [
        {
          scope: "command",
          part: "shortcut",
        },
        {
          scope: "context-menu",
          part: "shortcut",
        },
        {
          scope: "menubar",
          part: "shortcut",
        },
      ],
      surface: [
        {
          scope: "alert-dialog",
          part: "content",
        },
        {
          scope: "color-picker",
          part: "content",
        },
        {
          scope: "color-picker",
          part: "panel",
        },
        {
          scope: "command",
          part: "root",
        },
        {
          scope: "dialog",
          part: "content",
        },
        {
          scope: "drawer",
          part: "content",
        },
        {
          scope: "hover-card",
          part: "content",
        },
        {
          scope: "navigation-menu",
          part: "viewport",
        },
        {
          scope: "popover",
          part: "content",
        },
        {
          scope: "rich-tooltip",
          part: "content",
        },
        {
          scope: "sheet",
          part: "content",
        },
        {
          scope: "toast",
          part: "root",
        },
        {
          scope: "tooltip",
          part: "content",
        },
      ],
    },
    controls: [
      {
        scope: "autocomplete",
        part: "input",
      },
      {
        scope: "button",
        part: "root",
      },
      {
        scope: "code-diff",
        part: "expand-button",
      },
      {
        scope: "combobox",
        part: "input",
      },
      {
        scope: "dropdown-menu",
        part: "trigger",
      },
      {
        scope: "field",
        part: "control",
      },
      {
        scope: "input-group",
        part: "root",
      },
      {
        scope: "input-otp",
        part: "slot",
      },
      {
        scope: "input",
        part: "root",
      },
      {
        scope: "menubar",
        part: "trigger",
      },
      {
        scope: "native-select",
        part: "root",
      },
      {
        scope: "navigation-menu",
        part: "trigger",
      },
      {
        scope: "number-field",
        part: "group",
      },
      {
        scope: "pagination",
        part: "link",
      },
      {
        scope: "select",
        part: "trigger",
      },
      {
        scope: "textarea",
        part: "root",
      },
      {
        scope: "toggle",
        part: "root",
      },
      {
        scope: "toolbar",
        part: "button",
      },
      {
        scope: "toolbar",
        part: "input",
      },
      {
        scope: "toolbar",
        part: "link",
      },
    ],
    surfaces: {
      floating: [
        {
          scope: "autocomplete",
          part: "content",
        },
        {
          scope: "color-picker",
          part: "content",
        },
        {
          scope: "color-picker",
          part: "panel",
        },
        {
          scope: "combobox",
          part: "content",
        },
        {
          scope: "context-menu",
          part: "content",
        },
        {
          scope: "context-menu",
          part: "sub-content",
        },
        {
          scope: "dropdown-menu",
          part: "content",
        },
        {
          scope: "hover-card",
          part: "content",
        },
        {
          scope: "menubar",
          part: "content",
        },
        {
          scope: "menubar",
          part: "sub-content",
        },
        {
          scope: "navigation-menu",
          part: "viewport",
        },
        {
          scope: "popover",
          part: "content",
        },
        {
          scope: "rich-tooltip",
          part: "content",
        },
        {
          scope: "select",
          part: "content",
        },
        {
          scope: "thread-rail",
          part: "popover",
        },
        {
          scope: "toast",
          part: "root",
        },
        {
          scope: "trigger-menu",
          part: "root",
        },
      ],
      modal: [
        {
          scope: "alert-dialog",
          part: "content",
        },
        {
          scope: "dialog",
          part: "content",
        },
        {
          scope: "drawer",
          part: "content",
        },
        {
          scope: "sheet",
          part: "content",
        },
      ],
      panel: [
        {
          scope: "alert",
          part: "root",
        },
        {
          scope: "card",
          part: "root",
        },
        {
          scope: "chat-composer-attachment",
          part: "root",
        },
        {
          scope: "chat-layout",
          part: "root",
        },
        {
          scope: "code-block-editor",
          part: "root",
        },
        {
          scope: "code-diff",
          part: "root",
        },
        {
          scope: "code",
          part: "root",
        },
        {
          scope: "command",
          part: "root",
        },
        {
          scope: "dockable-panel",
          part: "drop-zone",
        },
        {
          scope: "dockable-panel",
          part: "root",
        },
        {
          scope: "environment-variables",
          part: "root",
        },
        {
          scope: "inline-attachment",
          part: "root",
        },
        {
          scope: "markdown-block",
          part: "root",
        },
        {
          scope: "morphing-panel",
          part: "root",
        },
        {
          scope: "resizable",
          part: "panel-group",
        },
        {
          scope: "sidebar-layout",
          part: "content",
        },
        {
          scope: "sidebar",
          part: "root",
        },
        {
          scope: "task-list",
          part: "root",
        },
        {
          scope: "user-ask",
          part: "root",
        },
      ],
    },
  },
  externalStateAttributes: [
    "aria-selected",
    "data-activation-direction",
    "data-active",
    "data-align",
    "data-anchor-hidden",
    "data-behind",
    "data-checked",
    "data-closed",
    "data-complete",
    "data-dirty",
    "data-disabled",
    "data-dragging",
    "data-empty",
    "data-ending-style",
    "data-expanded",
    "data-filled",
    "data-focusable",
    "data-focused",
    "data-has-overflow-x",
    "data-has-overflow-y",
    "data-has-submenu-open",
    "data-hidden",
    "data-highlighted",
    "data-hovering",
    "data-indeterminate",
    "data-index",
    "data-instant",
    "data-invalid",
    "data-limited",
    "data-list-empty",
    "data-modal",
    "data-multiple",
    "data-nested",
    "data-nested-dialog-open",
    "data-nested-drawer-open",
    "data-nested-drawer-swiping",
    "data-open",
    "data-orientation",
    "data-overflow-x-end",
    "data-overflow-x-start",
    "data-overflow-y-end",
    "data-overflow-y-start",
    "data-panel-open",
    "data-placeholder",
    "data-popup-open",
    "data-popup-side",
    "data-pressed",
    "data-progressing",
    "data-readonly",
    "data-required",
    "data-scrolling",
    "data-scrubbing",
    "data-selected",
    "data-separator",
    "data-side",
    "data-starting-style",
    "data-swipe-direction",
    "data-swipe-dismiss",
    "data-swiping",
    "data-touched",
    "data-type",
    "data-uncentered",
    "data-unchecked",
    "data-valid",
    "data-visible",
  ],
};
