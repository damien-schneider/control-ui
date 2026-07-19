import type { ComponentProps, CSSProperties, MouseEvent, ReactElement, ReactNode, Ref } from "react";

export type ChatRole = "user" | "assistant" | "system" | "tool";
export type ChatDensity = "compact" | "comfortable";
export type ChatState = "idle" | "streaming" | "pending" | "error";
export type ChatTone = "neutral" | "success" | "warning" | "danger";

export type ChatMessageProps = ComponentProps<"article"> & {
  from: ChatRole;
  state?: ChatState;
  density?: ChatDensity;
  tone?: ChatTone;
};

export type ChatInputSubmitPayload = {
  value: string;
  clear: () => void;
  // Rich editor surface only; absent for plain-textarea path (stays optional/backward-compatible).
  mentions?: MentionItem[];
};

export type ChatInputProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (payload: ChatInputSubmitPayload) => void | Promise<void>;
  state?: "idle" | "submitting" | "disabled";
  density?: ChatDensity;
  disabled?: boolean;
};

export type ActivityState = "pending" | "running" | "success" | "error";
export type ActivityKind = "default" | "tool";

export type ActivityProps = Omit<CollapsibleProps, "children"> & {
  children?: ReactNode;
  kind?: ActivityKind;
  name?: string;
  state?: ActivityState;
  statusLabel?: ReactNode;
};

/** Resolved answers keyed by question id; a freeform option resolves to its typed text. */
export type UserAskAnswers = Record<string, string>;

// UserAsk temporarily replaces the chat composer inside its container: same width, keyboard-first
// (digits select, arrows move, Enter continues, Escape dismisses). Questions/options register
// themselves — the panel derives count, numbering, and pagination instead of taking data arrays.
export type UserAskProps = ComponentProps<"section"> & {
  children?: ReactNode;
  onComplete?: (answers: UserAskAnswers) => void;
  onDismiss?: () => void;
};

/** Which audio-visualizer usage version is rendering — bars (default) or line; both share AudioVisualizerProps. */
export type AudioVisualizerVariant = "bars" | "line";

/**
 * Shared contract of the audio-visualizer usage family. Both versions (audio-visualizer.tsx = bars,
 * audio-visualizer-line.tsx = line) export the same `AudioVisualizer` against these exact props, so
 * swapping versions is an import-path change — no call site moves.
 */
export type AudioVisualizerProps = Omit<ComponentProps<"div">, "children"> & {
  /** Rolling window of 0..1 audio levels, oldest first (e.g. RMS per frame from an AnalyserNode). */
  levels: readonly number[];
  /** Whether the source is live. Inactive visualizers retain their last shape with quieter emphasis. */
  active?: boolean;
  /** Stable number of rendered points (latest N levels, left-padded with silence); defaults to 28 and is capped at 128. */
  points?: number;
};

export type ThreadRailProps = ComponentProps<"nav">;

export type ThreadRailItemProps = ComponentProps<"div"> & {
  from?: ChatRole;
  inView?: boolean;
  active?: boolean;
};

export type RenderProp<Props, State extends Record<string, unknown> = Record<string, unknown>> =
  | ReactElement
  | ((props: Props, state: State) => ReactElement<unknown>);

/**
 * Skins install as SOURCE (reinstall, not runtime toggle). Default = shadcn-compat (host primitives via
 * registryDependencies); opinionated skins (refined) scope under components/control-ui/ui/*, never touch components/ui/*.
 * Every skin emits scoped anatomy+data-slot(+component identity), normalizes state via data-state/data-active, composes via render/nativeButton.
 */

// `variant` = visual STRUCTURE not color: solid=primary action, surface=visible-secondary (bg/border),
// ghost=standard hover (shadcn-like), quiet=discreet inline (Copy/Edit). `tone` = color INTENT, orthogonal
// (avoids solidDanger/ghostDanger explosion). No `lg` — chat needs compactness. Brand fx (shine/ripple) live in CSS/extensions, not this prop surface.
// Slot module components/control-ui/ui/button exports Button. scoped anatomy data-slot="button", data-active reflects `active`.
// Shared by Button/Select trigger/Menu trigger/Input via controlSize cva (height --control-h-*/padding/text per step). Default md.
export type ControlSize = "xs" | "sm" | "md" | "lg";

// effects.css keys off data-effects (space-separated). Declared here not in the optional extension because ControlUiSkin.effects
// references it even without the ripple runtime installed (top-shine is CSS-only). control-effects.ts re-exports it publicly.
export type ControlEffect = "top-shine" | "ripple" | "hover-circle";

export type ButtonVariant = "solid" | "surface" | "ghost" | "quiet";
export type ButtonSize = ControlSize;
export type ButtonTone = "neutral" | "primary" | "danger";
export type ButtonShape = "default" | "circle";

export type ButtonAppearanceProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  active?: boolean;
  iconOnly?: boolean;
  shape?: ButtonShape;
};

export type ButtonProps = ComponentProps<"button"> &
  ButtonAppearanceProps & {
    render?: RenderProp<ComponentProps<"button">, { disabled: boolean }>;
    nativeButton?: boolean;
  };

export type ButtonLinkProps = ComponentProps<"a"> &
  ButtonAppearanceProps & {
    render?: RenderProp<ComponentProps<"a">>;
  };

export type ButtonLabelProps = ComponentProps<"label"> & ButtonAppearanceProps;

// Kebab-case superset of onOpenChange reasons across all popup-style primitives (DropdownMenu adds item-press/list-navigation,
// Combobox adds input-change, etc.) — callers get one shape regardless of which primitive backs the contract.
export type OpenChangeReason =
  | "trigger-hover"
  | "trigger-focus"
  | "trigger-press"
  | "outside-press"
  | "escape-key"
  | "close-watcher"
  | "close-press"
  | "focus-out"
  | "list-navigation"
  | "item-press"
  | "sibling-open"
  | "cancel-open"
  | "input-change"
  | "input-clear"
  | "clear-press"
  | "chip-remove-press"
  | "imperative-action"
  | "swipe"
  | "none";

// event widened to base Event (Base UI-agnostic). cancel() blocks pending state change (e.g. keep dialog open while form dirty).
// allowPropagation() opts Escape back into bubbling to an ancestor popup (Base UI stops it by default).
export type OpenChangeEventDetails = {
  reason: OpenChangeReason;
  event: Event;
  cancel: () => void;
  allowPropagation: () => void;
  isCanceled: boolean;
  isPropagationAllowed: boolean;
  trigger: Element | undefined;
};

// components/control-ui/ui/collapsible: root data-slot="collapsible" data-state="open"|"closed", trigger data-slot="trigger",
// content data-slot="content" (all scoped anatomy).
export type CollapsibleProps = Omit<ComponentProps<"div">, "onChange"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  children?: ReactNode;
};

