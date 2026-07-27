import type { ReactNode } from "react";
import type {
  ActivityKind,
  ActivityState,
  AlertVariant,
  AudioVisualizerVariant,
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
  ContextSegmentKind,
  ContextStatus,
  ControlEffect,
  ControlSize,
  DiffStyle,
  DockablePanelContentPadding,
  DrawerContentPadding,
  DrawerContentSurface,
  DrawerContentVariant,
  DropdownMenuTriggerVariant,
  DropzoneOverlayScope,
  DropzoneVisualState,
  DynamicNotificationState,
  DynamicNotificationVariant,
  NavigationMenuLinkVariant,
  PopoverContentPadding,
  ResizableHandleVariant,
  ResizablePanelGroupVariant,
  SelectionIndicator,
  SelectTriggerVariant,
  SliderVariant,
  StepperContentMode,
  StepperOrientation,
  StepperState,
  TableOfContentsVariant,
  TabsListVariant,
  TaskStatus,
  TimelineState,
  ToolbarLinkVariant,
  ToolbarVariant,
  TreeSelectionMode,
} from "./contracts";
import { skin } from "./skin.config";

// Pure lookup, no React and no "use client" — skin is data, so resolution stays RSC-safe.

/** skin's answer for one slot: a fixed class string, or a function of the part's ctx. */
export type SlotOverride<Ctx> = string | ((ctx: Ctx) => string | undefined);

/** part that emits no state of its own — nothing to branch on, so only string form is useful. */
type StatelessPart = Record<never, never>;

