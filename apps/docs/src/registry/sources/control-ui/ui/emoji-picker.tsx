"use client";

import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";

import {
  defaultEmojiDataResolver,
  type Emoji,
  type EmojiData,
  type EmojiDataResolver,
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
  EmojiPicker as EmojiPickerPrimitive,
} from "frimousse";
import {
  FlagIcon,
  HandIcon,
  HashIcon,
  HeartIcon,
  LeafIcon,
  LightbulbIcon,
  PizzaIcon,
  PlaneIcon,
  SearchIcon,
  SmileIcon,
  VolleyballIcon,
} from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type KeyboardEvent,
  type RefObject,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { EmojiPickerKnobStyle } from "@/components/control-ui/knob-contracts/emoji-picker-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { IconPicker } from "@/components/control-ui/ui/icon-picker";
import { PopoverViewport } from "@/components/control-ui/ui/popover";
import { Spinner } from "@/components/control-ui/ui/spinner";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";

type EmojiPickerLoadState = { status: "loading" } | { status: "error" } | { status: "ready"; data: EmojiData };
type EmojiPickerContextValue = {
  columns: number;
  rootRef: RefObject<HTMLDivElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
  loadState: EmojiPickerLoadState;
  retryEmojiData: () => void;
  selectEmoji: (emoji: Emoji) => void;
};
const EmojiPickerContext = createContext<EmojiPickerContextValue | null>(null);

function useEmojiPicker() {
  const picker = useContext(EmojiPickerContext);
  if (!picker) throw new Error("EmojiPicker parts must be rendered inside <EmojiPicker>.");
  return picker;
}

type EmojiPickerStyle = { style?: CSSProperties & EmojiPickerKnobStyle };

export type EmojiPickerProps = Omit<ComponentProps<typeof EmojiPickerPrimitive.Root>, "style"> & EmojiPickerStyle;

export function EmojiPicker({
  className,
  columns = 8,
  style,
  ref,
  onEmojiSelect,
  resolveEmojiData = defaultEmojiDataResolver,
  ...props
}: EmojiPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [loadState, setLoadState] = useState<EmojiPickerLoadState>({ status: "loading" });
  const [retryAttempt, setRetryAttempt] = useState(0);
  useImperativeHandle(ref, () => {
    if (!rootRef.current) throw new Error("EmojiPicker root is not mounted.");
    return rootRef.current;
  });
  const loadEmojiData: EmojiDataResolver = async (locale, options) => {
    setLoadState({ status: "loading" });
    try {
      const data = await resolveEmojiData(locale, options);
      if (!options.signal?.aborted) setLoadState({ status: "ready", data });
      return data;
    } catch (error) {
      if (!options.signal?.aborted) setLoadState({ status: "error" });
      throw error;
    }
  };
  const retryEmojiData = () => {
    setLoadState({ status: "loading" });
    setRetryAttempt((attempt) => attempt + 1);
  };
  const selectEmoji = (emoji: Emoji) => onEmojiSelect?.(emoji);
  const pickerStyle = { "--_emoji-picker-columns": columns, ...style } satisfies CSSProperties & { "--_emoji-picker-columns": number };
  return (
    <EmojiPickerContext.Provider value={{ columns, rootRef, viewportRef, loadState, retryEmojiData, selectEmoji }}>
      <EmojiPickerPrimitive.Root
        key={retryAttempt}
        data-control-ui="emoji-picker"
        data-control-family="emoji-picker"
        data-slot="root"
        columns={columns}
        className={cn("isolate flex flex-col", className)}
        {...props}
        ref={rootRef}
        style={pickerStyle}
        onEmojiSelect={selectEmoji}
        resolveEmojiData={loadEmojiData}
      />
    </EmojiPickerContext.Provider>
  );
}

function stopPickerNavigation(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key !== "Escape" && event.key !== "Tab") event.stopPropagation();
}

const categoryIcons = new Map([
  [0, SmileIcon],
  [1, HandIcon],
  [3, LeafIcon],
  [4, PizzaIcon],
  [5, PlaneIcon],
  [6, VolleyballIcon],
  [7, LightbulbIcon],
  [8, HeartIcon],
  [9, FlagIcon],
]);

function emojiCategoryRows(emojiData: EmojiData, columns: number) {
  let rowOffset = 0;
  return emojiData.categories.flatMap((category) => {
    const emojiCount = emojiData.emojis.filter((emoji) => emoji.category === category.index).length;
    if (emojiCount === 0) return [];
    const startRow = rowOffset;
    rowOffset += Math.ceil(emojiCount / columns);
    return [{ ...category, startRow }];
  });
}