export type CollapsibleTriggerProps = ComponentProps<"button"> & {
  "data-slot"?: string;
  render?: RenderProp<ComponentProps<"button">, { open: boolean }>;
  nativeButton?: boolean;
};

export type CollapsibleContentProps = ComponentProps<"div"> & {
  "data-slot"?: string;
  /** Keep the panel in the DOM while closed (Base UI passthrough) — needed when hidden children carry state, e.g. TaskList item registration. */
  keepMounted?: boolean;
};

export type MorphingPanelDimensions = {
  width: string;
  height: string;
};

export type MorphingPanelProps = CollapsibleProps & {
  collapsedSize: MorphingPanelDimensions;
  expandedSize: MorphingPanelDimensions;
};

export type MorphingPanelTriggerProps = CollapsibleTriggerProps;
export type MorphingPanelContentProps = CollapsibleContentProps;

export type TaskStatus = "pending" | "active" | "completed";

// TaskList floats just above the chat composer as a one-row progress pill ("Task 3 of 5 › label")
// and expands into the full task list. Items register their status — the pill derives progress.
export type TaskListProps = CollapsibleProps;

// Tabs exposes the local parts root, list, trigger, indicator, and panel.
// Indicator is stable anatomy; skin decides pill/line/texture look.
export type TabsProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export type TabsListProps = ComponentProps<"div"> & {
  size?: ControlSize;
};

export type TabsTabProps = Omit<ComponentProps<"button">, "value"> & {
  value: string;
  /** Render as another element (e.g. router Link) to turn the tab strip into nav; set nativeButton={false} for non-<button>. */
  render?: RenderProp<ComponentProps<"button">, { active: boolean; disabled: boolean }>;
  nativeButton?: boolean;
};

export type TabsPanelProps = ComponentProps<"div"> & {
  value: string;
};

// components/control-ui/ui/stepper: semantic ordered steps with optional native triggers and preserved panels, without tab semantics.
export type StepperOrientation = "horizontal" | "vertical";
export type StepperContentMode = "current" | "all";
export type StepperState = "neutral" | "complete" | "current" | "upcoming";

export type StepperProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number) => void;
  orientation?: StepperOrientation;
  contentMode?: StepperContentMode;
  responsive?: boolean;
};

export type StepperListProps = ComponentProps<"ol">;

export type StepperItemProps = Omit<ComponentProps<"li">, "value"> & {
  step: number;
  disabled?: boolean;
  invalid?: boolean;
};

export type StepperTriggerProps = ComponentProps<"button">;
export type StepperIndicatorProps = ComponentProps<"span">;
export type StepperSeparatorProps = ComponentProps<"span">;
export type StepperTitleProps = ComponentProps<"span">;
export type StepperDescriptionProps = ComponentProps<"span">;

export type StepperContentProps = ComponentProps<"section"> & {
  step: number;
  keepMounted?: boolean;
};

// components/control-ui/ui/tree — library-original (Base UI has none); each branch reuses Base UI Collapsible; WAI-ARIA APG "file directory treeview" (<li> = focusable treeitem, roving tabindex, trigger row presentational).
// Tree exposes local parts for items, triggers, indicators, labels, and grouped content.
// Selection/expansion value-first, always string[] so single/multiple share one shape (no conditional generics); selectionMode="none" = nav-only.
export type TreeSelectionMode = "none" | "single" | "multiple";

export type TreeInteractionReason = "pointer" | "keyboard" | "imperative";

export type TreeSelectionChangeDetails = {
  value: string;
  reason: TreeInteractionReason;
};

export type TreeExpandedChangeDetails = {
  value: string;
  expanded: boolean;
  reason: TreeInteractionReason;
};

/** Sliding selection pill, shared by row-in-track lists (Tree, SidebarMenu). none=per-row bg, slide=single moving highlight. Default is a SKIN decision (ControlUiSkin.indicators); explicit prop wins. */
export type SelectionIndicator = "none" | "slide";

export type TreeSelectionIndicator = SelectionIndicator;

export type TreeProps = Omit<ComponentProps<"ul">, "onChange" | "defaultValue"> & {
  /** `single` (default), `multiple` (Cmd/Ctrl-click, Cmd/Ctrl-Space, Shift-range), or `none`. */
  selectionMode?: TreeSelectionMode;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[], details: TreeSelectionChangeDetails) => void;
  expandedValue?: string[];
  defaultExpandedValue?: string[];
  onExpandedChange?: (expanded: string[], details: TreeExpandedChangeDetails) => void;
  /** none=per-row bg; slide=Vercel-style pill glides to hover/rests on selection (suppresses per-row bg), best for single-select, motion via --duration-* (snaps reduced-motion). Default ControlUiSkin.indicators.tree, else none. */
  indicator?: TreeSelectionIndicator;
};

export type TreeItemProps = Omit<ComponentProps<"li">, "value"> & {
  /** Stable id/path — the selection + expansion key, and the roving/`data-value` handle. */
  value: string;
  disabled?: boolean;
  /** Type-ahead text. Falls back to the `TreeItemLabel` text content when omitted. */
  label?: string;
  children?: ReactNode;
};

export type TreeItemTriggerProps = ComponentProps<"div"> & {
  render?: RenderProp<ComponentProps<"div">>;
};

export type TreeItemIndicatorProps = ComponentProps<"span">;

export type TreeItemLabelProps = ComponentProps<"span"> & {
  render?: RenderProp<ComponentProps<"span">>;
};

export type TreeItemContentProps = ComponentProps<"div">;

// components/control-ui/ui/scroll-area: two-axis surface, overlay scrollbars, edge fades only on sides with clipped content. data-slot="scroll-area".
export type ScrollAreaLockAxis = "x" | "y" | "both";
export type ScrollAreaViewportProps = Omit<ComponentProps<"div">, "children" | "className" | "ref"> & {
  "data-control-ui"?: string;
  "data-slot"?: string;
};

export type ScrollAreaProps = ComponentProps<"div"> & {
  viewportClassName?: string;
  viewportProps?: ScrollAreaViewportProps;
  viewportRef?: Ref<HTMLDivElement>;
  maxHeight?: string;
  mask?: boolean;
  lockAxis?: ScrollAreaLockAxis;
  scrollbarVisibility?: "scroll" | "hover" | "always";
};

export type TocItem = {
  /** Fragment link to the section, e.g. `#install`. */
  href: string;
  label: string;
  /** Heading depth (1 = h1, 2 = h2, 3 = h3, ...). Drives indentation. Defaults to nesting depth, then 2. */
  level?: number;
  children?: TocItem[];
};

export type TableOfContentsVariant = "background" | "trail" | "both";

