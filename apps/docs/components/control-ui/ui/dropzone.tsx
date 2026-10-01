"use client";

import { CircleAlert, CloudUpload, FileIcon, LoaderCircle, Search, XIcon } from "lucide-react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type ReactNode,
  type Ref,
  type RefCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { DropzoneVisualState } from "@/components/control-ui/hooks/use-dropzone";
import {
  type DropzoneDropDetails,
  type DropzoneGetFilesFromEvent,
  type DropzoneValueChangeDetails,
  type UseDropzoneReturn,
  useDropzone,
} from "@/components/control-ui/hooks/use-dropzone";
import type { DropzoneKnobStyle } from "@/components/control-ui/knob-contracts/dropzone-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { type DropzoneFileRejection, type DropzonePolicy, formatDropzoneFileSize } from "@/components/control-ui/lib/dropzone-validation";
import { Button } from "@/components/control-ui/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/control-ui/ui/item";

export type DropzoneOverlayScope = "local" | "global";

export type DropzoneProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange" | "onDrop" | "onError"> & {
  value?: readonly File[];
  defaultValue?: readonly File[];
  onValueChange?: (value: readonly File[], details: DropzoneValueChangeDetails) => void;
  policy?: DropzonePolicy;
  disabled?: boolean;
  drag?: boolean;
  paste?: boolean;
  getFilesFromEvent?: DropzoneGetFilesFromEvent;
  onDrop?: (details: DropzoneDropDetails) => void;
  onError?: (error: Error) => void;
} & { style?: CSSProperties & DropzoneKnobStyle };
export type DropzoneAreaProps = ComponentProps<"div"> & { style?: CSSProperties & DropzoneKnobStyle };
export type DropzoneInputProps = Omit<ComponentProps<"input">, "accept" | "disabled" | "multiple" | "onChange" | "onClick" | "type"> & {
  style?: CSSProperties & DropzoneKnobStyle;
};
export type DropzoneTriggerProps = Omit<ComponentProps<"button">, "style"> & {
  style?: CSSProperties & DropzoneKnobStyle;
};
export type DropzoneOverlayProps = Omit<ComponentProps<"div">, "style"> & {
  scope?: DropzoneOverlayScope;
  style?: CSSProperties & DropzoneKnobStyle;
};
export type DropzoneFileListProps = Omit<ComponentProps<"ul">, "children"> & {
  children?: (file: File, index: number) => ReactNode;
} & { style?: CSSProperties & DropzoneKnobStyle };
export type DropzoneRejectionListProps = Omit<ComponentProps<"ul">, "children"> & {
  children?: (rejection: DropzoneFileRejection, index: number) => ReactNode;
} & { style?: CSSProperties & DropzoneKnobStyle };
export type DropzoneContextValue = UseDropzoneReturn & {
  registerGlobalOverlay: () => () => void;
};
export type DropzoneStatusProps = Omit<ComponentProps<"div">, "children" | "style"> & {
  children?: (state: DropzoneContextValue) => ReactNode;
  style?: CSSProperties & DropzoneKnobStyle;
};
export type DropzoneRemoveProps = ComponentProps<typeof Button> & { file: File };
export type DropzoneClearProps = ComponentProps<typeof Button>;

type DropzoneFocusTargets = {
  register: (kind: "trigger" | "remove", node: HTMLElement) => () => void;
  focusAfterRemoval: (control: HTMLElement, all: boolean) => void;
};

const DropzoneContext = createContext<DropzoneContextValue | null>(null);
const DropzoneFocusContext = createContext<DropzoneFocusTargets | null>(null);
const fileRenderKeys = new WeakMap<File, string>();
let nextFileRenderKey = 0;

function getFileRenderKey(file: File) {
  const existingKey = fileRenderKeys.get(file);
  if (existingKey) return existingKey;
  const key = `dropzone-file-${nextFileRenderKey}`;
  nextFileRenderKey += 1;
  fileRenderKeys.set(file, key);
  return key;
}

export function useDropzoneContext() {
  const context = useContext(DropzoneContext);
  if (!context) throw new Error("Dropzone parts must be used inside Dropzone.");
  return context;
}

