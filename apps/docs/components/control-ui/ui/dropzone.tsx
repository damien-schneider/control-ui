"use client";

import { CircleAlert, CloudUpload, FileIcon, LoaderCircle, Search, XIcon } from "lucide-react";
import { type ComponentProps, createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import type { DropzoneOverlayScope, DropzoneVisualState } from "@/components/control-ui/contracts";
import {
  type DropzoneDropDetails,
  type DropzoneGetFilesFromEvent,
  type DropzoneValueChangeDetails,
  type UseDropzoneReturn,
  useDropzone,
} from "@/components/control-ui/hooks/use-dropzone";
import { cn } from "@/components/control-ui/lib/cn";
import { type DropzoneFileRejection, type DropzonePolicy, formatDropzoneFileSize } from "@/components/control-ui/lib/dropzone-validation";
import { skinSlot } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/control-ui/ui/item";

export type DropzoneProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange" | "onDrop" | "onError"> & {
  value?: readonly File[];
  defaultValue?: readonly File[];
  onValueChange?: (value: readonly File[], details: DropzoneValueChangeDetails) => void;
  policy?: DropzonePolicy;
  disabled?: boolean;
  getFilesFromEvent?: DropzoneGetFilesFromEvent;
  onDrop?: (details: DropzoneDropDetails) => void;
  onError?: (error: Error) => void;
};
export type DropzoneAreaProps = ComponentProps<"div">;
export type DropzoneInputProps = Omit<ComponentProps<"input">, "accept" | "disabled" | "multiple" | "onChange" | "onClick" | "type">;
export type DropzoneTriggerProps = ComponentProps<"button">;
export type DropzoneOverlayProps = ComponentProps<"div"> & { scope?: DropzoneOverlayScope };
export type DropzoneFileListProps = Omit<ComponentProps<"ul">, "children"> & {
  children?: (file: File, index: number) => ReactNode;
};
export type DropzoneRejectionListProps = Omit<ComponentProps<"ul">, "children"> & {
  children?: (rejection: DropzoneFileRejection, index: number) => ReactNode;
};
export type DropzoneContextValue = UseDropzoneReturn & {
  registerGlobalOverlay: () => () => void;
};
export type DropzoneStatusProps = Omit<ComponentProps<"div">, "children"> & {
  children?: (state: DropzoneContextValue) => ReactNode;
};
export type DropzoneRemoveProps = ComponentProps<typeof Button> & { file: File };
export type DropzoneClearProps = ComponentProps<typeof Button>;

const DropzoneContext = createContext<DropzoneContextValue | null>(null);
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

export function Dropzone({
  value,
  defaultValue,
  onValueChange,
  policy,
  disabled,
  getFilesFromEvent,
  onDrop,
  onError,
  className,
  children,
  ...props
}: DropzoneProps) {
  const [globalOverlayCount, setGlobalOverlayCount] = useState(0);
  const registerGlobalOverlayRef = useRef<(() => () => void) | null>(null);
  registerGlobalOverlayRef.current ??= () => {
    let registered = true;
    setGlobalOverlayCount((count) => count + 1);
    return () => {
      if (!registered) return;
      registered = false;
      setGlobalOverlayCount((count) => Math.max(0, count - 1));
    };
  };
  const registerGlobalOverlay = registerGlobalOverlayRef.current;
  const dropzone = useDropzone({
    value,
    defaultValue,
    onValueChange,
    policy,
    disabled,
    getFilesFromEvent,
    onDrop,
    onError,
    trackDocumentDrag: globalOverlayCount > 0,
  });
  const context = { ...dropzone, registerGlobalOverlay };
  const empty = dropzone.value.length === 0 && dropzone.fileRejections.length === 0;

  return (
    <DropzoneContext.Provider value={context}>
      <div
        {...props}
        data-control-ui="dropzone"
        data-slot="root"
        data-disabled={dropzone.disabled ? "true" : undefined}
        data-empty={empty ? "true" : undefined}
        className={cn("min-w-0", skinSlot("dropzone", "root", { disabled: dropzone.disabled, empty }), className)}
      >
        {children}
      </div>
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
      data-slot="area"
      data-state={context.visualState}
      data-disabled={context.disabled ? "true" : undefined}
      className={cn(
        "relative isolate min-w-0",
        skinSlot("dropzone", "area", {
          state: context.visualState,
          disabled: context.disabled,
        }),
        className,
      )}
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
      data-control-ui="dropzone"
      data-slot="input"
      className={cn("sr-only", skinSlot("dropzone", "input", {}), className)}
    />
  );
}

