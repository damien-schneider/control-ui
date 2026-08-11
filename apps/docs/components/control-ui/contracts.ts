import type { ComponentProps, CSSProperties, MouseEvent, ReactElement, ReactNode, Ref } from "react";

/** Controlled value triple shared by every choice control. `defaultValue` is NoInfer — one uncontrolled option would otherwise pin TValue to that literal. */
export type ControlledChoice<TValue extends string = string> = {
  value?: TValue;
  defaultValue?: NoInfer<TValue>;
  onValueChange?: (value: TValue) => void;
};

export type ControlledMultiChoice<TValue extends string = string> = {
  value?: TValue[];
  defaultValue?: NoInfer<TValue>[];
  onValueChange?: (value: TValue[]) => void;
};

export type ChatRole = "user" | "assistant" | "system" | "tool";
export type ChatDensity = "compact" | "comfortable";
export type ChatState = "idle" | "streaming" | "pending" | "error";
export type ChatTone = "neutral" | "success" | "warning" | "danger";
export type InlineAttachmentState = "ready" | "pending" | "error";

export type DropzoneSelectionMode = "append" | "replace";
export type DropzoneVisualState = "idle" | "accept" | "reject" | "unknown" | "processing";
export type DropzoneOverlayScope = "local" | "global";
export type DropzoneValueChangeReason = "drop" | "input" | "remove" | "clear";

export type ChatMessageProps = ComponentProps<"article"> & {
  from: ChatRole;
  state?: ChatState;
  density?: ChatDensity;
  tone?: ChatTone;
};

export type ChatComposerSubmitPayload = {
  value: string;
  clear: () => void;
  // rich editor only — plain-textarea path never sets it
  mentions?: MentionItem[];
};

export type ChatComposerProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (payload: ChatComposerSubmitPayload) => void | Promise<void>;
  state?: "idle" | "submitting" | "disabled";
  density?: ChatDensity;
  disabled?: boolean;
};

export type ActivityState = "pending" | "running" | "success" | "error";
export type ActivityKind = "default" | "tool" | "reasoning" | "signal";

export type ActivityProps = Omit<CollapsibleProps, "children"> & {
  children?: ReactNode;
  kind?: ActivityKind;
  name?: string;
  state?: ActivityState;
  statusLabel?: ReactNode;
};

export type TranscriptDividerProps = ComponentProps<"div"> & {
  tone?: ChatTone;
};

export type ContextSegmentKind = "system" | "tool" | "message" | "source" | "reasoning" | "cache" | "other";

export type ContextStatus = "normal" | "over-limit" | "unavailable";

export type ContextSegment = {
  id: string;
  label: string;
  tokens: number;
  kind?: ContextSegmentKind;
  description?: ReactNode;
};

export type ContextProps = Omit<ComponentProps<"div">, "children"> & {
  segments: readonly ContextSegment[];
  maxTokens?: number | null;
  model?: string;
  locale?: Intl.LocalesArgument;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  children?: ReactNode;
};

export type SourceReference = {
  href: string;
  title?: string;
  description?: string;
  quote?: string;
  faviconSrc?: string | false;
};

/** Resolved answers keyed by question id; freeform option resolves to its typed text. */
export type UserAskAnswers = Record<string, string>;

// Replaces composer in place. Questions/options self-register — count, numbering, pagination derived, never passed.
export type UserAskProps = ComponentProps<"section"> & {
  children?: ReactNode;
  onComplete?: (answers: UserAskAnswers) => void;
  onDismiss?: () => void;
};

export type AudioVisualizerVariant = "bars" | "line";

