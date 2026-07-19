import type {
  ActivityKind,
  ActivityState,
  AlertVariant,
  BadgeColor,
  BadgeSize,
  BadgeVariant,
  ButtonShape,
  ButtonTone,
  ButtonVariant,
  CardVariant,
  ChatDensity,
  ChatRole,
  ChatState,
  ChatTone,
  CodeChrome,
  CodeDensity,
  CodeDiffLineType,
  ControlSize,
  DiffStyle,
  DockablePanelContentPadding,
  DockablePanelPlacement,
  DrawerContentPadding,
  DrawerContentSurface,
  DropdownMenuTriggerVariant,
  DropzoneOverlayScope,
  DropzoneVisualState,
  DynamicNotificationState,
  DynamicNotificationVariant,
  NavigationMenuLinkVariant,
  PopoverContentPadding,
  ResizablePanelGroupVariant,
  SelectTriggerVariant,
  SliderVariant,
  StepperContentMode,
  StepperOrientation,
  StepperState,
  TableOfContentsVariant,
  TabsListVariant,
  TaskStatus,
  ToolbarLinkVariant,
  ToolbarVariant,
} from "../../src/registry/contracts";

export type EmittedStateContract = {
  "activity:root:data-activity-kind": ActivityKind;
  "activity:root:data-activity-name": string;
  "activity:root:data-activity-state": ActivityState;
  "activity:root:data-status": ActivityState;
  "activity:announcement:data-status": ActivityState;
  "activity:status:data-status": ActivityState;
  "audio-recorder:root:data-disabled": true;
  "audio-recorder:root:data-error": true;
  "audio-recorder:root:data-state": "idle" | "requesting" | "recording" | "recorded" | "submitting" | "error";
  "audio-recorder:trigger:data-recorder-state": "idle" | "requesting" | "recording" | "recorded" | "submitting" | "error";
  "alert:root:data-variant": AlertVariant;
  "autocomplete:input:data-size": ControlSize;
  "badge:root:data-color": BadgeColor;
  "badge:root:data-size": BadgeSize;
  "badge:root:data-variant": BadgeVariant;
  "button:root:data-size": ControlSize;
  "button:root:data-icon-only": true;
  "button:root:data-shape": ButtonShape;
  "button:root:data-tone": ButtonTone;
  "button:root:data-variant": ButtonVariant;
  "card:root:data-variant": CardVariant;
  "button-group:root:data-orientation": "horizontal" | "vertical";
  "button-group:separator:data-orientation": "horizontal" | "vertical";
  "button-group:text:data-size": ControlSize;
  "chat-composer:root:data-density": ChatDensity;
  "chat-composer:root:data-state": "idle" | "submitting" | "disabled";
  "chat-composer:shell:data-state": "idle" | "submitting" | "disabled";
  "chat-composer:mention:data-icon": string;
  "chat-composer:mention:data-id": string;
  "chat-composer:mention:data-mention": string;
  "chat-composer-attachment:root:data-kind": "image" | "pdf" | "spreadsheet" | "document" | "archive" | "audio" | "video" | "file";
  "chat-composer-attachment:root:data-state": "idle" | "uploading" | "uploaded" | "error";
  "chat-composer-attachment:root:data-variant": "preview" | "file";
  "chat-composer-attachment:description:data-state": "idle" | "uploading" | "uploaded" | "error";
  "chat-message:root:data-density": ChatDensity;
  "chat-message:root:data-role": ChatRole;
  "chat-message:root:data-state": ChatState;
  "chat-message:root:data-tone": ChatTone;
  "chat-message:content:data-role": ChatRole;
  "chat-turn:root:data-from": "user" | "assistant";
  "checkbox-group:root:data-orientation": "horizontal" | "vertical";
  "code:root:data-chrome": CodeChrome;
  "code:root:data-density": CodeDensity;
  "code:line:data-index": number;
  "code-block-editor:root:data-variant": "default" | "command";
  "code-diff:root:data-diff-style": DiffStyle;
  "code-diff:root:data-file-count": number;
  "code-diff:file:data-file-name": string;
  "code-diff:line:data-line-type": CodeDiffLineType;
  "combobox:input:data-size": ControlSize;
  "dockable-panel:root:data-placement": DockablePanelPlacement;
  "dockable-panel:drop-zone:data-side": DockablePanelPlacement;
  "agent-team-view:zone:data-disabled": true;
  "agent-team-view:zone:data-dragging": true;
  "agent-team-view:zone:data-selected": true;
  "agent-team-view:zone-base:data-dragging": true;
  "agent-team-view:zone-base:data-selected": true;
  "agent-team-view:zone-drag-handle:data-disabled": true;
  "agent-team-view:zone-drag-handle:data-dragging": true;
  "agent-team-view:zone-drag-handle:data-selected": true;
  "agent-team-view:zone-platform:data-dragging": true;
  "agent-team-view:zone-platform:data-selected": true;
  "dropzone:root:data-disabled": true;
  "dropzone:root:data-empty": true;
  "dropzone:area:data-disabled": true;
  "dropzone:trigger:data-disabled": true;
  "dropzone:overlay:data-active": true;
  "dropzone:file-list:data-empty": true;
  "dropzone:rejection-list:data-empty": true;
  "dropzone:area:data-state": DropzoneVisualState;
  "dropzone:overlay:data-scope": DropzoneOverlayScope;
  "dropzone:overlay:data-state": DropzoneVisualState;
  "dropzone:status:data-state": DropzoneVisualState;
  "dropzone:trigger:data-state": DropzoneVisualState;
  "dynamic-notification:root:data-state": DynamicNotificationState;
  "dynamic-notification:root:data-variant": DynamicNotificationVariant;
  "dynamic-notification:island:data-state": DynamicNotificationState;
  "dynamic-notification:island:data-variant": DynamicNotificationVariant;
  "field:root:data-orientation": "horizontal" | "vertical" | "responsive";
  "input:root:data-size": ControlSize;
  "input-group:root:data-size": ControlSize;
  "item:root:data-variant": "default" | "outline" | "muted";
  "dropdown-menu:trigger:data-size": ControlSize;
  "dropdown-menu:trigger:data-icon-only": true;
  "dropdown-menu:trigger:data-variant": DropdownMenuTriggerVariant;
  "navigation-menu:link:data-variant": NavigationMenuLinkVariant;
  "dockable-panel:content:data-padding": DockablePanelContentPadding;
  "drawer:content:data-padding": DrawerContentPadding;
  "drawer:content:data-surface-variant": DrawerContentSurface;
  "popover:content:data-padding": PopoverContentPadding;
  "resizable:panel-group:data-variant": ResizablePanelGroupVariant;
  "select:trigger:data-variant": SelectTriggerVariant;
  "toolbar:button:data-icon-only": true;
  "toolbar:link:data-variant": ToolbarLinkVariant;
  "toolbar:root:data-variant": ToolbarVariant;
  "morphing-panel:content:data-state": "open" | "closed";
  "morphing-panel:root:data-state": "open" | "closed";
  "morphing-panel:trigger:data-state": "open" | "closed";
  "native-select:root:data-size": ControlSize;
  "number-field:group:data-size": ControlSize;
  "radio-group:root:data-orientation": "horizontal" | "vertical";
  "select:trigger:data-size": ControlSize;
  "sidebar:root:data-collapsible": "offcanvas" | "icon" | "none";
  "sidebar:root:data-side": "left" | "right";
  "sidebar:root:data-state": "expanded" | "collapsed";
  "sidebar:root:data-variant": "sidebar" | "floating" | "inset";
  "sidebar:menu-button:data-active": boolean;
  "sidebar:menu-button:data-size": "default" | "sm" | "lg";
  "slider:root:data-variant": SliderVariant;
  "stepper:root:data-content-mode": StepperContentMode;
  "stepper:root:data-orientation": StepperOrientation;
  "stepper:indicator:data-state": StepperState;
  "stepper:item:data-state": StepperState;
  "stepper:item:data-step": number;
  "stepper:list:data-orientation": StepperOrientation;
  "stepper:separator:data-state": StepperState;
  "stepper:trigger:data-state": StepperState;
  "table-of-contents:root:data-variant": TableOfContentsVariant;
  "table-of-contents:item:data-active": true;
  "table-of-contents:item:data-depth": number;
  "table-of-contents:item:data-level": number;
  "table-of-contents:item:data-variant": TableOfContentsVariant;
  "tabs:list:data-size": ControlSize;
  "tabs:list:data-variant": TabsListVariant;
  "task-list:item:data-status": TaskStatus;
  "task-list:item-indicator:data-status": TaskStatus;
  "thread-rail:item:data-from": ChatRole;
  "toggle:root:data-size": ControlSize;
  "toggle:root:data-tone": ButtonTone;
  "toggle:root:data-variant": ButtonVariant;
  "tree:item:data-disabled": true;
  "tree:item:data-label": string;
  "tree:item:data-selected": true;
  "tree:item:data-value": string;
  "tree:item-trigger:data-selected": true;
};