function createFocusTargets(): DropzoneFocusTargets {
  const triggers = new Set<HTMLElement>();
  const removes = new Set<HTMLElement>();
  const inDocumentOrder = (nodes: Set<HTMLElement>) =>
    [...nodes]
      .filter((node) => !node.matches(":disabled"))
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  return {
    register(kind, node) {
      const nodes = kind === "trigger" ? triggers : removes;
      nodes.add(node);
      return () => {
        nodes.delete(node);
      };
    },
    focusAfterRemoval(control, all) {
      const siblings = all ? [] : inDocumentOrder(removes);
      const index = siblings.indexOf(control);
      const next = siblings[index + 1] ?? siblings[index - 1] ?? inDocumentOrder(triggers)[0];
      next?.focus();
    },
  };
}

function useFocusTargetRef<T extends HTMLElement>(kind: "trigger" | "remove", ref: Ref<T> | undefined): RefCallback<T> {
  const focusTargets = useContext(DropzoneFocusContext);
  return (node: T) => {
    const unregister = focusTargets?.register(kind, node);
    let release: (() => void) | undefined;
    if (typeof ref === "function") {
      const cleanup = ref(node);
      release = typeof cleanup === "function" ? cleanup : () => ref(null);
    } else if (ref) {
      ref.current = node;
      release = () => {
        ref.current = null;
      };
    }
    return () => {
      unregister?.();
      release?.();
    };
  };
}

export function Dropzone({
  value,
  defaultValue,
  onValueChange,
  policy,
  disabled,
  drag,
  paste,
  getFilesFromEvent,
  onDrop,
  onError,
  className,
  children,
  ...props
}: DropzoneProps) {
  const [globalOverlayCount, setGlobalOverlayCount] = useState(0);
  const [focusTargets] = useState(createFocusTargets);
  const [registerGlobalOverlay] = useState<() => () => void>(() => () => {
    let registered = true;
    setGlobalOverlayCount((count) => count + 1);
    return () => {
      if (!registered) return;
      registered = false;
      setGlobalOverlayCount((count) => Math.max(0, count - 1));
    };
  });
  const dropzone = useDropzone({
    value,
    defaultValue,
    onValueChange,
    policy,
    disabled,
    drag,
    paste,
    getFilesFromEvent,
    onDrop,
    onError,
    trackDocumentDrag: globalOverlayCount > 0,
  });
  const context = { ...dropzone, registerGlobalOverlay };
  const empty = dropzone.value.length === 0 && dropzone.fileRejections.length === 0;

  return (
    <DropzoneContext.Provider value={context}>
      <DropzoneFocusContext.Provider value={focusTargets}>
        <div
          {...props}
          data-control-ui="dropzone"
          data-control-family="dropzone"
          data-slot="root"
          data-disabled={dropzone.disabled ? "true" : undefined}
          data-empty={empty ? "true" : undefined}
          className={cn("min-w-0", className)}
        >
          {children}
        </div>
      </DropzoneFocusContext.Provider>
    </DropzoneContext.Provider>
  );
}

export function DropzoneArea({ className, ...props }: DropzoneAreaProps) {
  const context = useDropzoneContext();
  const areaProps = context.getRootProps(props);
  return (
    <div
      {...areaProps}
      aria-busy={context.isProcessing ? "true" : "false"}
      data-control-ui="dropzone"
      data-control-family="dropzone"
      data-slot="area"
      data-state={context.visualState}
      data-disabled={context.disabled ? "true" : undefined}
      className={cn("relative isolate min-w-0", className)}
    />
  );
}

export function DropzoneInput({ className, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...props }: DropzoneInputProps) {
  const context = useDropzoneContext();
  const inputProps = context.getInputProps({
    ...props,
    "aria-label": ariaLabelledBy ? ariaLabel : (ariaLabel ?? "Choose files"),
    "aria-labelledby": ariaLabelledBy,
  });
  return (
    <input
      {...inputProps}
      tabIndex={-1}
      data-control-ui="dropzone"
      data-control-family="dropzone"
      data-slot="input"
      className={cn("sr-only", className)}
    />
  );
}

export function DropzoneTrigger({ className, children, onClick, disabled, ref, ...props }: DropzoneTriggerProps) {
  const context = useDropzoneContext();
  const triggerRef = useFocusTargetRef("trigger", ref);
  const triggerDisabled = disabled || context.disabled;
  const busy = context.isProcessing && !triggerDisabled;

  return (
    <button
      {...props}
      ref={triggerRef}
      type="button"
      disabled={triggerDisabled}
      aria-disabled={busy ? "true" : undefined}
      data-control-ui="dropzone"
      data-control-family="dropzone"
      data-slot="trigger"
      data-state={context.visualState}
      data-disabled={triggerDisabled || busy ? "true" : undefined}
      className={cn(
        "flex w-full cursor-pointer flex-col items-center justify-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed",
        className,
      )}
      onClick={(event) => {
        if (busy) return;
        onClick?.(event);
        if (!event.defaultPrevented) context.open();
      }}
    >
      {children ?? <DropzoneFeedback state={context.visualState} />}
    </button>
  );
}