// components/control-ui/ui/table-of-contents: sticky "on this page" nav, scroll-spies items' section ids, highlights in-view range as one contiguous block. Indicator/scroll/offset are CSS; only in-view detection is JS.
// Anatomy: table-of-contents root, list, and item; nested lists emit data-nested.
export type TableOfContentsProps = Omit<ComponentProps<"nav">, "children"> & {
  items: TocItem[];
  /** Heading shown above the list and used as the nav's accessible name. Defaults to "On this page". */
  label?: string;
  /** Active item treatment. Defaults to both the trail and background. */
  variant?: TableOfContentsVariant;
};

// components/control-ui/ui/select: trigger shares --radius-control with Button/Menu trigger (one token squares every control).
// data-slot="select-trigger"|"select-content"|"select-item" (scoped anatomy).
export type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  children?: ReactNode;
};

export type SelectTriggerVariant = "surface" | "ghost";

export type SelectTriggerProps = ComponentProps<"button"> & {
  size?: ControlSize;
  variant?: SelectTriggerVariant;
};

export type SelectValueProps = {
  placeholder?: ReactNode;
  children?: ReactNode | ((value: string) => ReactNode);
};

export type SelectContentProps = ComponentProps<"div">;

export type SelectItemProps = ComponentProps<"div"> & {
  value: string;
  label?: string;
  disabled?: boolean;
};

// components/control-ui/ui/menu: trigger shares --radius-control with Button/Select. data-slot="menu-trigger"|"menu-content"|"menu-item" (scoped anatomy).
export type MenuProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type MenuTriggerVariant = "surface" | "ghost";

export type MenuTriggerProps = ComponentProps<"button"> & {
  size?: ControlSize;
  iconOnly?: boolean;
  variant?: MenuTriggerVariant;
};

export type MenuContentProps = ComponentProps<"div">;

export type MenuItemProps = Omit<ComponentProps<"div">, "onClick"> & {
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
};

export type MenuSeparatorProps = ComponentProps<"div">;

export type MenuLabelProps = ComponentProps<"div">;

export type PopoverContentPadding = "default" | "none";

// components/control-ui/ui/context-menu (shadcn-compatible surface, full submenu/checkbox/radio family): right-click/long-press menu.
// Rows share --radius-popup-item; popup shares --radius-popover with Menu/Select. data-slot="context-menu-content"|"context-menu-item" (scoped anatomy).
export type ContextMenuProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type ContextMenuTriggerProps = ComponentProps<"div">;

export type ContextMenuGroupProps = ComponentProps<"div">;

export type ContextMenuContentProps = ComponentProps<"div">;

export type ContextMenuItemProps = Omit<ComponentProps<"div">, "onClick"> & {
  disabled?: boolean;
  inset?: boolean;
  onClick?: (event: MouseEvent) => void;
};

export type ContextMenuCheckboxItemProps = Omit<ComponentProps<"div">, "onClick"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export type ContextMenuRadioGroupProps = ComponentProps<"div"> & {
  value?: string;
  onValueChange?: (value: string) => void;
};

export type ContextMenuRadioItemProps = Omit<ComponentProps<"div">, "onClick"> & {
  value: string;
  disabled?: boolean;
};

export type ContextMenuLabelProps = ComponentProps<"div"> & {
  inset?: boolean;
};

export type ContextMenuSeparatorProps = ComponentProps<"div">;

export type ContextMenuShortcutProps = ComponentProps<"span">;

export type ContextMenuSubProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type ContextMenuSubTriggerProps = Omit<ComponentProps<"div">, "onClick"> & {
  disabled?: boolean;
  inset?: boolean;
};

export type ContextMenuSubContentProps = ComponentProps<"div">;

// components/control-ui/ui/menubar: horizontal bar of Base UI Menu triggers; popups/rows share popover token set with Menu/Select.
export type MenubarProps = ComponentProps<"div"> & {
  modal?: boolean;
  loopFocus?: boolean;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
};

export type MenubarMenuProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type MenubarTriggerProps = ComponentProps<"button">;

export type MenubarContentProps = ComponentProps<"div">;

export type MenubarItemProps = Omit<ComponentProps<"div">, "onClick"> & {
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
};

export type MenubarSeparatorProps = ComponentProps<"div">;

export type MenubarLabelProps = ComponentProps<"div"> & {
  inset?: boolean;
};

export type MenubarGroupProps = ComponentProps<"div">;

export type MenubarShortcutProps = ComponentProps<"span">;

export type MenubarSubProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type MenubarSubTriggerProps = Omit<ComponentProps<"div">, "onClick"> & {
  disabled?: boolean;
  inset?: boolean;
};

export type MenubarSubContentProps = ComponentProps<"div">;

// components/control-ui/ui/navigation-menu: triggers over one shared floating viewport that morphs between panels. Triggers share --radius-control; viewport is --radius-popover.
export type NavigationMenuProps = ComponentProps<"nav"> & {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  orientation?: "horizontal" | "vertical";
  delay?: number;
  closeDelay?: number;
};

export type NavigationMenuListProps = ComponentProps<"ul">;

export type NavigationMenuItemProps = ComponentProps<"li"> & {
  value?: string;
};

export type NavigationMenuTriggerProps = ComponentProps<"button">;

export type NavigationMenuContentProps = ComponentProps<"div">;

export type NavigationMenuLinkVariant = "default" | "compact";

export type NavigationMenuLinkProps = ComponentProps<"a"> & {
  active?: boolean;
  closeOnClick?: boolean;
  variant?: NavigationMenuLinkVariant;
};

export type NavigationMenuViewportProps = ComponentProps<"div">;

// components/control-ui/model-switcher: model picker on Select slot; drop inside ChatInputTools or standalone.
export type ModelOption = {
  value: string;
  label: string;
  hint?: ReactNode;
};

export type ModelSwitcherProps = {
  models: ModelOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: "xs" | "sm";
  variant?: SelectTriggerVariant;
  className?: string;
};

// components/control-ui/ui/dialog: modal, --radius-panel + shadow-modal (tracks theme). data-slot="dialog-content".
export type DialogProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type DialogContentProps = ComponentProps<"div"> & {
  showCloseButton?: boolean;
};

export type ResponsiveDialogProps = DialogProps;

export type ResponsiveDialogContentProps = DialogContentProps & {
  dialogClassName?: string;
  drawerClassName?: string;
};

// components/control-ui/ui/input: shares --radius-control with Button/Select/Menu triggers. data-slot="input".
export type InputProps = Omit<ComponentProps<"input">, "size"> & {
  size?: ControlSize;
};

// components/control-ui/ui/input-group: addon + field composed as one control. data-slot="input-group".
export type InputGroupProps = ComponentProps<"div"> & {
  render?: RenderProp<ComponentProps<"div">>;
  size?: ControlSize;
};

export type InputGroupAddonProps = ComponentProps<"span">;

// components/control-ui/ui/label: renders <label> when htmlFor is set (ties to control), else <span> for group captions.
export type LabelProps = ComponentProps<"label">;

