import { preview, sourceFile } from "./shared";

export const primitiveCategories = [
  { id: "layout", label: "Layout" },
  { id: "actions", label: "Actions" },
  { id: "forms", label: "Forms" },
  { id: "navigation", label: "Navigation" },
  { id: "overlays", label: "Overlays" },
  { id: "feedback", label: "Feedback" },
  { id: "display", label: "Display" },
] as const;

export type PrimitiveCategoryId = (typeof primitiveCategories)[number]["id"];

const surfaceVariantsFile = sourceFile("Surface variants", "src/registry/sources/control-ui/surface-variants.ts", "surface-variants");

export const primitiveEntries = [
  {
    id: "button",
    category: "actions",
    kind: "Primitive",
    name: "Button",
    summary: "Accessible action button with size, variant, and semantic tone support.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/button",
    paths: {
      registry: {
        target: "components/control-ui/ui/button.tsx",
        example: sourceFile("Button preview", "src/registry/examples/control-ui/primitives/button.tsx", "example"),
        source: sourceFile("Button slot", "src/registry/sources/control-ui/ui/button.tsx", "component"),
        supportFiles: [
          sourceFile("Control variants", "src/registry/sources/control-ui/control-variants.ts", "control-variants"),
          sourceFile("Effect utilities", "src/registry/sources/control-ui/effects.css", "effect-css"),
        ],
        registryKind: "button",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/button").then((mod) => ({ default: mod.PrimitiveButtonExample })),
    ),
  },
  {
    id: "collapsible",
    category: "display",
    kind: "Primitive",
    name: "Collapsible",
    summary: "Accessible disclosure primitive with measured open and close motion.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/collapsible",
    paths: {
      registry: {
        target: "components/control-ui/ui/collapsible.tsx",
        example: sourceFile("Collapsible preview", "src/registry/examples/control-ui/primitives/collapsible.tsx", "example"),
        source: sourceFile("Base UI Collapsible slot", "src/registry/sources/control-ui/ui/collapsible.tsx", "component"),
        registryKind: "collapsible",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/collapsible").then((mod) => ({ default: mod.PrimitiveCollapsibleExample })),
    ),
  },
  {
    id: "tabs",
    category: "navigation",
    kind: "Primitive",
    name: "Tabs",
    summary: "Segmented and browser-style navigation with a stable active indicator.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/tabs",
    paths: {
      registry: {
        target: "components/control-ui/ui/tabs.tsx",
        example: sourceFile("Tabs preview", "src/registry/examples/control-ui/primitives/tabs.tsx", "example"),
        source: sourceFile("Base UI Tabs slot", "src/registry/sources/control-ui/ui/tabs.tsx", "component"),
        registryKind: "tabs",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/tabs").then((mod) => ({ default: mod.PrimitiveTabsExample })),
    ),
  },
  {
    id: "sidebar",
    category: "layout",
    kind: "Primitive",
    status: "beta",
    name: "Sidebar",
    summary: "Responsive app sidebar with collapse, mobile sheet, and keyboard toggle support.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/sidebar",
    paths: {
      registry: {
        target: "components/control-ui/ui/sidebar.tsx",
        example: sourceFile("Sidebar preview", "src/registry/examples/control-ui/primitives/sidebar.tsx", "example"),
        source: sourceFile("Sidebar slot", "src/registry/sources/control-ui/ui/sidebar.tsx", "component"),
        supportFiles: [
          sourceFile("Mobile hook", "src/registry/hooks/use-mobile.ts", "hook"),
          sourceFile("Sheet slot", "src/registry/sources/control-ui/ui/sheet.tsx", "skin-control"),
          sourceFile("Tooltip slot", "src/registry/sources/control-ui/ui/tooltip.tsx", "skin-control"),
        ],
        composition: [
          {
            title: "Application shell",
            description: "Provider owns responsive state; Sidebar and SidebarInset stay as siblings.",
            code: `SidebarProvider
├── Sidebar
│   ├── SidebarHeader
│   ├── SidebarContent
│   │   └── SidebarGroup
│   │       ├── SidebarGroupLabel
│   │       └── SidebarMenu
│   │           └── SidebarMenuItem
│   │               └── SidebarMenuButton
│   ├── SidebarFooter
│   └── SidebarRail
└── SidebarInset
    └── SidebarTrigger`,
          },
        ],
        registryKind: "sidebar",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/sidebar").then((mod) => ({ default: mod.PrimitiveSidebarExample })),
    ),
  },
  {
    id: "scroll-area",
    category: "layout",
    kind: "Primitive",
    name: "Scroll area",
    summary: "Scroll container with overlay scrollbars and edge fades.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/scroll-area",
    paths: {
      registry: {
        target: "components/control-ui/ui/scroll-area.tsx",
        example: sourceFile("Scroll area preview", "src/registry/examples/control-ui/primitives/scroll-area.tsx", "example"),
        source: sourceFile("Base UI Scroll area slot", "src/registry/sources/control-ui/ui/scroll-area.tsx", "component"),
        registryKind: "scroll-area",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/scroll-area").then((mod) => ({ default: mod.PrimitiveScrollAreaExample })),
    ),
  },
  {
    id: "table-of-contents",
    category: "navigation",
    kind: "Primitive",
    name: "Table of contents",
    summary: "Sticky in-page navigation with scroll-spy range highlighting.",
    paths: {
      registry: {
        target: "components/control-ui/ui/table-of-contents.tsx",
        example: sourceFile("Table of contents preview", "src/registry/examples/control-ui/primitives/table-of-contents.tsx", "example"),
        source: sourceFile("Table of contents slot", "src/registry/sources/control-ui/ui/table-of-contents.tsx", "component"),
        registryKind: "table-of-contents",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/table-of-contents").then((mod) => ({
        default: mod.PrimitiveTableOfContentsExample,
      })),
    ),
  },
  {
    id: "stepper",
    category: "navigation",
    kind: "Primitive",
    name: "Stepper",
    summary: "Static and interactive workflow steps with horizontal and vertical layouts.",
    paths: {
      registry: {
        target: "components/control-ui/ui/stepper.tsx",
        example: sourceFile("Static stepper preview", "src/registry/examples/control-ui/primitives/stepper.tsx", "example"),
        source: sourceFile("Stepper slot", "src/registry/sources/control-ui/ui/stepper.tsx", "component"),
        registryKind: "stepper",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/stepper").then((mod) => ({ default: mod.PrimitiveStepperExample })),
    ),
    additionalPreviews: [
      {
        id: "controlled-vertical",
        title: "Controlled vertical workflow",
        description: "Application state owns navigation while Stepper derives progress and keeps inactive panels mounted.",
        previewClassName: "flex min-h-[420px] items-start justify-center p-6",
        source: sourceFile("Controlled stepper preview", "src/registry/examples/control-ui/primitives/stepper-controlled.tsx", "example"),
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/primitives/stepper-controlled").then((mod) => ({
            default: mod.PrimitiveControlledStepperExample,
          })),
        ),
      },
    ],
  },
  {
    id: "skeleton",
    category: "feedback",
    kind: "Primitive",
    status: "beta",
    name: "Skeleton",
    summary: "Loading placeholder with a token-driven shimmer.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/skeleton",
    paths: {
      registry: {
        target: "components/control-ui/ui/skeleton.tsx",
        example: sourceFile("Skeleton preview", "src/registry/examples/control-ui/primitives/skeleton.tsx", "example"),
        source: sourceFile("Skeleton slot", "src/registry/sources/control-ui/ui/skeleton.tsx", "component"),
        registryKind: "skeleton",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/skeleton").then((mod) => ({ default: mod.PrimitiveSkeletonExample })),
    ),
  },
  {
    id: "slider",
    category: "forms",
    kind: "Primitive",
    name: "Slider",
    summary: "Single-value range control with branded and plain treatments.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/slider",
    paths: {
      registry: {
        target: "components/control-ui/ui/slider.tsx",
        example: sourceFile("Slider preview", "src/registry/examples/control-ui/primitives/slider.tsx", "example"),
        source: sourceFile("Base UI Slider slot", "src/registry/sources/control-ui/ui/slider.tsx", "component"),
        registryKind: "slider",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/slider").then((mod) => ({ default: mod.PrimitiveSliderExample })),
    ),
  },
  {
    id: "select",
    category: "forms",
    kind: "Primitive",
    name: "Select",
    summary: "Single-choice picker with a token-matched trigger and floating list.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/select",
    paths: {
      registry: {
        target: "components/control-ui/ui/select.tsx",
        example: sourceFile("Select preview", "src/registry/examples/control-ui/primitives/select.tsx", "example"),
        source: sourceFile("Base UI Select slot", "src/registry/sources/control-ui/ui/select.tsx", "component"),
        supportFiles: [
          sourceFile("Control variants", "src/registry/sources/control-ui/control-variants.ts", "control-variants"),
          surfaceVariantsFile,
          sourceFile("Effect utilities", "src/registry/sources/control-ui/effects.css", "effect-css"),
        ],
        registryKind: "select",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/select").then((mod) => ({ default: mod.PrimitiveSelectExample })),
    ),
  },
  {
    id: "dropdown-menu",
    category: "actions",
    kind: "Primitive",
    name: "DropdownMenu",
    summary: "Dropdown menu for actions, resources, labels, separators, and submenus.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/dropdown-menu",
    paths: {
      registry: {
        target: "components/control-ui/ui/dropdown-menu.tsx",
        example: sourceFile("Dropdown menu preview", "src/registry/examples/control-ui/primitives/dropdown-menu.tsx", "example"),
        source: sourceFile("Base UI Dropdown Menu slot", "src/registry/sources/control-ui/ui/dropdown-menu.tsx", "component"),
        supportFiles: [
          sourceFile("Control variants", "src/registry/sources/control-ui/control-variants.ts", "control-variants"),
          surfaceVariantsFile,
          sourceFile("Effect utilities", "src/registry/sources/control-ui/effects.css", "effect-css"),
        ],
        registryKind: "dropdown-menu",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/dropdown-menu").then((mod) => ({ default: mod.PrimitiveDropdownMenuExample })),
    ),
  },
  {
    id: "context-menu",
    category: "actions",
    kind: "Primitive",
    name: "Context Menu",
    summary: "Pointer-positioned right-click and long-press menu with nested actions and selection controls.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/context-menu",
    paths: {
      registry: {
        target: "components/control-ui/ui/context-menu.tsx",
        example: sourceFile("Context menu preview", "src/registry/examples/control-ui/primitives/context-menu.tsx", "example"),
        source: sourceFile("Base UI Context menu slot", "src/registry/sources/control-ui/ui/context-menu.tsx", "component"),
        supportFiles: [surfaceVariantsFile],
        registryKind: "context-menu",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/context-menu").then((mod) => ({ default: mod.PrimitiveContextMenuExample })),
    ),
  },
  {
    id: "toggle",
    category: "actions",
    kind: "Primitive",
    name: "Toggle",
    summary: "Pressed-state button and toggle group built on the Button surface.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/toggle",
    paths: {
      registry: {
        target: "components/control-ui/ui/toggle.tsx",
        example: sourceFile("Toggle preview", "src/registry/examples/control-ui/primitives/toggle.tsx", "example"),
        source: sourceFile("Base UI Toggle slot", "src/registry/sources/control-ui/ui/toggle.tsx", "component"),
        supportFiles: [sourceFile("Button slot", "src/registry/sources/control-ui/ui/button.tsx", "skin-control")],
        registryKind: "toggle",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/toggle").then((mod) => ({ default: mod.PrimitiveToggleExample })),
    ),
  },
  {
    id: "switch",
    category: "forms",
    kind: "Primitive",
    name: "Switch",
    summary: "On/off control with token-driven track, thumb, and press motion.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/switch",
    paths: {
      registry: {
        target: "components/control-ui/ui/switch.tsx",
        example: sourceFile("Switch preview", "src/registry/examples/control-ui/primitives/switch.tsx", "example"),
        source: sourceFile("Base UI Switch slot", "src/registry/sources/control-ui/ui/switch.tsx", "component"),
        registryKind: "switch",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/switch").then((mod) => ({ default: mod.PrimitiveSwitchExample })),
    ),
  },
  {
    id: "dialog",
    category: "overlays",
    kind: "Primitive",
    name: "Dialog",
    summary: "Modal dialog for focused tasks, confirmations, and custom panels.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/dialog",
    paths: {
      registry: {
        target: "components/control-ui/ui/dialog.tsx",
        example: sourceFile("Dialog preview", "src/registry/examples/control-ui/primitives/dialog.tsx", "example"),
        source: sourceFile("Base UI Dialog slot", "src/registry/sources/control-ui/ui/dialog.tsx", "component"),
        supportFiles: [sourceFile("Button slot", "src/registry/sources/control-ui/ui/button.tsx", "skin-control")],
        registryKind: "dialog",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/dialog").then((mod) => ({ default: mod.PrimitiveDialogExample })),
    ),
  },
  {
    id: "popover",
    category: "overlays",
    kind: "Primitive",
    name: "Popover",
    summary: "Anchored floating panel for inline settings and contextual content.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/popover",
    paths: {
      registry: {
        target: "components/control-ui/ui/popover.tsx",
        example: sourceFile("Popover preview", "src/registry/examples/control-ui/primitives/popover.tsx", "example"),
        source: sourceFile("Base UI Popover slot", "src/registry/sources/control-ui/ui/popover.tsx", "component"),
        supportFiles: [surfaceVariantsFile],
        registryKind: "popover",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/popover").then((mod) => ({ default: mod.PrimitivePopoverExample })),
    ),
  },
  {
    id: "tooltip",
    category: "overlays",
    kind: "Primitive",
    name: "Tooltip",
    summary: "Hover or focus hint popup with Base UI positioning and Control UI tokens.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/tooltip",
    paths: {
      registry: {
        target: "components/control-ui/ui/tooltip.tsx",
        example: sourceFile("Tooltip preview", "src/registry/examples/control-ui/primitives/tooltip.tsx", "example"),
        source: sourceFile("Base UI Tooltip slot", "src/registry/sources/control-ui/ui/tooltip.tsx", "component"),
        registryKind: "tooltip",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/tooltip").then((mod) => ({ default: mod.PrimitiveTooltipExample })),
    ),
  },
  {
    id: "drawer",
    category: "overlays",
    kind: "Primitive",
    name: "Drawer",
    summary: "Swipeable edge panel for mobile sheets and off-canvas surfaces.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/drawer",
    paths: {
      registry: {
        target: "components/control-ui/ui/drawer.tsx",
        example: sourceFile("Drawer preview", "src/registry/examples/control-ui/primitives/drawer.tsx", "example"),
        source: sourceFile("Base UI Drawer slot", "src/registry/sources/control-ui/ui/drawer.tsx", "component"),
        registryKind: "drawer",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/drawer").then((mod) => ({ default: mod.PrimitiveDrawerExample })),
    ),
    additionalPreviews: [
      {
        id: "nested",
        title: "Nested drawers",
        description: "Open a multi-step flow without unmounting the parent drawer or losing its focus-managed context.",
        previewClassName: "flex min-h-[240px] items-center justify-center p-6",
        source: sourceFile("Nested drawer preview", "src/registry/examples/control-ui/primitives/drawer-nested.tsx", "example"),
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/primitives/drawer-nested").then((mod) => ({
            default: mod.PrimitiveNestedDrawerExample,
          })),
        ),
      },
      {
        id: "sides",
        title: "Drawer sides",
        description: "Match the drawer placement and dismissal gesture to any viewport edge.",
        previewClassName: "flex min-h-[240px] items-center justify-center p-6",
        source: sourceFile("Drawer sides preview", "src/registry/examples/control-ui/primitives/drawer-sides.tsx", "example"),
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/primitives/drawer-sides").then((mod) => ({
            default: mod.PrimitiveDrawerSidesExample,
          })),
        ),
      },
      {
        id: "scrollable",
        title: "Scrollable content",
        description: "Keep the header and close action visible while a longer drawer body scrolls.",
        previewClassName: "flex min-h-[240px] items-center justify-center p-6",
        source: sourceFile("Scrollable drawer preview", "src/registry/examples/control-ui/primitives/drawer-scrollable.tsx", "example"),
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/primitives/drawer-scrollable").then((mod) => ({
            default: mod.PrimitiveScrollableDrawerExample,
          })),
        ),
      },
    ],
  },
  {
    id: "responsive-dialog",
    category: "overlays",
    kind: "Primitive",
    name: "Responsive dialog",
    summary: "Modal dialog on desktop that becomes a swipeable bottom drawer on mobile.",
    paths: {
      registry: {
        target: "components/control-ui/ui/responsive-dialog.tsx",
        example: sourceFile("Responsive dialog preview", "src/registry/examples/control-ui/primitives/responsive-dialog.tsx", "example"),
        source: sourceFile("Responsive dialog composition", "src/registry/sources/control-ui/ui/responsive-dialog.tsx", "component"),
        registryKind: "responsive-dialog",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/responsive-dialog").then((mod) => ({
        default: mod.PrimitiveResponsiveDialogExample,
      })),
    ),
  },
  {
    id: "toast",
    category: "feedback",
    kind: "Primitive",
    name: "Toast",
    summary: "Transient notifications with a callable toast API and single Toaster mount.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/sonner",
    paths: {
      registry: {
        target: "components/control-ui/ui/toast.tsx",
        example: sourceFile("Toast preview", "src/registry/examples/control-ui/primitives/toast.tsx", "example"),
        source: sourceFile("Base UI Toast slot", "src/registry/sources/control-ui/ui/toast.tsx", "component"),
        supportFiles: [surfaceVariantsFile],
        registryKind: "toast",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/toast").then((mod) => ({ default: mod.PrimitiveToastExample })),
    ),
  },
  {
    id: "input",
    category: "forms",
    kind: "Primitive",
    name: "Input",
    summary: "Text field primitive sized and styled to match other controls.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/input",
    paths: {
      registry: {
        target: "components/control-ui/ui/input.tsx",
        example: sourceFile("Input preview", "src/registry/examples/control-ui/primitives/input.tsx", "example"),
        source: sourceFile("Base UI Input slot", "src/registry/sources/control-ui/ui/input.tsx", "component"),
        supportFiles: [sourceFile("Control variants", "src/registry/sources/control-ui/control-variants.ts", "control-variants")],
        registryKind: "input",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/input").then((mod) => ({ default: mod.PrimitiveInputExample })),
    ),
  },
  {
    id: "input-group",
    category: "forms",
    kind: "Primitive",
    name: "Input group",
    summary: "Joined input wrapper for addons, icons, and focus-within rings.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/input-group",
    paths: {
      registry: {
        target: "components/control-ui/ui/input-group.tsx",
        example: sourceFile("Input group preview", "src/registry/examples/control-ui/primitives/input-group.tsx", "example"),
        source: sourceFile("Input group slot", "src/registry/sources/control-ui/ui/input-group.tsx", "component"),
        supportFiles: [sourceFile("Control variants", "src/registry/sources/control-ui/control-variants.ts", "control-variants")],
        registryKind: "input-group",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/input-group").then((mod) => ({ default: mod.PrimitiveInputGroupExample })),
    ),
  },
  {
    id: "dropzone",
    category: "forms",
    kind: "Primitive",
    status: "beta",
    name: "Dropzone",
    summary: "Composable file intake with validation, managed selection, and drag-activated overlays.",
    paths: {
      registry: {
        target: "components/control-ui/ui/dropzone.tsx",
        example: sourceFile("Dropzone preview", "src/registry/examples/control-ui/primitives/dropzone.tsx", "example"),
        source: sourceFile("Dropzone slot", "src/registry/sources/control-ui/ui/dropzone.tsx", "component"),
        supportFiles: [
          sourceFile("Dropzone hook", "src/registry/hooks/use-dropzone.ts", "hook"),
          sourceFile("Dropzone file policy", "src/registry/lib/dropzone-validation.ts", "policy"),
        ],
        composition: [
          {
            title: "Visible and overlay intake",
            description: "The root owns selection and policy while Area alone defines the bounded native drop target.",
            code: "Dropzone → Input + Area(Trigger/Overlay/content) + Lists + Status",
          },
        ],
        registryKind: "dropzone",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/dropzone").then((mod) => ({
        default: mod.PrimitiveDropzoneExample,
      })),
    ),
    additionalPreviews: [
      {
        id: "invisible-overlay",
        title: "Invisible overlay",
        description: "Document drag tracking reveals a bounded workspace overlay; only the Area accepts the drop.",
        previewClassName: "flex min-h-[420px] items-center justify-center p-6",
        source: sourceFile("Invisible overlay preview", "src/registry/examples/control-ui/primitives/dropzone-overlay.tsx", "example"),
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/primitives/dropzone-overlay").then((mod) => ({
            default: mod.PrimitiveDropzoneOverlayExample,
          })),
        ),
      },
    ],
  },
  {
    id: "phone-input",
    category: "forms",
    kind: "Primitive",
    name: "Phone input",
    summary: "International phone field with country search, E.164 values, and Zod validation helpers.",
    status: "beta",
    paths: {
      registry: {
        target: "components/control-ui/ui/phone-input.tsx",
        example: sourceFile("Phone input preview", "src/registry/examples/control-ui/primitives/phone-input.tsx", "example"),
        source: sourceFile("International phone input", "src/registry/sources/control-ui/ui/phone-input.tsx", "component"),
        supportFiles: [
          sourceFile("Phone number schemas", "src/registry/lib/phone-number.ts", "util"),
          sourceFile("Phone input formatting", "src/registry/lib/phone-input-format.ts", "util"),
        ],
        composition: [
          {
            title: "Country-aware form field",
            description: "Field wires labels and errors while PhoneInput submits a canonical E.164 value.",
            code: `Field
├── FieldLabel
├── FieldControl render={<PhoneInput />}
│   └── PhoneInput
│       └── InputGroup
│           ├── Country search (Popover + Command)
│           └── InputGroupInput
├── FieldDescription
└── FieldError`,
          },
        ],
        registryKind: "phone-input",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/phone-input").then((mod) => ({ default: mod.PrimitivePhoneInputExample })),
    ),
  },
  {
    id: "command",
    category: "actions",
    kind: "Primitive",
    name: "Command",
    summary: "Command palette with token-matched dialog, input, and result rows.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/command",
    paths: {
      registry: {
        target: "components/control-ui/ui/command.tsx",
        example: sourceFile("Command preview", "src/registry/examples/control-ui/primitives/command.tsx", "example"),
        source: sourceFile("cmdk Command slot", "src/registry/sources/control-ui/ui/command.tsx", "component"),
        supportFiles: [
          sourceFile("Dialog slot", "src/registry/sources/control-ui/ui/dialog.tsx", "skin-control"),
          sourceFile("Button slot", "src/registry/sources/control-ui/ui/button.tsx", "skin-control"),
          surfaceVariantsFile,
        ],
        registryKind: "command",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/command").then((mod) => ({ default: mod.PrimitiveCommandExample })),
    ),
  },
  {
    id: "kbd",
    category: "display",
    kind: "Primitive",
    name: "Kbd",
    summary: "Keyboard shortcut chip and chord group.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/kbd",
    paths: {
      registry: {
        target: "components/control-ui/ui/kbd.tsx",
        example: sourceFile("Kbd preview", "src/registry/examples/control-ui/primitives/kbd.tsx", "example"),
        source: sourceFile("Kbd slot", "src/registry/sources/control-ui/ui/kbd.tsx", "component"),
        registryKind: "kbd",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/kbd").then((mod) => ({ default: mod.PrimitiveKbdExample })),
    ),
  },
  {
    id: "checkbox",
    category: "forms",
    kind: "Primitive",
    name: "Checkbox",
    summary: "Single checkbox control with checked and indeterminate states.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/checkbox",
    paths: {
      registry: {
        target: "components/control-ui/ui/checkbox.tsx",
        example: sourceFile("Checkbox preview", "src/registry/examples/control-ui/primitives/checkbox.tsx", "example"),
        source: sourceFile("Base UI Checkbox slot", "src/registry/sources/control-ui/ui/checkbox.tsx", "component"),
        registryKind: "checkbox",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/checkbox").then((mod) => ({ default: mod.PrimitiveCheckboxExample })),
    ),
  },
  {
    id: "radio-group",
    category: "forms",
    kind: "Primitive",
    name: "Radio group",
    summary: "Single-choice radio set for plans, filters, and option lists.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/radio-group",
    paths: {
      registry: {
        target: "components/control-ui/ui/radio-group.tsx",
        example: sourceFile("Radio group preview", "src/registry/examples/control-ui/primitives/radio-group.tsx", "example"),
        source: sourceFile("Base UI Radio group slot", "src/registry/sources/control-ui/ui/radio-group.tsx", "component"),
        registryKind: "radio-group",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/radio-group").then((mod) => ({ default: mod.PrimitiveRadioGroupExample })),
    ),
  },
  {
    id: "accordion",
    category: "display",
    kind: "Primitive",
    name: "Accordion",
    summary: "Stacked disclosure rows with measured panel animation.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/accordion",
    paths: {
      registry: {
        target: "components/control-ui/ui/accordion.tsx",
        example: sourceFile("Accordion preview", "src/registry/examples/control-ui/primitives/accordion.tsx", "example"),
        source: sourceFile("Base UI Accordion slot", "src/registry/sources/control-ui/ui/accordion.tsx", "component"),
        registryKind: "accordion",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/accordion").then((mod) => ({ default: mod.PrimitiveAccordionExample })),
    ),
  },
  {
    id: "avatar",
    category: "display",
    kind: "Primitive",
    name: "Avatar",
    summary: "Profile image with initials fallback and composable overlapping groups.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/avatar",
    paths: {
      registry: {
        target: "components/control-ui/ui/avatar.tsx",
        example: sourceFile("Avatar preview", "src/registry/examples/control-ui/primitives/avatar.tsx", "example"),
        source: sourceFile("Base UI Avatar slot", "src/registry/sources/control-ui/ui/avatar.tsx", "component"),
        registryKind: "avatar",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/avatar").then((mod) => ({ default: mod.PrimitiveAvatarExample })),
    ),
  },
  {
    id: "progress",
    category: "feedback",
    kind: "Primitive",
    name: "Progress",
    summary: "Determinate task progress with optional label and value rows.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/progress",
    paths: {
      registry: {
        target: "components/control-ui/ui/progress.tsx",
        example: sourceFile("Progress preview", "src/registry/examples/control-ui/primitives/progress.tsx", "example"),
        source: sourceFile("Base UI Progress slot", "src/registry/sources/control-ui/ui/progress.tsx", "component"),
        registryKind: "progress",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/progress").then((mod) => ({ default: mod.PrimitiveProgressExample })),
    ),
  },
  {
    id: "hover-card",
    category: "overlays",
    kind: "Primitive",
    name: "Hover card",
    summary: "Hover or focus preview panel for profiles, links, and contextual details.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/hover-card",
    paths: {
      registry: {
        target: "components/control-ui/ui/hover-card.tsx",
        example: sourceFile("Hover card preview", "src/registry/examples/control-ui/primitives/hover-card.tsx", "example"),
        source: sourceFile("Base UI Preview card slot", "src/registry/sources/control-ui/ui/hover-card.tsx", "component"),
        supportFiles: [surfaceVariantsFile],
        registryKind: "hover-card",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/hover-card").then((mod) => ({ default: mod.PrimitiveHoverCardExample })),
    ),
  },
  {
    id: "alert-dialog",
    category: "overlays",
    kind: "Primitive",
    name: "Alert dialog",
    summary: "Modal confirmation dialog for destructive or blocking decisions.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/alert-dialog",
    paths: {
      registry: {
        target: "components/control-ui/ui/alert-dialog.tsx",
        example: sourceFile("Alert dialog preview", "src/registry/examples/control-ui/primitives/alert-dialog.tsx", "example"),
        source: sourceFile("Base UI Alert dialog slot", "src/registry/sources/control-ui/ui/alert-dialog.tsx", "component"),
        supportFiles: [sourceFile("Button slot", "src/registry/sources/control-ui/ui/button.tsx", "skin-control"), surfaceVariantsFile],
        registryKind: "alert-dialog",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/alert-dialog").then((mod) => ({ default: mod.PrimitiveAlertDialogExample })),
    ),
  },
  {
    id: "menubar",
    category: "actions",
    kind: "Primitive",
    name: "Menubar",
    summary: "Desktop command bar with nested menus, shortcuts, and separators.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/menubar",
    paths: {
      registry: {
        target: "components/control-ui/ui/menubar.tsx",
        example: sourceFile("Menubar preview", "src/registry/examples/control-ui/primitives/menubar.tsx", "example"),
        source: sourceFile("Base UI Menubar slot", "src/registry/sources/control-ui/ui/menubar.tsx", "component"),
        supportFiles: [surfaceVariantsFile],
        registryKind: "menubar",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/menubar").then((mod) => ({ default: mod.PrimitiveMenubarExample })),
    ),
  },
  {
    id: "navigation-menu",
    category: "navigation",
    kind: "Primitive",
    name: "Navigation menu",
    summary: "Site navigation menu with a shared animated viewport.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/navigation-menu",
    paths: {
      registry: {
        target: "components/control-ui/ui/navigation-menu.tsx",
        example: sourceFile("Navigation menu preview", "src/registry/examples/control-ui/primitives/navigation-menu.tsx", "example"),
        source: sourceFile("Base UI Navigation Menu slot", "src/registry/sources/control-ui/ui/navigation-menu.tsx", "component"),
        supportFiles: [surfaceVariantsFile],
        registryKind: "navigation-menu",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/navigation-menu").then((mod) => ({
        default: mod.PrimitiveNavigationMenuExample,
      })),
    ),
  },
  {
    id: "field",
    category: "forms",
    kind: "Primitive",
    name: "Field",
    summary: "Form field wrapper for labels, descriptions, errors, and validity state.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/field",
    paths: {
      registry: {
        target: "components/control-ui/ui/field.tsx",
        example: sourceFile("Field preview", "src/registry/examples/control-ui/primitives/field.tsx", "example"),
        source: sourceFile("Base UI Field slot", "src/registry/sources/control-ui/ui/field.tsx", "component"),
        supportFiles: [sourceFile("Separator slot", "src/registry/sources/control-ui/ui/separator.tsx", "skin-control")],
        registryKind: "field",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/field").then((mod) => ({ default: mod.PrimitiveFieldExample })),
    ),
  },
  {
    id: "form",
    category: "forms",
    kind: "Primitive",
    name: "Form",
    summary: "Form wrapper that coordinates field validation and returned errors.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/form",
    paths: {
      registry: {
        target: "components/control-ui/ui/form.tsx",
        example: sourceFile("Form preview", "src/registry/examples/control-ui/primitives/form.tsx", "example"),
        source: sourceFile("Base UI Form slot", "src/registry/sources/control-ui/ui/form.tsx", "component"),
        registryKind: "form",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/form").then((mod) => ({ default: mod.PrimitiveFormExample })),
    ),
  },
  {
    id: "native-select",
    category: "forms",
    kind: "Primitive",
    name: "Native select",
    summary: "Native select control styled to match the Control UI control family.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/native-select",
    paths: {
      registry: {
        target: "components/control-ui/ui/native-select.tsx",
        example: sourceFile("Native select preview", "src/registry/examples/control-ui/primitives/native-select.tsx", "example"),
        source: sourceFile("Native select slot", "src/registry/sources/control-ui/ui/native-select.tsx", "component"),
        supportFiles: [sourceFile("Control variants", "src/registry/sources/control-ui/control-variants.ts", "control-variants")],
        registryKind: "native-select",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/native-select").then((mod) => ({ default: mod.PrimitiveNativeSelectExample })),
    ),
  },
  {
    id: "textarea",
    category: "forms",
    kind: "Primitive",
    name: "Textarea",
    summary: "Multiline text field with CSS-first auto-growth.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/textarea",
    paths: {
      registry: {
        target: "components/control-ui/ui/textarea.tsx",
        example: sourceFile("Textarea preview", "src/registry/examples/control-ui/primitives/textarea.tsx", "example"),
        source: sourceFile("Textarea slot", "src/registry/sources/control-ui/ui/textarea.tsx", "component"),
        registryKind: "textarea",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/textarea").then((mod) => ({ default: mod.PrimitiveTextareaExample })),
    ),
  },
  {
    id: "input-otp",
    category: "forms",
    kind: "Primitive",
    name: "Input OTP",
    summary: "One-time-code field with grouped, focus-aware slots.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/input-otp",
    paths: {
      registry: {
        target: "components/control-ui/ui/input-otp.tsx",
        example: sourceFile("Input OTP preview", "src/registry/examples/control-ui/primitives/input-otp.tsx", "example"),
        source: sourceFile("Base UI OtpField slot", "src/registry/sources/control-ui/ui/input-otp.tsx", "component"),
        registryKind: "input-otp",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/input-otp").then((mod) => ({ default: mod.PrimitiveInputOtpExample })),
    ),
  },
  {
    id: "combobox",
    category: "forms",
    kind: "Primitive",
    name: "Combobox",
    summary: "Searchable single-select with input and floating option list.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/combobox",
    paths: {
      registry: {
        target: "components/control-ui/ui/combobox.tsx",
        example: sourceFile("Combobox preview", "src/registry/examples/control-ui/primitives/combobox.tsx", "example"),
        source: sourceFile("Base UI Combobox slot", "src/registry/sources/control-ui/ui/combobox.tsx", "component"),
        supportFiles: [
          sourceFile("Control variants", "src/registry/sources/control-ui/control-variants.ts", "control-variants"),
          surfaceVariantsFile,
        ],
        composition: [
          {
            title: "Searchable list",
            description: "Input and floating content stay as siblings under the Combobox root.",
            code: `Combobox
├── ComboboxInput
└── ComboboxContent
    ├── ComboboxEmpty
    └── ComboboxList
        ├── ComboboxGroup
        │   ├── ComboboxGroupLabel
        │   └── ComboboxItem
        └── ComboboxItem`,
          },
        ],
        registryKind: "combobox",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/combobox").then((mod) => ({ default: mod.PrimitiveComboboxExample })),
    ),
  },
  {
    id: "alert",
    category: "feedback",
    kind: "Primitive",
    status: "beta",
    name: "Alert",
    summary: "Inline status panel for callouts, errors, and notices.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/alert",
    paths: {
      registry: {
        target: "components/control-ui/ui/alert.tsx",
        example: sourceFile("Alert preview", "src/registry/examples/control-ui/primitives/alert.tsx", "example"),
        source: sourceFile("Alert slot", "src/registry/sources/control-ui/ui/alert.tsx", "component"),
        registryKind: "alert",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/alert").then((mod) => ({ default: mod.PrimitiveAlertExample })),
    ),
  },
  {
    id: "badge",
    category: "display",
    kind: "Primitive",
    status: "beta",
    name: "Badge",
    summary: "Compact status, label, or count chip.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/badge",
    paths: {
      registry: {
        target: "components/control-ui/ui/badge.tsx",
        example: sourceFile("Badge preview", "src/registry/examples/control-ui/primitives/badge.tsx", "example"),
        source: sourceFile("Badge slot", "src/registry/sources/control-ui/ui/badge.tsx", "component"),
        supportFiles: [sourceFile("Theme tokens", "src/registry/sources/control-ui/theme.css", "tokens")],
        registryKind: "badge",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/badge").then((mod) => ({ default: mod.PrimitiveBadgeExample })),
    ),
  },
  {
    id: "card",
    category: "display",
    kind: "Primitive",
    status: "beta",
    name: "Card",
    summary: "Content surface for panels, tiles, and settings groups.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/card",
    paths: {
      registry: {
        target: "components/control-ui/ui/card.tsx",
        example: sourceFile("Card preview", "src/registry/examples/control-ui/primitives/card.tsx", "example"),
        source: sourceFile("Card slot", "src/registry/sources/control-ui/ui/card.tsx", "component"),
        composition: [
          {
            title: "Panel anatomy",
            description: "Header parts are optional; content and footer keep the surface predictable.",
            code: `Card
├── CardHeader
│   ├── CardTitle
│   ├── CardDescription
│   └── CardAction
├── CardContent
└── CardFooter`,
          },
        ],
        registryKind: "card",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/card").then((mod) => ({ default: mod.PrimitiveCardExample })),
    ),
  },
  {
    id: "table",
    category: "display",
    kind: "Primitive",
    name: "Table",
    summary: "Responsive data table for lists, comparisons, and structured records.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/table",
    paths: {
      registry: {
        target: "components/control-ui/ui/table.tsx",
        example: sourceFile("Table preview", "src/registry/examples/control-ui/primitives/table.tsx", "example"),
        source: sourceFile("Table slot", "src/registry/sources/control-ui/ui/table.tsx", "component"),
        registryKind: "table",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/table").then((mod) => ({ default: mod.PrimitiveTableExample })),
    ),
  },
  {
    id: "aspect-ratio",
    category: "layout",
    kind: "Primitive",
    status: "beta",
    name: "Aspect ratio",
    summary: "CSS aspect-ratio wrapper for media and previews.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/aspect-ratio",
    paths: {
      registry: {
        target: "components/control-ui/ui/aspect-ratio.tsx",
        example: sourceFile("Aspect ratio preview", "src/registry/examples/control-ui/primitives/aspect-ratio.tsx", "example"),
        source: sourceFile("Aspect ratio slot", "src/registry/sources/control-ui/ui/aspect-ratio.tsx", "component"),
        registryKind: "aspect-ratio",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/aspect-ratio").then((mod) => ({ default: mod.PrimitiveAspectRatioExample })),
    ),
  },
  {
    id: "button-group",
    category: "actions",
    kind: "Primitive",
    name: "Button group",
    summary: "Joined button group for toolbars, split actions, and segmented controls.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/button-group",
    paths: {
      registry: {
        target: "components/control-ui/ui/button-group.tsx",
        example: sourceFile("Button group preview", "src/registry/examples/control-ui/primitives/button-group.tsx", "example"),
        source: sourceFile("Button group slot", "src/registry/sources/control-ui/ui/button-group.tsx", "component"),
        registryKind: "button-group",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/button-group").then((mod) => ({ default: mod.PrimitiveButtonGroupExample })),
    ),
  },
  {
    id: "empty",
    category: "feedback",
    kind: "Primitive",
    status: "beta",
    name: "Empty",
    summary: "Empty-state layout for blank lists, zero results, and new workspaces.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/empty",
    paths: {
      registry: {
        target: "components/control-ui/ui/empty.tsx",
        example: sourceFile("Empty preview", "src/registry/examples/control-ui/primitives/empty.tsx", "example"),
        source: sourceFile("Empty slot", "src/registry/sources/control-ui/ui/empty.tsx", "component"),
        registryKind: "empty",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/empty").then((mod) => ({ default: mod.PrimitiveEmptyExample })),
    ),
  },
  {
    id: "item",
    category: "display",
    kind: "Primitive",
    status: "beta",
    name: "Item",
    summary: "List row with media, content, and trailing actions.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/item",
    paths: {
      registry: {
        target: "components/control-ui/ui/item.tsx",
        example: sourceFile("Item preview", "src/registry/examples/control-ui/primitives/item.tsx", "example"),
        source: sourceFile("Item slot", "src/registry/sources/control-ui/ui/item.tsx", "component"),
        supportFiles: [sourceFile("Separator slot", "src/registry/sources/control-ui/ui/separator.tsx", "skin-control")],
        composition: [
          {
            title: "Grouped content rows",
            description: "ItemGroup owns list grouping while ItemSeparator divides independently composed rows.",
            code: `ItemGroup
├── Item
│   ├── ItemMedia
│   ├── ItemContent
│   └── ItemActions
├── ItemSeparator
└── Item`,
          },
        ],
        registryKind: "item",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/item").then((mod) => ({ default: mod.PrimitiveItemExample })),
    ),
  },
  {
    id: "pagination",
    category: "navigation",
    kind: "Primitive",
    name: "Pagination",
    summary: "Page navigation for long lists and result sets.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/pagination",
    paths: {
      registry: {
        target: "components/control-ui/ui/pagination.tsx",
        example: sourceFile("Pagination preview", "src/registry/examples/control-ui/primitives/pagination.tsx", "example"),
        source: sourceFile("Pagination slot", "src/registry/sources/control-ui/ui/pagination.tsx", "component"),
        registryKind: "pagination",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/pagination").then((mod) => ({ default: mod.PrimitivePaginationExample })),
    ),
  },
  {
    id: "spinner",
    category: "feedback",
    kind: "Primitive",
    name: "Spinner",
    summary: "Accessible loading indicator for pending buttons, panels, and inline waits.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/spinner",
    paths: {
      registry: {
        target: "components/control-ui/ui/spinner.tsx",
        example: sourceFile("Spinner preview", "src/registry/examples/control-ui/primitives/spinner.tsx", "example"),
        source: sourceFile("Spinner slot", "src/registry/sources/control-ui/ui/spinner.tsx", "component"),
        registryKind: "spinner",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/spinner").then((mod) => ({ default: mod.PrimitiveSpinnerExample })),
    ),
  },
  {
    id: "meter",
    category: "display",
    kind: "Primitive",
    name: "Meter",
    summary: "Static range meter for quota, storage, score, or usage values.",
    paths: {
      registry: {
        target: "components/control-ui/ui/meter.tsx",
        example: sourceFile("Meter preview", "src/registry/examples/control-ui/primitives/meter.tsx", "example"),
        source: sourceFile("Base UI Meter slot", "src/registry/sources/control-ui/ui/meter.tsx", "component"),
        registryKind: "meter",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/meter").then((mod) => ({ default: mod.PrimitiveMeterExample })),
    ),
  },
  {
    id: "tree",
    category: "display",
    kind: "Primitive",
    name: "Tree",
    summary: "Accessible tree view with roving keyboard navigation, single/multi selection, and animated disclosure.",
    paths: {
      registry: {
        target: "components/control-ui/ui/tree.tsx",
        example: sourceFile("Tree preview", "src/registry/examples/control-ui/primitives/tree.tsx", "example"),
        source: sourceFile("Tree slot", "src/registry/sources/control-ui/ui/tree.tsx", "component"),
        composition: [
          {
            title: "Branching tree",
            description: "TreeItem owns each row; nested TreeItemContent contains child items.",
            code: `Tree
├── TreeItem
│   ├── TreeItemTrigger
│   │   ├── TreeItemIndicator
│   │   └── TreeItemLabel
│   └── TreeItemContent
│       └── TreeItem
└── TreeItem`,
          },
        ],
        registryKind: "tree",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/tree").then((mod) => ({ default: mod.PrimitiveTreeExample })),
    ),
  },
  {
    id: "checkbox-group",
    category: "forms",
    kind: "Primitive",
    status: "beta",
    name: "Checkbox Group",
    summary: "Multi-select checkbox set with shared state and select-all support.",
    paths: {
      registry: {
        target: "components/control-ui/ui/checkbox-group.tsx",
        example: sourceFile("Checkbox group preview", "src/registry/examples/control-ui/primitives/checkbox-group.tsx", "example"),
        source: sourceFile("Base UI Checkbox group slot", "src/registry/sources/control-ui/ui/checkbox-group.tsx", "component"),
        registryKind: "checkbox-group",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/checkbox-group").then((mod) => ({
        default: mod.PrimitiveCheckboxGroupExample,
      })),
    ),
  },
  {
    id: "autocomplete",
    category: "forms",
    kind: "Primitive",
    name: "Autocomplete",
    summary: "Free-text input with search-as-you-type suggestions.",
    paths: {
      registry: {
        target: "components/control-ui/ui/autocomplete.tsx",
        example: sourceFile("Autocomplete preview", "src/registry/examples/control-ui/primitives/autocomplete.tsx", "example"),
        source: sourceFile("Base UI Autocomplete slot", "src/registry/sources/control-ui/ui/autocomplete.tsx", "component"),
        supportFiles: [
          sourceFile("Control variants", "src/registry/sources/control-ui/control-variants.ts", "control-variants"),
          surfaceVariantsFile,
          sourceFile("Scroll area", "src/registry/sources/control-ui/ui/scroll-area.tsx", "component"),
        ],
        composition: [
          {
            title: "Free-text suggestions",
            description: "The field value remains text; choosing an item fills the input instead of locking selection state.",
            code: `Autocomplete
├── AutocompleteInput
│   └── AutocompleteClear
└── AutocompleteContent
    ├── AutocompleteEmpty
    └── AutocompleteList
        ├── AutocompleteGroup
        │   ├── AutocompleteGroupLabel
        │   └── AutocompleteItem
        └── AutocompleteItem`,
          },
        ],
        registryKind: "autocomplete",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/autocomplete").then((mod) => ({ default: mod.PrimitiveAutocompleteExample })),
    ),
  },
  {
    id: "number-field",
    category: "forms",
    kind: "Primitive",
    name: "Number Field",
    summary: "Numeric input with stepper buttons and optional drag-to-change behavior.",
    paths: {
      registry: {
        target: "components/control-ui/ui/number-field.tsx",
        example: sourceFile("Number field preview", "src/registry/examples/control-ui/primitives/number-field.tsx", "example"),
        source: sourceFile("Base UI Number field slot", "src/registry/sources/control-ui/ui/number-field.tsx", "component"),
        supportFiles: [sourceFile("Control variants", "src/registry/sources/control-ui/control-variants.ts", "control-variants")],
        registryKind: "number-field",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/number-field").then((mod) => ({
        default: mod.PrimitiveNumberFieldExample,
      })),
    ),
  },
  {
    id: "trigger-menu",
    category: "actions",
    kind: "Primitive",
    status: "beta",
    name: "Trigger Menu",
    summary: "Caret-anchored command or mention menu for text editors.",
    paths: {
      registry: {
        target: "components/control-ui/ui/trigger-menu.tsx",
        example: sourceFile("Trigger menu preview", "src/registry/examples/control-ui/primitives/trigger-menu.tsx", "example"),
        source: sourceFile("Trigger menu slot", "src/registry/sources/control-ui/ui/trigger-menu.tsx", "component"),
        supportFiles: [
          sourceFile("Trigger menu engine", "src/registry/hooks/use-trigger-menu.ts", "engine"),
          sourceFile("Textarea binding", "src/registry/hooks/use-textarea-trigger-menu.ts", "binding"),
          sourceFile("Trigger detection", "src/registry/lib/trigger-detect.ts", "detect"),
          surfaceVariantsFile,
        ],
        registryKind: "trigger-menu",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/trigger-menu").then((mod) => ({ default: mod.PrimitiveTriggerMenuExample })),
    ),
  },
  {
    id: "toolbar",
    category: "actions",
    kind: "Primitive",
    name: "Toolbar",
    summary: "Roving-focus toolbar for editor controls and compact actions.",
    paths: {
      registry: {
        target: "components/control-ui/ui/toolbar.tsx",
        example: sourceFile("Toolbar preview", "src/registry/examples/control-ui/primitives/toolbar.tsx", "example"),
        source: sourceFile("Toolbar slot", "src/registry/sources/control-ui/ui/toolbar.tsx", "component"),
        registryKind: "toolbar",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/toolbar").then((mod) => ({ default: mod.PrimitiveToolbarExample })),
    ),
    additionalPreviews: [
      {
        id: "floating-editor",
        title: "Floating editor toolbar",
        description: "The toolbar remains placement-agnostic while composing active tools, tooltips, and a nested DropdownMenu trigger.",
        source: sourceFile("Floating toolbar preview", "src/registry/examples/control-ui/primitives/toolbar-floating.tsx", "example"),
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/primitives/toolbar-floating").then((mod) => ({
            default: mod.PrimitiveFloatingToolbarExample,
          })),
        ),
        previewClassName: "min-h-[256px]",
      },
    ],
  },
  {
    id: "dockable-panel",
    category: "layout",
    kind: "Primitive",
    name: "Dockable Panel",
    summary: "Non-modal workspace panel that moves between two explicit edge slots with a mobile Drawer fallback.",
    status: "experimental",
    paths: {
      registry: {
        target: "components/control-ui/ui/dockable-panel.tsx",
        example: sourceFile("Dockable panel preview", "src/registry/examples/control-ui/primitives/dockable-panel.tsx", "example"),
        source: sourceFile("Dockable panel slot", "src/registry/sources/control-ui/ui/dockable-panel.tsx", "component"),
        supportFiles: [
          sourceFile("Docking geometry", "src/registry/sources/control-ui/ui/dockable-panel-geometry.ts", "geometry"),
          sourceFile("Mobile hook", "src/registry/hooks/use-mobile.ts", "hook"),
          sourceFile("Drawer slot", "src/registry/sources/control-ui/ui/drawer.tsx", "skin-control"),
          sourceFile("Button slot", "src/registry/sources/control-ui/ui/button.tsx", "skin-control"),
        ],
        composition: [
          {
            title: "Workspace panel",
            description: "The root owns two-slot placement and drag previews; header actions expose the equivalent keyboard controls.",
            code: `DockablePanel
├── DockablePanelHeader
│   ├── DockablePanelDragHandle
│   │   └── DockablePanelTitle
│   └── DockablePanelActions
│       ├── DockablePanelDock
│       ├── DockablePanelToggle
│       └── DockablePanelClose
└── DockablePanelContent`,
          },
        ],
        registryKind: "dockable-panel",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/dockable-panel").then((mod) => ({
        default: mod.PrimitiveDockablePanelExample,
      })),
    ),
  },
  {
    id: "infinite-canvas",
    category: "layout",
    kind: "Primitive",
    name: "Infinite Canvas",
    summary: "Pan-and-zoom spatial workspace for arranging content without fixed bounds.",
    status: "experimental",
    paths: {
      registry: {
        target: "components/control-ui/ui/infinite-canvas.tsx",
        example: sourceFile("Infinite canvas preview", "src/registry/examples/control-ui/primitives/infinite-canvas.tsx", "example"),
        source: sourceFile("Infinite canvas", "src/registry/sources/control-ui/ui/infinite-canvas.tsx", "component"),
        supportFiles: [sourceFile("Button slot", "src/registry/sources/control-ui/ui/button.tsx", "skin-control")],
        composition: [
          {
            title: "Unbounded spatial workspace",
            description: "The root owns pan and zoom state while content remains an open composition surface for product-specific nodes.",
            code: `InfiniteCanvas
├── InfiniteCanvasContent
│   └── Your spatial nodes
└── InfiniteCanvasControls`,
          },
        ],
        registryKind: "infinite-canvas",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/infinite-canvas").then((mod) => ({
        default: mod.PrimitiveInfiniteCanvasExample,
      })),
    ),
    previewClassName: "min-h-[640px]",
  },
  {
    id: "morphing-panel",
    category: "layout",
    kind: "Primitive",
    name: "Morphing Panel",
    summary: "Accessible disclosure surface that morphs between explicit collapsed and expanded dimensions.",
    status: "experimental",
    paths: {
      registry: {
        target: "components/control-ui/ui/morphing-panel.tsx",
        example: sourceFile("Morphing panel preview", "src/registry/examples/control-ui/primitives/morphing-panel.tsx", "example"),
        source: sourceFile("Morphing panel slot", "src/registry/sources/control-ui/ui/morphing-panel.tsx", "component"),
        registryKind: "morphing-panel",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/morphing-panel").then((mod) => ({
        default: mod.PrimitiveMorphingPanelExample,
      })),
    ),
    previewClassName: "min-h-[360px]",
  },
  {
    id: "color-picker",
    category: "forms",
    kind: "Primitive",
    name: "Color Picker",
    summary: "Color input with picker UI, formats, presets, and contrast helpers.",
    status: "beta",
    paths: {
      registry: {
        target: "components/control-ui/ui/color-picker.tsx",
        example: sourceFile("Color picker preview", "src/registry/examples/control-ui/primitives/color-picker.tsx", "example"),
        source: sourceFile("Color picker slot", "src/registry/sources/control-ui/ui/color-picker.tsx", "component"),
        supportFiles: [
          sourceFile("Color engine", "src/registry/lib/color.ts", "color-engine"),
          sourceFile("WCAG contrast", "src/registry/lib/contrast.ts", "contrast"),
          sourceFile("Color area drag hook", "src/registry/hooks/use-color-area.ts", "hook"),
          sourceFile("Control variants", "src/registry/sources/control-ui/control-variants.ts", "control-variants"),
          surfaceVariantsFile,
        ],
        registryKind: "color-picker",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/color-picker").then((mod) => ({ default: mod.PrimitiveColorPickerExample })),
    ),
  },
  {
    id: "gradient-editor",
    category: "forms",
    kind: "Primitive",
    name: "Gradient Editor",
    summary: "CSS gradient editor with draggable stops and live preview.",
    status: "beta",
    paths: {
      registry: {
        target: "components/control-ui/ui/gradient-editor.tsx",
        example: sourceFile("Gradient editor preview", "src/registry/examples/control-ui/primitives/gradient-editor.tsx", "example"),
        source: sourceFile("Gradient editor slot", "src/registry/sources/control-ui/ui/gradient-editor.tsx", "component"),
        supportFiles: [
          sourceFile("Color picker slot", "src/registry/sources/control-ui/ui/color-picker.tsx", "color-picker"),
          sourceFile("Color engine", "src/registry/lib/color.ts", "color-engine"),
          surfaceVariantsFile,
        ],
        registryKind: "gradient-editor",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/gradient-editor").then((mod) => ({
        default: mod.PrimitiveGradientEditorExample,
      })),
    ),
  },
  {
    id: "resizable",
    category: "layout",
    kind: "Primitive",
    status: "beta",
    name: "Resizable",
    summary: "Accessible resizable panel groups and split layouts with keyboard support.",
    paths: {
      registry: {
        target: "components/control-ui/ui/resizable.tsx",
        example: sourceFile("Resizable preview", "src/registry/examples/control-ui/primitives/resizable.tsx", "example"),
        source: sourceFile("Resizable slot", "src/registry/sources/control-ui/ui/resizable.tsx", "component"),
        registryKind: "resizable",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/resizable").then((mod) => ({ default: mod.PrimitiveResizableExample })),
    ),
  },
  {
    id: "calendar",
    category: "forms",
    kind: "Primitive",
    status: "beta",
    name: "Calendar",
    summary: "Date selection grid built on react-day-picker and themed through tokens.",
    paths: {
      registry: {
        target: "components/control-ui/ui/calendar.tsx",
        example: sourceFile("Calendar preview", "src/registry/examples/control-ui/primitives/calendar.tsx", "example"),
        source: sourceFile("Calendar slot", "src/registry/sources/control-ui/ui/calendar.tsx", "component"),
        registryKind: "calendar",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/calendar").then((mod) => ({ default: mod.PrimitiveCalendarExample })),
    ),
    additionalPreviews: [
      {
        id: "date-picker",
        title: "Date picker",
        description: "Compose Calendar with a Button trigger and Popover when the date grid should open from a field.",
        previewClassName: "flex min-h-[320px] items-center justify-center p-6",
        source: sourceFile("Date picker example", "src/registry/examples/control-ui/primitives/date-picker.tsx", "example"),
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/primitives/date-picker").then((mod) => ({
            default: mod.PrimitiveDatePickerExample,
          })),
        ),
      },
    ],
  },
  {
    id: "typography",
    category: "display",
    kind: "Primitive",
    name: "Typography",
    summary: "The token-driven type scale — one --text-* rung per size, named by role. Publish the utilities, not a component.",
    shadcnDocsUrl: "https://ui.shadcn.com/docs/components/typography",
    paths: {
      registry: {
        target: "components/control-ui/styles/type-scale.css",
        example: sourceFile("Type specimen", "src/registry/examples/control-ui/primitives/typography.tsx", "example"),
        source: sourceFile("Type scale", "src/registry/examples/control-ui/primitives/type-scale.css", "tokens"),
        registryKind: "typography",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/typography").then((mod) => ({ default: mod.TypographyTokensExample })),
    ),
  },
  {
    id: "code",
    category: "display",
    kind: "Primitive",
    name: "Code",
    summary: "Shared code surface: Shiki-highlighted lines, gutter, clean copy, and virtualization for large files.",
    paths: {
      registry: {
        target: "components/control-ui/ui/code.tsx",
        example: sourceFile("Code preview", "src/registry/examples/control-ui/primitives/code.tsx", "example"),
        source: sourceFile("Code slot", "src/registry/sources/control-ui/ui/code.tsx", "component"),
        supportFiles: [
          sourceFile("Scroll area slot", "src/registry/sources/control-ui/ui/scroll-area.tsx", "component"),
          sourceFile("Button slot", "src/registry/sources/control-ui/ui/button.tsx", "skin-control"),
          sourceFile("Tooltip slot", "src/registry/sources/control-ui/ui/tooltip.tsx", "skin-control"),
          sourceFile("Shiki tokenizer", "src/registry/lib/code-tokens.ts", "tokenizer"),
          sourceFile("Code + diff tokens", "src/registry/sources/control-ui/code.css", "code-css"),
        ],
        registryKind: "code",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/code").then((mod) => ({ default: mod.PrimitiveCodeExample })),
    ),
    additionalPreviews: [
      {
        id: "headerless",
        title: "Headerless copy",
        description: "Use an icon copy action when the filename row would add noise.",
        source: sourceFile("Headerless code preview", "src/registry/examples/control-ui/primitives/code-headerless.tsx", "example"),
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/primitives/code-headerless").then((mod) => ({
            default: mod.PrimitiveCodeHeaderlessExample,
          })),
        ),
        previewClassName: "flex min-h-[220px] items-center justify-center p-6",
      },
    ],
  },
  {
    id: "code-diff",
    category: "display",
    kind: "Primitive",
    name: "Code Diff",
    summary: "Unified or split diff from a git patch or a before/after pair, with word-level intra-line highlighting.",
    paths: {
      registry: {
        target: "components/control-ui/ui/code-diff.tsx",
        example: sourceFile("Code diff preview", "src/registry/examples/control-ui/primitives/code-diff.tsx", "example"),
        source: sourceFile("Code diff slot", "src/registry/sources/control-ui/ui/code-diff.tsx", "component"),
        supportFiles: [
          sourceFile("Code slot", "src/registry/sources/control-ui/ui/code.tsx", "component"),
          sourceFile("Scroll area slot", "src/registry/sources/control-ui/ui/scroll-area.tsx", "component"),
          sourceFile("Button slot", "src/registry/sources/control-ui/ui/button.tsx", "skin-control"),
          sourceFile("Tooltip slot", "src/registry/sources/control-ui/ui/tooltip.tsx", "skin-control"),
          sourceFile("Diff engine", "src/registry/lib/diff.ts", "diff-engine"),
          sourceFile("Shiki tokenizer", "src/registry/lib/code-tokens.ts", "tokenizer"),
          sourceFile("Code + diff tokens", "src/registry/sources/control-ui/code.css", "code-css"),
        ],
        registryKind: "code-diff",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/code-diff").then((mod) => ({ default: mod.PrimitiveCodeDiffExample })),
    ),
    additionalPreviews: [
      {
        id: "headerless",
        title: "Headerless copy",
        description: "Use the same copy affordance when a diff does not need its filename and stats row.",
        source: sourceFile(
          "Headerless code diff preview",
          "src/registry/examples/control-ui/primitives/code-diff-headerless.tsx",
          "example",
        ),
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/primitives/code-diff-headerless").then((mod) => ({
            default: mod.PrimitiveCodeDiffHeaderlessExample,
          })),
        ),
        previewClassName: "flex min-h-[220px] items-center justify-center p-6",
      },
    ],
  },
  {
    id: "markdown",
    category: "display",
    kind: "Primitive",
    name: "Markdown",
    summary: "Rendered agent markdown (GFM) whose code fences compose Code, and diff fences compose CodeDiff.",
    paths: {
      registry: {
        target: "components/control-ui/ui/markdown.tsx",
        example: sourceFile("Markdown preview", "src/registry/examples/control-ui/primitives/markdown.tsx", "example"),
        source: sourceFile("Markdown slot", "src/registry/sources/control-ui/ui/markdown.tsx", "component"),
        supportFiles: [
          sourceFile("Code slot", "src/registry/sources/control-ui/ui/code.tsx", "component"),
          sourceFile("Code diff slot", "src/registry/sources/control-ui/ui/code-diff.tsx", "component"),
          sourceFile("Diff engine", "src/registry/lib/diff.ts", "diff-engine"),
          sourceFile("Shiki tokenizer", "src/registry/lib/code-tokens.ts", "tokenizer"),
          sourceFile("Code + diff tokens", "src/registry/sources/control-ui/code.css", "code-css"),
        ],
        registryKind: "markdown",
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/primitives/markdown").then((mod) => ({ default: mod.PrimitiveMarkdownExample })),
    ),
  },
] as const;