/** One entry per public scope and local part; ctx is state part emits as data-*. */
export type SkinSlotContexts = {
  button: {
    root: { variant: ButtonVariant; tone: ButtonTone; size: ControlSize; shape: ButtonShape; active: boolean };
    content: StatelessPart;
  };
  toggle: {
    root: { variant: ButtonVariant; tone: ButtonTone; size: ControlSize; active: boolean };
    content: StatelessPart;
    check: StatelessPart;
    group: { orientation: "horizontal" | "vertical" };
  };
  select: {
    content: StatelessPart;
    trigger: { size: ControlSize; variant: SelectTriggerVariant };
    icon: StatelessPart;
    item: { disabled: boolean };
  };
  "dropdown-menu": {
    trigger: { size: ControlSize; variant: DropdownMenuTriggerVariant };
    content: StatelessPart;
    item: { disabled: boolean };
    separator: StatelessPart;
    label: StatelessPart;
  };
  "context-menu": {
    trigger: StatelessPart;
    group: StatelessPart;
    content: StatelessPart;
    item: { disabled: boolean };
    "checkbox-item": { disabled: boolean };
    "radio-group": StatelessPart;
    "radio-item": { disabled: boolean };
    label: StatelessPart;
    separator: StatelessPart;
    shortcut: StatelessPart;
    "sub-trigger": { disabled: boolean };
    "sub-content": StatelessPart;
  };
  menubar: {
    root: StatelessPart;
    trigger: StatelessPart;
    content: StatelessPart;
    item: { disabled: boolean };
    separator: StatelessPart;
    label: StatelessPart;
    group: StatelessPart;
    shortcut: StatelessPart;
    "sub-trigger": { disabled: boolean };
    "sub-content": StatelessPart;
  };
  "navigation-menu": {
    root: StatelessPart;
    list: StatelessPart;
    item: StatelessPart;
    trigger: StatelessPart;
    content: StatelessPart;
    link: { active: boolean; variant: NavigationMenuLinkVariant };
    viewport: StatelessPart;
  };
  dialog: {
    trigger: StatelessPart;
    close: StatelessPart;
    content: StatelessPart;
    header: StatelessPart;
    footer: StatelessPart;
    title: StatelessPart;
    description: StatelessPart;
  };
  popover: {
    trigger: StatelessPart;
    content: { padding: PopoverContentPadding };
    close: StatelessPart;
    header: StatelessPart;
    title: StatelessPart;
    description: StatelessPart;
  };
  drawer: {
    trigger: StatelessPart;
    content: { padding: DrawerContentPadding; surface: DrawerContentSurface; variant: DrawerContentVariant };
    close: StatelessPart;
    header: StatelessPart;
    footer: StatelessPart;
    handle: StatelessPart;
    title: StatelessPart;
    description: StatelessPart;
  };
  toast: {
    root: StatelessPart;
    title: StatelessPart;
    description: StatelessPart;
    action: StatelessPart;
    close: StatelessPart;
  };
  input: {
    root: { size: ControlSize };
  };
  "input-group": {
    root: { size: ControlSize };
    addon: StatelessPart;
    input: StatelessPart;
  };
  dropzone: {
    root: { disabled: boolean; empty: boolean };
    area: { state: DropzoneVisualState; disabled: boolean };
    input: StatelessPart;
    trigger: { state: DropzoneVisualState; disabled: boolean };
    overlay: { state: DropzoneVisualState; active: boolean; scope: DropzoneOverlayScope };
    "file-list": { empty: boolean };
    file: StatelessPart;
    "rejection-list": { empty: boolean };
    rejection: StatelessPart;
    status: { state: DropzoneVisualState };
  };
  command: {
    root: StatelessPart;
    "input-wrapper": StatelessPart;
    input: StatelessPart;
    list: StatelessPart;
    empty: StatelessPart;
    group: StatelessPart;
    separator: StatelessPart;
    item: StatelessPart;
    shortcut: StatelessPart;
  };
  "trigger-menu": {
    root: StatelessPart;
    list: StatelessPart;
    item: { highlighted: boolean; disabled: boolean };
    empty: StatelessPart;
    group: StatelessPart;
    "group-label": StatelessPart;
    icon: StatelessPart;
  };
  kbd: {
    root: StatelessPart;
    group: StatelessPart;
  };
  collapsible: {
    root: { state: "open" | "closed" };
    trigger: { state: "open" | "closed" };
    content: { state: "open" | "closed" };
  };
  "morphing-panel": {
    root: { state: "open" | "closed" };
    trigger: { state: "open" | "closed" };
    content: { state: "open" | "closed" };
  };
  label: {
    root: StatelessPart;
  };
  skeleton: {
    root: StatelessPart;
  };
  slider: {
    root: { variant: SliderVariant; labeled: boolean };
    control: StatelessPart;
    track: StatelessPart;
    indicator: StatelessPart;
    thumb: StatelessPart;
    label: StatelessPart;
    value: StatelessPart;
  };
  switch: {
    root: { checked: boolean; disabled: boolean };
    thumb: { checked: boolean };
  };
  checkbox: {
    root: { checked: boolean; disabled: boolean };
  };
  "radio-group": {
    root: StatelessPart;
    item: { disabled: boolean };
  };
  sidebar: {
    root: { dragging: boolean };
    inner: { dragging: boolean };
    wrapper: StatelessPart;
    inset: StatelessPart;
    rail: StatelessPart;
    trigger: StatelessPart;
    header: StatelessPart;
    content: StatelessPart;
    footer: StatelessPart;
    group: StatelessPart;
    "group-label": StatelessPart;
    menu: StatelessPart;
    "menu-item": StatelessPart;
    "menu-button": { active: boolean; indicator: SelectionIndicator };
  };
  "sidebar-layout": {
    content: StatelessPart;
  };
  sheet: {
    content: StatelessPart;
    title: StatelessPart;
    close: StatelessPart;
  };
  tooltip: {
    content: StatelessPart;
  };
  separator: {
    root: StatelessPart;
  };
  breadcrumb: {
    root: StatelessPart;
    page: StatelessPart;
  };
  tabs: {
    root: StatelessPart;
    list: { size: ControlSize; variant: TabsListVariant };
    indicator: StatelessPart;
    tab: StatelessPart;
    panel: StatelessPart;
  };
  stepper: {
    root: { orientation: StepperOrientation; contentMode: StepperContentMode; responsive: boolean };
    list: { orientation: StepperOrientation; responsive: boolean };
    item: { state: StepperState; disabled: boolean; invalid: boolean };
    trigger: { state: StepperState; disabled: boolean; invalid: boolean };
    indicator: { state: StepperState; invalid: boolean };
    separator: { state: StepperState; invalid: boolean };
    title: StatelessPart;
    description: StatelessPart;
    content: { active: boolean };
  };
  timeline: {
    root: StatelessPart;
    item: { state: TimelineState };
    indicator: StatelessPart;
    separator: StatelessPart;
    content: StatelessPart;
    title: StatelessPart;
    description: StatelessPart;
    meta: StatelessPart;
  };
  "scroll-area": {
    root: StatelessPart;
    scrollbar: { orientation: "horizontal" | "vertical" };
    thumb: StatelessPart;
    corner: StatelessPart;
  };
  "table-of-contents": {
    root: StatelessPart;
    list: StatelessPart;
    item: { active: boolean; variant: TableOfContentsVariant };
  };
  "chat-layout": {
    root: StatelessPart;
  };
  "chat-thread": {
    root: StatelessPart;
  };
  "chat-thought": {
    root: StatelessPart;
    details: StatelessPart;
  };
  "chat-message": {
    root: { role: ChatRole; state: ChatState; density: ChatDensity; tone: ChatTone };
    row: StatelessPart;
    avatar: StatelessPart;
    content: { role: ChatRole };
  };
  "chat-composer": {
    root: StatelessPart;
    shell: StatelessPart;
    accent: StatelessPart;
    textarea: StatelessPart;
    toolbar: StatelessPart;
    tools: StatelessPart;
    footer: StatelessPart;
    submit: StatelessPart;
    mention: StatelessPart;
  };
  "dynamic-notification": {
    root: { state: DynamicNotificationState; variant: DynamicNotificationVariant };
    island: { state: DynamicNotificationState; variant: DynamicNotificationVariant };
    glass: StatelessPart;
    liquid: StatelessPart;
    pill: StatelessPart;
    indicator: StatelessPart;
    content: StatelessPart;
    title: StatelessPart;
    message: StatelessPart;
    reply: StatelessPart;
    "reply-input": StatelessPart;
    "reply-submit": StatelessPart;
    close: StatelessPart;
  };
  "audio-recorder": {
    root: StatelessPart;
    trigger: StatelessPart;
    status: StatelessPart;
    visualizer: StatelessPart;
    duration: StatelessPart;
    cancel: StatelessPart;
    submit: StatelessPart;
  };
  "audio-visualizer": {
    root: { variant: AudioVisualizerVariant };
  };
  activity: {
    root: { kind: ActivityKind; state: ActivityState };
    row: StatelessPart;
    trigger: { kind: ActivityKind };
    icon: { kind: ActivityKind; state: ActivityState };
    title: StatelessPart;
    status: { kind: ActivityKind; state: ActivityState };
    announcement: StatelessPart;
    content: StatelessPart;
    detail: StatelessPart;
    "detail-label": StatelessPart;
    "detail-content": StatelessPart;
  };
  context: {
    root: { status: ContextStatus };
    trigger: { status: ContextStatus };
    "trigger-indicator": { status: ContextStatus };
    "trigger-label": StatelessPart;
    content: StatelessPart;
    header: StatelessPart;
    summary: { status: ContextStatus };
    graph: { status: ContextStatus };
    track: StatelessPart;
    segment: { kind: ContextSegmentKind };
    "limit-marker": StatelessPart;
    legend: StatelessPart;
    "legend-item": { kind: ContextSegmentKind };
    "legend-indicator": { kind: ContextSegmentKind };
    "legend-value": StatelessPart;
  };
  "inline-citation": {
    root: StatelessPart;
    trigger: StatelessPart;
    favicons: StatelessPart;
    favicon: StatelessPart;
    label: StatelessPart;
    content: StatelessPart;
    navigation: StatelessPart;
    previous: StatelessPart;
    next: StatelessPart;
    position: StatelessPart;
    source: StatelessPart;
    "source-header": StatelessPart;
    "source-favicon": StatelessPart;
    "source-title": StatelessPart;
    "source-description": StatelessPart;
    "source-quote": StatelessPart;
  };
  "source-badge": {
    root: StatelessPart;
    favicon: StatelessPart;
    label: StatelessPart;
  };
  "user-ask": {
    root: StatelessPart;
    header: StatelessPart;
    title: StatelessPart;
    pagination: StatelessPart;
    question: { active: boolean };
    option: { selected: boolean; disabled: boolean };
    "option-indicator": { selected: boolean };
    "option-label": StatelessPart;
    "option-description": StatelessPart;
    footer: StatelessPart;
  };
  "task-list": {
    root: StatelessPart;
    progress: StatelessPart;
    label: StatelessPart;
    items: StatelessPart;
    item: { status: TaskStatus };
    "item-indicator": { status: TaskStatus };
  };
  "thread-rail": {
    root: StatelessPart;
    item: StatelessPart;
    line: StatelessPart;
    popover: StatelessPart;
    title: StatelessPart;
    footer: StatelessPart;
    file: StatelessPart;
  };
  "markdown-block": {
    root: StatelessPart;
    header: StatelessPart;
    title: StatelessPart;
    content: StatelessPart;
  };
  code: {
    root: { chrome: CodeChrome; density: CodeDensity };
    header: StatelessPart;
    title: StatelessPart;
    actions: StatelessPart;
    content: StatelessPart;
    line: StatelessPart;
    gutter: StatelessPart;
  };
  "code-diff": {
    root: { diffStyle: DiffStyle };
    header: StatelessPart;
    title: StatelessPart;
    stat: StatelessPart;
    actions: StatelessPart;
    body: StatelessPart;
    row: StatelessPart;
    gutter: StatelessPart;
    line: { lineType: CodeDiffLineType };
    expander: StatelessPart;
    "expand-button": StatelessPart;
  };
  markdown: {
    root: StatelessPart;
  };
  "inline-attachment": {
    root: StatelessPart;
    image: StatelessPart;
    content: StatelessPart;
    action: StatelessPart;
  };
  "chat-composer-attachments": {
    root: StatelessPart;
    scroll: StatelessPart;
    list: StatelessPart;
  };
  "chat-composer-attachment": {
    root: {
      kind: "image" | "pdf" | "spreadsheet" | "document" | "archive" | "audio" | "video" | "file";
      status: "idle" | "uploading" | "uploaded" | "error";
      variant: "preview" | "file";
    };
    preview: {
      kind: "image" | "pdf" | "spreadsheet" | "document" | "archive" | "audio" | "video" | "file";
      status: "idle" | "uploading" | "uploaded" | "error";
      variant: "preview" | "file";
    };
    status: { status: "idle" | "uploading" | "uploaded" | "error" };
    content: StatelessPart;
    title: StatelessPart;
    description: { status: "idle" | "uploading" | "uploaded" | "error" };
    remove: StatelessPart;
    progress: StatelessPart;
    "progress-indicator": StatelessPart;
  };
  "action-bar": {
    root: StatelessPart;
  };
  field: {
    root: StatelessPart;
    label: StatelessPart;
    description: StatelessPart;
    error: StatelessPart;
    set: StatelessPart;
    legend: StatelessPart;
    item: StatelessPart;
  };
  form: {
    root: StatelessPart;
  };
  "native-select": {
    root: { size: ControlSize };
  };
  textarea: {
    root: StatelessPart;
  };
  accordion: {
    root: StatelessPart;
    item: StatelessPart;
    trigger: StatelessPart;
    panel: StatelessPart;
  };
  avatar: {
    root: StatelessPart;
    group: StatelessPart;
    fallback: StatelessPart;
  };
  progress: {
    root: StatelessPart;
    track: StatelessPart;
    indicator: StatelessPart;
  };
  "hover-card": {
    trigger: StatelessPart;
    content: StatelessPart;
  };
  "alert-dialog": {
    trigger: StatelessPart;
    close: StatelessPart;
    content: StatelessPart;
    header: StatelessPart;
    footer: StatelessPart;
    title: StatelessPart;
    description: StatelessPart;
  };
  "input-otp": {
    root: StatelessPart;
    slot: StatelessPart;
    separator: StatelessPart;
  };
  combobox: {
    root: StatelessPart;
    input: { size: ControlSize };
    trigger: StatelessPart;
    icon: StatelessPart;
    content: StatelessPart;
    list: StatelessPart;
    item: { disabled: boolean };
    empty: StatelessPart;
    group: StatelessPart;
    "group-label": StatelessPart;
  };
  alert: {
    root: { variant: AlertVariant };
  };
  badge: {
    root: { variant: BadgeVariant; size: BadgeSize; color: BadgeColor };
  };
  card: {
    root: { variant: CardVariant };
  };
  table: {
    root: StatelessPart;
  };
  "aspect-ratio": {
    root: StatelessPart;
  };
  "button-group": {
    root: { orientation: "horizontal" | "vertical" };
    text: StatelessPart;
  };
  empty: {
    root: StatelessPart;
    media: StatelessPart;
  };
  item: {
    root: { variant: "default" | "outline" | "muted" };
  };
  pagination: {
    root: StatelessPart;
    link: { active: boolean };
  };
  spinner: {
    root: StatelessPart;
  };
  meter: {
    root: StatelessPart;
    track: StatelessPart;
    indicator: StatelessPart;
  };
  "checkbox-group": {
    root: StatelessPart;
  };
  autocomplete: {
    root: StatelessPart;
    input: { size: ControlSize };
    clear: StatelessPart;
    content: StatelessPart;
    list: StatelessPart;
    item: { disabled: boolean };
    empty: StatelessPart;
    group: StatelessPart;
    "group-label": StatelessPart;
  };
  toolbar: {
    root: { orientation: "horizontal" | "vertical"; variant: ToolbarVariant };
    button: StatelessPart;
    link: { variant: ToolbarLinkVariant };
    group: StatelessPart;
    separator: StatelessPart;
    input: StatelessPart;
  };
  "dockable-panel": {
    root: { placement: "left" | "right"; dragging: boolean };
    header: StatelessPart;
    "drag-handle": { dragging: boolean };
    title: StatelessPart;
    actions: StatelessPart;
    toggle: { placement: "left" | "right" };
    dock: { active: boolean; placement: "left" | "right" };
    close: StatelessPart;
    content: { padding: DockablePanelContentPadding };
    "drop-zone": { side: "left" | "right"; active: boolean };
  };
  "infinite-canvas": {
    root: { panning: boolean };
    content: { scale: number };
    controls: StatelessPart;
  };
  "number-field": {
    group: { size: ControlSize };
    input: StatelessPart;
    decrement: StatelessPart;
    increment: StatelessPart;
    "scrub-area": StatelessPart;
    "scrub-cursor": StatelessPart;
  };
  "color-picker": {
    trigger: { disabled: boolean };
    content: StatelessPart;
    panel: StatelessPart;
    area: StatelessPart;
    "area-thumb": StatelessPart;
    hue: StatelessPart;
    "hue-thumb": StatelessPart;
    alpha: StatelessPart;
    "alpha-thumb": StatelessPart;
    wheel: StatelessPart;
    "wheel-thumb": StatelessPart;
    channels: StatelessPart;
    swatches: StatelessPart;
    swatch: { selected: boolean };
    "swatch-add": StatelessPart;
    contrast: StatelessPart;
    output: StatelessPart;
  };
  "gradient-editor": {
    root: StatelessPart;
    preview: StatelessPart;
    track: StatelessPart;
    stop: { selected: boolean };
    "stop-add": StatelessPart;
  };
  resizable: {
    "panel-group": { orientation: "horizontal" | "vertical"; variant: ResizablePanelGroupVariant };
    panel: StatelessPart;
    handle: { orientation: "horizontal" | "vertical"; variant: ResizableHandleVariant };
    "handle-grip": { orientation: "horizontal" | "vertical"; variant: ResizableHandleVariant };
  };
  calendar: {
    root: StatelessPart;
    day: StatelessPart;
  };
  tree: {
    root: { selectionMode: TreeSelectionMode };
    item: { level: number; selected: boolean; expanded: boolean; disabled: boolean };
    "item-trigger": { selected: boolean; expanded: boolean; disabled: boolean; indicator: SelectionIndicator };
    "item-indicator": StatelessPart;
    "item-label": StatelessPart;
    "item-content": { state: "open" | "closed" };
  };
};

