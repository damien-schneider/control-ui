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
  ControlEffect,
  ControlSize,
  DiffStyle,
  DockablePanelContentPadding,
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
  SelectionIndicator,
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
  TreeSelectionMode,
} from "./contracts";
import { skin } from "./skin.config";

/*
 * Skin = DATA (a complete theme.css contract + skin.config slot overrides), not code; components never change per skin.
 * Slot compose: cn(recipe, skinSlot(scope, part, ctx), className) — className always wins (shadcn contract), precedence via argument order not CSS specificity.
 * No React/"use client" here, pure lookup = RSC-safe. Paint order: token(theme.css) > skinSlot > skin.css(scoped [data-skin], never bare host) > never. Ladder: /architecture#customization-ladder.
 */

type SlotOverride<Ctx> = string | ((ctx: Ctx) => string | undefined);

/**
 * One entry per public scope and local part; ctx is the state the part emits as data-*.
 */
export type SkinSlotContexts = {
  button: {
    root: { variant: ButtonVariant; tone: ButtonTone; size: ControlSize; shape: ButtonShape; active: boolean };
    content: Record<never, never>;
  };
  toggle: {
    root: { variant: ButtonVariant; tone: ButtonTone; size: ControlSize; active: boolean };
    content: Record<never, never>;
    check: Record<never, never>;
    group: { orientation: "horizontal" | "vertical" };
  };
  select: {
    content: Record<never, never>;
    trigger: { size: ControlSize; variant: SelectTriggerVariant };
    icon: Record<never, never>;
    item: { disabled: boolean };
  };
  "dropdown-menu": {
    trigger: { size: ControlSize; variant: DropdownMenuTriggerVariant };
    content: Record<never, never>;
    item: { disabled: boolean };
    separator: Record<never, never>;
    label: Record<never, never>;
  };
  "context-menu": {
    trigger: Record<never, never>;
    group: Record<never, never>;
    content: Record<never, never>;
    item: { disabled: boolean };
    "checkbox-item": { disabled: boolean };
    "radio-group": Record<never, never>;
    "radio-item": { disabled: boolean };
    label: Record<never, never>;
    separator: Record<never, never>;
    shortcut: Record<never, never>;
    "sub-trigger": { disabled: boolean };
    "sub-content": Record<never, never>;
  };
  menubar: {
    root: Record<never, never>;
    trigger: Record<never, never>;
    content: Record<never, never>;
    item: { disabled: boolean };
    separator: Record<never, never>;
    label: Record<never, never>;
    group: Record<never, never>;
    shortcut: Record<never, never>;
    "sub-trigger": { disabled: boolean };
    "sub-content": Record<never, never>;
  };
  "navigation-menu": {
    root: Record<never, never>;
    list: Record<never, never>;
    item: Record<never, never>;
    trigger: Record<never, never>;
    content: Record<never, never>;
    link: { active: boolean; variant: NavigationMenuLinkVariant };
    viewport: Record<never, never>;
  };
  dialog: {
    trigger: Record<never, never>;
    close: Record<never, never>;
    content: Record<never, never>;
    header: Record<never, never>;
    footer: Record<never, never>;
    title: Record<never, never>;
    description: Record<never, never>;
  };
  popover: {
    trigger: Record<never, never>;
    content: { padding: PopoverContentPadding };
    close: Record<never, never>;
    header: Record<never, never>;
    title: Record<never, never>;
    description: Record<never, never>;
  };
  drawer: {
    trigger: Record<never, never>;
    content: { padding: DrawerContentPadding; surface: DrawerContentSurface };
    close: Record<never, never>;
    header: Record<never, never>;
    footer: Record<never, never>;
    handle: Record<never, never>;
    title: Record<never, never>;
    description: Record<never, never>;
  };
  toast: {
    root: Record<never, never>;
    title: Record<never, never>;
    description: Record<never, never>;
    action: Record<never, never>;
    close: Record<never, never>;
  };
  input: {
    root: { size: ControlSize };
  };
  "input-group": {
    root: { size: ControlSize };
    addon: Record<never, never>;
    input: Record<never, never>;
  };
  dropzone: {
    root: { disabled: boolean; empty: boolean };
    area: { state: DropzoneVisualState; disabled: boolean };
    input: Record<never, never>;
    trigger: { state: DropzoneVisualState; disabled: boolean };
    overlay: { state: DropzoneVisualState; active: boolean; scope: DropzoneOverlayScope };
    "file-list": { empty: boolean };
    file: Record<never, never>;
    "rejection-list": { empty: boolean };
    rejection: Record<never, never>;
    status: { state: DropzoneVisualState };
  };
  command: {
    root: Record<never, never>;
    "input-wrapper": Record<never, never>;
    input: Record<never, never>;
    list: Record<never, never>;
    empty: Record<never, never>;
    group: Record<never, never>;
    separator: Record<never, never>;
    item: Record<never, never>;
    shortcut: Record<never, never>;
  };
  "trigger-menu": {
    root: Record<never, never>;
    list: Record<never, never>;
    item: { highlighted: boolean; disabled: boolean };
    empty: Record<never, never>;
    group: Record<never, never>;
    "group-label": Record<never, never>;
    icon: Record<never, never>;
  };
  kbd: {
    root: Record<never, never>;
    group: Record<never, never>;
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
    root: Record<never, never>;
  };
  skeleton: {
    root: Record<never, never>;
  };
  slider: {
    root: { variant: SliderVariant; labeled: boolean };
    control: Record<never, never>;
    track: Record<never, never>;
    indicator: Record<never, never>;
    thumb: Record<never, never>;
    label: Record<never, never>;
    value: Record<never, never>;
  };
  switch: {
    root: { checked: boolean; disabled: boolean };
    thumb: { checked: boolean };
  };
  checkbox: {
    root: { checked: boolean; disabled: boolean };
  };
  "radio-group": {
    root: Record<never, never>;
    item: { disabled: boolean };
  };
  sidebar: {
    root: { dragging: boolean };
    inner: { dragging: boolean };
    wrapper: Record<never, never>;
    inset: Record<never, never>;
    rail: Record<never, never>;
    trigger: Record<never, never>;
    header: Record<never, never>;
    content: Record<never, never>;
    footer: Record<never, never>;
    group: Record<never, never>;
    "group-label": Record<never, never>;
    menu: Record<never, never>;
    "menu-item": Record<never, never>;
    "menu-button": { active: boolean; indicator: SelectionIndicator };
  };
  "sidebar-layout": {
    content: Record<never, never>;
  };
  sheet: {
    content: Record<never, never>;
    title: Record<never, never>;
    close: Record<never, never>;
  };
  tooltip: {
    content: Record<never, never>;
  };
  separator: {
    root: Record<never, never>;
  };
  breadcrumb: {
    root: Record<never, never>;
    page: Record<never, never>;
  };
  tabs: {
    root: Record<never, never>;
    list: { size: ControlSize; variant: TabsListVariant };
    indicator: Record<never, never>;
    tab: Record<never, never>;
    panel: Record<never, never>;
  };
  stepper: {
    root: { orientation: StepperOrientation; contentMode: StepperContentMode; responsive: boolean };
    list: { orientation: StepperOrientation; responsive: boolean };
    item: { state: StepperState; disabled: boolean; invalid: boolean };
    trigger: { state: StepperState; disabled: boolean; invalid: boolean };
    indicator: { state: StepperState; invalid: boolean };
    separator: { state: StepperState; invalid: boolean };
    title: Record<never, never>;
    description: Record<never, never>;
    content: { active: boolean };
  };
  "scroll-area": {
    root: Record<never, never>;
    scrollbar: { orientation: "horizontal" | "vertical" };
    thumb: Record<never, never>;
    corner: Record<never, never>;
  };
  "table-of-contents": {
    root: Record<never, never>;
    list: Record<never, never>;
    item: { active: boolean; variant: TableOfContentsVariant };
  };
  "chat-layout": {
    root: Record<never, never>;
  };
  "chat-thread": {
    root: Record<never, never>;
  };
  "chat-thought": {
    root: Record<never, never>;
    details: Record<never, never>;
  };
  "chat-message": {
    root: { role: ChatRole; state: ChatState; density: ChatDensity; tone: ChatTone };
    row: Record<never, never>;
    avatar: Record<never, never>;
    content: { role: ChatRole };
  };
  "chat-composer": {
    root: Record<never, never>;
    shell: Record<never, never>;
    accent: Record<never, never>;
    textarea: Record<never, never>;
    toolbar: Record<never, never>;
    tools: Record<never, never>;
    footer: Record<never, never>;
    submit: Record<never, never>;
    mention: Record<never, never>;
  };
  "dynamic-notification": {
    root: { state: DynamicNotificationState; variant: DynamicNotificationVariant };
    island: { state: DynamicNotificationState; variant: DynamicNotificationVariant };
    glass: Record<never, never>;
    liquid: Record<never, never>;
    pill: Record<never, never>;
    indicator: Record<never, never>;
    content: Record<never, never>;
    title: Record<never, never>;
    message: Record<never, never>;
    reply: Record<never, never>;
    "reply-input": Record<never, never>;
    "reply-submit": Record<never, never>;
    close: Record<never, never>;
  };
  "audio-recorder": {
    root: Record<never, never>;
    trigger: Record<never, never>;
    status: Record<never, never>;
    visualizer: Record<never, never>;
    duration: Record<never, never>;
    cancel: Record<never, never>;
    submit: Record<never, never>;
  };
  "audio-visualizer": {
    root: { variant: AudioVisualizerVariant };
  };
  activity: {
    root: { kind: ActivityKind; state: ActivityState };
    row: Record<never, never>;
    trigger: { kind: ActivityKind };
    icon: { kind: ActivityKind; state: ActivityState };
    title: Record<never, never>;
    status: { kind: ActivityKind; state: ActivityState };
    announcement: Record<never, never>;
    content: Record<never, never>;
    detail: Record<never, never>;
    "detail-label": Record<never, never>;
    "detail-content": Record<never, never>;
    list: Record<never, never>;
    item: Record<never, never>;
    "item-icon": Record<never, never>;
    "item-content": Record<never, never>;
  };
  "source-badge": {
    root: Record<never, never>;
    favicon: Record<never, never>;
    label: Record<never, never>;
  };
  "user-ask": {
    root: Record<never, never>;
    header: Record<never, never>;
    title: Record<never, never>;
    pagination: Record<never, never>;
    question: { active: boolean };
    option: { selected: boolean; disabled: boolean };
    "option-indicator": { selected: boolean };
    "option-label": Record<never, never>;
    "option-description": Record<never, never>;
    footer: Record<never, never>;
  };
  "task-list": {
    root: Record<never, never>;
    progress: Record<never, never>;
    label: Record<never, never>;
    items: Record<never, never>;
    item: { status: TaskStatus };
    "item-indicator": { status: TaskStatus };
  };
  "thread-rail": {
    root: Record<never, never>;
    item: Record<never, never>;
    line: Record<never, never>;
    popover: Record<never, never>;
    title: Record<never, never>;
    footer: Record<never, never>;
    file: Record<never, never>;
  };
  "markdown-block": {
    root: Record<never, never>;
    header: Record<never, never>;
    title: Record<never, never>;
    content: Record<never, never>;
  };
  code: {
    root: { chrome: CodeChrome; density: CodeDensity };
    header: Record<never, never>;
    title: Record<never, never>;
    actions: Record<never, never>;
    content: Record<never, never>;
    line: Record<never, never>;
    gutter: Record<never, never>;
  };
  "code-diff": {
    root: { diffStyle: DiffStyle };
    header: Record<never, never>;
    title: Record<never, never>;
    stat: Record<never, never>;
    actions: Record<never, never>;
    body: Record<never, never>;
    row: Record<never, never>;
    gutter: Record<never, never>;
    line: { lineType: CodeDiffLineType };
    expander: Record<never, never>;
    "expand-button": Record<never, never>;
  };
  markdown: {
    root: Record<never, never>;
  };
  "inline-attachment": {
    root: Record<never, never>;
    image: Record<never, never>;
    content: Record<never, never>;
    action: Record<never, never>;
  };
  "chat-composer-attachments": {
    root: Record<never, never>;
    scroll: Record<never, never>;
    list: Record<never, never>;
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
    content: Record<never, never>;
    title: Record<never, never>;
    description: { status: "idle" | "uploading" | "uploaded" | "error" };
    remove: Record<never, never>;
    progress: Record<never, never>;
    "progress-indicator": Record<never, never>;
  };
  "action-bar": {
    root: Record<never, never>;
  };
  field: {
    root: Record<never, never>;
    label: Record<never, never>;
    description: Record<never, never>;
    error: Record<never, never>;
    set: Record<never, never>;
    legend: Record<never, never>;
    item: Record<never, never>;
  };
  form: {
    root: Record<never, never>;
  };
  "native-select": {
    root: { size: ControlSize };
  };
  textarea: {
    root: Record<never, never>;
  };
  accordion: {
    root: Record<never, never>;
    item: Record<never, never>;
    trigger: Record<never, never>;
    panel: Record<never, never>;
  };
  avatar: {
    root: Record<never, never>;
    group: Record<never, never>;
    fallback: Record<never, never>;
  };
  progress: {
    root: Record<never, never>;
    track: Record<never, never>;
    indicator: Record<never, never>;
  };
  "hover-card": {
    trigger: Record<never, never>;
    content: Record<never, never>;
  };
  "alert-dialog": {
    trigger: Record<never, never>;
    close: Record<never, never>;
    content: Record<never, never>;
    header: Record<never, never>;
    footer: Record<never, never>;
    title: Record<never, never>;
    description: Record<never, never>;
  };
  "input-otp": {
    root: Record<never, never>;
    slot: Record<never, never>;
    separator: Record<never, never>;
  };
  combobox: {
    root: Record<never, never>;
    input: { size: ControlSize };
    trigger: Record<never, never>;
    icon: Record<never, never>;
    content: Record<never, never>;
    list: Record<never, never>;
    item: { disabled: boolean };
    empty: Record<never, never>;
    group: Record<never, never>;
    "group-label": Record<never, never>;
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
    root: Record<never, never>;
  };
  "aspect-ratio": {
    root: Record<never, never>;
  };
  "button-group": {
    root: { orientation: "horizontal" | "vertical" };
    text: Record<never, never>;
  };
  empty: {
    root: Record<never, never>;
    media: Record<never, never>;
  };
  item: {
    root: { variant: "default" | "outline" | "muted" };
  };
  pagination: {
    root: Record<never, never>;
    link: { active: boolean };
  };
  spinner: {
    root: Record<never, never>;
  };
  meter: {
    root: Record<never, never>;
    track: Record<never, never>;
    indicator: Record<never, never>;
  };
  "checkbox-group": {
    root: Record<never, never>;
  };
  autocomplete: {
    root: Record<never, never>;
    input: { size: ControlSize };
    clear: Record<never, never>;
    content: Record<never, never>;
    list: Record<never, never>;
    item: { disabled: boolean };
    empty: Record<never, never>;
    group: Record<never, never>;
    "group-label": Record<never, never>;
  };
  toolbar: {
    root: { orientation: "horizontal" | "vertical"; variant: ToolbarVariant };
    button: Record<never, never>;
    link: { variant: ToolbarLinkVariant };
    group: Record<never, never>;
    separator: Record<never, never>;
    input: Record<never, never>;
  };
  "dockable-panel": {
    root: { placement: "left" | "right"; dragging: boolean };
    header: Record<never, never>;
    "drag-handle": { dragging: boolean };
    title: Record<never, never>;
    actions: Record<never, never>;
    toggle: { placement: "left" | "right" };
    dock: { active: boolean; placement: "left" | "right" };
    close: Record<never, never>;
    content: { padding: DockablePanelContentPadding };
    "drop-zone": { side: "left" | "right"; active: boolean };
  };
  "infinite-canvas": {
    root: { panning: boolean };
    content: { scale: number };
    controls: Record<never, never>;
  };
  "agent-team-view": {
    root: Record<never, never>;
    zone: { selected: boolean; dragging: boolean; disabled: boolean };
    "zone-drag-handle": { selected: boolean; dragging: boolean; disabled: boolean };
    "zone-shadow": { selected: boolean; dragging: boolean };
    "zone-front": { selected: boolean; dragging: boolean };
    "zone-side": { selected: boolean; dragging: boolean };
    "zone-top": { selected: boolean; dragging: boolean };
    "zone-title": Record<never, never>;
    "zone-details": Record<never, never>;
    "zone-content": Record<never, never>;
    agent: Record<never, never>;
  };
  "number-field": {
    group: { size: ControlSize };
    input: Record<never, never>;
    decrement: Record<never, never>;
    increment: Record<never, never>;
    "scrub-area": Record<never, never>;
    "scrub-cursor": Record<never, never>;
  };
  "color-picker": {
    trigger: { disabled: boolean };
    content: Record<never, never>;
    panel: Record<never, never>;
    area: Record<never, never>;
    "area-thumb": Record<never, never>;
    hue: Record<never, never>;
    "hue-thumb": Record<never, never>;
    alpha: Record<never, never>;
    "alpha-thumb": Record<never, never>;
    wheel: Record<never, never>;
    "wheel-thumb": Record<never, never>;
    channels: Record<never, never>;
    swatches: Record<never, never>;
    swatch: { selected: boolean };
    "swatch-add": Record<never, never>;
    contrast: Record<never, never>;
    output: Record<never, never>;
  };
  "gradient-editor": {
    root: Record<never, never>;
    preview: Record<never, never>;
    track: Record<never, never>;
    stop: { selected: boolean };
    "stop-add": Record<never, never>;
  };
  resizable: {
    "panel-group": { orientation: "horizontal" | "vertical"; variant: ResizablePanelGroupVariant };
    panel: Record<never, never>;
    handle: { orientation: "horizontal" | "vertical" };
    "handle-grip": Record<never, never>;
  };
  calendar: {
    root: Record<never, never>;
    day: Record<never, never>;
  };
  tree: {
    root: { selectionMode: TreeSelectionMode };
    item: { level: number; selected: boolean; expanded: boolean; disabled: boolean };
    "item-trigger": { selected: boolean; expanded: boolean; disabled: boolean; indicator: SelectionIndicator };
    "item-indicator": Record<never, never>;
    "item-label": Record<never, never>;
    "item-content": { state: "open" | "closed" };
  };
};