// components/control-ui/ui/slider: variant "default"=branded (muted track, --primary indicator, pill thumb); "plain"=neutral monochrome (recessed track, thin thumb).
// plain + label/showValue grows into a taller labeled bar w/ value + step ticks (opt-in; default ignores these props).
// data-slot="slider"|"slider-control"|"slider-track"|"slider-indicator"|"slider-thumb" (scoped anatomy).
export type SliderVariant = "default" | "plain";

export type SliderProps = {
  variant?: SliderVariant;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
  "aria-label"?: string;
};

// components/control-ui/ui/toggle: Toggle+ToggleGroup compose Button slot (shares --radius-control/controlSize/tones/chrome). pressed surfaces via Button's active/data-active — never special-case toggle anatomy; `active` prop force-overrides independent of pressed state.
// showCheck renders Checkbox/SelectItem's tick glyph gated on pressed, for tile-style toggles wanting an explicit check mark (don't hand-roll this).
// data-slot="button" component identity="toggle" data-active=pressed (toggle); data-slot="toggle-group" (group), scoped anatomy.
export type ToggleProps = Omit<ButtonProps, "render" | "nativeButton" | "value"> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** Identifies the toggle inside a ToggleGroup (the group's value is the set of pressed values). */
  value?: string;
  /** Show the shared checkmark glyph (Checkbox/SelectItem's tick) when the toggle is active. */
  showCheck?: boolean;
};

export type ToggleGroupProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Allow several toggles pressed at once. Default false — single-select. */
  multiple?: boolean;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
};

// components/control-ui/ui/checkbox: Base UI Checkbox, shares --radius-sm + control focus ring, fills --primary checked, dash tick when indeterminate. Inside Field.Root, data-invalid ring surfaces validation.
// data-slot="checkbox"(data-checked=on)|"checkbox-indicator", scoped anatomy.
export type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

// components/control-ui/ui/radio-group: Base UI RadioGroup+Radio, circle shares control ring w/ Checkbox, fills --primary+--primary-foreground dot when selected. Group owns value; compose label beside Radio.
// data-slot="radio-group"|"radio"(data-checked=selected), scoped anatomy.
export type RadioGroupProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  orientation?: "horizontal" | "vertical";
};

export type RadioProps = {
  value: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

// components/control-ui/ui/switch: OWN anatomy (pill track+sliding thumb), not a restyled Button (contrast Toggle). Track recolors --primary checked; thumb STRETCHES while pressed via --duration-*/--ease-* (motion kill-switch flattens it).
// icon = one glyph both states (color flips checked); checkedIcon/uncheckedIcon = per-state glyphs, cross-fade, take precedence over icon.
// data-slot="switch"(data-checked=on)|"switch-thumb"|"switch-thumb-icon"(data-switch-icon=checked|unchecked), scoped anatomy.
export type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  className?: string;
  /** A single thumb glyph shown in both states; its colour flips when checked. */
  icon?: ReactNode;
  /** Thumb glyph shown while checked. Overrides `icon`. Cross-fades with `uncheckedIcon`. */
  checkedIcon?: ReactNode;
  /** Thumb glyph shown while unchecked. Overrides `icon`. Cross-fades with `checkedIcon`. */
  uncheckedIcon?: ReactNode;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

// components/control-ui/ui/field: shadcn Field family on Base UI Field+Fieldset. Pure layout+text — owns labeling/description/validation wiring, never paints a control; drop control-ui Input/Select/Textarea into FieldControl's render.
// Base UI stamps data-valid/-invalid/-dirty/-touched/-filled/-focused on every part (zero-JS validity styling).
// scoped anatomy + data-slot on each part: field/field-label/field-control/field-description/field-error/field-group/field-set/field-legend.
export type FieldProps = ComponentProps<"div"> & {
  orientation?: "vertical" | "horizontal" | "responsive";
  /** Field name; keys Form `errors` and takes precedence over the control's own name. */
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  validationMode?: "onSubmit" | "onBlur" | "onChange";
};

export type FieldLabelProps = ComponentProps<"label">;

export type FieldContentProps = ComponentProps<"div">;

export type FieldTitleProps = ComponentProps<"div">;

// render intersected straight off Base UI's Field.Control in the slot source, so typing/merging matches Base UI exactly.
export type FieldControlProps = ComponentProps<"input">;

export type FieldDescriptionProps = ComponentProps<"p">;

// `match` narrows when the error shows to a specific ValidityState key; omit to show on any invalid.
export type FieldErrorMatch = boolean | keyof ValidityState;

export type FieldErrorProps = ComponentProps<"div"> & {
  match?: FieldErrorMatch;
};

export type FieldGroupProps = ComponentProps<"div">;

export type FieldSeparatorProps = ComponentProps<"div"> & {
  children?: ReactNode;
};

// FieldItem wraps one labelled row in a Fieldset group (e.g. radio/checkbox option) so Base UI scopes label+description+validity to that control. data-slot="field-item".
export type FieldItemProps = ComponentProps<"div">;

export type FieldSetProps = ComponentProps<"fieldset">;

export type FieldLegendProps = ComponentProps<"div">;

// components/control-ui/ui/form: Base UI <form> wrapper, merges externally-returned errors (keyed by Field name) onto matching FieldError. data-slot="form".
export type FormErrors = Record<string, string | string[]>;

export type FormProps = ComponentProps<"form"> & {
  errors?: FormErrors;
  validationMode?: "onSubmit" | "onBlur" | "onChange";
};

// components/control-ui/ui/native-select: real native <select> (not floating Base UI Select), shares --radius-control+controlSize with Button/Input/Select, chevron overlay. data-slot="native-select".
export type NativeSelectProps = Omit<ComponentProps<"select">, "size"> & {
  size?: ControlSize;
};

// components/control-ui/ui/textarea: mirrors Input surface, multiline rhythm, auto-grows CSS-first via field-sizing-content. data-slot="textarea".
export type TextareaProps = ComponentProps<"textarea">;

// components/control-ui/ui/accordion: Base UI Accordion, chevron rotates on data-panel-open, Panel height-animates via --accordion-panel-height (pure CSS).
export type AccordionValue = (string | number)[];

export type AccordionProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: AccordionValue;
  defaultValue?: AccordionValue;
  onValueChange?: (value: AccordionValue) => void;
  multiple?: boolean;
  disabled?: boolean;
};

export type AccordionItemProps = ComponentProps<"div"> & {
  value?: string | number;
  disabled?: boolean;
};

export type AccordionTriggerProps = ComponentProps<"button">;

export type AccordionPanelProps = ComponentProps<"div">;

// components/control-ui/ui/avatar: Base UI owns image-load state; Fallback shows when Image missing/errors.
export type AvatarProps = ComponentProps<"span">;

export type AvatarImageProps = ComponentProps<"img"> & {
  onLoadingStatusChange?: (status: "idle" | "loading" | "loaded" | "error") => void;
};