export type SkinPaintContexts = {
  skeleton: {
    shimmer: StatelessPart;
  };
  "chat-message": {
    streaming: StatelessPart;
  };
};

export type SkinPopupPart = "surface" | "list-surface" | "list-content" | "item" | "label" | "separator" | "shortcut";

export type SkinFamilyContexts = {
  popup: {
    [Part in SkinPopupPart]: string;
  };
};

export type SkinSlotScope = keyof SkinSlotContexts;
export type SkinSlotPart<Scope extends SkinSlotScope> = keyof SkinSlotContexts[Scope];

export type SkinPaintScope = keyof SkinPaintContexts;
export type SkinPaintPart<Scope extends SkinPaintScope> = keyof SkinPaintContexts[Scope];

/** Anchors skin may fill with JSX. component owns positioned wrapper and skin supplies only visuals; unfilled anchor renders zero DOM and never gates behavior. */
export type SkinAdornmentContexts = {
  "chat-layout": { titlebar: StatelessPart };
  "chat-thought": { details: StatelessPart };
  dialog: { titlebar: StatelessPart };
  "chat-composer": { "send-layer": { sendCount: number } };
};

export type SkinAdornmentScope = keyof SkinAdornmentContexts;
export type SkinAdornmentPart<Scope extends SkinAdornmentScope> = keyof SkinAdornmentContexts[Scope];