export type SkinPaintContexts = {
  skeleton: {
    shimmer: Record<never, never>;
  };
  "chat-message": {
    streaming: Record<never, never>;
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

/**
 * Anchors a skin may fill with JSX; render zero DOM when absent, never gate library behavior.
 * Two flavors share the contract: decorative anchors (titlebars — empty ctx) and behavioral anchors, whose ctx carries
 * plain render-time values (a render prop, not React Context) so an anchored extension can react to component events.
 * Each anchor is ONE position contract: the component owns the positioned wrapper (aria-hidden, pointer-events-none,
 * paint containment) and the skin only supplies visuals. Anchors are rare and justified like slots.
 * Interactive bits live in a separate "use client" component the pack references — skin.config itself never carries "use client", keeping RSC intact.
 */
export type SkinAdornmentContexts = {
  "chat-layout": { titlebar: Record<never, never> };
  "chat-thought": { details: Record<never, never> };
  dialog: { titlebar: Record<never, never> };
  "chat-composer": { "send-layer": { sendCount: number } };
};

export type SkinAdornmentScope = keyof SkinAdornmentContexts;
export type SkinAdornmentPart<Scope extends SkinAdornmentScope> = keyof SkinAdornmentContexts[Scope];

type AdornmentEntry<Ctx> = ReactNode | ((ctx: Ctx) => ReactNode);

export type ControlUiSkin = {
  /** Scopes theme.css/skin.css via data-skin; components stamp it on portal containers. */
  id: string;
  /**
   * motion:"reduced" stamps data-motion="reduced" (theme editor + installed skin), collapsing --duration-fast/base/slow to 0ms — flattens cva transitions, Base UI enter/exit, shimmer/ripple keyframes at once.
   * Ripple cleanup relies on 0ms duration (never `animation:none`) so `animationend` still fires; on <html> portals inherit via document.body descent.
   * Container-scoped skin: stamp data-motion on same container so its portal popups inherit too.
   */
  motion?: "reduced";
  /**
   * Lock skin to one color scheme (undefined = adaptive, authors both light+dark blocks). When set, page mode (.dark class) must follow it — Shiki dual-theme, native color-scheme, dark: utilities all key off .dark independently of skin tokens.
   * App forces .dark to match + locks the toggle while active; skin's theme.css still paints every surface. Docs editor enforces via write-vars + pre-paint init script (no flash); installed pack declares same intent.
   */
  colorScheme?: "light" | "dark";
  /**
   * Sidebar LAYOUT geometry (not a slot restyle): shadcn's sidebar|floating|inset drive padding/gap/rounding/shadow across sidebar-gap/container/inner — resolved at render via skinSidebarLayout().
   * Explicit `variant` prop always wins (caller-wins); undefined keeps app default ("sidebar"). modern-apple sets "floating".
   */
  sidebarLayout?: SidebarLayout;
  /**
   * Sliding selection pill (Vercel-style) — an app-wide DS choice (sidebars/trees all glide or none do), not a per-instance prop, resolved via skinIndicator().
   * Explicit `indicator` prop still wins (caller-wins); undefined = static default "none", which also skips downloading the highlight engine's lazy chunk.
   */
  indicators?: { sidebar?: SelectionIndicator; tree?: SelectionIndicator };
  /** Sidebar WIDTH (any CSS length) — DS-level geometry like sidebarLayout, resolved via skinSidebarWidth(); caller's own --sidebar-width (inline style, runtime writes) still wins; undefined keeps shadcn default (16rem). */
  sidebarWidth?: string;
  /**
   * Control effects (top-shine|ripple) — DS-level choice like `indicators`; effects.css keys off `data-effects` ancestor attribute.
   * Portals stamp resolved list on positioner (next to data-skin); ControlEffectsRuntime extension mirrors it on <html> for in-tree content. top-shine is CSS-only, ripple needs the runtime's document pointer listener.
   * Undefined = nothing stamped, all effect selectors inert; a subtree <ControlEffectsRoot effects={...}> is still a caller-wins local override.
   */
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

/** The three shadcn Sidebar layouts a skin may request; see ControlUiSkin.sidebarLayout. */
export type SidebarLayout = "sidebar" | "floating" | "inset";

/** Active skin id, read at render time (getter-based configs stay live); portals stamp it on their positioner since they land outside any token-scoped ancestor. */
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

/** Resolve a slot's skin override — string passes through, function gets ctx; undefined = skin leaves slot untouched (default config's answer for everything). */
export function skinSlot<Scope extends SkinSlotScope, Part extends SkinSlotPart<Scope>>(
  scope: Scope,
  part: Part,
  ctx: SkinSlotContexts[Scope][Part],
): string | undefined {
  const entry = skin.slots?.[scope]?.[part];
  if (entry === undefined) return undefined;
  return typeof entry === "string"
    ? entry
    : (entry as SlotOverride<SkinSlotContexts[Scope][Part]> & ((value: SkinSlotContexts[Scope][Part]) => string))(ctx);
}

/** Resolve an exclusive paint hook separately from DOM anatomy. */
export function skinPaint<Scope extends SkinPaintScope, Part extends SkinPaintPart<Scope>>(
  scope: Scope,
  part: Part,
  ctx: SkinPaintContexts[Scope][Part],
): string | undefined {
  const entry = skin.paints?.[scope]?.[part];
  if (entry === undefined) return undefined;
  return typeof entry === "string"
    ? entry
    : (entry as SlotOverride<SkinPaintContexts[Scope][Part]> & ((value: SkinPaintContexts[Scope][Part]) => string))(ctx);
}

/** Active skin's requested Sidebar layout, or undefined; Sidebar falls back variant prop → this → "sidebar". */
export function skinSidebarLayout(): SidebarLayout | undefined {
  return skin.sidebarLayout;
}

/** Active skin's sliding indicator for sidebar|tree, or undefined; component falls back indicator prop → this → "none". */
export function skinIndicator(component: "sidebar" | "tree"): SelectionIndicator | undefined {
  return skin.indicators?.[component];
}

/**
 * Applied AFTER skin slot classes when sliding indicator is on: pill is the sole hover/active chrome, so every bg the recipe/skin painted must go. Caller className still comes last and wins.
 * twMerge only evicts an exact modifier chain, so dark: forms are restated alongside bare ones — a pack painting bg under any OTHER modifier leaks past this and fails the slide-neutralization test (not a runtime double-highlight).
 * Function-form slots can branch on ctx.indicator to skip the background entirely.
 */
export const SELECTION_INDICATOR_BG_RESET = [
  "bg-transparent hover:bg-transparent active:bg-transparent",
  "data-[active=true]:bg-transparent data-[selected]:bg-transparent data-[state=open]:hover:bg-transparent",
  "dark:bg-transparent dark:hover:bg-transparent dark:active:bg-transparent",
  "dark:data-[active=true]:bg-transparent dark:data-[selected]:bg-transparent dark:data-[state=open]:hover:bg-transparent",
].join(" ");

/** Active skin's requested sidebar width, or undefined; SidebarProvider seeds --sidebar-width from this, caller-provided value still wins. */
export function skinSidebarWidth(): string | undefined {
  return skin.sidebarWidth;
}

/** data-effects attribute value the active skin requests, or undefined (React omits attribute); portals stamp it next to data-skin, ControlEffectsRuntime mirrors on <html>. */
export function skinEffects(): string | undefined {
  const effects = skin.effects;
  return effects && effects.length > 0 ? effects.join(" ") : undefined;
}

/** Resolve a decorative adornment — config's ReactNode or ctx-fn result, or undefined when skin fills nothing there (component renders no adornment DOM). */
export function skinAdornment<Scope extends SkinAdornmentScope, Part extends SkinAdornmentPart<Scope>>(
  scope: Scope,
  part: Part,
  ctx: SkinAdornmentContexts[Scope][Part],
): ReactNode | undefined {
  const entry = skin.adornments?.[scope]?.[part];
  if (entry === undefined) return undefined;
  return typeof entry === "function"
    ? (entry as AdornmentEntry<SkinAdornmentContexts[Scope][Part]> & ((value: SkinAdornmentContexts[Scope][Part]) => ReactNode))(ctx)
    : entry;
}

/** Whether the active skin fills an anchor — lets a component skip the state that only feeds that anchor's ctx (e.g. the send counter). */
export function hasSkinAdornment<Scope extends SkinAdornmentScope, Part extends SkinAdornmentPart<Scope>>(
  scope: Scope,
  part: Part,
): boolean {
  return skin.adornments?.[scope]?.[part] !== undefined;
}