export type AvatarFallbackProps = ComponentProps<"span"> & {
  delay?: number;
};

// components/control-ui/ui/progress: Base UI drives Indicator width from value/min/max; value null = indeterminate.
export type ProgressProps = ComponentProps<"div"> & {
  value: number | null;
  min?: number;
  max?: number;
  format?: Intl.NumberFormatOptions;
  getAriaValueText?: (formattedValue: string | null, value: number | null) => string;
  locale?: Intl.LocalesArgument;
};

export type ProgressTrackProps = ComponentProps<"div">;

export type ProgressIndicatorProps = ComponentProps<"div">;

export type ProgressLabelProps = ComponentProps<"span">;

export type ProgressValueProps = Omit<ComponentProps<"span">, "children"> & {
  children?: ((formattedValue: string | null, value: number | null) => ReactNode) | null;
};

// components/control-ui/ui/hover-card: Base UI PreviewCard, popover token set (--radius-popover/--popover-padding/shadow-pop), re-asserts skin scope on portal.
export type HoverCardProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type HoverCardContentProps = ComponentProps<"div"> & {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
};

// components/control-ui/ui/alert-dialog: modal requiring explicit action (no light dismiss). --radius-panel + shadow-modal over themed backdrop, re-asserts skin scope on portal.
// Close actions compose Button, so footer actions share size/tone/variant contract.
export type AlertDialogProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type AlertDialogContentProps = ComponentProps<"div">;

// components/control-ui/ui/input-otp: Base UI OtpField; each slot shares --radius-control + card/ring surface with Input/Select trigger.
export type InputOTPProps = {
  length?: number;
  separator?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  mask?: boolean;
  id?: string;
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
  "aria-describedby"?: string;
};

export type InputOTPSlotProps = {
  index: number;
  length?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export type InputOTPSeparatorProps = ComponentProps<"div">;

// components/control-ui/ui/combobox: Base UI Combobox, searchable single-select. Input shares --radius-control/controlSurfaceClasses/controlSize with Button/Select; list rides shared popover tokens. Generic over item Value (inferred from items/value).
export type ComboboxProps<Value = string> = {
  children?: ReactNode;
  items?: readonly Value[];
  value?: Value | null;
  defaultValue?: Value | null;
  onValueChange?: (value: Value | null) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (inputValue: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  autoHighlight?: boolean;
  itemToStringLabel?: (itemValue: Value) => string;
  isItemEqualToValue?: (itemValue: Value, value: Value) => boolean;
};

export type ComboboxInputProps = Omit<ComponentProps<"input">, "size"> & {
  size?: ControlSize;
};

export type ComboboxTriggerProps = ComponentProps<"button">;

export type ComboboxContentProps = ComponentProps<"div"> & {
  sideOffset?: number;
};

export type ComboboxListProps<Value = unknown> = Omit<ComponentProps<"div">, "children"> & {
  children?: ReactNode | ((item: Value, index: number) => ReactNode);
};

export type ComboboxItemProps<Value = unknown> = Omit<ComponentProps<"div">, "value"> & {
  value?: Value;
  disabled?: boolean;
};

export type ComboboxEmptyProps = ComponentProps<"div">;
export type ComboboxGroupProps = ComponentProps<"div">;
export type ComboboxGroupLabelProps = ComponentProps<"div">;

// components/control-ui/ui/alert: role="alert" panel, --radius-lg + --card/--border, grid layout (icon own column); destructive variant re-tints via --destructive.
export type AlertVariant = "default" | "destructive";
export type AlertProps = ComponentProps<"div"> & { variant?: AlertVariant };
export type AlertTitleProps = ComponentProps<"div">;
export type AlertDescriptionProps = ComponentProps<"div">;

// components/control-ui/ui/badge: control-shaped chip sharing border+focus ring w/ buttons/fields. render renders as link/button; color intent routes through badge tokens.
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
export type BadgeSize = "sm" | "md";
export type BadgeColor =
  | "neutral"
  | "slate"
  | "gray"
  | "zinc"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose";
export type BadgeProps = ComponentProps<"span"> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  render?: RenderProp<ComponentProps<"span">>;
};

// components/control-ui/ui/card: --radius-lg surface on --card+shadow-sm; header is grid so CardAction pins top-right column.
export type CardVariant = "default" | "sectioned";
export type CardProps = ComponentProps<"div"> & { variant?: CardVariant };
export type CardHeaderProps = ComponentProps<"div">;
export type CardTitleProps = ComponentProps<"div">;
export type CardDescriptionProps = ComponentProps<"div">;
export type CardActionProps = ComponentProps<"div">;
export type CardContentProps = ComponentProps<"div">;
export type CardFooterProps = ComponentProps<"div">;

// components/control-ui/ui/table: <table> wrapped in overflow-x-auto (wide tables scroll); hairlines --border, heads --muted-foreground, rows lift on hover via fg alpha.
export type TableProps = ComponentProps<"table">;
export type TableSectionProps = ComponentProps<"tbody">;
export type TableRowProps = ComponentProps<"tr">;
export type TableHeadProps = ComponentProps<"th">;
export type TableCellProps = ComponentProps<"td">;
export type TableCaptionProps = ComponentProps<"caption">;

// components/control-ui/ui/aspect-ratio: pure-CSS (no Radix), sets native aspect-ratio from `ratio` (default 16/9) via inline style.
export type AspectRatioProps = ComponentProps<"div"> & { ratio?: number };

// components/control-ui/ui/button-group: flex wrapper joining buttons/inputs into one segmented control (collapses inner corners, overlaps borders).
export type ButtonGroupProps = ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
};

export type ButtonGroupSeparatorProps = ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
};

// components/control-ui/ui/empty: centered empty-state block, reads --muted-foreground/--foreground (tracks DA).
export type EmptyProps = ComponentProps<"div">;

// components/control-ui/ui/item: horizontal list row on --radius-lg surface. variant=surface treatment; render=row as link/button.
export type ItemProps = ComponentProps<"div"> & {
  variant?: "default" | "outline" | "muted";
  render?: RenderProp<ComponentProps<"div">>;
};

export type ItemGroupProps = ComponentProps<"div">;

export type ItemSeparatorProps = ComponentProps<"div">;

// components/control-ui/ui/pagination: semantic <nav>/<ul>/<li> page switcher; PaginationLink is control-shaped without importing Button.
export type PaginationLinkProps = ComponentProps<"a"> & {
  isActive?: boolean;
};

// components/control-ui/ui/spinner: animate-spin, deliberately NOT gated by motion kill-switch (loader must keep turning under reduced motion). role="status" + hidden label.
export type SpinnerProps = ComponentProps<"span"> & {
  size?: ControlSize;
};