export function DropzoneTrigger({ className, children, onClick, disabled, ...props }: DropzoneTriggerProps) {
  const context = useDropzoneContext();
  const triggerDisabled = disabled || context.disabled || context.isProcessing;

  return (
    <button
      {...props}
      type="button"
      disabled={triggerDisabled}
      data-control-ui="dropzone"
      data-slot="trigger"
      data-state={context.visualState}
      data-disabled={triggerDisabled ? "true" : undefined}
      className={cn(
        "flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-panel)] border border-dashed border-border bg-card p-6 text-center text-foreground outline-none transition-[background-color,border-color,color,opacity] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:cursor-not-allowed disabled:opacity-50 data-[state=accept]:border-primary data-[state=accept]:text-primary-text data-[state=reject]:border-destructive data-[state=reject]:text-destructive-text data-[state=unknown]:border-muted-foreground data-[state=unknown]:text-muted-foreground",
        skinSlot("dropzone", "trigger", {
          state: context.visualState,
          disabled: triggerDisabled,
        }),
        className,
      )}
      onClick={(event) => {
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
      data-slot="overlay"
      data-state={context.visualState}
      data-active={active ? "true" : undefined}
      data-scope={scope}
      className={cn(
        "pointer-events-none absolute inset-0 z-10 hidden items-center justify-center rounded-[var(--radius-panel)] border border-primary bg-card/95 p-6 text-center text-primary-text opacity-0 transition-[display,opacity] transition-discrete duration-[var(--duration-fast)] ease-[var(--ease-standard)] data-[active=true]:flex data-[active=true]:opacity-100 data-[state=reject]:border-destructive data-[state=reject]:text-destructive-text data-[state=unknown]:border-muted-foreground data-[state=unknown]:text-muted-foreground starting:opacity-0",
        skinSlot("dropzone", "overlay", {
          state: context.visualState,
          active,
          scope,
        }),
        className,
      )}
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
      data-slot="file-list"
      data-empty={empty ? "true" : undefined}
      className={cn("mt-3 flex flex-col gap-2", skinSlot("dropzone", "file-list", { empty }), className)}
    >
      {context.value.map((file, index) => (
        <li key={getFileRenderKey(file)} data-control-ui="dropzone" data-slot="file" className={skinSlot("dropzone", "file", {})}>
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
      data-slot="rejection-list"
      data-empty={empty ? "true" : undefined}
      className={cn("mt-3 flex flex-col gap-2", skinSlot("dropzone", "rejection-list", { empty }), className)}
    >
      {context.fileRejections.map((rejection, index) => (
        <li
          key={getFileRenderKey(rejection.file)}
          data-control-ui="dropzone"
          data-slot="rejection"
          className={skinSlot("dropzone", "rejection", {})}
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
      data-slot="status"
      data-state={context.visualState}
      className={cn("mt-3 text-sm text-muted-foreground", skinSlot("dropzone", "status", { state: context.visualState }), className)}
    >
      {children ? children(context) : getDropzoneStatusMessage(context)}
    </div>
  );
}

export function DropzoneRemove({ file, children, onClick, disabled, ...props }: DropzoneRemoveProps) {
  const context = useDropzoneContext();
  return (
    <Button
      {...props}
      type="button"
      variant={props.variant ?? "quiet"}
      size={props.size ?? "sm"}
      iconOnly={props.iconOnly ?? true}
      aria-label={props["aria-label"] ?? `Remove ${file.name}`}
      disabled={disabled || context.disabled || context.isProcessing}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.removeFile(file);
      }}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </Button>
  );
}

export function DropzoneClear({ children, onClick, disabled, ...props }: DropzoneClearProps) {
  const context = useDropzoneContext();
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
        if (!event.defaultPrevented) context.reset();
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
    icon = <LoaderCircle className="animate-spin" aria-hidden="true" />;
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
    <span className="flex flex-col items-center gap-2">
      <span className="[&>svg]:size-6">{icon}</span>
      <span className="text-sm font-medium">{message}</span>
    </span>
  );
}

function DefaultFile({ file }: { file: File }) {
  return (
    <Item variant="muted" className="py-2">
      <ItemMedia>
        <FileIcon aria-hidden="true" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="wrap-anywhere leading-normal">{file.name}</ItemTitle>
        <ItemDescription>{formatDropzoneFileSize(file.size)}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <DropzoneRemove file={file} />
      </ItemActions>
    </Item>
  );
}

function DefaultRejection({ rejection }: { rejection: DropzoneFileRejection }) {
  return (
    <Item variant="muted" className="py-2">
      <ItemMedia className="text-destructive-text">
        <CircleAlert aria-hidden="true" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="wrap-anywhere leading-normal">{rejection.file.name}</ItemTitle>
        {rejection.errors.map((error) => (
          <ItemDescription key={`${error.code}-${error.message}`} className="text-destructive-text">
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
  DropzoneOverlayScope,
  DropzoneSelectionMode,
  DropzoneValueChangeReason,
  DropzoneVisualState,
} from "@/components/control-ui/contracts";
export type {
  DropzoneDropDetails,
  DropzoneEvent,
  DropzoneGetFilesFromEvent,
  DropzoneValueChangeDetails,
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
  DropzoneValidator,
  DropzoneValidatorResult,
} from "@/components/control-ui/lib/dropzone-validation";
export {
  DropzoneErrorCode,
  formatDropzoneFileSize,
} from "@/components/control-ui/lib/dropzone-validation";