type AdornmentEntry<Ctx> = ReactNode | ((ctx: Ctx) => ReactNode);

export type ControlUiSkin = {
  /** Scopes theme.css/skin.css via data-skin; components stamp it on portal containers. */
  id: string;
  /** Stamps data-motion="reduced", collapsing --duration-* to 0ms. Never `animation:none` — ripple cleanup still needs `animationend` to fire. */
  motion?: "reduced";
  /** Locks skin to one scheme; page's .dark class must then follow it, since Shiki, native color-scheme, and dark: utilities key off .dark, not skin tokens. Undefined = adaptive, both blocks authored. */
  colorScheme?: "light" | "dark";
  /** Geometry, not slot restyle — padding, gap, rounding, and shadow across sidebar gap/container/inner. explicit `variant` prop wins; undefined keeps "sidebar". */
  sidebarLayout?: SidebarLayout;
  /** App-wide choice: sidebars and trees all glide or none do. Explicit `indicator` still wins; undefined also skips highlight engine's lazy chunk. */
  indicators?: { sidebar?: SelectionIndicator; tree?: SelectionIndicator };
  /** Any CSS length. Seeds --sidebar-width; caller's own value still wins. Undefined keeps shadcn's 16rem. */
  sidebarWidth?: string;
  /** effects.css keys off data-effects ancestor attribute. top-shine is CSS-only; ripple needs runtime's document pointer listener. */
  effects?: ControlEffect[];
  families?: {
    [Family in keyof SkinFamilyContexts]?: Partial<SkinFamilyContexts[Family]>;
  };
  slots?: {
    [Scope in SkinSlotScope]?: {
      [Part in SkinSlotPart<Scope>]?: SlotOverride<SkinSlotContexts[Scope][Part]>;
    };
  };
  paints?: {
    [Scope in SkinPaintScope]?: {
      [Part in SkinPaintPart<Scope>]?: SlotOverride<SkinPaintContexts[Scope][Part]>;
    };
  };
  adornments?: {
    [Scope in SkinAdornmentScope]?: {
      [Part in SkinAdornmentPart<Scope>]?: AdornmentEntry<SkinAdornmentContexts[Scope][Part]>;
    };
  };
};