// components/control-ui/ui/meter: Base UI drives Indicator width from value/min/max. Unlike Progress, value is required (role="meter", never indeterminate) — static gauge (e.g. storage used), not a task in flight.
export type MeterProps = ComponentProps<"div"> & {
  value: number;
  min?: number;
  max?: number;
  format?: Intl.NumberFormatOptions;
  getAriaValueText?: (formattedValue: string, value: number) => string;
  locale?: Intl.LocalesArgument;
};

export type MeterTrackProps = ComponentProps<"div">;

export type MeterIndicatorProps = ComponentProps<"div">;

export type MeterLabelProps = ComponentProps<"span">;

export type MeterValueProps = Omit<ComponentProps<"span">, "children"> & {
  children?: ((formattedValue: string, value: number) => ReactNode) | null;
};

// components/control-ui/ui/checkbox-group: Base UI CheckboxGroup wrapper, holds shared string[] of ticked values, hands to matching child Checkbox by value. allValues + select-all Checkbox surfaces indeterminate.
// orientation is visual-only (flips flex direction, not forwarded to primitive); Base UI CheckboxGroup has no name prop (each Checkbox carries its own).
export type CheckboxGroupProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Names of all child checkbox values. Set this alongside a select-all checkbox to drive indeterminate. */
  allValues?: string[];
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
};

// components/control-ui/ui/autocomplete: Base UI Autocomplete, search-as-you-type. Unlike Combobox, FREE TEXT — value/onValueChange is the filtering input string (mode "list" default); selecting fills input, never locks to a discrete value. No per-row ItemIndicator (Base UI Autocomplete has none).
// Input shares --radius-control/controlSurfaceClasses/controlSize w/ Button/Select; list rides shared popover tokens. Generic over item Value (inferred from items).
export type AutocompleteProps<Value = string> = {
  children?: ReactNode;
  items?: readonly Value[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  /** list (default): filter items by the query. both/inline: inline-complete from the active item. none: static list. */
  mode?: "list" | "both" | "inline" | "none";
  autoHighlight?: boolean | "always";
  limit?: number;
  openOnInputClick?: boolean;
  filter?: ((itemValue: Value, query: string, itemToString?: (itemValue: Value) => string) => boolean) | null;
  itemToStringValue?: (itemValue: Value) => string;
};

export type AutocompleteInputProps = Omit<ComponentProps<"input">, "size"> & {
  size?: ControlSize;
};

export type AutocompleteClearProps = ComponentProps<"button">;

export type AutocompleteContentProps = ComponentProps<"div"> & {
  sideOffset?: number;
};

export type AutocompleteListProps<Value = unknown> = Omit<ComponentProps<"div">, "children"> & {
  children?: ReactNode | ((item: Value, index: number) => ReactNode);
};

export type AutocompleteItemProps<Value = unknown> = Omit<ComponentProps<"div">, "value"> & {
  value?: Value;
  disabled?: boolean;
};

export type AutocompleteEmptyProps = ComponentProps<"div">;
export type AutocompleteGroupProps = ComponentProps<"div">;
export type AutocompleteGroupLabelProps = ComponentProps<"div">;

// components/control-ui/ui/toolbar: Base UI Toolbar, roving-tabindex focus group (arrow keys between controls, one Tab stop). Uses concentric shell/control radii from theme.css.
// Button/Link forward Base UI's render prop so a consumer can compose Menu.Trigger/Tooltip.Trigger/control-ui Button.
export type ToolbarVariant = "default" | "inverse";
export type ToolbarLinkVariant = "default" | "track";

export type ToolbarProps = ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
  variant?: ToolbarVariant;
};

export type ToolbarButtonProps = ComponentProps<"button"> & {
  iconOnly?: boolean;
};
export type ToolbarLinkProps = ComponentProps<"a"> & {
  variant?: ToolbarLinkVariant;
};
export type ToolbarGroupProps = ComponentProps<"div">;
export type ToolbarSeparatorProps = ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
};
export type ToolbarInputProps = ComponentProps<"input">;

// components/control-ui/ui/dockable-panel: non-modal workspace panel with two explicit edge slots.
// Dragging previews both destinations; mobile presentation composes Drawer.
export type DockablePanelPlacement = "left" | "right";

export type DockablePanelProps = Omit<ComponentProps<"aside">, "onChange" | "ref"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: DockablePanelPlacement;
  defaultPlacement?: DockablePanelPlacement;
  onPlacementChange?: (placement: DockablePanelPlacement) => void;
};

export type DockablePanelHeaderProps = ComponentProps<"div">;
export type DockablePanelDragHandleProps = ComponentProps<"button">;
export type DockablePanelTitleProps = ComponentProps<"h2">;
export type DockablePanelActionsProps = ComponentProps<"div">;
export type DockablePanelToggleProps = Omit<ComponentProps<"button">, "children"> & { children?: ReactNode };
export type DockablePanelDockProps = Omit<ComponentProps<"button">, "children"> & {
  placement: DockablePanelPlacement;
  children?: ReactNode;
};
export type DockablePanelCloseProps = Omit<ComponentProps<"button">, "children"> & { children?: ReactNode };
export type DockablePanelContentPadding = "default" | "none";
export type DockablePanelContentProps = ComponentProps<"div"> & { padding?: DockablePanelContentPadding };

export type DrawerContentPadding = "default" | "none";
export type DrawerContentSurface = "background" | "card";

// components/control-ui/ui/number-field: Base UI NumberField. Group shares --radius-control/controlSurfaceClasses/controlSize with Button/Input/Select — transparent Input + ± stepper buttons as one joined segment (hairline dividers).
// size lives on Root, shared with Group via context; value/defaultValue passed explicitly to keep Base UI's controlled detection (value !== undefined) intact.
export type NumberFieldChangeReason =
  | "input-change"
  | "input-clear"
  | "input-blur"
  | "input-paste"
  | "keyboard"
  | "increment-press"
  | "decrement-press"
  | "wheel"
  | "scrub"
  | "none";

// event widened to base Event (Base UI-agnostic). cancel/allowPropagation/isCanceled/isPropagationAllowed/trigger are optional because
// onValueCommitted only exposes reason+event (no cancel controls) while onValueChange carries the full set — optional keeps one type assignable to both.
export type NumberFieldChangeEventDetails = {
  reason: NumberFieldChangeReason;
  event: Event;
  cancel?: () => void;
  allowPropagation?: () => void;
  isCanceled?: boolean;
  isPropagationAllowed?: boolean;
  trigger?: Element | undefined;
};