export function EmojiPickerCategories({ "aria-label": ariaLabel = "Emoji categories", onKeyDown, ...props }: ComponentProps<"div">) {
  const { columns, loadState, rootRef, viewportRef } = useEmojiPicker();
  if (loadState.status !== "ready") return null;
  const categories = emojiCategoryRows(loadState.data, columns);
  const scrollToCategory = (startRow: number, categoryIndex: number) => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    if (!root || !viewport) return;
    const metrics = getComputedStyle(root);
    const rowHeight = Number.parseFloat(metrics.getPropertyValue("--frimousse-row-height"));
    const headerHeight = Number.parseFloat(metrics.getPropertyValue("--frimousse-category-header-height"));
    viewport.scrollTo({ top: startRow * rowHeight + categoryIndex * headerHeight });
  };
  return (
    <ToolbarPrimitive.Root
      data-control-ui="emoji-picker"
      data-control-family="emoji-picker"
      data-slot="categories"
      aria-label={ariaLabel}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        stopPickerNavigation(event);
      }}
    >
      {categories.map((category, categoryIndex) => {
        const CategoryIcon = categoryIcons.get(category.index) ?? HashIcon;
        return (
          <ToolbarPrimitive.Button
            key={category.index}
            type="button"
            aria-label={category.label}
            data-control-ui="emoji-picker"
            data-control-family="emoji-picker"
            data-slot="category"
            onClick={() => scrollToCategory(category.startRow, categoryIndex)}
          >
            <CategoryIcon aria-hidden="true" />
          </ToolbarPrimitive.Button>
        );
      })}
    </ToolbarPrimitive.Root>
  );
}

export type EmojiPickerRecentProps = ComponentProps<"div"> & { emojis: readonly Emoji[]; label?: string };

export type EmojiPickerReactionsProps = ComponentProps<"div"> & { emojis: readonly Emoji[]; onEmojiSelect: (emoji: Emoji) => void };

export function EmojiPickerReactions({
  emojis,
  onEmojiSelect,
  "aria-label": ariaLabel = "Reactions",
  onKeyDown,
  ...props
}: EmojiPickerReactionsProps) {
  return (
    <ToolbarPrimitive.Root
      aria-label={ariaLabel}
      data-control-ui="emoji-picker"
      data-control-family="emoji-picker"
      data-slot="root"
      data-variant="reactions"
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        stopPickerNavigation(event);
      }}
    >
      {emojis.map((emoji) => (
        <ToolbarPrimitive.Button
          key={emoji.emoji}
          type="button"
          aria-label={emoji.label}
          data-control-ui="emoji-picker"
          data-control-family="emoji-picker"
          data-slot="emoji"
          onClick={() => onEmojiSelect(emoji)}
        >
          {emoji.emoji}
        </ToolbarPrimitive.Button>
      ))}
    </ToolbarPrimitive.Root>
  );
}

export function EmojiPickerRecent({ emojis, label = "Recently used", ...props }: EmojiPickerRecentProps) {
  const picker = useEmojiPicker();
  if (emojis.length === 0) return null;
  return (
    <div data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="recent" {...props}>
      <div data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="recent-label">
        {label}
      </div>
      <EmojiPickerReactions
        data-control-ui="emoji-picker"
        data-slot="recent-grid"
        emojis={emojis.slice(0, picker.columns)}
        aria-label={label}
        onEmojiSelect={picker.selectEmoji}
      />
    </div>
  );
}

export type EmojiPickerSearchProps = Omit<ComponentProps<typeof EmojiPickerPrimitive.Search>, "style"> & EmojiPickerStyle;

export function EmojiPickerSearch({
  className,
  placeholder = "Search emoji…",
  "aria-label": ariaLabel = "Search emoji",
  ...props
}: EmojiPickerSearchProps) {
  return (
    <div data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="search" className="flex items-center">
      <SearchIcon aria-hidden="true" data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="search-icon" />
      <EmojiPickerPrimitive.Search
        data-control-ui="emoji-picker"
        data-control-family="emoji-picker"
        data-slot="search-input"
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn("min-w-0 flex-1", className)}
        {...props}
      />
    </div>
  );
}