// audio-visualizer.tsx (bars) and audio-visualizer-line.tsx both export `AudioVisualizer` on these props — swap = import-path change.
export type AudioVisualizerProps = Omit<ComponentProps<"div">, "children"> & {
  /** Rolling window of 0..1 levels, oldest first (e.g. RMS per frame from AnalyserNode). */
  levels: readonly number[];
  /** Inactive keeps last shape with quieter emphasis. */
  active?: boolean;
  /** Latest N levels, left-padded with silence. Default 28, capped at 128. */
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

// One step drives height (--control-h-*), padding, text across Button, Select/DropdownMenu triggers, Input.
export type ControlSize = "xs" | "sm" | "md" | "lg";

// effects.css keys off data-effects. Here, not in optional extension: ControlUiSkin.effects references it without ripple runtime installed.
export type ControlEffect = "top-shine" | "ripple" | "hover-circle";

// variant = structure, tone = color intent — orthogonal, no solidDanger/ghostDanger explosion.
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

// Superset across every popup primitive — one shape whichever backs contract.
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
  | "input-press"
  | "clear-press"
  | "chip-remove-press"
  | "imperative-action"
  | "swipe"
  | "none";

// cancel() blocks pending state change; allowPropagation() opts Escape back into bubbling (Base UI stops it by default).
export type OpenChangeEventDetails = {
  reason: OpenChangeReason;
  event: Event;
  cancel: () => void;
  allowPropagation: () => void;
  isCanceled: boolean;
  isPropagationAllowed: boolean;
  trigger: Element | undefined;
};

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
  /** Keep panel mounted while closed — hidden children that register themselves (TaskList items) need it. */
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

// Collapsed pill reads "Task 3 of 5 › label" — items register status, pill derives progress.
export type TaskListProps = CollapsibleProps;

export type TabsProps<TValue extends string = string> = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> & ControlledChoice<TValue>;

export type TabsListVariant = "default" | "browser";

export type TabsListProps = ComponentProps<"div"> & {
  size?: ControlSize;
  variant?: TabsListVariant;
};

export type TabsTabProps = Omit<ComponentProps<"button">, "value"> & {
  value: string;
  /** Render as another element (e.g. router Link) to turn tab strip into nav; set nativeButton={false} for non-<button>. */
  render?: RenderProp<ComponentProps<"button">, { active: boolean; disabled: boolean }>;
  nativeButton?: boolean;
};

export type TabsPanelProps = ComponentProps<"div"> & {
  value: string;
};

export type TimelineState = "neutral" | "pending" | "running" | "success" | "error";

export type TimelineProps = ComponentProps<"ol">;

export type TimelineItemProps = ComponentProps<"li"> & {
  state?: TimelineState;
};

export type TimelineIndicatorProps = ComponentProps<"span">;
export type TimelineSeparatorProps = ComponentProps<"span">;
export type TimelineContentProps = ComponentProps<"div">;
export type TimelineTitleProps = ComponentProps<"div">;
export type TimelineDescriptionProps = ComponentProps<"div">;
export type TimelineMetaProps = ComponentProps<"div">;

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

// Library-original (Base UI has none). WAI-ARIA APG treeview — <li> is focusable treeitem, trigger row presentational.
// Selection stays string[] even single-select — both modes share one shape.
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

/** Shared by row-in-track lists (Tree, SidebarMenu). Default comes from ControlUiSkin.indicators; explicit prop wins. */
export type SelectionIndicator = "none" | "slide";
export const SIDEBAR_COOKIE_NAME = "sidebar_state";

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
  /** `slide` suppresses per-row backgrounds — one pill glides to hover and rests on selection. Default ControlUiSkin.indicators.tree, else none. */
  indicator?: TreeSelectionIndicator;
};

export type TreeItemProps = Omit<ComponentProps<"li">, "value"> & {
  /** Stable id/path — selection + expansion key, and roving/`data-value` handle. */
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
  /** Fragment link to section, e.g. `#install`. */
  href: string;
  label: string;
  /** Heading depth (1 = h1, 2 = h2, 3 = h3, ...). Drives indentation. Defaults to nesting depth, then 2. */
  level?: number;
  children?: TocItem[];
};

export type TableOfContentsVariant = "background" | "trail" | "both";

// Indicator, scroll, offset are CSS — only in-view detection runs in JS.
export type TableOfContentsProps = Omit<ComponentProps<"nav">, "children"> & {
  items: TocItem[];
  /** Heading shown above list and used as nav's accessible name. Defaults to "On this page". */
  label?: string;
  /** Active item treatment. Defaults to both trail and background. */
  variant?: TableOfContentsVariant;
};