export function DropzoneOverlay({ scope = "local", className, children, ...props }: DropzoneOverlayProps) {
  const context = useDropzoneContext();
  const active = scope === "global" ? context.isDragGlobal : context.isDragActive;

  useEffect(() => {
    if (scope !== "global") return;
    return context.registerGlobalOverlay();
  }, [context.registerGlobalOverlay, scope]);

  return (
    <div
      {...props}
      aria-hidden="true"
      data-control-ui="dropzone"
      data-control-family="dropzone"
      data-slot="overlay"
      data-state={context.visualState}
      data-active={active ? "true" : undefined}
      data-scope={scope}
      className={cn("pointer-events-none absolute inset-0 z-10 hidden items-center justify-center data-[active=true]:flex", className)}
    >
      {children ?? <DropzoneFeedback state={context.visualState} />}
    </div>
  );
}

export function DropzoneFileList({
  className,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: DropzoneFileListProps) {
  const context = useDropzoneContext();
  const empty = context.value.length === 0;

  return (
    <ul
      {...props}
      hidden={empty}
      aria-label={ariaLabelledBy ? ariaLabel : (ariaLabel ?? "Selected files")}
      aria-labelledby={ariaLabelledBy}
      data-control-ui="dropzone"
      data-control-family="dropzone"
      data-slot="file-list"
      data-empty={empty ? "true" : undefined}
      className={cn("flex flex-col", className)}
    >
      {context.value.map((file, index) => (
        <li key={getFileRenderKey(file)} data-control-ui="dropzone" data-control-family="dropzone" data-slot="file" className={undefined}>
          {children ? children(file, index) : <DefaultFile file={file} />}
        </li>
      ))}
    </ul>
  );
}

export function DropzoneRejectionList({
  className,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: DropzoneRejectionListProps) {
  const context = useDropzoneContext();
  const empty = context.fileRejections.length === 0;

  return (
    <ul
      {...props}
      hidden={empty}
      aria-label={ariaLabelledBy ? ariaLabel : (ariaLabel ?? "Rejected files")}
      aria-labelledby={ariaLabelledBy}
      data-control-ui="dropzone"
      data-control-family="dropzone"
      data-slot="rejection-list"
      data-empty={empty ? "true" : undefined}
      className={cn("flex flex-col", className)}
    >
      {context.fileRejections.map((rejection, index) => (
        <li
          key={getFileRenderKey(rejection.file)}
          data-control-ui="dropzone"
          data-control-family="dropzone"
          data-slot="rejection"
          className={undefined}
        >
          {children ? children(rejection, index) : <DefaultRejection rejection={rejection} />}
        </li>
      ))}
    </ul>
  );
}

export function DropzoneStatus({ className, children, role = "status", "aria-live": ariaLive = "polite", ...props }: DropzoneStatusProps) {
  const context = useDropzoneContext();
  return (
    <div
      {...props}
      role={role}
      aria-live={ariaLive}
      data-control-ui="dropzone"
      data-control-family="dropzone"
      data-slot="status"
      data-state={context.visualState}
      className={className}
    >
      {children ? children(context) : getDropzoneStatusMessage(context)}
    </div>
  );
}

export function DropzoneRemove({ file, children, onClick, disabled, ref, ...props }: DropzoneRemoveProps) {
  const context = useDropzoneContext();
  const focusTargets = useContext(DropzoneFocusContext);
  const removeRef = useFocusTargetRef("remove", ref);
  return (
    <Button
      {...props}
      ref={removeRef}
      type="button"
      variant={props.variant ?? "quiet"}
      size={props.size ?? "sm"}
      iconOnly={props.iconOnly ?? true}
      aria-label={props["aria-label"] ?? `Remove ${file.name}`}
      disabled={disabled || context.disabled || context.isProcessing}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        focusTargets?.focusAfterRemoval(event.currentTarget, false);
        context.removeFile(file);
      }}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </Button>
  );
}

