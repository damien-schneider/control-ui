"use client";

import {
  type ChangeEvent,
  type ComponentProps,
  type DragEvent as ReactDragEvent,
  type Ref,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

import type { DropzoneValueChangeReason, DropzoneVisualState } from "../contracts";
import {
  compileDropzoneAccept,
  type DropzoneFileMetadata,
  type DropzoneFileRejection,
  type DropzonePolicy,
  type DropzoneProcessResult,
  getDropzoneDragVerdict,
  processDropzoneFiles,
  toDropzoneError,
} from "../lib/dropzone-validation";

export type DropzoneEvent = ReactDragEvent<HTMLElement> | ChangeEvent<HTMLInputElement>;
export type DropzoneGetFilesFromEvent = (event: DropzoneEvent, signal: AbortSignal) => readonly File[] | Promise<readonly File[]>;
export type DropzoneValueChangeDetails = {
  reason: DropzoneValueChangeReason;
  addedFiles: readonly File[];
  removedFiles: readonly File[];
};
export type DropzoneDropDetails = {
  acceptedFiles: readonly File[];
  fileRejections: readonly DropzoneFileRejection[];
  event: DropzoneEvent;
};
export type UseDropzoneOptions = {
  value?: readonly File[];
  defaultValue?: readonly File[];
  onValueChange?: (value: readonly File[], details: DropzoneValueChangeDetails) => void;
  policy?: DropzonePolicy;
  disabled?: boolean;
  drag?: boolean;
  preventDropOnDocument?: boolean;
  trackDocumentDrag?: boolean;
  getFilesFromEvent?: DropzoneGetFilesFromEvent;
  onDrop?: (details: DropzoneDropDetails) => void;
  onError?: (error: Error) => void;
};
export type UseDropzoneReturn = {
  value: readonly File[];
  fileRejections: readonly DropzoneFileRejection[];
  accept: string | undefined;
  multiple: boolean;
  disabled: boolean;
  dragEnabled: boolean;
  visualState: DropzoneVisualState;
  isDragActive: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
  isDragUnknown: boolean;
  isDragGlobal: boolean;
  isFileDialogActive: boolean;
  isProcessing: boolean;
  rootRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  open: () => void;
  removeFile: (file: File) => void;
  clearFiles: () => void;
  clearRejections: () => void;
  reset: () => void;
  getRootProps: (props?: ComponentProps<"div">) => ComponentProps<"div">;
  getInputProps: (props?: ComponentProps<"input">) => ComponentProps<"input">;
};

type IntakeReason = Extract<DropzoneValueChangeReason, "drop" | "input">;
type ActiveDragState = Exclude<DropzoneVisualState, "idle" | "processing">;

const registeredDropzoneRoots = new WeakSet<EventTarget>();

export function useDropzone({
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  policy,
  disabled = false,
  drag = true,
  preventDropOnDocument = true,
  trackDocumentDrag = false,
  getFilesFromEvent,
  onDrop,
  onError,
}: UseDropzoneOptions = {}): UseDropzoneReturn {
  const [uncontrolledValue, setUncontrolledValue] = useState<readonly File[]>(defaultValue);
  const [fileRejections, setFileRejections] = useState<readonly DropzoneFileRejection[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [activeDragState, setActiveDragState] = useState<ActiveDragState>("unknown");
  const [isDragGlobal, setIsDragGlobal] = useState(false);
  const [isFileDialogActive, setIsFileDialogActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mountedInput = useRef<HTMLInputElement | null>(null);
  const localDragTargets = useRef(new Set<EventTarget>());
  const globalDragTargets = useRef(new Set<EventTarget>());
  const intakeController = useRef<AbortController | null>(null);
  const fallbackDialogCleanup = useRef<(() => void) | null>(null);
  const processingRef = useRef(false);
  const currentValue = controlledValue ?? uncontrolledValue;
  const currentValueRef = useRef(currentValue);
  const disabledRef = useRef(disabled);
  const dragEnabled = drag && !disabled;
  const dragEnabledRef = useRef(dragEnabled);
  const policyRef = useRef(policy);
  const customExtractionRef = useRef(Boolean(getFilesFromEvent));

  currentValueRef.current = currentValue;
  disabledRef.current = disabled;
  dragEnabledRef.current = dragEnabled;
  policyRef.current = policy;
  customExtractionRef.current = Boolean(getFilesFromEvent);

  const handleNativeCancelRef = useRef<(() => void) | null>(null);
  handleNativeCancelRef.current ??= () => {
    fallbackDialogCleanup.current?.();
    fallbackDialogCleanup.current = null;
    setIsFileDialogActive(false);
  };
  const handleNativeCancel = handleNativeCancelRef.current;

  function resetLocalDrag() {
    localDragTargets.current.clear();
    setIsDragActive(false);
    setActiveDragState("unknown");
  }

  function resetGlobalDrag() {
    globalDragTargets.current.clear();
    setIsDragGlobal(false);
  }

  function resetDragState() {
    resetLocalDrag();
    resetGlobalDrag();
  }

  function commitValue(nextValue: readonly File[], details: DropzoneValueChangeDetails) {
    if (areSameFiles(currentValueRef.current, nextValue)) return false;
    currentValueRef.current = nextValue;
    if (controlledValue === undefined) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue, details);
    return true;
  }

  async function intake(event: DropzoneEvent, reason: IntakeReason) {
    intakeController.current?.abort();
    const controller = new AbortController();
    intakeController.current = controller;
    processingRef.current = true;
    setIsProcessing(true);

    let result: DropzoneProcessResult;
    try {
      const extractedFiles = await (getFilesFromEvent ?? defaultGetFilesFromEvent)(event, controller.signal);
      controller.signal.throwIfAborted();
      result = await processDropzoneFiles(extractedFiles, currentValueRef.current, policy, controller.signal);
    } catch (error) {
      if (controller.signal.aborted || intakeController.current !== controller) return;
      processingRef.current = false;
      setIsProcessing(false);
      onError?.(toDropzoneError(error));
      return;
    }

    if (controller.signal.aborted || intakeController.current !== controller) return;
    intakeController.current = null;
    processingRef.current = false;
    setIsProcessing(false);
    setFileRejections(result.fileRejections);
    commitValue(result.value, {
      reason,
      addedFiles: result.acceptedFiles,
      removedFiles: result.removedFiles,
    });
    onDrop?.({
      acceptedFiles: result.acceptedFiles,
      fileRejections: result.fileRejections,
      event,
    });
  }

  function open() {
    if (disabledRef.current || processingRef.current) return;
    const input = inputRef.current;
    if (!input) return;

    fallbackDialogCleanup.current?.();
    fallbackDialogCleanup.current = null;
    input.value = "";
    setIsFileDialogActive(true);

    if (input.oncancel === undefined) {
      const view = input.ownerDocument.defaultView;
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const handleFocus = () => {
        timeout = setTimeout(() => setIsFileDialogActive(false), 300);
      };
      view?.addEventListener("focus", handleFocus, { once: true });
      fallbackDialogCleanup.current = () => {
        view?.removeEventListener("focus", handleFocus);
        clearTimeout(timeout);
      };
    }

    input.click();
  }

  function removeFile(file: File) {
    if (disabledRef.current || processingRef.current) return;
    const index = currentValueRef.current.indexOf(file);
    if (index < 0) return;
    const nextValue = currentValueRef.current.filter((_, fileIndex) => fileIndex !== index);
    commitValue(nextValue, { reason: "remove", addedFiles: [], removedFiles: [file] });
  }

  function clearFiles() {
    if (disabledRef.current || processingRef.current || currentValueRef.current.length === 0) return;
    const removedFiles = currentValueRef.current;
    commitValue([], { reason: "clear", addedFiles: [], removedFiles });
  }

  function clearRejections() {
    if (disabledRef.current || processingRef.current || fileRejections.length === 0) return;
    setFileRejections([]);
  }

  function reset() {
    if (disabledRef.current || processingRef.current) return;
    if (currentValueRef.current.length > 0) {
      const removedFiles = currentValueRef.current;
      commitValue([], { reason: "clear", addedFiles: [], removedFiles });
    }
    if (fileRejections.length > 0) setFileRejections([]);
  }

  function getRootProps(props: ComponentProps<"div"> = {}): ComponentProps<"div"> {
    const { onDragEnter, onDragOver, onDragLeave, onDragEnd, onDrop: callerOnDrop, ref, ...rootProps } = props;

    return {
      ...rootProps,
      ref: (node) => {
        if (rootRef.current !== node) {
          if (rootRef.current) registeredDropzoneRoots.delete(rootRef.current);
          rootRef.current = node;
          if (node) registeredDropzoneRoots.add(node);
        }
        assignRef(ref, node);
      },
      onDragEnter: (event) => {
        onDragEnter?.(event);
        if (!isFileDrag(event.dataTransfer)) return;
        event.stopPropagation();
        if (event.defaultPrevented || !dragEnabledRef.current) return;
        event.preventDefault();
        localDragTargets.current.add(event.target);
        setActiveDragState(
          getDropzoneDragVerdict(getDragMetadata(event.dataTransfer), currentValueRef.current, policyRef.current, {
            customExtraction: customExtractionRef.current,
          }),
        );
        setIsDragActive(true);
      },
      onDragOver: (event) => {
        onDragOver?.(event);
        if (!isFileDrag(event.dataTransfer)) return;
        event.stopPropagation();
        if (event.defaultPrevented || !dragEnabledRef.current) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        if (!isDragActive) {
          setActiveDragState(
            getDropzoneDragVerdict(getDragMetadata(event.dataTransfer), currentValueRef.current, policyRef.current, {
              customExtraction: customExtractionRef.current,
            }),
          );
          setIsDragActive(true);
        }
      },
      onDragLeave: (event) => {
        onDragLeave?.(event);
        if (!isFileDrag(event.dataTransfer)) return;
        event.stopPropagation();
        localDragTargets.current.delete(event.target);
        if (event.relatedTarget === null || localDragTargets.current.size === 0) resetLocalDrag();
      },
      onDragEnd: (event) => {
        onDragEnd?.(event);
        if (!isFileDrag(event.dataTransfer)) return;
        event.stopPropagation();
        resetDragState();
      },
      onDrop: (event) => {
        callerOnDrop?.(event);
        if (!isFileDrag(event.dataTransfer)) return;
        event.stopPropagation();
        resetDragState();
        if (event.defaultPrevented || !dragEnabledRef.current) return;
        event.preventDefault();
        void intake(event, "drop");
      },
    };
  }

  function getInputProps(props: ComponentProps<"input"> = {}): ComponentProps<"input"> {
    const { onChange, ref, ...inputProps } = props;
    return {
      ...inputProps,
      type: "file",
      accept: compileDropzoneAccept(policy?.accept),
      multiple: policy?.multiple ?? true,
      disabled,
      ref: (node) => {
        if (mountedInput.current !== node) {
          mountedInput.current?.removeEventListener("cancel", handleNativeCancel);
          mountedInput.current = node;
          node?.addEventListener("cancel", handleNativeCancel);
        }
        inputRef.current = node;
        assignRef(ref, node);
      },
      onChange: (event) => {
        onChange?.(event);
        fallbackDialogCleanup.current?.();
        fallbackDialogCleanup.current = null;
        setIsFileDialogActive(false);
        if (!event.defaultPrevented && !disabledRef.current) void intake(event, "input");
      },
    };
  }

  useEffect(() => {
    if (!disabled && drag) return;
    if (disabled) {
      intakeController.current?.abort();
      intakeController.current = null;
      processingRef.current = false;
      setIsProcessing(false);
      fallbackDialogCleanup.current?.();
      fallbackDialogCleanup.current = null;
      setIsFileDialogActive(false);
    }
    localDragTargets.current.clear();
    globalDragTargets.current.clear();
    setIsDragActive(false);
    setActiveDragState("unknown");
    setIsDragGlobal(false);
  }, [disabled, drag]);

  useEffect(() => {
    const ownerDocument = rootRef.current?.ownerDocument ?? document;
    const ownerWindow = ownerDocument.defaultView;

    function resetDocumentGlobalDrag() {
      globalDragTargets.current.clear();
      setIsDragGlobal(false);
    }

    function resetDocumentDragState() {
      localDragTargets.current.clear();
      globalDragTargets.current.clear();
      setIsDragActive(false);
      setActiveDragState("unknown");
      setIsDragGlobal(false);
    }

    function handleDocumentDragOver(event: DragEvent) {
      if (preventDropOnDocument && isFileDrag(event.dataTransfer)) event.preventDefault();
    }

    function handleDocumentDrop(event: DragEvent) {
      resetDocumentDragState();
      if (preventDropOnDocument && isFileDrag(event.dataTransfer)) event.preventDefault();
    }

    function handleGlobalDragEnter(event: DragEvent) {
      if (!trackDocumentDrag || !dragEnabledRef.current || !isFileDrag(event.dataTransfer)) return;
      const dragOwner = getRegisteredDropzoneRoot(event);
      if (dragOwner && dragOwner !== rootRef.current) {
        resetDocumentGlobalDrag();
        return;
      }
      globalDragTargets.current.add(event.target ?? ownerDocument);
      setIsDragGlobal(true);
    }

    function handleGlobalDragLeave(event: DragEvent) {
      if (!isFileDrag(event.dataTransfer)) return;
      globalDragTargets.current.delete(event.target ?? ownerDocument);
      if (event.relatedTarget === null || globalDragTargets.current.size === 0) {
        resetDocumentGlobalDrag();
      }
    }

    function handleTerminalDrag() {
      resetDocumentDragState();
    }

    ownerDocument.addEventListener("dragover", handleDocumentDragOver);
    ownerDocument.addEventListener("drop", handleDocumentDrop);
    ownerDocument.addEventListener("dragenter", handleGlobalDragEnter, true);
    ownerDocument.addEventListener("dragleave", handleGlobalDragLeave, true);
    ownerDocument.addEventListener("drop", handleTerminalDrag, true);
    ownerDocument.addEventListener("dragend", handleTerminalDrag, true);
    ownerWindow?.addEventListener("blur", handleTerminalDrag);

    return () => {
      ownerDocument.removeEventListener("dragover", handleDocumentDragOver);
      ownerDocument.removeEventListener("drop", handleDocumentDrop);
      ownerDocument.removeEventListener("dragenter", handleGlobalDragEnter, true);
      ownerDocument.removeEventListener("dragleave", handleGlobalDragLeave, true);
      ownerDocument.removeEventListener("drop", handleTerminalDrag, true);
      ownerDocument.removeEventListener("dragend", handleTerminalDrag, true);
      ownerWindow?.removeEventListener("blur", handleTerminalDrag);
    };
  }, [preventDropOnDocument, trackDocumentDrag]);

  useEffect(
    () => () => {
      intakeController.current?.abort();
      if (rootRef.current) registeredDropzoneRoots.delete(rootRef.current);
      mountedInput.current?.removeEventListener("cancel", handleNativeCancel);
      fallbackDialogCleanup.current?.();
    },
    [handleNativeCancel],
  );

  let visualState: DropzoneVisualState = "idle";
  if (isProcessing) visualState = "processing";
  else if (isDragActive) visualState = activeDragState;
  else if (isDragGlobal) visualState = "unknown";

  return {
    value: currentValue,
    fileRejections,
    accept: compileDropzoneAccept(policy?.accept),
    multiple: policy?.multiple ?? true,
    disabled,
    dragEnabled,
    visualState,
    isDragActive,
    isDragAccept: visualState === "accept",
    isDragReject: visualState === "reject",
    isDragUnknown: visualState === "unknown",
    isDragGlobal,
    isFileDialogActive,
    isProcessing,
    rootRef,
    inputRef,
    open,
    removeFile,
    clearFiles,
    clearRejections,
    reset,
    getRootProps,
    getInputProps,
  };
}

export function defaultGetFilesFromEvent(event: DropzoneEvent): readonly File[] {
  return "dataTransfer" in event ? Array.from(event.dataTransfer.files) : Array.from(event.currentTarget.files ?? []);
}

function isFileDrag(dataTransfer: DataTransfer | null) {
  return dataTransfer ? Array.from(dataTransfer.types).includes("Files") : false;
}

function getRegisteredDropzoneRoot(event: DragEvent) {
  for (const target of event.composedPath()) {
    if (target && registeredDropzoneRoots.has(target)) return target;
  }
  return undefined;
}

function getDragMetadata(dataTransfer: DataTransfer): readonly DropzoneFileMetadata[] | null {
  const files = Array.from(dataTransfer.files);
  if (files.length > 0) return files;

  const fileItems = Array.from(dataTransfer.items).filter((item) => item.kind === "file");
  if (fileItems.length === 0) return null;
  return fileItems.map((item) => item.getAsFile() ?? { type: item.type || undefined });
}

function areSameFiles(left: readonly File[], right: readonly File[]) {
  return left.length === right.length && left.every((file, index) => file === right[index]);
}

function assignRef<Element>(ref: Ref<Element> | undefined, value: Element | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}