export type SelectProps<TValue extends string = string> = ControlledChoice<TValue> & {
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

export type DropdownMenuProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type DropdownMenuTriggerVariant = "surface" | "ghost";

export type DropdownMenuTriggerProps = ComponentProps<"button"> & {
  size?: ControlSize;
  iconOnly?: boolean;
  variant?: DropdownMenuTriggerVariant;
};

export type DropdownMenuContentProps = ComponentProps<"div">;

export type DropdownMenuItemProps = Omit<ComponentProps<"div">, "onClick"> & {
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
};

export type DropdownMenuSeparatorProps = ComponentProps<"div">;

export type DropdownMenuLabelProps = ComponentProps<"div">;

export type PopoverContentPadding = "default" | "none";

export type RichTooltipTone = "accent" | "surface";
export type RichTooltipProgressVariant = "count" | "dots";

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

export type ContextMenuRadioGroupProps<TValue extends string = string> = ComponentProps<"div"> &
  Omit<ControlledChoice<TValue>, "defaultValue">;

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

// Triggers share one floating viewport that morphs between panels.
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

export type InputProps = Omit<ComponentProps<"input">, "size"> & {
  size?: ControlSize;
};

export type InputGroupProps = ComponentProps<"div"> & {
  render?: RenderProp<ComponentProps<"div">>;
  size?: ControlSize;
};

export type InputGroupAddonProps = ComponentProps<"span">;

// <label> when htmlFor set, else <span> for group captions.
export type LabelProps = ComponentProps<"label">;

// label/showValue only grow taller labeled bar under "plain" — default variant ignores them.
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

// Composes Button slot: pressed surfaces through Button's data-active — never special-case toggle anatomy. `active` force-overrides.
export type ToggleProps = Omit<ButtonProps, "render" | "nativeButton" | "value"> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** Identifies toggle inside ToggleGroup (group's value is set of pressed values). */
  value?: string;
  /** Show shared Checkbox/SelectItem tick when pressed — for tile-style toggles. Never hand-roll it. */
  showCheck?: boolean;
};

export type ToggleGroupProps<TValue extends string = string> = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> &
  ControlledMultiChoice<TValue> & {
    /** Allow several toggles pressed at once. Default false — single-select. */
    multiple?: boolean;
    disabled?: boolean;
    orientation?: "horizontal" | "vertical";
  };

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

// Group owns value; compose label beside Radio.
export type RadioGroupProps<TValue extends string = string> = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> &
  ControlledChoice<TValue> & {
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

// Own anatomy — pill track plus sliding thumb, not restyled Button like Toggle.
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
  /** single thumb glyph shown in both states; its colour flips when checked. */
  icon?: ReactNode;
  /** Thumb glyph shown while checked. Overrides `icon`. Cross-fades with `uncheckedIcon`. */
  checkedIcon?: ReactNode;
  /** Thumb glyph shown while unchecked. Overrides `icon`. Cross-fades with `checkedIcon`. */
  uncheckedIcon?: ReactNode;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

// Pure layout and text — never paints control; drop Input/Select/Textarea into FieldControl's render.
// Base UI stamps data-valid/-invalid/-dirty/-touched/-filled/-focused on every part — validity styling needs no JS.
export type FieldProps = ComponentProps<"div"> & {
  orientation?: "vertical" | "horizontal" | "responsive";
  /** Field name; keys Form `errors` and takes precedence over control's own name. */
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  validationMode?: "onSubmit" | "onBlur" | "onChange";
};

export type FieldLabelProps = ComponentProps<"label">;

export type FieldContentProps = ComponentProps<"div">;

export type FieldTitleProps = ComponentProps<"div">;

// render intersected straight off Base UI's Field.Control in slot source — typing and merging match exactly.
export type FieldControlProps = ComponentProps<"input">;

export type FieldDescriptionProps = ComponentProps<"p">;

// `match` narrows error to specific ValidityState key; omit to show on any invalid.
export type FieldErrorMatch = boolean | keyof ValidityState;

export type FieldErrorProps = ComponentProps<"div"> & {
  match?: FieldErrorMatch;
};

export type FieldGroupProps = ComponentProps<"div">;

export type FieldSeparatorProps = ComponentProps<"div"> & {
  children?: ReactNode;
};

// One labelled row inside Fieldset — Base UI scopes label, description, validity to that control.
export type FieldItemProps = ComponentProps<"div">;

export type FieldSetProps = ComponentProps<"fieldset">;

export type FieldLegendProps = ComponentProps<"div">;

// Merges externally-returned errors, keyed by Field name, onto matching FieldError.
export type FormErrors = Record<string, string | string[]>;

export type FormProps = ComponentProps<"form"> & {
  errors?: FormErrors;
  validationMode?: "onSubmit" | "onBlur" | "onChange";
};

// Real native <select>, not floating Base UI Select.
export type NativeSelectProps = Omit<ComponentProps<"select">, "size"> & {
  size?: ControlSize;
};

// Auto-grows through field-sizing-content, no JS measurement.
export type TextareaProps = ComponentProps<"textarea">;

// Panel height-animates from --accordion-panel-height, pure CSS.
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

export type AvatarProps = ComponentProps<"span">;

export type AvatarGroupProps = ComponentProps<"div">;

export type AvatarImageProps = ComponentProps<"img"> & {
  onLoadingStatusChange?: (status: "idle" | "loading" | "loaded" | "error") => void;
};

export type AvatarFallbackProps = ComponentProps<"span"> & {
  delay?: number;
};

// value null = indeterminate.
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

// Base UI PreviewCard; re-asserts skin scope on portal.
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

// No light dismiss — explicit action required. Re-asserts skin scope on portal.
export type AlertDialogProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type AlertDialogContentProps = ComponentProps<"div">;

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

// Searchable single-select — selecting locks to discrete value, unlike Autocomplete.
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

export type AlertVariant = "default" | "destructive";
export type AlertProps = ComponentProps<"div"> & { variant?: AlertVariant };
export type AlertTitleProps = ComponentProps<"div">;
export type AlertDescriptionProps = ComponentProps<"div">;

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
export type BadgeSize = "sm" | "md";
/** Stable application-facing families; each skin may tune exact hue. */
export const BADGE_COLORS = ["neutral", "red", "orange", "yellow", "green", "blue", "purple", "pink"] as const;
export type BadgeColor = (typeof BADGE_COLORS)[number];
export type BadgeProps = ComponentProps<"span"> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  render?: RenderProp<ComponentProps<"span">>;
};

// Header is grid — CardAction pins to its own top-right column.
export type CardVariant = "default" | "sectioned";
export type CardProps = ComponentProps<"div"> & { variant?: CardVariant };
export type CardHeaderProps = ComponentProps<"div">;
export type CardTitleProps = ComponentProps<"div">;
export type CardDescriptionProps = ComponentProps<"div">;
export type CardActionProps = ComponentProps<"div">;
export type CardContentProps = ComponentProps<"div">;
export type CardFooterProps = ComponentProps<"div">;

// <table> ships wrapped in overflow-x-auto — wide tables scroll instead of blowing out layout.
export type TableProps = ComponentProps<"table">;
export type TableSectionProps = ComponentProps<"tbody">;
export type TableRowProps = ComponentProps<"tr">;
export type TableHeadProps = ComponentProps<"th">;
export type TableCellProps = ComponentProps<"td">;
export type TableCaptionProps = ComponentProps<"caption">;

// Native CSS aspect-ratio set inline, no Radix. Defaults to 16/9.
export type AspectRatioProps = ComponentProps<"div"> & { ratio?: number };

// Collapses inner corners, overlaps borders — children read as one segmented control.
export type ButtonGroupProps = ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
};

