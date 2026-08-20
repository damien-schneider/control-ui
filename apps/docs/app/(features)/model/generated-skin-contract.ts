import "server-only";

import type { SkinContract } from "@/scripts/skin-contract/model";

export const generatedSkinContract: SkinContract = {
  version: 6,
  selectorPattern: '[data-skin="{skin}"] :where([data-control-ui="{scope}"][data-slot="{part}"])',
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
          registryItems: ["accordion"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["accordion"],
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
              valueKind: "presence",
              values: [],
            },
          ],
        },
        icon: {
          registryItems: ["accordion"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["accordion"],
            },
          ],
        },
        item: {
          registryItems: ["accordion"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["accordion"],
            },
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
          registryItems: ["accordion"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["accordion"],
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
          registryItems: ["accordion"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["accordion"],
            },
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
          registryItems: ["action-bar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["action-bar"],
            },
          ],
        },
      },
      registryItems: ["action-bar"],
    },
    activity: {
      parts: {
        root: {
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
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["activity"],
            },
          ],
        },
        announcement: {
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["activity"],
            },
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "pending", "running", "success"],
            },
          ],
        },
        chevron: {
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["activity"],
            },
          ],
        },
        content: {
          registryItems: ["activity"],
          states: [],
        },
        "content-viewport": {
          registryItems: ["chat-layout"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["activity"],
            },
          ],
        },
        detail: {
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["activity"],
            },
          ],
        },
        "detail-content": {
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["activity"],
            },
            {
              attribute: "data-format",
              source: "control-ui",
              valueKind: "enum",
              values: ["code", "text"],
            },
          ],
        },
        "detail-label": {
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["activity"],
            },
          ],
        },
        icon: {
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["activity"],
            },
            {
              attribute: "data-status-icon",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        row: {
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["activity"],
            },
          ],
        },
        status: {
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["activity"],
            },
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
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["activity"],
            },
          ],
        },
        trigger: {
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["activity"],
            },
          ],
        },
      },
      registryItems: ["activity", "chat-layout"],
    },
    alert: {
      parts: {
        root: {
          registryItems: ["alert"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["alert"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "destructive"],
            },
          ],
        },
        description: {
          registryItems: ["alert"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["alert"],
            },
          ],
        },
        title: {
          registryItems: ["alert"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["alert"],
            },
          ],
        },
      },
      registryItems: ["alert"],
    },
    "alert-dialog": {
      parts: {
        backdrop: {
          registryItems: ["alert-dialog"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["alert-dialog"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["alert-dialog"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["alert-dialog"],
            },
          ],
        },
        footer: {
          registryItems: ["alert-dialog"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["alert-dialog"],
            },
          ],
        },
        header: {
          registryItems: ["alert-dialog"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["alert-dialog"],
            },
          ],
        },
        title: {
          registryItems: ["alert-dialog"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["audio-recorder"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-recorder"],
            },
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
          registryItems: ["audio-recorder"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-recorder"],
            },
          ],
        },
        cancel: {
          registryItems: ["audio-recorder"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-recorder"],
            },
            {
              attribute: "data-visible",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        content: {
          registryItems: ["audio-recorder"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-recorder"],
            },
          ],
        },
        duration: {
          registryItems: ["audio-recorder"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-recorder"],
            },
            {
              attribute: "data-visible",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        status: {
          registryItems: ["audio-recorder"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-recorder"],
            },
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-recorder"],
            },
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-recorder"],
            },
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-recorder"],
            },
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
          registryItems: ["audio-visualizer", "audio-visualizer-line"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-visualizer"],
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
          registryItems: ["audio-visualizer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-visualizer"],
            },
          ],
        },
        "bar-track": {
          registryItems: ["audio-visualizer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-visualizer"],
            },
          ],
        },
        baseline: {
          registryItems: ["audio-visualizer-line"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-visualizer"],
            },
          ],
        },
        track: {
          registryItems: ["audio-visualizer", "audio-visualizer-line"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-visualizer"],
            },
          ],
        },
      },
      registryItems: ["audio-visualizer", "audio-visualizer-line"],
    },
    "audio-visualizer-line": {
      parts: {
        waveform: {
          registryItems: ["audio-visualizer-line"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["audio-visualizer"],
            },
          ],
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["autocomplete"],
            },
          ],
        },
        group: {
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["autocomplete"],
            },
          ],
        },
        "group-label": {
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["autocomplete"],
            },
          ],
        },
        input: {
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
              values: ["autocomplete"],
            },
          ],
        },
        list: {
          registryItems: ["autocomplete"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["autocomplete"],
            },
          ],
        },
        positioner: {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["avatar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["avatar"],
            },
          ],
        },
        fallback: {
          registryItems: ["avatar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["avatar"],
            },
          ],
        },
        group: {
          registryItems: ["avatar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["avatar"],
            },
          ],
        },
        image: {
          registryItems: ["avatar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["avatar"],
            },
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
          registryItems: ["badge"],
          states: [
            {
              attribute: "data-color",
              source: "control-ui",
              valueKind: "enum",
              values: ["blue", "green", "neutral", "orange", "pink", "purple", "red", "yellow"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["badge"],
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
              values: ["default", "destructive", "outline", "secondary"],
            },
          ],
        },
      },
      registryItems: ["badge"],
    },
    breadcrumb: {
      parts: {
        root: {
          registryItems: ["breadcrumb"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["breadcrumb"],
            },
          ],
        },
        ellipsis: {
          registryItems: ["breadcrumb"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["breadcrumb"],
            },
          ],
        },
        item: {
          registryItems: ["breadcrumb"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["breadcrumb"],
            },
          ],
        },
        link: {
          registryItems: ["breadcrumb"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["breadcrumb"],
            },
          ],
        },
        list: {
          registryItems: ["breadcrumb"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["breadcrumb"],
            },
          ],
        },
        page: {
          registryItems: ["breadcrumb"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["breadcrumb"],
            },
          ],
        },
        separator: {
          registryItems: ["breadcrumb"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["breadcrumb"],
            },
          ],
        },
      },
      registryItems: ["breadcrumb"],
    },
    button: {
      parts: {
        root: {
          registryItems: ["button"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button"],
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
          registryItems: ["button", "dropdown-menu", "select"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button"],
            },
          ],
        },
      },
      registryItems: ["button", "dropdown-menu", "select"],
    },
    "button-group": {
      parts: {
        root: {
          registryItems: ["button-group"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button-group"],
            },
            {
              attribute: "data-orientation",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        separator: {
          registryItems: ["button-group"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button-group"],
            },
            {
              attribute: "data-orientation",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        text: {
          registryItems: ["button-group"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button-group"],
            },
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
          registryItems: ["calendar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["calendar"],
            },
          ],
        },
        "caption-label": {
          registryItems: ["calendar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["calendar"],
            },
          ],
        },
        day: {
          registryItems: ["calendar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["calendar"],
            },
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
          registryItems: ["calendar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["calendar"],
            },
          ],
        },
        month: {
          registryItems: ["calendar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["calendar"],
            },
          ],
        },
        "month-caption": {
          registryItems: ["calendar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["calendar"],
            },
          ],
        },
        "month-grid": {
          registryItems: ["calendar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["calendar"],
            },
          ],
        },
        months: {
          registryItems: ["calendar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["calendar"],
            },
          ],
        },
        nav: {
          registryItems: ["calendar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["calendar"],
            },
          ],
        },
        "nav-button": {
          registryItems: ["calendar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["calendar"],
            },
          ],
        },
        weekday: {
          registryItems: ["calendar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["calendar"],
            },
          ],
        },
      },
      registryItems: ["calendar"],
    },
    card: {
      parts: {
        root: {
          registryItems: ["card"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["card"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "sectioned"],
            },
          ],
        },
        action: {
          registryItems: ["card"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["card"],
            },
          ],
        },
        content: {
          registryItems: ["card"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["card"],
            },
          ],
        },
        description: {
          registryItems: ["card"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["card"],
            },
          ],
        },
        footer: {
          registryItems: ["card"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["card"],
            },
          ],
        },
        header: {
          registryItems: ["card"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["card"],
            },
          ],
        },
        title: {
          registryItems: ["card"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["card"],
            },
          ],
        },
      },
      registryItems: ["card"],
    },
    "chat-composer": {
      parts: {
        root: {
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
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
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
          ],
        },
        footer: {
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
          ],
        },
        mention: {
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
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
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
          ],
        },
        "mention-icon": {
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
          ],
        },
        "mention-label": {
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
          ],
        },
        shell: {
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
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
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
          ],
        },
        toolbar: {
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
          ],
        },
        tools: {
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
          ],
        },
      },
      registryItems: ["chat-composer"],
    },
    "chat-composer-attachment": {
      parts: {
        root: {
          registryItems: ["chat-composer-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer-attachment"],
            },
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
          registryItems: ["chat-composer-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer-attachment"],
            },
          ],
        },
        description: {
          registryItems: ["chat-composer-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer-attachment"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "idle", "uploaded", "uploading"],
            },
          ],
        },
        preview: {
          registryItems: ["chat-composer-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer-attachment"],
            },
          ],
        },
        "preview-label": {
          registryItems: ["chat-composer-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer-attachment"],
            },
          ],
        },
        progress: {
          registryItems: ["chat-composer-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer-attachment"],
            },
          ],
        },
        "progress-indicator": {
          registryItems: ["chat-composer-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer-attachment"],
            },
          ],
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
          registryItems: ["chat-composer-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer-attachment"],
            },
          ],
        },
        title: {
          registryItems: ["chat-composer-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer-attachment"],
            },
          ],
        },
      },
      registryItems: ["chat-composer-attachment"],
    },
    "chat-composer-attachments": {
      parts: {
        root: {
          registryItems: ["chat-composer-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer-attachment"],
            },
          ],
        },
        list: {
          registryItems: ["chat-composer-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer-attachment"],
            },
          ],
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
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
          ],
        },
        editor: {
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
          ],
        },
        fallback: {
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
          ],
        },
        placeholder: {
          registryItems: ["chat-composer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-composer"],
            },
          ],
        },
      },
      registryItems: ["chat-composer"],
    },
    "chat-layout": {
      parts: {
        root: {
          registryItems: ["chat-layout"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-layout"],
            },
          ],
        },
      },
      registryItems: ["chat-layout"],
    },
    "chat-message": {
      parts: {
        root: {
          registryItems: ["chat-message"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-message"],
            },
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
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["danger", "neutral", "success", "warning"],
            },
          ],
        },
        actions: {
          registryItems: ["chat-message"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-message"],
            },
          ],
        },
        avatar: {
          registryItems: ["chat-message"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-message"],
            },
          ],
        },
        body: {
          registryItems: ["chat-message"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-message"],
            },
          ],
        },
        content: {
          registryItems: ["chat-message"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-message"],
            },
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
          registryItems: ["chat-message"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-message"],
            },
          ],
        },
        row: {
          registryItems: ["chat-message"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-message"],
            },
          ],
        },
      },
      registryItems: ["chat-message"],
    },
    "chat-thought": {
      parts: {
        root: {
          registryItems: ["chat-layout"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-layout"],
            },
          ],
        },
        chevron: {
          registryItems: ["chat-layout"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-layout"],
            },
          ],
        },
        details: {
          registryItems: ["chat-layout"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-layout"],
            },
          ],
        },
        title: {
          registryItems: ["chat-layout"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-layout"],
            },
          ],
        },
        trigger: {
          registryItems: ["chat-layout"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["chat-layout"],
            },
          ],
        },
      },
      registryItems: ["chat-layout"],
    },
    "chat-thread": {
      parts: {
        root: {
          registryItems: ["chat-layout"],
          states: [],
        },
      },
      registryItems: ["chat-layout"],
    },
    "chat-turn": {
      parts: {
        root: {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["choice"],
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["choice"],
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
          registryItems: ["code"],
          states: [
            {
              attribute: "data-chrome",
              source: "control-ui",
              valueKind: "enum",
              values: ["embedded", "standalone"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code"],
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
          registryItems: ["code"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code"],
            },
          ],
        },
        actions: {
          registryItems: ["code"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code"],
            },
          ],
        },
        content: {
          registryItems: ["code"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code"],
            },
          ],
        },
        grid: {
          registryItems: ["code"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code"],
            },
            {
              attribute: "data-density",
              source: "control-ui",
              valueKind: "enum",
              values: ["compact", "default"],
            },
          ],
        },
        gutter: {
          registryItems: ["code"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code"],
            },
          ],
        },
        header: {
          registryItems: ["code"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code"],
            },
          ],
        },
        line: {
          registryItems: ["code"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code"],
            },
            {
              attribute: "data-index",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
          ],
        },
        title: {
          registryItems: ["code"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code"],
            },
          ],
        },
      },
      registryItems: ["code"],
    },
    "code-block-editor": {
      parts: {
        root: {
          registryItems: ["code-block-editor"],
          states: [
            {
              attribute: "data-chrome",
              source: "control-ui",
              valueKind: "enum",
              values: ["embedded", "standalone"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-block-editor"],
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
          registryItems: ["code-block-editor"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-block-editor"],
            },
          ],
        },
        content: {
          registryItems: ["code-block-editor"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-block-editor"],
            },
          ],
        },
        editor: {
          registryItems: ["code-block-editor"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-block-editor"],
            },
          ],
        },
        header: {
          registryItems: ["code-block-editor"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-block-editor"],
            },
          ],
        },
        title: {
          registryItems: ["code-block-editor"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-block-editor"],
            },
          ],
        },
      },
      registryItems: ["code-block-editor"],
    },
    "code-diff": {
      parts: {
        root: {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
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
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
          ],
        },
        actions: {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
          ],
        },
        body: {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
          ],
        },
        emphasis: {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
            {
              attribute: "data-line-type",
              source: "control-ui",
              valueKind: "enum",
              values: ["add", "context", "del"],
            },
          ],
        },
        "empty-half": {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
            {
              attribute: "data-side",
              source: "control-ui",
              valueKind: "enum",
              values: ["left", "right"],
            },
          ],
        },
        "expand-button": {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
          ],
        },
        expander: {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
          ],
        },
        "expander-label": {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
          ],
        },
        file: {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
            {
              attribute: "data-file-name",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
          ],
        },
        "file-header": {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
          ],
        },
        "file-title": {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
          ],
        },
        gutter: {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
            {
              attribute: "data-line-type",
              source: "control-ui",
              valueKind: "enum",
              values: ["add", "context", "del"],
            },
          ],
        },
        header: {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
          ],
        },
        line: {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
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
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
            {
              attribute: "data-line-type",
              source: "control-ui",
              valueKind: "enum",
              values: ["add", "context", "del"],
            },
          ],
        },
        row: {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
          ],
        },
        stat: {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
          ],
        },
        "stat-additions": {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
          ],
        },
        "stat-deletions": {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
          ],
        },
        title: {
          registryItems: ["code-diff"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["code-diff"],
            },
          ],
        },
      },
      registryItems: ["code-diff"],
    },
    collapsible: {
      parts: {
        root: {
          registryItems: ["collapsible"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["collapsible"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["closed", "open"],
            },
          ],
        },
        content: {
          registryItems: ["collapsible"],
          states: [
            {
              attribute: "data-collapsible-part",
              source: "control-ui",
              valueKind: "enum",
              values: ["content"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["collapsible"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["closed", "open"],
            },
          ],
        },
        trigger: {
          registryItems: ["collapsible"],
          states: [
            {
              attribute: "data-collapsible-part",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["collapsible"],
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
      registryItems: ["collapsible"],
    },
    "color-picker": {
      parts: {
        alpha: {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
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
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
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
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
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
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
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
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        "area-saturation": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        "area-thumb": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        channel: {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        "channel-label": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        channels: {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        content: {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        "contrast-fix": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        "contrast-level": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
            {
              attribute: "data-passing",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "contrast-ratio": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
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
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
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
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
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
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
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
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        output: {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        "output-checker": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        "output-color": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        "output-swatch": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        "output-value": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        panel: {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
            {
              attribute: "data-selected",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "swatch-add": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        "swatch-checker": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        "swatch-color": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        swatches: {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        "swatches-group": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        "swatches-label": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        trigger: {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
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
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        "trigger-color": {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
        },
        wheel: {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
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
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["color-picker"],
            },
          ],
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
          ],
        },
        group: {
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
          ],
        },
        "group-label": {
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
          ],
        },
        icon: {
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
          ],
        },
        input: {
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
          ],
        },
        list: {
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["combobox"],
            },
          ],
        },
        positioner: {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["combobox"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["command"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["command"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
        empty: {
          registryItems: ["command"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
        group: {
          registryItems: ["command"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
        input: {
          registryItems: ["command"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
        "input-icon": {
          registryItems: ["command"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
        "input-wrapper": {
          registryItems: ["command"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["command"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["command"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
        separator: {
          registryItems: ["command"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["command"],
            },
          ],
        },
        shortcut: {
          registryItems: ["command"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["normal", "over-limit", "unavailable"],
            },
          ],
        },
        content: {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
          ],
        },
        description: {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
          ],
        },
        graph: {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["normal", "over-limit", "unavailable"],
            },
          ],
        },
        header: {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
          ],
        },
        legend: {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
          ],
        },
        "legend-description": {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
          ],
        },
        "legend-indicator": {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
            {
              attribute: "data-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["cache", "message", "other", "reasoning", "source", "system", "tool"],
            },
          ],
        },
        "legend-item": {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
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
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
          ],
        },
        "legend-value": {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
          ],
        },
        "limit-marker": {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
          ],
        },
        overage: {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
          ],
        },
        segment: {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
            {
              attribute: "data-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["cache", "message", "other", "reasoning", "source", "system", "tool"],
            },
          ],
        },
        summary: {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["normal", "over-limit", "unavailable"],
            },
          ],
        },
        "summary-value": {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
          ],
        },
        title: {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
          ],
        },
        track: {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
          ],
        },
        trigger: {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["normal", "over-limit", "unavailable"],
            },
          ],
        },
        "trigger-indicator": {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["normal", "over-limit", "unavailable"],
            },
          ],
        },
        "trigger-label": {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
          ],
        },
        "trigger-track": {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["normal", "over-limit", "unavailable"],
            },
          ],
        },
        "trigger-value": {
          registryItems: ["context"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["context"],
            },
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
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-checked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
          ],
        },
        item: {
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          ],
        },
        label: {
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
          ],
        },
        "radio-group": {
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
          ],
        },
        "radio-indicator": {
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
          ],
        },
        "radio-item": {
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-checked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
              values: ["context-menu"],
            },
          ],
        },
        shortcut: {
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
          ],
        },
        "sub-content": {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "sub-trigger-indicator": {
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["context-menu"],
            },
          ],
        },
        trigger: {
          registryItems: ["context-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["dialog"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["dialog"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["dialog"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["dialog"],
            },
          ],
        },
        footer: {
          registryItems: ["dialog"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["dialog"],
            },
          ],
        },
        header: {
          registryItems: ["dialog"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["dialog"],
            },
          ],
        },
        title: {
          registryItems: ["dialog"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["dockable-panel"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dockable-panel"],
            },
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
          registryItems: ["dockable-panel"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dockable-panel"],
            },
          ],
        },
        close: {
          registryItems: ["dockable-panel"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button"],
            },
          ],
        },
        content: {
          registryItems: ["dockable-panel"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dockable-panel"],
            },
            {
              attribute: "data-padding",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "none"],
            },
          ],
        },
        dock: {
          registryItems: ["dockable-panel"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button"],
            },
          ],
        },
        "drag-handle": {
          registryItems: ["dockable-panel"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dockable-panel"],
            },
          ],
        },
        "drop-zone": {
          registryItems: ["dockable-panel"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dockable-panel"],
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
          registryItems: ["dockable-panel"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dockable-panel"],
            },
          ],
        },
        title: {
          registryItems: ["dockable-panel"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dockable-panel"],
            },
          ],
        },
        toggle: {
          registryItems: ["dockable-panel"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button"],
            },
          ],
        },
      },
      registryItems: ["dockable-panel"],
    },
    drawer: {
      parts: {
        backdrop: {
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
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
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        close: {
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
          ],
        },
        content: {
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
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
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
          ],
        },
        footer: {
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
          ],
        },
        handle: {
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
          ],
        },
        header: {
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
          ],
        },
        title: {
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-control-family",
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
            },
          ],
        },
        viewport: {
          registryItems: ["drawer"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["drawer"],
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["dropdown-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          ],
        },
        label: {
          registryItems: ["dropdown-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
          ],
        },
        separator: {
          registryItems: ["dropdown-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        trigger: {
          registryItems: ["dropdown-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button"],
            },
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
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dropzone"],
            },
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
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dropzone"],
            },
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
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dropzone"],
            },
          ],
        },
        "feedback-icon": {
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dropzone"],
            },
          ],
        },
        "feedback-message": {
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dropzone"],
            },
          ],
        },
        "feedback-spinner": {
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dropzone"],
            },
          ],
        },
        file: {
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dropzone"],
            },
          ],
        },
        "file-list": {
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dropzone"],
            },
            {
              attribute: "data-empty",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        input: {
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dropzone"],
            },
          ],
        },
        overlay: {
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dropzone"],
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
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dropzone"],
            },
          ],
        },
        "rejection-list": {
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dropzone"],
            },
            {
              attribute: "data-empty",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        status: {
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dropzone"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["accept", "idle", "processing", "reject", "unknown"],
            },
          ],
        },
        trigger: {
          registryItems: ["dropzone"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dropzone"],
            },
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
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dynamic-notification"],
            },
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
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dynamic-notification"],
            },
          ],
        },
        glass: {
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dynamic-notification"],
            },
          ],
        },
        indicator: {
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dynamic-notification"],
            },
          ],
        },
        island: {
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dynamic-notification"],
            },
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
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dynamic-notification"],
            },
          ],
        },
        message: {
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dynamic-notification"],
            },
          ],
        },
        pill: {
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dynamic-notification"],
            },
          ],
        },
        reply: {
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dynamic-notification"],
            },
          ],
        },
        "reply-input": {
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dynamic-notification"],
            },
          ],
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
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dynamic-notification"],
            },
          ],
        },
        word: {
          registryItems: ["dynamic-notification"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["dynamic-notification"],
            },
          ],
        },
      },
      registryItems: ["dynamic-notification"],
    },
    empty: {
      parts: {
        root: {
          registryItems: ["empty"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["empty"],
            },
          ],
        },
        content: {
          registryItems: ["empty"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["empty"],
            },
          ],
        },
        description: {
          registryItems: ["empty"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["empty"],
            },
          ],
        },
        header: {
          registryItems: ["empty"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["empty"],
            },
          ],
        },
        media: {
          registryItems: ["empty"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["empty"],
            },
          ],
        },
        title: {
          registryItems: ["empty"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["empty"],
            },
          ],
        },
      },
      registryItems: ["empty"],
    },
    "environment-variables": {
      parts: {
        root: {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
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
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        "column-labels": {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        description: {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        empty: {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        "field-error": {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        "field-label": {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        header: {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        hint: {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        "hint-code": {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        "key-input": {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        message: {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        "readonly-item": {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        "readonly-key": {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        "readonly-list": {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        "readonly-value": {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        row: {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        rows: {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        title: {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        toolbar: {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
        "value-group": {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
            {
              attribute: "data-invalid",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "value-input": {
          registryItems: ["environment-variables"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["environment-variables"],
            },
          ],
        },
      },
      registryItems: ["environment-variables"],
    },
    field: {
      parts: {
        root: {
          registryItems: ["field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
          ],
        },
        control: {
          registryItems: ["field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
          ],
        },
        item: {
          registryItems: ["field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
          ],
        },
        separator: {
          registryItems: ["field"],
          states: [
            {
              attribute: "data-content",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
          ],
        },
        set: {
          registryItems: ["field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
          ],
        },
        title: {
          registryItems: ["field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
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
          registryItems: ["gradient-editor"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["gradient-editor"],
            },
          ],
        },
        preview: {
          registryItems: ["gradient-editor"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["gradient-editor"],
            },
          ],
        },
        stop: {
          registryItems: ["gradient-editor"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["gradient-editor"],
            },
            {
              attribute: "data-selected",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "stop-add": {
          registryItems: ["gradient-editor"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["gradient-editor"],
            },
          ],
        },
        track: {
          registryItems: ["gradient-editor"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["gradient-editor"],
            },
          ],
        },
      },
      registryItems: ["gradient-editor"],
    },
    "hover-card": {
      parts: {
        content: {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["hover-card"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["infinite-canvas"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["infinite-canvas"],
            },
            {
              attribute: "data-panning",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        content: {
          registryItems: ["infinite-canvas"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["infinite-canvas"],
            },
            {
              attribute: "data-scale",
              source: "control-ui",
              valueKind: "open",
              values: [],
            },
          ],
        },
        controls: {
          registryItems: ["infinite-canvas"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["infinite-canvas"],
            },
          ],
        },
      },
      registryItems: ["infinite-canvas"],
    },
    "inline-attachment": {
      parts: {
        root: {
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-attachment"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "pending", "ready"],
            },
          ],
        },
        action: {
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-attachment"],
            },
          ],
        },
        actions: {
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-attachment"],
            },
          ],
        },
        content: {
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-attachment"],
            },
          ],
        },
        description: {
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-attachment"],
            },
          ],
        },
        document: {
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-attachment"],
            },
          ],
        },
        "document-heading": {
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-attachment"],
            },
          ],
        },
        "document-line": {
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-attachment"],
            },
            {
              attribute: "data-width",
              source: "control-ui",
              valueKind: "enum",
              values: ["long", "longest", "medium", "short"],
            },
          ],
        },
        "document-sheet": {
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-attachment"],
            },
          ],
        },
        "document-stamp": {
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-attachment"],
            },
          ],
        },
        image: {
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-attachment"],
            },
          ],
        },
        "media-image": {
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-attachment"],
            },
          ],
        },
        placeholder: {
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-attachment"],
            },
          ],
        },
        title: {
          registryItems: ["inline-attachment"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-attachment"],
            },
          ],
        },
      },
      registryItems: ["inline-attachment"],
    },
    "inline-citation": {
      parts: {
        root: {
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
            },
          ],
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
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
            },
          ],
        },
        favicons: {
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
            },
          ],
        },
        label: {
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
            },
          ],
        },
        navigation: {
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
            },
          ],
        },
        next: {
          registryItems: ["inline-citation"],
          states: [],
        },
        position: {
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
            },
          ],
        },
        previous: {
          registryItems: ["inline-citation"],
          states: [],
        },
        source: {
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-activation-direction",
              source: "control-ui",
              valueKind: "enum",
              values: ["left", "right"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
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
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
            },
          ],
        },
        "source-external-icon": {
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
            },
          ],
        },
        "source-favicon": {
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
            },
          ],
        },
        "source-header": {
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
            },
          ],
        },
        "source-hostname": {
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
            },
          ],
        },
        "source-quote": {
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
            },
          ],
        },
        "source-title": {
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
            },
          ],
        },
        trigger: {
          registryItems: ["inline-citation"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["inline-citation"],
            },
          ],
        },
      },
      registryItems: ["inline-citation"],
    },
    input: {
      parts: {
        root: {
          registryItems: ["input"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["input-group"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg", "md", "sm", "xs"],
            },
          ],
        },
        addon: {
          registryItems: ["input-group"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["input-group"],
            },
          ],
        },
        input: {
          registryItems: ["input-group"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["input-group"],
            },
            {
              attribute: "data-input-group-part",
              source: "control-ui",
              valueKind: "enum",
              values: ["input"],
            },
          ],
        },
      },
      registryItems: ["input-group"],
    },
    "input-otp": {
      parts: {
        root: {
          registryItems: ["input-otp"],
          states: [
            {
              attribute: "data-complete",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["input-otp"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
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
          registryItems: ["input-otp"],
          states: [
            {
              attribute: "data-complete",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["item"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["item"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "muted", "outline"],
            },
          ],
        },
        actions: {
          registryItems: ["item"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["item"],
            },
          ],
        },
        content: {
          registryItems: ["item"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["item"],
            },
          ],
        },
        description: {
          registryItems: ["item"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["item"],
            },
          ],
        },
        footer: {
          registryItems: ["item"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["item"],
            },
          ],
        },
        group: {
          registryItems: ["item"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["item"],
            },
          ],
        },
        header: {
          registryItems: ["item"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["item"],
            },
          ],
        },
        media: {
          registryItems: ["item"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["item"],
            },
          ],
        },
        separator: {
          registryItems: ["item"],
          states: [],
        },
        title: {
          registryItems: ["item"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["item"],
            },
          ],
        },
      },
      registryItems: ["item"],
    },
    kbd: {
      parts: {
        root: {
          registryItems: ["kbd"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["kbd"],
            },
          ],
        },
        group: {
          registryItems: ["kbd"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["kbd"],
            },
          ],
        },
      },
      registryItems: ["kbd"],
    },
    label: {
      parts: {
        root: {
          registryItems: ["label"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["label"],
            },
          ],
        },
      },
      registryItems: ["label"],
    },
    markdown: {
      parts: {
        root: {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        blockquote: {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        emphasis: {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        h1: {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        h2: {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        h3: {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        "inline-code": {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        link: {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        "list-item": {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        "ordered-list": {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        paragraph: {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        separator: {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        strong: {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        table: {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        "table-cell": {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        "table-header": {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        "table-scroll": {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
        "unordered-list": {
          registryItems: ["markdown"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown"],
            },
          ],
        },
      },
      registryItems: ["markdown"],
    },
    "markdown-block": {
      parts: {
        root: {
          registryItems: ["markdown-block"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown-block"],
            },
          ],
        },
        content: {
          registryItems: ["markdown-block"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown-block"],
            },
          ],
        },
        header: {
          registryItems: ["markdown-block"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown-block"],
            },
          ],
        },
        title: {
          registryItems: ["markdown-block"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown-block"],
            },
          ],
        },
        "title-icon": {
          registryItems: ["markdown-block"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["markdown-block"],
            },
          ],
        },
      },
      registryItems: ["markdown-block"],
    },
    menubar: {
      parts: {
        root: {
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["menubar"],
            },
          ],
        },
        item: {
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
              values: ["menubar"],
            },
          ],
        },
        label: {
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["menubar"],
            },
          ],
        },
        separator: {
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
        shortcut: {
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["menubar"],
            },
          ],
        },
        "sub-content": {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["menubar"],
            },
          ],
        },
        trigger: {
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button"],
            },
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
          registryItems: ["meter"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["meter"],
            },
          ],
        },
        indicator: {
          registryItems: ["meter"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["meter"],
            },
          ],
        },
        label: {
          registryItems: ["meter"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["meter"],
            },
          ],
        },
        track: {
          registryItems: ["meter"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["meter"],
            },
          ],
        },
        value: {
          registryItems: ["meter"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
            },
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
          registryItems: ["model-switcher"],
          states: [
            {
              attribute: "data-button-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["model-switcher"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button"],
            },
          ],
        },
        hint: {
          registryItems: ["model-switcher"],
          states: [
            {
              attribute: "data-button-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["model-switcher"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button"],
            },
          ],
        },
        indicator: {
          registryItems: ["model-switcher"],
          states: [
            {
              attribute: "data-button-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["model-switcher"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button"],
            },
          ],
        },
        value: {
          registryItems: ["model-switcher"],
          states: [
            {
              attribute: "data-button-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["model-switcher"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button"],
            },
          ],
        },
      },
      registryItems: ["model-switcher"],
    },
    "morphing-panel": {
      parts: {
        root: {
          registryItems: ["morphing-panel"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["morphing-panel"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["closed", "open"],
            },
          ],
        },
        content: {
          registryItems: ["morphing-panel"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["morphing-panel"],
            },
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["morphing-panel"],
            },
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
          registryItems: ["native-select"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
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
          registryItems: ["native-select"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
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
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["navigation-menu"],
            },
          ],
        },
        content: {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["navigation-menu"],
            },
          ],
        },
        link: {
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-active",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["navigation-menu"],
            },
          ],
        },
        popup: {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button"],
            },
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
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-navigation-menu-part",
              source: "control-ui",
              valueKind: "enum",
              values: ["viewport"],
            },
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
          registryItems: ["number-field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["number-field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
            {
              attribute: "data-field-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["number-field"],
            },
          ],
        },
        group: {
          registryItems: ["number-field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["number-field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["number-field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["number-field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["number-field"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
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
          registryItems: ["pagination"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["pagination"],
            },
          ],
        },
        content: {
          registryItems: ["pagination"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["pagination"],
            },
          ],
        },
        ellipsis: {
          registryItems: ["pagination"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["pagination"],
            },
          ],
        },
        item: {
          registryItems: ["pagination"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["pagination"],
            },
          ],
        },
        link: {
          registryItems: ["pagination"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["pagination"],
            },
          ],
        },
      },
      registryItems: ["pagination"],
    },
    "phone-input": {
      parts: {
        check: {
          registryItems: ["phone-input"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["phone-input"],
            },
            {
              attribute: "data-visible",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        chevron: {
          registryItems: ["phone-input"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["phone-input"],
            },
            {
              attribute: "data-open",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "country-code": {
          registryItems: ["phone-input"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["phone-input"],
            },
          ],
        },
        "country-trigger": {
          registryItems: ["phone-input"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["phone-input"],
            },
          ],
        },
        flag: {
          registryItems: ["phone-input"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["phone-input"],
            },
          ],
        },
        metadata: {
          registryItems: ["phone-input"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["phone-input"],
            },
          ],
        },
      },
      registryItems: ["phone-input"],
    },
    popover: {
      parts: {
        close: {
          registryItems: ["popover"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["popover"],
            },
          ],
        },
        content: {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["popover"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["popover"],
            },
          ],
        },
        header: {
          registryItems: ["popover"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["popover"],
            },
          ],
        },
        title: {
          registryItems: ["popover"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["progress"],
          states: [
            {
              attribute: "data-complete",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
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
          registryItems: ["progress"],
          states: [
            {
              attribute: "data-complete",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
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
          registryItems: ["progress"],
          states: [
            {
              attribute: "data-complete",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
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
          registryItems: ["progress"],
          states: [
            {
              attribute: "data-complete",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
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
          registryItems: ["progress"],
          states: [
            {
              attribute: "data-complete",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
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
          registryItems: ["radio-group"],
          states: [
            {
              attribute: "data-choice-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["radio-group"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["choice"],
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["choice"],
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["choice"],
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
          registryItems: ["resizable"],
          states: [
            {
              attribute: "data-axis",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["resizable"],
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
          registryItems: ["resizable"],
          states: [
            {
              attribute: "data-axis",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["resizable"],
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
          registryItems: ["resizable"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["resizable"],
            },
          ],
        },
        "panel-group": {
          registryItems: ["resizable"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["resizable"],
            },
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        content: {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        header: {
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        media: {
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        next: {
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        positioner: {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        progress: {
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["rich-tooltip"],
            },
          ],
        },
        trigger: {
          registryItems: ["rich-tooltip"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["scroll-area"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["scroll-area"],
            },
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
          registryItems: ["scroll-area"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["scroll-area"],
            },
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
          registryItems: ["scroll-area"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["scroll-area"],
            },
          ],
        },
        scrollbar: {
          registryItems: ["scroll-area"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["scroll-area"],
            },
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
          registryItems: ["scroll-area"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["scroll-area"],
            },
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
          registryItems: ["scroll-area"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["scroll-area"],
            },
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
              attribute: "data-scroll-area-part",
              source: "control-ui",
              valueKind: "enum",
              values: ["viewport"],
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["select"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
              attribute: "data-select-part",
              source: "control-ui",
              valueKind: "enum",
              values: ["icon"],
            },
          ],
        },
        item: {
          registryItems: ["select"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["select"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["select"],
            },
          ],
        },
        trigger: {
          registryItems: ["select"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button"],
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
              attribute: "data-select-part",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger"],
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
          registryItems: ["separator"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["separator"],
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
      registryItems: ["separator"],
    },
    sheet: {
      parts: {
        backdrop: {
          registryItems: ["sheet"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["sheet"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["sheet"],
          states: [
            {
              attribute: "data-closed",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
              attribute: "data-sheet-part",
              source: "control-ui",
              valueKind: "enum",
              values: ["content"],
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
          registryItems: ["sheet"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["sheet"],
            },
          ],
        },
        header: {
          registryItems: ["sheet"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["sheet"],
            },
          ],
        },
        title: {
          registryItems: ["sheet"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-collapsible",
              source: "control-ui",
              valueKind: "enum",
              values: ["icon", "none", "offcanvas"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
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
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
            },
          ],
        },
        content: {
          registryItems: ["sidebar"],
          states: [],
        },
        footer: {
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
            },
          ],
        },
        gap: {
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
            },
          ],
        },
        group: {
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
            },
          ],
        },
        "group-label": {
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
            },
          ],
        },
        header: {
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
            },
          ],
        },
        inner: {
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
            },
          ],
        },
        inset: {
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
            },
          ],
        },
        menu: {
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
            },
            {
              attribute: "data-indicator",
              source: "control-ui",
              valueKind: "enum",
              values: ["none", "slide"],
            },
          ],
        },
        "menu-button": {
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
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
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
            },
          ],
        },
        "menu-track": {
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
            },
            {
              attribute: "data-indicator",
              source: "control-ui",
              valueKind: "enum",
              values: ["none", "slide"],
            },
          ],
        },
        rail: {
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
            },
          ],
        },
        trigger: {
          registryItems: ["sidebar"],
          states: [],
        },
        wrapper: {
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["sidebar"],
            },
          ],
        },
      },
      registryItems: ["sidebar"],
    },
    "sidebar-layout": {
      parts: {
        content: {
          registryItems: ["sidebar-layout-block"],
          states: [],
        },
      },
      registryItems: ["sidebar-layout-block"],
    },
    skeleton: {
      parts: {
        root: {
          registryItems: ["skeleton"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["skeleton"],
            },
          ],
        },
      },
      registryItems: ["skeleton"],
    },
    slider: {
      parts: {
        root: {
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
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
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
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
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
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
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["slider"],
            },
          ],
        },
        thumb: {
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
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
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
            },
            {
              attribute: "data-range-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["slider"],
            },
          ],
        },
        track: {
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
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
          registryItems: ["slider"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["range"],
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
          registryItems: ["spinner"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["spinner"],
            },
          ],
        },
        indicator: {
          registryItems: ["spinner"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["spinner"],
            },
          ],
        },
      },
      registryItems: ["spinner"],
    },
    stepper: {
      parts: {
        root: {
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-content-mode",
              source: "control-ui",
              valueKind: "enum",
              values: ["all", "current"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["stepper"],
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
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["stepper"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["active", "inactive"],
            },
          ],
        },
        description: {
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["stepper"],
            },
          ],
        },
        indicator: {
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["stepper"],
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
          ],
        },
        item: {
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["stepper"],
            },
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
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["stepper"],
            },
            {
              attribute: "data-orientation",
              source: "control-ui",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        separator: {
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["stepper"],
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
          ],
        },
        title: {
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["stepper"],
            },
          ],
        },
        trigger: {
          registryItems: ["stepper"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["stepper"],
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
          ],
        },
      },
      registryItems: ["stepper"],
    },
    switch: {
      parts: {
        root: {
          registryItems: ["switch"],
          states: [
            {
              attribute: "data-checked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["switch"],
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
          registryItems: ["switch"],
          states: [
            {
              attribute: "data-checked",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["switch"],
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
          registryItems: ["switch"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["switch"],
            },
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
          registryItems: ["table"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table"],
            },
          ],
        },
        body: {
          registryItems: ["table"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table"],
            },
          ],
        },
        caption: {
          registryItems: ["table"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table"],
            },
          ],
        },
        cell: {
          registryItems: ["table"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table"],
            },
          ],
        },
        container: {
          registryItems: ["table"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table"],
            },
          ],
        },
        footer: {
          registryItems: ["table"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table"],
            },
          ],
        },
        head: {
          registryItems: ["table"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table"],
            },
          ],
        },
        header: {
          registryItems: ["table"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table"],
            },
          ],
        },
        row: {
          registryItems: ["table"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table"],
            },
          ],
        },
      },
      registryItems: ["table"],
    },
    "table-of-contents": {
      parts: {
        root: {
          registryItems: ["table-of-contents"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table-of-contents"],
            },
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["background", "both", "trail"],
            },
          ],
        },
        item: {
          registryItems: ["table-of-contents"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table-of-contents"],
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
          registryItems: ["table-of-contents"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table-of-contents"],
            },
          ],
        },
        list: {
          registryItems: ["table-of-contents"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table-of-contents"],
            },
            {
              attribute: "data-nested",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        rail: {
          registryItems: ["table-of-contents"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table-of-contents"],
            },
          ],
        },
        track: {
          registryItems: ["table-of-contents"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table-of-contents"],
            },
          ],
        },
        trail: {
          registryItems: ["table-of-contents"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["table-of-contents"],
            },
          ],
        },
      },
      registryItems: ["table-of-contents"],
    },
    tabs: {
      parts: {
        root: {
          registryItems: ["tabs"],
          states: [
            {
              attribute: "data-activation-direction",
              source: "external",
              valueKind: "enum",
              values: ["down", "left", "none", "right", "up"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["tabs"],
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
          registryItems: ["tabs"],
          states: [
            {
              attribute: "data-activation-direction",
              source: "external",
              valueKind: "enum",
              values: ["down", "left", "none", "right", "up"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["tabs"],
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
          registryItems: ["tabs"],
          states: [
            {
              attribute: "data-activation-direction",
              source: "external",
              valueKind: "enum",
              values: ["down", "left", "none", "right", "up"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["tabs"],
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
          registryItems: ["tabs"],
          states: [
            {
              attribute: "data-activation-direction",
              source: "external",
              valueKind: "enum",
              values: ["down", "left", "none", "right", "up"],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["tabs"],
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["tabs"],
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
          registryItems: ["task-list"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["task-list"],
            },
          ],
        },
        chevron: {
          registryItems: ["task-list"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["task-list"],
            },
          ],
        },
        item: {
          registryItems: ["task-list"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["task-list"],
            },
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["active", "completed", "pending"],
            },
          ],
        },
        "item-indicator": {
          registryItems: ["task-list"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["task-list"],
            },
            {
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["active", "completed", "pending"],
            },
          ],
        },
        items: {
          registryItems: ["task-list"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["task-list"],
            },
          ],
        },
        label: {
          registryItems: ["task-list"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["task-list"],
            },
          ],
        },
        progress: {
          registryItems: ["task-list"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["task-list"],
            },
          ],
        },
        trigger: {
          registryItems: ["task-list"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["task-list"],
            },
          ],
        },
      },
      registryItems: ["task-list"],
    },
    textarea: {
      parts: {
        root: {
          registryItems: ["textarea"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["field"],
            },
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
          registryItems: ["thread-rail"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["thread-rail"],
            },
          ],
        },
        file: {
          registryItems: ["thread-rail"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["thread-rail"],
            },
          ],
        },
        "file-icon": {
          registryItems: ["thread-rail"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["thread-rail"],
            },
          ],
        },
        footer: {
          registryItems: ["thread-rail"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["thread-rail"],
            },
          ],
        },
        item: {
          registryItems: ["thread-rail"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["thread-rail"],
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
          registryItems: ["thread-rail"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["thread-rail"],
            },
          ],
        },
        more: {
          registryItems: ["thread-rail"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["thread-rail"],
            },
          ],
        },
        popover: {
          registryItems: ["thread-rail"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["thread-rail"],
            },
          ],
        },
        "popover-layer": {
          registryItems: ["thread-rail"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["thread-rail"],
            },
          ],
        },
        summary: {
          registryItems: ["thread-rail"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["thread-rail"],
            },
          ],
        },
        title: {
          registryItems: ["thread-rail"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["thread-rail"],
            },
          ],
        },
      },
      registryItems: ["thread-rail"],
    },
    timeline: {
      parts: {
        root: {
          registryItems: ["timeline"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["timeline"],
            },
          ],
        },
        content: {
          registryItems: ["timeline"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["timeline"],
            },
          ],
        },
        description: {
          registryItems: ["timeline"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["timeline"],
            },
          ],
        },
        indicator: {
          registryItems: ["timeline"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["timeline"],
            },
          ],
        },
        item: {
          registryItems: ["timeline"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["timeline"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "neutral", "pending", "running", "success"],
            },
          ],
        },
        meta: {
          registryItems: ["timeline"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["timeline"],
            },
          ],
        },
        separator: {
          registryItems: ["timeline"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["timeline"],
            },
          ],
        },
        title: {
          registryItems: ["timeline"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["timeline"],
            },
          ],
        },
      },
      registryItems: ["timeline"],
    },
    toast: {
      parts: {
        root: {
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["toast"],
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
              attribute: "data-limited",
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
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-control-family",
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
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-control-family",
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
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-behind",
              source: "external",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["toast"],
            },
            {
              attribute: "data-expanded",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        description: {
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-control-family",
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
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["toast"],
            },
          ],
        },
        title: {
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-control-family",
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
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["toast"],
            },
            {
              attribute: "data-expanded",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
      },
      registryItems: ["toast"],
    },
    toggle: {
      parts: {
        root: {
          registryItems: ["toggle"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["button"],
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
          registryItems: ["toolbar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["toolbar"],
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
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "inverse"],
            },
          ],
        },
        button: {
          registryItems: ["toolbar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["toolbar"],
            },
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
          registryItems: ["toolbar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["toolbar"],
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
        input: {
          registryItems: ["toolbar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["toolbar"],
            },
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
          registryItems: ["toolbar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["toolbar"],
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
            {
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "track"],
            },
          ],
        },
        separator: {
          registryItems: ["toolbar"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["toolbar"],
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
      registryItems: ["toolbar"],
    },
    tooltip: {
      parts: {
        arrow: {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["tooltip"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["tooltip"],
            },
          ],
        },
        content: {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["track-highlight"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["track-highlight"],
            },
          ],
        },
        hover: {
          registryItems: ["track-highlight"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["track-highlight"],
            },
          ],
        },
      },
      registryItems: ["track-highlight"],
    },
    "transcript-divider": {
      parts: {
        root: {
          registryItems: ["transcript-divider"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["transcript-divider"],
            },
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["danger", "neutral", "success", "warning"],
            },
          ],
        },
        label: {
          registryItems: ["transcript-divider"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["transcript-divider"],
            },
          ],
        },
      },
      registryItems: ["transcript-divider"],
    },
    tree: {
      parts: {
        root: {
          registryItems: ["tree"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["tree"],
            },
            {
              attribute: "data-indicator",
              source: "control-ui",
              valueKind: "enum",
              values: ["none", "slide"],
            },
          ],
        },
        item: {
          registryItems: ["tree"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["tree"],
            },
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
          registryItems: ["tree"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["tree"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["closed", "open"],
            },
          ],
        },
        "item-group": {
          registryItems: ["tree"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["tree"],
            },
          ],
        },
        "item-indicator": {
          registryItems: ["tree"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["tree"],
            },
            {
              attribute: "data-state",
              source: "control-ui",
              valueKind: "enum",
              values: ["closed", "open"],
            },
          ],
        },
        "item-label": {
          registryItems: ["tree"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["tree"],
            },
          ],
        },
        "item-trigger": {
          registryItems: ["tree"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["tree"],
            },
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
          registryItems: ["tree"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["tree"],
            },
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["trigger-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger-menu"],
            },
          ],
        },
        group: {
          registryItems: ["trigger-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger-menu"],
            },
          ],
        },
        "group-label": {
          registryItems: ["trigger-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger-menu"],
            },
          ],
        },
        icon: {
          registryItems: ["trigger-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger-menu"],
            },
          ],
        },
        item: {
          registryItems: ["trigger-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
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
          registryItems: ["trigger-menu"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
            },
            {
              attribute: "data-popup-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["trigger-menu"],
            },
          ],
        },
        positioner: {
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
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["popup"],
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
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["user-ask"],
            },
          ],
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
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["user-ask"],
            },
          ],
        },
        "freeform-label": {
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["user-ask"],
            },
          ],
        },
        header: {
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["user-ask"],
            },
          ],
        },
        option: {
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["user-ask"],
            },
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
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["user-ask"],
            },
          ],
        },
        "option-indicator": {
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["user-ask"],
            },
            {
              attribute: "data-selected",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "option-input": {
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["user-ask"],
            },
          ],
        },
        "option-label": {
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["user-ask"],
            },
          ],
        },
        pagination: {
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["user-ask"],
            },
          ],
        },
        "pagination-count": {
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["user-ask"],
            },
          ],
        },
        question: {
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["user-ask"],
            },
          ],
        },
        recommended: {
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["user-ask"],
            },
          ],
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
          registryItems: ["user-ask"],
          states: [
            {
              attribute: "data-control-family",
              source: "control-ui",
              valueKind: "enum",
              values: ["user-ask"],
            },
          ],
        },
      },
      registryItems: ["user-ask"],
    },
  },
  adornments: {
    button: {
      layer: {
        context: {
          tone: "ButtonTone",
          variant: "ButtonVariant",
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
