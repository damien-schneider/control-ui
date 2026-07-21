import "server-only";

export const generatedSkinContract = {
  version: 5,
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
    popover: ["popover"],
    progress: ["progress"],
    "radio-group": ["radio-group"],
    resizable: ["resizable"],
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
    toast: ["toast"],
    toggle: ["toggle"],
    toolbar: ["toolbar"],
    tooltip: ["tooltip"],
    "track-highlight": ["track-highlight"],
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
        item: {
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
          registryItems: ["action-bar"],
          states: [],
        },
      },
      registryItems: ["action-bar"],
    },
    activity: {
      parts: {
        root: {
          context: {
            kind: "ActivityKind",
            state: "ActivityState",
          },
          registryItems: ["activity"],
          states: [
            {
              attribute: "data-activity-kind",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "tool"],
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
              attribute: "data-status",
              source: "control-ui",
              valueKind: "enum",
              values: ["error", "pending", "running", "success"],
            },
          ],
        },
        announcement: {
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
          registryItems: ["activity"],
          states: [],
        },
        content: {
          registryItems: ["activity"],
          states: [],
        },
        "content-viewport": {
          registryItems: ["chat-layout"],
          states: [],
        },
        detail: {
          registryItems: ["activity"],
          states: [],
        },
        "detail-content": {
          registryItems: ["activity"],
          states: [],
        },
        "detail-label": {
          registryItems: ["activity"],
          states: [],
        },
        icon: {
          context: {
            kind: "ActivityKind",
            state: "ActivityState",
          },
          registryItems: ["activity"],
          states: [],
        },
        item: {
          registryItems: ["activity"],
          states: [],
        },
        "item-content": {
          registryItems: ["activity"],
          states: [],
        },
        "item-icon": {
          registryItems: ["activity"],
          states: [],
        },
        list: {
          registryItems: ["activity"],
          states: [],
        },
        row: {
          registryItems: ["activity"],
          states: [],
        },
        status: {
          context: {
            kind: "ActivityKind",
            state: "ActivityState",
          },
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
        title: {
          registryItems: ["activity"],
          states: [],
        },
        trigger: {
          context: {
            kind: "ActivityKind",
          },
          registryItems: ["activity"],
          states: [],
        },
      },
      registryItems: ["activity", "chat-layout"],
    },
    alert: {
      parts: {
        root: {
          context: {
            variant: "AlertVariant",
          },
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
          registryItems: ["alert"],
          states: [],
        },
        title: {
          registryItems: ["alert"],
          states: [],
        },
      },
      registryItems: ["alert"],
    },
    "alert-dialog": {
      parts: {
        close: {
          registryItems: ["alert-dialog"],
          states: [],
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
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        description: {
          registryItems: ["alert-dialog"],
          states: [],
        },
        footer: {
          registryItems: ["alert-dialog"],
          states: [],
        },
        header: {
          registryItems: ["alert-dialog"],
          states: [],
        },
        title: {
          registryItems: ["alert-dialog"],
          states: [],
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
          registryItems: ["audio-recorder"],
          states: [],
        },
        duration: {
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
          context: {
            variant: "AudioVisualizerVariant",
          },
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
          registryItems: ["audio-visualizer"],
          states: [],
        },
        "bar-track": {
          registryItems: ["audio-visualizer"],
          states: [],
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
          ],
        },
      },
      registryItems: ["audio-visualizer", "audio-visualizer-line"],
    },
    "audio-visualizer-line": {
      parts: {
        root: {
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
          states: [],
        },
        group: {
          registryItems: ["autocomplete"],
          states: [],
        },
        "group-label": {
          registryItems: ["autocomplete"],
          states: [],
        },
        input: {
          context: {
            size: "ControlSize",
          },
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
          context: {
            disabled: "boolean",
          },
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
          ],
        },
        list: {
          registryItems: ["autocomplete"],
          states: [],
        },
      },
      registryItems: ["autocomplete"],
    },
    avatar: {
      parts: {
        root: {
          registryItems: ["avatar"],
          states: [],
        },
        fallback: {
          registryItems: ["avatar"],
          states: [],
        },
        group: {
          registryItems: ["avatar"],
          states: [],
        },
        image: {
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
          context: {
            color: "BadgeColor",
            size: "BadgeSize",
            variant: "BadgeVariant",
          },
          registryItems: ["badge"],
          states: [
            {
              attribute: "data-color",
              source: "control-ui",
              valueKind: "open",
              values: [],
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
          states: [],
        },
        ellipsis: {
          registryItems: ["breadcrumb"],
          states: [],
        },
        item: {
          registryItems: ["breadcrumb"],
          states: [],
        },
        link: {
          registryItems: ["breadcrumb"],
          states: [],
        },
        list: {
          registryItems: ["breadcrumb"],
          states: [],
        },
        page: {
          registryItems: ["breadcrumb"],
          states: [],
        },
        separator: {
          registryItems: ["breadcrumb"],
          states: [],
        },
      },
      registryItems: ["breadcrumb"],
    },
    button: {
      parts: {
        root: {
          context: {
            active: "boolean",
            shape: "ButtonShape",
            size: "ControlSize",
            tone: "ButtonTone",
            variant: "ButtonVariant",
          },
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
          registryItems: ["button", "dropdown-menu", "select"],
          states: [],
        },
      },
      registryItems: ["button", "dropdown-menu", "select"],
    },
    "button-group": {
      parts: {
        root: {
          context: {
            orientation: '"horizontal" | "vertical"',
          },
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
          registryItems: ["calendar"],
          states: [],
        },
        day: {
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
      },
      registryItems: ["calendar"],
    },
    card: {
      parts: {
        root: {
          context: {
            variant: "CardVariant",
          },
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
          registryItems: ["card"],
          states: [],
        },
        content: {
          registryItems: ["card"],
          states: [],
        },
        description: {
          registryItems: ["card"],
          states: [],
        },
        footer: {
          registryItems: ["card"],
          states: [],
        },
        header: {
          registryItems: ["card"],
          states: [],
        },
        title: {
          registryItems: ["card"],
          states: [],
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
          states: [],
        },
        footer: {
          registryItems: ["chat-composer"],
          states: [],
        },
        mention: {
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
        shell: {
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
          registryItems: ["chat-composer"],
          states: [],
        },
        toolbar: {
          registryItems: ["chat-composer"],
          states: [],
        },
        tools: {
          registryItems: ["chat-composer"],
          states: [],
        },
      },
      registryItems: ["chat-composer"],
    },
    "chat-composer-attachment": {
      parts: {
        root: {
          context: {
            kind: '"image" | "pdf" | "spreadsheet" | "document" | "archive" | "audio" | "video" | "file"',
            status: '"idle" | "uploading" | "uploaded" | "error"',
            variant: '"preview" | "file"',
          },
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
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        description: {
          context: {
            status: '"idle" | "uploading" | "uploaded" | "error"',
          },
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
          context: {
            kind: '"image" | "pdf" | "spreadsheet" | "document" | "archive" | "audio" | "video" | "file"',
            status: '"idle" | "uploading" | "uploaded" | "error"',
            variant: '"preview" | "file"',
          },
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        progress: {
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        "progress-indicator": {
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        remove: {
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        status: {
          context: {
            status: '"idle" | "uploading" | "uploaded" | "error"',
          },
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        title: {
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
      },
      registryItems: ["chat-composer-attachment"],
    },
    "chat-composer-attachments": {
      parts: {
        root: {
          registryItems: ["chat-composer-attachment"],
          states: [],
        },
        list: {
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
          registryItems: ["chat-composer"],
          states: [],
        },
      },
      registryItems: ["chat-composer"],
    },
    "chat-layout": {
      parts: {
        root: {
          registryItems: ["chat-layout"],
          states: [],
        },
      },
      registryItems: ["chat-layout"],
    },
    "chat-message": {
      parts: {
        root: {
          context: {
            density: "ChatDensity",
            role: "ChatRole",
            state: "ChatState",
            tone: "ChatTone",
          },
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
            {
              attribute: "data-tone",
              source: "control-ui",
              valueKind: "enum",
              values: ["danger", "neutral", "success", "warning"],
            },
          ],
        },
        avatar: {
          registryItems: ["chat-message"],
          states: [],
        },
        content: {
          context: {
            role: "ChatRole",
          },
          registryItems: ["chat-message"],
          states: [
            {
              attribute: "data-role",
              source: "control-ui",
              valueKind: "enum",
              values: ["assistant", "system", "tool", "user"],
            },
          ],
        },
        row: {
          registryItems: ["chat-message"],
          states: [],
        },
      },
      registryItems: ["chat-message"],
    },
    "chat-thought": {
      parts: {
        root: {
          registryItems: ["chat-layout"],
          states: [],
        },
        details: {
          registryItems: ["chat-layout"],
          states: [],
        },
        trigger: {
          registryItems: ["chat-layout"],
          states: [],
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
          context: {
            checked: "boolean",
            disabled: "boolean",
          },
          registryItems: ["checkbox"],
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
          context: {
            chrome: "CodeChrome",
            density: "CodeDensity",
          },
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
          registryItems: ["code"],
          states: [],
        },
        actions: {
          registryItems: ["code"],
          states: [],
        },
        content: {
          registryItems: ["code"],
          states: [],
        },
        gutter: {
          registryItems: ["code"],
          states: [],
        },
        header: {
          registryItems: ["code"],
          states: [],
        },
        line: {
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
          registryItems: ["code"],
          states: [],
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
          states: [],
        },
        header: {
          registryItems: ["code-block-editor"],
          states: [],
        },
        title: {
          registryItems: ["code-block-editor"],
          states: [],
        },
      },
      registryItems: ["code-block-editor"],
    },
    "code-diff": {
      parts: {
        root: {
          context: {
            diffStyle: "DiffStyle",
          },
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
          registryItems: ["code-diff"],
          states: [],
        },
        actions: {
          registryItems: ["code-diff"],
          states: [],
        },
        body: {
          registryItems: ["code-diff"],
          states: [],
        },
        "expand-button": {
          registryItems: ["code-diff"],
          states: [],
        },
        expander: {
          registryItems: ["code-diff"],
          states: [],
        },
        file: {
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
          registryItems: ["code-diff"],
          states: [],
        },
        gutter: {
          registryItems: ["code-diff"],
          states: [],
        },
        header: {
          registryItems: ["code-diff"],
          states: [],
        },
        line: {
          context: {
            lineType: "CodeDiffLineType",
          },
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
          registryItems: ["code-diff"],
          states: [],
        },
        stat: {
          registryItems: ["code-diff"],
          states: [],
        },
        title: {
          registryItems: ["code-diff"],
          states: [],
        },
      },
      registryItems: ["code-diff"],
    },
    collapsible: {
      parts: {
        root: {
          context: {
            state: '"open" | "closed"',
          },
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
          context: {
            state: '"open" | "closed"',
          },
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
          context: {
            state: '"open" | "closed"',
          },
          registryItems: [],
          states: [],
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
        area: {
          registryItems: ["color-picker"],
          states: [
            {
              attribute: "data-dragging",
              source: "control-ui",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        "area-thumb": {
          registryItems: ["color-picker"],
          states: [],
        },
        channel: {
          registryItems: ["color-picker"],
          states: [],
        },
        channels: {
          registryItems: ["color-picker"],
          states: [],
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
        input: {
          registryItems: ["color-picker"],
          states: [],
        },
        output: {
          registryItems: ["color-picker"],
          states: [],
        },
        panel: {
          registryItems: ["color-picker"],
          states: [],
        },
        swatch: {
          context: {
            selected: "boolean",
          },
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
          registryItems: ["color-picker"],
          states: [],
        },
        swatches: {
          registryItems: ["color-picker"],
          states: [],
        },
        trigger: {
          context: {
            disabled: "boolean",
          },
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
        wheel: {
          registryItems: ["color-picker"],
          states: [
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
          states: [],
        },
        group: {
          registryItems: ["combobox"],
          states: [],
        },
        "group-label": {
          registryItems: ["combobox"],
          states: [],
        },
        icon: {
          registryItems: ["combobox"],
          states: [],
        },
        input: {
          context: {
            size: "ControlSize",
          },
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
          context: {
            disabled: "boolean",
          },
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
              attribute: "data-selected",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        list: {
          registryItems: ["combobox"],
          states: [],
        },
        trigger: {
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
          states: [],
        },
        empty: {
          registryItems: ["command"],
          states: [],
        },
        group: {
          registryItems: ["command"],
          states: [],
        },
        input: {
          registryItems: ["command"],
          states: [],
        },
        "input-wrapper": {
          registryItems: ["command"],
          states: [
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
              attribute: "data-disabled",
              source: "control-ui",
              valueKind: "presence",
              values: [],
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
          states: [],
        },
        separator: {
          registryItems: ["command"],
          states: [],
        },
        shortcut: {
          registryItems: ["command"],
          states: [],
        },
      },
      registryItems: ["command"],
    },
    "context-menu": {
      parts: {
        "checkbox-item": {
          context: {
            disabled: "boolean",
          },
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
        group: {
          registryItems: ["context-menu"],
          states: [],
        },
        item: {
          context: {
            disabled: "boolean",
          },
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
          ],
        },
        label: {
          registryItems: ["context-menu"],
          states: [],
        },
        "radio-group": {
          registryItems: ["context-menu"],
          states: [],
        },
        "radio-item": {
          context: {
            disabled: "boolean",
          },
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
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        shortcut: {
          registryItems: ["context-menu"],
          states: [],
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
        "sub-trigger": {
          context: {
            disabled: "boolean",
          },
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
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        trigger: {
          registryItems: ["context-menu"],
          states: [
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
        close: {
          registryItems: ["dialog"],
          states: [],
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
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        description: {
          registryItems: ["dialog"],
          states: [],
        },
        footer: {
          registryItems: ["dialog"],
          states: [],
        },
        header: {
          registryItems: ["dialog"],
          states: [],
        },
        title: {
          registryItems: ["dialog"],
          states: [],
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
          context: {
            dragging: "boolean",
            placement: '"left" | "right"',
          },
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
          registryItems: ["dockable-panel"],
          states: [],
        },
        close: {
          registryItems: ["dockable-panel"],
          states: [],
        },
        content: {
          context: {
            padding: "DockablePanelContentPadding",
          },
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
        dock: {
          context: {
            active: "boolean",
            placement: '"left" | "right"',
          },
          registryItems: ["dockable-panel"],
          states: [],
        },
        "drag-handle": {
          context: {
            dragging: "boolean",
          },
          registryItems: ["dockable-panel"],
          states: [],
        },
        "drop-zone": {
          context: {
            active: "boolean",
            side: '"left" | "right"',
          },
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
          registryItems: ["dockable-panel"],
          states: [],
        },
        title: {
          registryItems: ["dockable-panel"],
          states: [],
        },
        toggle: {
          context: {
            placement: '"left" | "right"',
          },
          registryItems: ["dockable-panel"],
          states: [],
        },
      },
      registryItems: ["dockable-panel"],
    },
    drawer: {
      parts: {
        close: {
          registryItems: ["drawer"],
          states: [],
        },
        content: {
          context: {
            padding: "DrawerContentPadding",
            surface: "DrawerContentSurface",
          },
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
          ],
        },
        description: {
          registryItems: ["drawer"],
          states: [],
        },
        footer: {
          registryItems: ["drawer"],
          states: [],
        },
        handle: {
          registryItems: ["drawer"],
          states: [],
        },
        header: {
          registryItems: ["drawer"],
          states: [],
        },
        title: {
          registryItems: ["drawer"],
          states: [],
        },
        trigger: {
          registryItems: ["drawer"],
          states: [],
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
          context: {
            disabled: "boolean",
          },
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
          registryItems: ["dropdown-menu"],
          states: [],
        },
        separator: {
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
          context: {
            size: "ControlSize",
            variant: "DropdownMenuTriggerVariant",
          },
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
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["lg", "md", "sm", "xs"],
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
          context: {
            disabled: "boolean",
            empty: "boolean",
          },
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
          context: {
            disabled: "boolean",
            state: "DropzoneVisualState",
          },
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
        file: {
          registryItems: ["dropzone"],
          states: [],
        },
        "file-list": {
          context: {
            empty: "boolean",
          },
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
          registryItems: ["dropzone"],
          states: [],
        },
        overlay: {
          context: {
            active: "boolean",
            scope: "DropzoneOverlayScope",
            state: "DropzoneVisualState",
          },
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
          registryItems: ["dropzone"],
          states: [],
        },
        "rejection-list": {
          context: {
            empty: "boolean",
          },
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
          context: {
            state: "DropzoneVisualState",
          },
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
          context: {
            disabled: "boolean",
            state: "DropzoneVisualState",
          },
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
          context: {
            state: "DynamicNotificationState",
            variant: "DynamicNotificationVariant",
          },
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
          states: [],
        },
        content: {
          registryItems: ["dynamic-notification"],
          states: [],
        },
        glass: {
          registryItems: ["dynamic-notification"],
          states: [],
        },
        indicator: {
          registryItems: ["dynamic-notification"],
          states: [],
        },
        island: {
          context: {
            state: "DynamicNotificationState",
            variant: "DynamicNotificationVariant",
          },
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
          registryItems: ["dynamic-notification"],
          states: [],
        },
        message: {
          registryItems: ["dynamic-notification"],
          states: [],
        },
        pill: {
          registryItems: ["dynamic-notification"],
          states: [],
        },
        reply: {
          registryItems: ["dynamic-notification"],
          states: [],
        },
        "reply-input": {
          registryItems: ["dynamic-notification"],
          states: [],
        },
        "reply-submit": {
          registryItems: ["dynamic-notification"],
          states: [],
        },
        title: {
          registryItems: ["dynamic-notification"],
          states: [],
        },
        word: {
          registryItems: ["dynamic-notification"],
          states: [],
        },
      },
      registryItems: ["dynamic-notification"],
    },
    empty: {
      parts: {
        root: {
          registryItems: ["empty"],
          states: [],
        },
        content: {
          registryItems: ["empty"],
          states: [],
        },
        description: {
          registryItems: ["empty"],
          states: [],
        },
        header: {
          registryItems: ["empty"],
          states: [],
        },
        media: {
          registryItems: ["empty"],
          states: [],
        },
        title: {
          registryItems: ["empty"],
          states: [],
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
          states: [],
        },
        header: {
          registryItems: ["environment-variables"],
          states: [],
        },
        message: {
          registryItems: ["environment-variables"],
          states: [],
        },
        "readonly-item": {
          registryItems: ["environment-variables"],
          states: [],
        },
        "readonly-list": {
          registryItems: ["environment-variables"],
          states: [],
        },
        row: {
          registryItems: ["environment-variables"],
          states: [],
        },
        rows: {
          registryItems: ["environment-variables"],
          states: [],
        },
        toolbar: {
          registryItems: ["environment-variables"],
          states: [],
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
          states: [],
        },
        control: {
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
          states: [],
        },
        item: {
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
          states: [],
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
          ],
        },
        "separator-content": {
          registryItems: ["field"],
          states: [],
        },
        set: {
          registryItems: ["field"],
          states: [],
        },
        title: {
          registryItems: ["field"],
          states: [],
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
          states: [],
        },
        preview: {
          registryItems: ["gradient-editor"],
          states: [],
        },
        stop: {
          context: {
            selected: "boolean",
          },
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
          registryItems: ["gradient-editor"],
          states: [],
        },
        track: {
          registryItems: ["gradient-editor"],
          states: [],
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
        trigger: {
          registryItems: ["hover-card"],
          states: [
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
          context: {
            panning: "boolean",
          },
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
          context: {
            scale: "number",
          },
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
          registryItems: ["infinite-canvas"],
          states: [],
        },
      },
      registryItems: ["infinite-canvas"],
    },
    "inline-attachment": {
      parts: {
        root: {
          registryItems: ["inline-attachment"],
          states: [],
        },
        action: {
          registryItems: ["inline-attachment"],
          states: [],
        },
        content: {
          registryItems: ["inline-attachment"],
          states: [],
        },
        image: {
          registryItems: ["inline-attachment"],
          states: [],
        },
      },
      registryItems: ["inline-attachment"],
    },
    input: {
      parts: {
        root: {
          context: {
            size: "ControlSize",
          },
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
          context: {
            size: "ControlSize",
          },
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
          registryItems: ["input-group"],
          states: [],
        },
        input: {
          registryItems: ["input-group"],
          states: [],
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
          context: {
            variant: '"default" | "outline" | "muted"',
          },
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
          registryItems: ["item"],
          states: [],
        },
        content: {
          registryItems: ["item"],
          states: [],
        },
        description: {
          registryItems: ["item"],
          states: [],
        },
        footer: {
          registryItems: ["item"],
          states: [],
        },
        group: {
          registryItems: ["item"],
          states: [],
        },
        header: {
          registryItems: ["item"],
          states: [],
        },
        media: {
          registryItems: ["item"],
          states: [],
        },
        separator: {
          registryItems: ["item"],
          states: [],
        },
        title: {
          registryItems: ["item"],
          states: [],
        },
      },
      registryItems: ["item"],
    },
    kbd: {
      parts: {
        root: {
          registryItems: ["kbd"],
          states: [],
        },
        group: {
          registryItems: ["kbd"],
          states: [],
        },
      },
      registryItems: ["kbd"],
    },
    label: {
      parts: {
        root: {
          registryItems: ["label"],
          states: [],
        },
      },
      registryItems: ["label"],
    },
    markdown: {
      parts: {
        root: {
          registryItems: ["markdown"],
          states: [],
        },
      },
      registryItems: ["markdown"],
    },
    "markdown-block": {
      parts: {
        root: {
          registryItems: ["markdown-block"],
          states: [],
        },
        content: {
          registryItems: ["markdown-block"],
          states: [],
        },
        header: {
          registryItems: ["markdown-block"],
          states: [],
        },
        title: {
          registryItems: ["markdown-block"],
          states: [],
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
        group: {
          registryItems: ["menubar"],
          states: [],
        },
        item: {
          context: {
            disabled: "boolean",
          },
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
          ],
        },
        label: {
          registryItems: ["menubar"],
          states: [],
        },
        separator: {
          registryItems: ["menubar"],
          states: [
            {
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        shortcut: {
          registryItems: ["menubar"],
          states: [],
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
        "sub-trigger": {
          context: {
            disabled: "boolean",
          },
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
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        trigger: {
          registryItems: ["menubar"],
          states: [
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
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["sm"],
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
          states: [],
        },
        indicator: {
          registryItems: ["meter"],
          states: [],
        },
        label: {
          registryItems: ["meter"],
          states: [],
        },
        track: {
          registryItems: ["meter"],
          states: [],
        },
        value: {
          registryItems: ["meter"],
          states: [],
        },
      },
      registryItems: ["meter"],
    },
    "model-switcher": {
      parts: {
        root: {
          registryItems: ["model-switcher"],
          states: [],
        },
      },
      registryItems: ["model-switcher"],
    },
    "morphing-panel": {
      parts: {
        root: {
          context: {
            state: '"open" | "closed"',
          },
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
          context: {
            state: '"open" | "closed"',
          },
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
          context: {
            state: '"open" | "closed"',
          },
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
          context: {
            size: "ControlSize",
          },
          registryItems: ["native-select"],
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
      registryItems: ["native-select"],
    },
    "navigation-menu": {
      parts: {
        root: {
          registryItems: ["navigation-menu"],
          states: [],
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
        item: {
          registryItems: ["navigation-menu"],
          states: [],
        },
        link: {
          context: {
            active: "boolean",
            variant: "NavigationMenuLinkVariant",
          },
          registryItems: ["navigation-menu"],
          states: [
            {
              attribute: "data-active",
              source: "external",
              valueKind: "presence",
              values: [],
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
          states: [],
        },
        trigger: {
          registryItems: ["navigation-menu"],
          states: [
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
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["sm"],
            },
          ],
        },
        viewport: {
          registryItems: ["navigation-menu"],
          states: [],
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
        group: {
          context: {
            size: "ControlSize",
          },
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
          states: [],
        },
        content: {
          registryItems: ["pagination"],
          states: [],
        },
        ellipsis: {
          registryItems: ["pagination"],
          states: [],
        },
        item: {
          registryItems: ["pagination"],
          states: [],
        },
        link: {
          context: {
            active: "boolean",
          },
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
    popover: {
      parts: {
        close: {
          registryItems: ["popover"],
          states: [],
        },
        content: {
          context: {
            padding: "PopoverContentPadding",
          },
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
          states: [],
        },
        header: {
          registryItems: ["popover"],
          states: [],
        },
        title: {
          registryItems: ["popover"],
          states: [],
        },
        trigger: {
          registryItems: ["popover"],
          states: [
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
          context: {
            disabled: "boolean",
          },
          registryItems: ["radio-group"],
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
      },
      registryItems: ["radio-group"],
    },
    resizable: {
      parts: {
        handle: {
          context: {
            orientation: '"horizontal" | "vertical"',
          },
          registryItems: ["resizable"],
          states: [
            {
              attribute: "data-separator",
              source: "external",
              valueKind: "enum",
              values: ["active", "disabled", "focus", "hover"],
            },
          ],
        },
        "handle-grip": {
          registryItems: ["resizable"],
          states: [],
        },
        panel: {
          registryItems: ["resizable"],
          states: [],
        },
        "panel-group": {
          context: {
            orientation: '"horizontal" | "vertical"',
            variant: "ResizablePanelGroupVariant",
          },
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
    "scroll-area": {
      parts: {
        root: {
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
          registryItems: ["scroll-area"],
          states: [],
        },
        scrollbar: {
          context: {
            orientation: '"horizontal" | "vertical"',
          },
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
          ],
        },
        thumb: {
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
              attribute: "data-popup-open",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        item: {
          context: {
            disabled: "boolean",
          },
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
              attribute: "data-selected",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        trigger: {
          context: {
            size: "ControlSize",
            variant: "SelectTriggerVariant",
          },
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
        close: {
          registryItems: ["sheet"],
          states: [
            {
              attribute: "data-disabled",
              source: "external",
              valueKind: "presence",
              values: [],
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
              attribute: "data-starting-style",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        description: {
          registryItems: ["sheet"],
          states: [],
        },
        header: {
          registryItems: ["sheet"],
          states: [],
        },
        title: {
          registryItems: ["sheet"],
          states: [],
        },
      },
      registryItems: ["sheet"],
    },
    sidebar: {
      parts: {
        root: {
          context: {
            dragging: "boolean",
          },
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
          registryItems: ["sidebar"],
          states: [],
        },
        content: {
          registryItems: ["sidebar"],
          states: [],
        },
        footer: {
          registryItems: ["sidebar"],
          states: [],
        },
        gap: {
          registryItems: ["sidebar"],
          states: [],
        },
        group: {
          registryItems: ["sidebar"],
          states: [],
        },
        "group-label": {
          registryItems: ["sidebar"],
          states: [],
        },
        header: {
          registryItems: ["sidebar"],
          states: [],
        },
        inner: {
          context: {
            dragging: "boolean",
          },
          registryItems: ["sidebar"],
          states: [],
        },
        inset: {
          registryItems: ["sidebar"],
          states: [],
        },
        menu: {
          registryItems: ["sidebar"],
          states: [],
        },
        "menu-button": {
          context: {
            active: "boolean",
            indicator: "SelectionIndicator",
          },
          registryItems: ["sidebar"],
          states: [
            {
              attribute: "data-active",
              source: "control-ui",
              valueKind: "enum",
              values: ["false", "true"],
            },
            {
              attribute: "data-size",
              source: "control-ui",
              valueKind: "enum",
              values: ["default", "lg", "sm"],
            },
          ],
        },
        "menu-item": {
          registryItems: ["sidebar"],
          states: [],
        },
        "menu-track": {
          registryItems: ["sidebar"],
          states: [],
        },
        rail: {
          registryItems: ["sidebar"],
          states: [],
        },
        trigger: {
          registryItems: ["sidebar"],
          states: [],
        },
        wrapper: {
          registryItems: ["sidebar"],
          states: [],
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
          states: [],
        },
      },
      registryItems: ["skeleton"],
    },
    slider: {
      parts: {
        root: {
          context: {
            labeled: "boolean",
            variant: "SliderVariant",
          },
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
        indicator: {
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
          registryItems: ["slider"],
          states: [],
        },
        thumb: {
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
        track: {
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
        value: {
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
          states: [],
        },
        favicon: {
          registryItems: ["source-badge"],
          states: [],
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
          states: [],
        },
      },
      registryItems: ["spinner"],
    },
    stepper: {
      parts: {
        root: {
          context: {
            contentMode: "StepperContentMode",
            orientation: "StepperOrientation",
            responsive: "boolean",
          },
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
          context: {
            active: "boolean",
          },
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
          registryItems: ["stepper"],
          states: [],
        },
        indicator: {
          context: {
            invalid: "boolean",
            state: "StepperState",
          },
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
          context: {
            disabled: "boolean",
            invalid: "boolean",
            state: "StepperState",
          },
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
          context: {
            orientation: "StepperOrientation",
            responsive: "boolean",
          },
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
          context: {
            invalid: "boolean",
            state: "StepperState",
          },
          registryItems: ["stepper"],
          states: [
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
          states: [],
        },
        trigger: {
          context: {
            disabled: "boolean",
            invalid: "boolean",
            state: "StepperState",
          },
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
          context: {
            checked: "boolean",
            disabled: "boolean",
          },
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
          context: {
            checked: "boolean",
          },
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
          registryItems: ["table"],
          states: [],
        },
        body: {
          registryItems: ["table"],
          states: [],
        },
        caption: {
          registryItems: ["table"],
          states: [],
        },
        cell: {
          registryItems: ["table"],
          states: [],
        },
        container: {
          registryItems: ["table"],
          states: [],
        },
        footer: {
          registryItems: ["table"],
          states: [],
        },
        head: {
          registryItems: ["table"],
          states: [],
        },
        header: {
          registryItems: ["table"],
          states: [],
        },
        row: {
          registryItems: ["table"],
          states: [],
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
              attribute: "data-variant",
              source: "control-ui",
              valueKind: "enum",
              values: ["background", "both", "trail"],
            },
          ],
        },
        item: {
          context: {
            active: "boolean",
            variant: "TableOfContentsVariant",
          },
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
        list: {
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
          registryItems: ["table-of-contents"],
          states: [],
        },
        track: {
          registryItems: ["table-of-contents"],
          states: [],
        },
        trail: {
          registryItems: ["table-of-contents"],
          states: [],
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
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
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
              attribute: "data-orientation",
              source: "external",
              valueKind: "enum",
              values: ["horizontal", "vertical"],
            },
          ],
        },
        list: {
          context: {
            size: "ControlSize",
            variant: "TabsListVariant",
          },
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
          states: [],
        },
        item: {
          context: {
            status: "TaskStatus",
          },
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
          context: {
            status: "TaskStatus",
          },
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
          registryItems: ["task-list"],
          states: [],
        },
        label: {
          registryItems: ["task-list"],
          states: [],
        },
        progress: {
          registryItems: ["task-list"],
          states: [],
        },
      },
      registryItems: ["task-list"],
    },
    textarea: {
      parts: {
        root: {
          registryItems: ["textarea"],
          states: [],
        },
      },
      registryItems: ["textarea"],
    },
    "thread-rail": {
      parts: {
        root: {
          registryItems: ["thread-rail"],
          states: [],
        },
        file: {
          registryItems: ["thread-rail"],
          states: [],
        },
        footer: {
          registryItems: ["thread-rail"],
          states: [],
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
          states: [],
        },
        popover: {
          registryItems: ["thread-rail"],
          states: [],
        },
        title: {
          registryItems: ["thread-rail"],
          states: [],
        },
      },
      registryItems: ["thread-rail"],
    },
    toast: {
      parts: {
        root: {
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
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        action: {
          registryItems: ["toast"],
          states: [
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
              attribute: "data-type",
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
              attribute: "data-type",
              source: "external",
              valueKind: "presence",
              values: [],
            },
          ],
        },
        title: {
          registryItems: ["toast"],
          states: [
            {
              attribute: "data-type",
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
          context: {
            active: "boolean",
            size: "ControlSize",
            tone: "ButtonTone",
            variant: "ButtonVariant",
          },
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
          registryItems: ["toggle"],
          states: [],
        },
        group: {
          context: {
            orientation: '"horizontal" | "vertical"',
          },
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
          context: {
            orientation: '"horizontal" | "vertical"',
            variant: "ToolbarVariant",
          },
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
          context: {
            variant: "ToolbarLinkVariant",
          },
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
      },
      registryItems: ["tooltip"],
    },
    "track-highlight": {
      parts: {
        root: {
          registryItems: ["track-highlight"],
          states: [],
        },
        hover: {
          registryItems: ["track-highlight"],
          states: [],
        },
      },
      registryItems: ["track-highlight"],
    },
    tree: {
      parts: {
        root: {
          context: {
            selectionMode: "TreeSelectionMode",
          },
          registryItems: ["tree"],
          states: [],
        },
        item: {
          context: {
            disabled: "boolean",
            expanded: "boolean",
            level: "number",
            selected: "boolean",
          },
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
          context: {
            state: '"open" | "closed"',
          },
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
        "item-indicator": {
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
          registryItems: ["tree"],
          states: [],
        },
        "item-trigger": {
          context: {
            disabled: "boolean",
            expanded: "boolean",
            indicator: "SelectionIndicator",
            selected: "boolean",
          },
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
          registryItems: ["tree"],
          states: [],
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
          states: [],
        },
        group: {
          registryItems: ["trigger-menu"],
          states: [],
        },
        "group-label": {
          registryItems: ["trigger-menu"],
          states: [],
        },
        icon: {
          registryItems: ["trigger-menu"],
          states: [],
        },
        item: {
          context: {
            disabled: "boolean",
            highlighted: "boolean",
          },
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
          ],
        },
        list: {
          registryItems: ["trigger-menu"],
          states: [],
        },
      },
      registryItems: ["trigger-menu"],
    },
    "user-ask": {
      parts: {
        root: {
          registryItems: ["user-ask"],
          states: [],
        },
        dismiss: {
          registryItems: ["user-ask"],
          states: [],
        },
        footer: {
          registryItems: ["user-ask"],
          states: [],
        },
        header: {
          registryItems: ["user-ask"],
          states: [],
        },
        option: {
          context: {
            disabled: "boolean",
            selected: "boolean",
          },
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
          registryItems: ["user-ask"],
          states: [],
        },
        "option-indicator": {
          context: {
            selected: "boolean",
          },
          registryItems: ["user-ask"],
          states: [],
        },
        "option-input": {
          registryItems: ["user-ask"],
          states: [],
        },
        "option-label": {
          registryItems: ["user-ask"],
          states: [],
        },
        pagination: {
          registryItems: ["user-ask"],
          states: [],
        },
        question: {
          context: {
            active: "boolean",
          },
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
        submit: {
          registryItems: ["user-ask"],
          states: [],
        },
        title: {
          registryItems: ["user-ask"],
          states: [],
        },
      },
      registryItems: ["user-ask"],
    },
  },
  paints: {
    "chat-message": {
      streaming: {
        context: {},
      },
    },
    skeleton: {
      shimmer: {
        context: {},
      },
    },
  },
  adornments: {
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
      separator: [
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
          scope: "hover-card",
          part: "content",
        },
        {
          scope: "popover",
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
        scope: "input-otp",
        part: "slot",
      },
      {
        scope: "menubar",
        part: "trigger",
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
          scope: "tooltip",
          part: "content",
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
          scope: "activity",
          part: "root",
        },
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
    "data-unchecked",
    "data-valid",
    "data-visible",
  ],
} as const;