export type ButtonGroupSeparatorProps = ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
};

export type EmptyProps = ComponentProps<"div">;

export type ItemProps = ComponentProps<"div"> & {
  variant?: "default" | "outline" | "muted";
  render?: RenderProp<ComponentProps<"div">>;
};

export type ItemGroupProps = ComponentProps<"div">;

export type ItemSeparatorProps = ComponentProps<"div">;

// Control-shaped without importing Button — pagination installs alone.
export type PaginationLinkProps = ComponentProps<"a"> & {
  isActive?: boolean;
};

// Deliberately outside motion kill-switch — loader must keep turning under reduced motion.
export type SpinnerProps = ComponentProps<"span"> & {
  size?: ControlSize;
};

// value required — role="meter" is static gauge, never indeterminate like Progress.
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

// orientation visual-only, never forwarded to primitive. Stays plain string[]: Base UI reports its own string[], so narrower union could not be honoured back without asserting.
export type CheckboxGroupProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> &
  ControlledMultiChoice & {
    /** Names of all child checkbox values. Set this alongside select-all checkbox to drive indeterminate. */
    allValues?: string[];
    disabled?: boolean;
    orientation?: "horizontal" | "vertical";
  };

// Free text, unlike Combobox — value is filtering input string, selecting only fills it.
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
  /** list (default): filter items by query. both/inline: inline-complete from active item. none: static list. */
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