export type SidebarLayout = "sidebar" | "floating" | "inset";

/** Read at render time so getter-based configs stay live. Portals stamp it on their positioner, which lands outside any token-scoped ancestor. */
export function skinId(): string {
  return skin.id;
}

/** Resolve one shared semantic-family treatment before any exact component slot override. */
export function skinFamily<Family extends keyof SkinFamilyContexts, Part extends keyof SkinFamilyContexts[Family]>(
  family: Family,
  part: Part,
): string | undefined {
  const classes = skin.families?.[family]?.[part];
  return typeof classes === "string" ? classes : undefined;
}

// Binding entry to plain `SlotOverride<Ctx>` parameter is what lets `typeof entry === "string"` narrow — indexed scope/part lookup stays deferred and narrows to nothing.
function resolveOverride<Ctx>(entry: SlotOverride<Ctx> | undefined, ctx: Ctx): string | undefined {
  if (entry === undefined) return undefined;
  return typeof entry === "string" ? entry : entry(ctx);
}

/** Undefined leaves slot untouched — default config's answer for everything. */
export function skinSlot<Scope extends SkinSlotScope, Part extends SkinSlotPart<Scope>>(
  scope: Scope,
  part: Part,
  ctx: SkinSlotContexts[Scope][Part],
): string | undefined {
  return resolveOverride(skin.slots?.[scope]?.[part], ctx);
}