export function DropzoneClear({ children, onClick, disabled, ...props }: DropzoneClearProps) {
  const context = useDropzoneContext();
  const focusTargets = useContext(DropzoneFocusContext);
  const empty = context.value.length === 0 && context.fileRejections.length === 0;
  return (
    <Button
      {...props}
      type="button"
      variant={props.variant ?? "quiet"}
      size={props.size ?? "sm"}
      disabled={disabled || context.disabled || context.isProcessing || empty}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        focusTargets?.focusAfterRemoval(event.currentTarget, true);
        context.reset();
      }}
    >
      {children ?? "Clear all"}
    </Button>
  );
}

function DropzoneFeedback({ state }: { state: DropzoneVisualState }) {
  let icon: ReactNode = <CloudUpload aria-hidden="true" />;
  let message = "Drop files here or choose files.";
  if (state === "processing") {
    icon = (
      <LoaderCircle
        data-control-ui="dropzone"
        data-control-family="dropzone"
        data-slot="feedback-spinner"
        data-motion-essential=""
        aria-hidden="true"
      />
    );
    message = "Checking files…";
  } else if (state === "accept") {
    icon = <CloudUpload aria-hidden="true" />;
    message = "Release to add files.";
  } else if (state === "reject") {
    icon = <CircleAlert aria-hidden="true" />;
    message = "Some files are not accepted.";
  } else if (state === "unknown") {
    icon = <Search aria-hidden="true" />;
    message = "Release to check files.";
  }

  return (
    <span data-control-ui="dropzone" data-control-family="dropzone" data-slot="feedback" className="flex flex-col items-center">
      <span data-control-ui="dropzone" data-control-family="dropzone" data-slot="feedback-icon" className="[&>svg]:size-6">
        {icon}
      </span>
      <span data-control-ui="dropzone" data-control-family="dropzone" data-slot="feedback-message">
        {message}
      </span>
    </span>
  );
}

function DefaultFile({ file }: { file: File }) {
  return (
    <Item variant="muted">
      <ItemMedia>
        <FileIcon aria-hidden="true" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="wrap-anywhere">{file.name}</ItemTitle>
        <ItemDescription className="tabular-nums">{formatDropzoneFileSize(file.size)}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <DropzoneRemove file={file} />
      </ItemActions>
    </Item>
  );
}

function DefaultRejection({ rejection }: { rejection: DropzoneFileRejection }) {
  return (
    <Item variant="muted">
      <ItemMedia data-dropzone-invalid="">
        <CircleAlert aria-hidden="true" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="wrap-anywhere">{rejection.file.name}</ItemTitle>
        {rejection.errors.map((error) => (
          <ItemDescription key={`${error.code}-${error.message}`} data-dropzone-invalid="">
            {error.message}
          </ItemDescription>
        ))}
      </ItemContent>
    </Item>
  );
}

function getDropzoneStatusMessage(context: DropzoneContextValue) {
  if (context.isProcessing) return "Checking files…";
  if (context.isDragActive && context.isDragReject) return "Some files are not accepted.";
  if (context.isDragActive && context.isDragAccept) return "Release to add files.";
  if (context.isDragActive && context.isDragUnknown) return "Release to check files.";
  if (context.fileRejections.length > 0) {
    const count = context.fileRejections.length;
    return `${count} ${count === 1 ? "file" : "files"} could not be added.`;
  }
  if (context.value.length > 0) {
    const count = context.value.length;
    return `${count} ${count === 1 ? "file" : "files"} selected.`;
  }
  return "No files selected.";
}

export type {
  DropzoneDropDetails,
  DropzoneEvent,
  DropzoneGetFilesFromEvent,
  DropzoneValueChangeDetails,
  DropzoneValueChangeReason,
  DropzoneVisualState,
  UseDropzoneOptions,
  UseDropzoneReturn,
} from "@/components/control-ui/hooks/use-dropzone";
// biome-ignore lint/performance/noBarrelFile: The component intentionally exposes one install-facing API.
export { useDropzone } from "@/components/control-ui/hooks/use-dropzone";
export type {
  DropzoneAccept,
  DropzoneErrorCodeValue,
  DropzoneFileError,
  DropzoneFileRejection,
  DropzonePolicy,
  DropzoneSelectionMode,
  DropzoneValidator,
  DropzoneValidatorResult,
} from "@/components/control-ui/lib/dropzone-validation";
export {
  DropzoneErrorCode,
  formatDropzoneFileSize,
} from "@/components/control-ui/lib/dropzone-validation";