export type NumberFieldProps = {
  size?: ControlSize;
  /** Controlled raw value; `null` clears. Base UI reads controlled-ness from `value !== undefined`. */
  value?: number | null;
  defaultValue?: number;
  onValueChange?: (value: number | null, eventDetails: NumberFieldChangeEventDetails) => void;
  onValueCommitted?: (value: number | null, eventDetails: NumberFieldChangeEventDetails) => void;
  min?: number;
  max?: number;
  step?: number;
  smallStep?: number;
  largeStep?: number;
  snapOnStep?: boolean;
  allowOutOfRange?: boolean;
  allowWheelScrub?: boolean;
  format?: Intl.NumberFormatOptions;
  locale?: Intl.LocalesArgument;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  id?: string;
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export type NumberFieldGroupProps = ComponentProps<"div">;
export type NumberFieldInputProps = ComponentProps<"input">;
export type NumberFieldIncrementProps = ComponentProps<"button"> & { nativeButton?: boolean };
export type NumberFieldDecrementProps = ComponentProps<"button"> & { nativeButton?: boolean };
export type NumberFieldScrubAreaProps = ComponentProps<"span"> & {
  direction?: "horizontal" | "vertical";
  pixelSensitivity?: number;
  teleportDistance?: number;
};

// components/control-ui/ui/color-picker: composable color input/picker. Root is DOM-less — internal HSVA model (hue/sat survive at black/white/gray), wraps children in Base UI Popover.Root (Trigger+Content optional, panel parts render inline). Public value = CSS color STRING in `format`; value/defaultValue seeded explicitly for Base UI controlled detection.
// Hue/Alpha/Wheel are custom pointer surfaces; Input/FormatSelect/Channel/EyeDropper reuse input/select-trigger/number-field-group/button slots (+component identity).
// data-slot (all scoped anatomy): color-picker-trigger/content(portal positioner data-skin)/panel/area(+area-thumb)/hue(+hue-thumb)/alpha(+alpha-thumb)/wheel(+wheel-thumb)/channels/swatches/swatch(data-selected)/swatch-add/contrast/output.
export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

// The Root is DOM-less (like Popover) so it takes no div props.
export type ColorPickerProps = {
  /** Controlled color string; parsed by the engine, re-emitted in `format`. */
  value?: string;
  /** Uncontrolled seed. Defaults to "#000000". */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  format?: ColorFormat;
  defaultFormat?: ColorFormat;
  onFormatChange?: (format: ColorFormat) => void;
  /** Enable the alpha channel (slider + alpha field + 8-digit hex). Default true. */
  alpha?: boolean;
  disabled?: boolean;
  // Popover pass-through — omit for inline usage.
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  children?: ReactNode;
};

export type ColorPickerTriggerProps = ComponentProps<"button">;
export type ColorPickerContentProps = ComponentProps<"div"> & {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
};
export type ColorPickerPanelProps = ComponentProps<"div">;
export type ColorPickerAreaProps = ComponentProps<"div">;
export type ColorPickerAreaThumbProps = ComponentProps<"div">;
export type ColorPickerHueProps = Pick<ComponentProps<"div">, "className" | "aria-label" | "aria-labelledby">;
export type ColorPickerAlphaProps = Pick<ComponentProps<"div">, "className" | "aria-label" | "aria-labelledby">;
export type ColorPickerWheelProps = ComponentProps<"div">;
export type ColorPickerEyeDropperProps = Omit<ComponentProps<"button">, "onError">;
export type ColorPickerInputProps = Omit<ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "size"> & {
  size?: ControlSize;
};
export type ColorPickerFormatSelectProps = {
  formats?: ColorFormat[];
  size?: ControlSize;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};
export type ColorPickerChannelsProps = ComponentProps<"div">;
export type ColorPickerChannelProps = Omit<ComponentProps<"div">, "children" | "aria-label"> & {
  channel: "r" | "g" | "b" | "h" | "s" | "l" | "okl" | "okc" | "okh" | "a";
  label?: ReactNode;
  "aria-label"?: string;
};
export type ColorPickerSwatchesProps = ComponentProps<"div"> & { colors?: string[]; label?: ReactNode };
export type ColorPickerSwatchProps = Omit<ComponentProps<"button">, "color"> & { color: string };
export type ColorPickerSwatchAddProps = Omit<ComponentProps<"button">, "onClick"> & { onAdd?: (value: string) => void };
export type ColorPickerContrastProps = Omit<ComponentProps<"div">, "children"> & {
  /** The surface the current color sits on, as a CSS color string. Default "#ffffff". */
  background?: string;
};
export type ColorPickerOutputProps = Omit<ComponentProps<"div">, "children"> & {
  children?: ReactNode;
  renderValue?: (state: { value: string }) => ReactNode;
};

// components/control-ui/ui/gradient-editor: multi-stop gradient built on ColorPicker (each stop opens a ColorPicker popover). Public value = CSS gradient STRING.
// data-slot="gradient-editor"|"gradient-editor-preview"|"gradient-editor-track"|"gradient-editor-stop"(data-selected)|"gradient-editor-stop-add", scoped anatomy.
export type GradientType = "linear" | "radial" | "conic";
export type GradientStop = { id: string; position: number; color: string };

export type GradientEditorProps = Omit<ComponentProps<"div">, "onChange" | "defaultValue"> & {
  value?: string;
  defaultStops?: GradientStop[];
  defaultType?: GradientType;
  defaultAngle?: number;
  onValueChange?: (value: string) => void;
};
export type GradientEditorPreviewProps = ComponentProps<"div">;
export type GradientEditorTrackProps = ComponentProps<"fieldset">;
export type GradientEditorStopProps = ComponentProps<"button"> & { stop: GradientStop };
export type GradientEditorStopAddProps = Omit<ComponentProps<"button">, "onClick">;
export type GradientEditorTypeSelectProps = {
  size?: ControlSize;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

// trigger-menu (components/control-ui/ui/trigger-menu): generic caret-anchored typeahead menu ("/" command + "@" mention popup). Backend-agnostic —
// headless engine (use-trigger-menu) drives UI/keyboard; a binding (textarea DOM or ProseMirror plugin) feeds trigger state + performs insertion.
// These are the shared data+view contracts; engine option/return types live with the hook (reference the DOM caret helper).
export type TriggerMenuItemData = {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  keywords?: readonly string[];
  disabled?: boolean;
  // Mention trigger ("@") only: kind tags the pill (data-mention), image = optional avatar URL. Ignored by "/" command triggers.
  kind?: string;
  image?: string;
};

// Structured mention a rich (ProseMirror) chat-input carries out: id the agent consumes + display label. Surfaced on submit payload alongside plain-text value.
export type MentionItem = { id: string; label: string; kind: string };

// Rich editor (ProseMirror) props live in chat-input-editor/types.ts (ProseMirror-shaped); here = shared vocabulary trigger-menu + mention extension both speak.

export type TriggerSelectContext = { char: string; query: string };

// One trigger char + item source. items: static list (engine-filtered) or fn returning already-filtered list (async sources resolve upstream). insert:"replace" swaps typed <char><query> token for item (mentions); "none" removes token, leaves rest to onSelect (slash-command opening dialog/mode).
// Generic over item so callers keep their own fields.
export type TriggerConfig<Item extends TriggerMenuItemData = TriggerMenuItemData> = {
  char: string;
  items: readonly Item[] | ((query: string) => readonly Item[]);
  filter?: (item: Item, query: string) => boolean;
  insert?: "replace" | "none";
  insertText?: (item: Item) => string;
  onSelect?: (item: Item, ctx: TriggerSelectContext) => void;
};

// View: popup is a Base UI Popover controlled by the engine (open + virtual anchor at caret rect), popover token set; never steals focus from editor (initialFocus={false}).
export type TriggerMenuProps = {
  open: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  anchorRect: DOMRect | null;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
  children?: ReactNode;
};

export type TriggerMenuListProps = ComponentProps<"div">;
export type TriggerMenuItemProps = Omit<ComponentProps<"div">, "onSelect"> & {
  active?: boolean;
  disabled?: boolean;
};
export type TriggerMenuEmptyProps = ComponentProps<"div">;
export type TriggerMenuGroupProps = ComponentProps<"div">;
export type TriggerMenuGroupLabelProps = ComponentProps<"div">;
export type TriggerMenuIconProps = ComponentProps<"span">;

// ── Resizable ──────────────────────────────────────────────────────────────────────────────
// react-resizable-panels v4 (Group/Panel/Separator). PanelGroup=framed surface, Panels=resizable regions, Handle=draggable separator. Sizes: percentage (0..100) or CSS length ("240px"/"20rem"/"30vh"). Layout = map of panel id→percentage (persistence).
// data-slot="resizable-panel-group"|"resizable-panel"|"resizable-handle", scoped anatomy.
export type ResizableLayout = { [panelId: string]: number };
export type ResizablePanelGroupVariant = "framed" | "nested";

export type ResizablePanelGroupProps = ComponentProps<"div"> & {
  // "horizontal" = side by side, dividers vertical.
  orientation?: "horizontal" | "vertical";
  variant?: ResizablePanelGroupVariant;
  // Initial layout (id→percentage), e.g. restored from storage.
  defaultLayout?: ResizableLayout;
  // Opts out of library's drag-cursor styling.
  disableCursor?: boolean;
  disabled?: boolean;
  // Fires continuously while dragging (every pointer move).
  onLayoutChange?: (layout: ResizableLayout) => void;
  // Fires once a drag settles — use this to persist layout.
  onLayoutChanged?: (layout: ResizableLayout, meta: { isUserInteraction: boolean }) => void;
};

export type ResizablePanelSize = { asPercentage: number; inPixels: number };

// Imperative handle, attach via panelRef (e.g. the library's usePanelRef hook).
export interface ResizablePanelHandle {
  collapse: () => void;
  expand: () => void;
  getSize: () => ResizablePanelSize;
  isCollapsed: () => boolean;
  resize: (size: number | string) => void;
}

export type ResizablePanelProps = Omit<ComponentProps<"div">, "onResize"> & {
  // Percentage (0..100) or CSS length string ("240px", "20rem", "30vh").
  defaultSize?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
  // Collapsible panel snaps to collapsedSize once dragged below minSize.
  collapsible?: boolean;
  collapsedSize?: number | string;
  // How panel reacts when parent group itself resizes.
  groupResizeBehavior?: "preserve-relative-size" | "preserve-pixel-size";
  // Freezes this panel's size (can still shift when a neighbour resizes).
  disabled?: boolean;
  panelRef?: Ref<ResizablePanelHandle>;
  onResize?: (size: ResizablePanelSize, id: string | number | undefined, prevSize: ResizablePanelSize | undefined) => void;
};

export type ResizableHandleProps = Omit<ComponentProps<"div">, "role" | "tabIndex"> & {
  // Renders a visible grip nub at the separator's centre.
  withHandle?: boolean;
  // Disables dragging on this separator (neighbours can still move indirectly).
  disabled?: boolean;
  // Disables double-click-to-reset-size.
  disableDoubleClick?: boolean;
};

// Code+CodeDiff shared enums a skin styles on. Model types (CodeTokenLines, DiffFile, DiffLine...) live in lib/code-tokens.ts + lib/diff.ts,
// NOT here — contracts.ts ships with EVERY primitive install, must not pull the diff engine into a plain Button install.
// Long lines soft-wrap ("wrap") or scroll horizontally ("scroll").
export type CodeOverflow = "wrap" | "scroll";
// "auto" = highlights (build-time tokens or client effect); "none" = plain text.
export type CodeHighlight = "auto" | "none";
export type CodeDensity = "default" | "compact";
// "standalone" = bordered surface; "embedded" drops chrome for nesting (inside a message/diff).
export type CodeChrome = "standalone" | "embedded";
// Side-by-side ("split") vs stacked ("unified").
export type DiffStyle = "unified" | "split";
export type CodeDiffLineType = "add" | "del" | "context";
// Non-color a11y marker for added/removed lines: "classic" +/- glyphs, "bars" side rule, "none".
export type DiffIndicators = "classic" | "bars" | "none";
// Intra-line diff granularity.
export type DiffLineKind = "word" | "char" | "none";

// Markdown: rendered agent markdown (GFM). content = raw markdown string; fenced code blocks route to Code, ```diff fences route to CodeDiff.
export type MarkdownProps = Omit<ComponentProps<"div">, "children"> & { content: string };

// dynamic-notification — Dynamic Island-style AI notification: a resident pill that morphs into a reply bubble.
// `variant` picks the island MATERIAL only (anatomy identical): "surface" = token-driven popover material,
// "glass" = backdrop-blurred dark glass (CSS gradient fallback; <DynamicNotificationGlass> upgrades it to WebGL),
// "liquid" = real refractive glass (<DynamicNotificationLiquid> rasterizes the scene behind the island
// and refracts it through a WebGL lens; CSS backdrop-filter fallback).
export type DynamicNotificationVariant = "surface" | "glass" | "liquid";

// Island lifecycle: collapsed pill → (optional) "thinking" blob while the model is answering
// (`loading` prop) → expanded reply bubble. Derived from `open` + `loading`, never set directly.
export type DynamicNotificationState = "collapsed" | "thinking" | "expanded";

export type DynamicNotificationReplyPayload = {
  value: string;
  clear: () => void;
};

export type DynamicNotificationProps = Omit<ComponentProps<"div">, "onChange"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  // While true (and open), the island holds the intermediate "thinking" size with the aurora
  // animating — flip it off when the model's answer lands to morph into the full bubble.
  loading?: boolean;
  // Reply field is controllable like ChatInput's value (uncontrolled by default).
  replyValue?: string;
  defaultReplyValue?: string;
  onReplyValueChange?: (value: string) => void;
  onReply?: (payload: DynamicNotificationReplyPayload) => void | Promise<void>;
  variant?: DynamicNotificationVariant;
  disabled?: boolean;
};