/** Resolve exclusive paint hook separately from DOM anatomy. */
export function skinPaint<Scope extends SkinPaintScope, Part extends SkinPaintPart<Scope>>(
  scope: Scope,
  part: Part,
  ctx: SkinPaintContexts[Scope][Part],
): string | undefined {
  return resolveOverride(skin.paints?.[scope]?.[part], ctx);
}

/** Sidebar falls back: variant prop → this → "sidebar". */
export function skinSidebarLayout(): SidebarLayout | undefined {
  return skin.sidebarLayout;
}

/** Component falls back: indicator prop → this → "none". */
export function skinIndicator(component: "sidebar" | "tree"): SelectionIndicator | undefined {
  return skin.indicators?.[component];
}

/** Applied after skin slot classes so sliding pill is sole chrome. twMerge only evicts exact modifier chain, hence restated dark: forms — pack painting under any other modifier leaks past and fails slide-neutralization test. */
export const SELECTION_INDICATOR_BG_RESET = [
  "bg-transparent hover:bg-transparent active:bg-transparent",
  "data-[active=true]:bg-transparent data-[selected]:bg-transparent data-[state=open]:hover:bg-transparent",
  "dark:bg-transparent dark:hover:bg-transparent dark:active:bg-transparent",
  "dark:data-[active=true]:bg-transparent dark:data-[selected]:bg-transparent dark:data-[state=open]:hover:bg-transparent",
].join(" ");