function EmojiPickerRow({ children, className, ...props }: EmojiPickerListRowProps) {
  return (
    <div
      data-control-ui="emoji-picker"
      data-control-family="emoji-picker"
      data-slot="row"
      className={cn("scroll-my-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function EmojiPickerEmoji({ emoji, className, ...props }: EmojiPickerListEmojiProps) {
  return (
    <button
      type="button"
      data-control-ui="emoji-picker"
      data-control-family="emoji-picker"
      data-slot="emoji"
      data-active={emoji.isActive ? "" : undefined}
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      {emoji.emoji}
    </button>
  );
}

function EmojiPickerCategoryHeader({ category, className, ...props }: EmojiPickerListCategoryHeaderProps) {
  return (
    <div data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="category-header" className={className} {...props}>
      {category.label}
    </div>
  );
}

export type EmojiPickerContentProps = Omit<ComponentProps<typeof EmojiPickerPrimitive.Viewport>, "style"> & EmojiPickerStyle;

export function EmojiPickerContent({ className, ref, ...props }: EmojiPickerContentProps) {
  const { viewportRef, loadState, retryEmojiData } = useEmojiPicker();
  useImperativeHandle(ref, () => {
    if (!viewportRef.current) throw new Error("EmojiPicker viewport is not mounted.");
    return viewportRef.current;
  });
  return (
    <EmojiPickerPrimitive.Viewport
      data-control-ui="emoji-picker"
      data-control-family="emoji-picker"
      data-slot="content"
      className={cn("relative min-h-0 flex-1 outline-none", className)}
      {...props}
      ref={viewportRef}
    >
      {loadState.status === "error" ? (
        <div data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="error" role="alert">
          <span>Couldn’t load emoji.</span>
          <button type="button" onClick={retryEmojiData}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <EmojiPickerPrimitive.Loading
            data-control-ui="emoji-picker"
            data-control-family="emoji-picker"
            data-slot="loading"
            className="absolute inset-0 flex items-center justify-center"
          >
            <Spinner label="Loading emoji" />
          </EmojiPickerPrimitive.Loading>
          <EmojiPickerPrimitive.Empty
            data-control-ui="emoji-picker"
            data-control-family="emoji-picker"
            data-slot="empty"
            className="absolute inset-0 flex items-center justify-center"
          >
            No emoji found.
          </EmojiPickerPrimitive.Empty>
          <EmojiPickerPrimitive.List
            data-control-ui="emoji-picker"
            data-control-family="emoji-picker"
            data-slot="list"
            className="select-none"
            components={{ Row: EmojiPickerRow, Emoji: EmojiPickerEmoji, CategoryHeader: EmojiPickerCategoryHeader }}
          />
        </>
      )}
    </EmojiPickerPrimitive.Viewport>
  );
}

export type EmojiPickerFooterProps = Omit<ComponentProps<"div">, "style" | "children"> & EmojiPickerStyle & { placeholder?: string };

export function EmojiPickerFooter({ className, placeholder = "Pick an emoji…", ...props }: EmojiPickerFooterProps) {
  return (
    <div
      data-control-ui="emoji-picker"
      data-control-family="emoji-picker"
      data-slot="footer"
      className={cn("flex min-w-0 items-center", className)}
      {...props}
    >
      <EmojiPickerPrimitive.ActiveEmoji>
        {({ emoji }) =>
          emoji ? (
            <>
              <span data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="footer-emoji" className="flex-none">
                {emoji.emoji}
              </span>
              <span data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="footer-label" className="truncate">
                {emoji.label}
              </span>
            </>
          ) : (
            <span data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="footer-placeholder" className="truncate">
              {placeholder}
            </span>
          )
        }
      </EmojiPickerPrimitive.ActiveEmoji>
    </div>
  );
}

export function EmojiIconPicker({ children, defaultValue = "emoji", ...props }: ComponentProps<typeof Tabs<"emoji" | "icons">>) {
  return (
    <Tabs data-control-ui="emoji-icon-picker" data-control-family="tabs" data-slot="root" defaultValue={defaultValue} {...props}>
      <PopoverViewport>{children}</PopoverViewport>
    </Tabs>
  );
}

export function EmojiIconPickerTabs({
  emojiLabel = "Emoji",
  iconsLabel = "Icons",
  ...props
}: Omit<ComponentProps<typeof TabsList>, "children"> & { emojiLabel?: string; iconsLabel?: string }) {
  return (
    <TabsList size="xs" className="mx-2 mt-2" aria-label="Choose emoji or icon" {...props}>
      <TabsTab value="emoji">{emojiLabel}</TabsTab>
      <TabsTab value="icons">{iconsLabel}</TabsTab>
    </TabsList>
  );
}

export function EmojiIconPickerEmoji(props: ComponentProps<typeof EmojiPicker>) {
  return (
    <TabsPanel value="emoji" data-slide={undefined} className="mt-0">
      <EmojiPicker {...props} />
    </TabsPanel>
  );
}

export function EmojiIconPickerIcons(props: ComponentProps<typeof IconPicker>) {
  return (
    <TabsPanel value="icons" data-slide={undefined} className="mt-0">
      <IconPicker {...props} />
    </TabsPanel>
  );
}