// Roving-tabindex group: arrow keys move between controls, whole toolbar is one Tab stop.
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

export type InfiniteCanvasTransform = { x: number; y: number; scale: number };
export type InfiniteCanvasMoveReason = "pointer" | "wheel" | "keyboard" | "control";
export type InfiniteCanvasMoveDetails = { reason: InfiniteCanvasMoveReason };
export type InfiniteCanvasProps = Omit<ComponentProps<"section">, "onChange" | "onWheel" | "ref"> & {
  transform?: InfiniteCanvasTransform;
  defaultTransform?: InfiniteCanvasTransform;
  onTransformChange?: (transform: InfiniteCanvasTransform, details: InfiniteCanvasMoveDetails) => void;
  minScale?: number;
  maxScale?: number;
  onWheel?: (event: WheelEvent) => void;
};
export type InfiniteCanvasContentProps = ComponentProps<"div">;
export type InfiniteCanvasControlsProps = Omit<ComponentProps<"div">, "children">;

export type DrawerContentPadding = "default" | "none";
export type DrawerContentSurface = "background" | "card";
// edge pins popup flush to its viewport edge; floating insets it so every corner rounds.
export type DrawerContentVariant = "edge" | "floating";

// size lives on Root, reaches Group through context; value/defaultValue passed explicitly to keep Base UI's `value !== undefined` controlled detection intact.
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

// Cancel controls stay optional: onValueCommitted exposes only reason+event, so one type serves both callbacks.
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

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

// DOM-less Root, no div props. Internal model is HSVA — hue and saturation survive at black, white, gray.
export type ColorPickerProps = {
  /** Controlled color string; parsed by engine, re-emitted in `format`. */
  value?: string;
  /** Uncontrolled seed. Defaults to "#000000". */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  format?: ColorFormat;
  defaultFormat?: ColorFormat;
  onFormatChange?: (format: ColorFormat) => void;
  /** Enable alpha channel (slider + alpha field + 8-digit hex). Default true. */
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
  /** surface current color sits on, as CSS color string. Default "#ffffff". */
  background?: string;
};
export type ColorPickerOutputProps = Omit<ComponentProps<"div">, "children"> & {
  children?: ReactNode;
  renderValue?: (state: { value: string }) => ReactNode;
};

// Public value is CSS gradient string; each stop opens ColorPicker popover.
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

// Backend-agnostic: use-trigger-menu drives UI and keyboard, binding (textarea DOM or ProseMirror plugin) feeds trigger state and performs insertion.
export type TriggerMenuItemData = {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  keywords?: readonly string[];
  disabled?: boolean;
  // "@" mention triggers only — "/" command triggers ignore both.
  kind?: string;
  image?: string;
};

// Surfaced on submit payload beside plain-text value; ProseMirror-shaped editor props live in chat-composer-editor/types.ts.
export type MentionItem = { id: string; label: string; kind: string };

export type TriggerSelectContext = { char: string; query: string };

// function `items` is taken as already filtered — async sources resolve upstream.
// insert "replace" swaps typed <char><query> token for item; "none" removes token and leaves rest to onSelect.
export type TriggerConfig<Item extends TriggerMenuItemData = TriggerMenuItemData> = {
  char: string;
  items: readonly Item[] | ((query: string) => readonly Item[]);
  filter?: (item: Item, query: string) => boolean;
  insert?: "replace" | "none";
  insertText?: (item: Item) => string;
  onSelect?: (item: Item, ctx: TriggerSelectContext) => void;
};