/** SidebarProvider seeds --sidebar-width from this; caller-provided value still wins. */
export function skinSidebarWidth(): string | undefined {
  return skin.sidebarWidth;
}

/** Portals stamp result next to data-skin; ControlEffectsRuntime mirrors it on <html>. */
export function skinEffects(): string | undefined {
  const effects = skin.effects;
  return effects && effects.length > 0 ? effects.join(" ") : undefined;
}

// Same deferred-lookup reason as resolveOverride. ReactNode may itself be callable, so entry decides branch, not ctx.
function resolveAdornment<Ctx>(entry: AdornmentEntry<Ctx> | undefined, ctx: Ctx): ReactNode | undefined {
  if (entry === undefined) return undefined;
  return typeof entry === "function" ? entry(ctx) : entry;
}

/** Undefined when skin fills nothing there — component then renders no adornment DOM at all. */
export function skinAdornment<Scope extends SkinAdornmentScope, Part extends SkinAdornmentPart<Scope>>(
  scope: Scope,
  part: Part,
  ctx: SkinAdornmentContexts[Scope][Part],
): ReactNode | undefined {
  return resolveAdornment(skin.adornments?.[scope]?.[part], ctx);
}

/** Lets component skip state that only feeds unfilled anchor's ctx, e.g. send counter. */
export function hasSkinAdornment<Scope extends SkinAdornmentScope, Part extends SkinAdornmentPart<Scope>>(
  scope: Scope,
  part: Part,
): boolean {
  return skin.adornments?.[scope]?.[part] !== undefined;
}