// Anchored to virtual caret rect, never steals focus from editor (initialFocus={false}).
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

// Backed by react-resizable-panels v4. Sizes take percentage (0..100) or CSS length; layout maps panel id → percentage.
export type ResizableLayout = { [panelId: string]: number };
export type ResizablePanelGroupVariant = "framed" | "nested";
// Both keep same 1px track — switching paint never shifts layout.
export type ResizableHandleVariant = "solid" | "hover";

export type ResizablePanelGroupProps = ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
  variant?: ResizablePanelGroupVariant;
  defaultLayout?: ResizableLayout;
  disableCursor?: boolean;
  disabled?: boolean;
  // fires on every pointer move
  onLayoutChange?: (layout: ResizableLayout) => void;
  // fires once drag settles — persist here
  onLayoutChanged?: (layout: ResizableLayout, meta: { isUserInteraction: boolean }) => void;
};

export type ResizablePanelSize = { asPercentage: number; inPixels: number };

// attach via panelRef
export interface ResizablePanelHandle {
  collapse: () => void;
  expand: () => void;
  getSize: () => ResizablePanelSize;
  isCollapsed: () => boolean;
  resize: (size: number | string) => void;
}

export type ResizablePanelProps = Omit<ComponentProps<"div">, "onResize"> & {
  // percentage (0..100) or CSS length — "240px", "20rem", "30vh"
  defaultSize?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
  // snaps to collapsedSize once dragged below minSize
  collapsible?: boolean;
  collapsedSize?: number | string;
  groupResizeBehavior?: "preserve-relative-size" | "preserve-pixel-size";
  // freezes this panel; neighbour resize can still shift it
  disabled?: boolean;
  panelRef?: Ref<ResizablePanelHandle>;
  onResize?: (size: ResizablePanelSize, id: string | number | undefined, prevSize: ResizablePanelSize | undefined) => void;
};

export type ResizableHandleProps = Omit<ComponentProps<"div">, "role" | "tabIndex"> & {
  variant?: ResizableHandleVariant;
  // grip nub at separator's centre; under "hover" it fades in with line
  withHandle?: boolean;
  // pins this separator; neighbours can still move it indirectly
  disabled?: boolean;
  // double-click otherwise resets size
  disableDoubleClick?: boolean;
};

// Model types (CodeTokenLines, DiffFile, DiffLine) stay in lib/code-tokens.ts and lib/diff.ts — contracts.ts ships with every primitive install, must not pull diff engine into plain Button install.
export type CodeOverflow = "wrap" | "scroll";
// "auto" = build-time tokens, or client effect when absent
export type CodeHighlight = "auto" | "none";
export type CodeDensity = "default" | "compact";
// "embedded" drops chrome — block can nest inside message or diff
export type CodeChrome = "standalone" | "embedded";
export type DiffStyle = "unified" | "split";
export type CodeDiffLineType = "add" | "del" | "context";
// non-color marker for added/removed lines: "classic" +/- glyphs, "bars" side rule
export type DiffIndicators = "classic" | "bars" | "none";
export type DiffLineKind = "word" | "char" | "none";

// Fenced code blocks route to Code, ```diff fences to CodeDiff.
export type MarkdownProps = Omit<ComponentProps<"div">, "children"> & { content: string };

// Material only — anatomy identical across all three. glass and liquid degrade to CSS when their WebGL companion is not installed.
export type DynamicNotificationVariant = "surface" | "glass" | "liquid";

// Derived from `open` + `loading`, never set directly.
export type DynamicNotificationState = "collapsed" | "thinking" | "expanded";

export type DynamicNotificationReplyPayload = {
  value: string;
  clear: () => void;
};

export type DynamicNotificationProps = Omit<ComponentProps<"div">, "onChange"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  // holds intermediate "thinking" size — flip off when answer lands
  loading?: boolean;
  replyValue?: string;
  defaultReplyValue?: string;
  onReplyValueChange?: (value: string) => void;
  onReply?: (payload: DynamicNotificationReplyPayload) => void | Promise<void>;
  variant?: DynamicNotificationVariant;
  disabled?: boolean;
};
