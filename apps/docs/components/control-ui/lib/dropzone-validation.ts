import type { DropzoneSelectionMode, DropzoneVisualState } from "../contracts";

export const DropzoneErrorCode = {
  FileInvalidType: "file-invalid-type",
  FileTooLarge: "file-too-large",
  FileTooSmall: "file-too-small",
  TooManyFiles: "too-many-files",
  FileAlreadySelected: "file-already-selected",
} as const;

export type DropzoneErrorCodeValue = (typeof DropzoneErrorCode)[keyof typeof DropzoneErrorCode];
export type DropzoneAccept = Readonly<Record<string, readonly string[]>>;
export type DropzoneFileError = { code: DropzoneErrorCodeValue | string; message: string };
export type DropzoneFileRejection = { file: File; errors: readonly DropzoneFileError[] };
export type DropzoneValidatorResult = DropzoneFileError | readonly DropzoneFileError[] | null;
export type DropzoneValidator = (
  file: File,
  signal: AbortSignal,
) => DropzoneValidatorResult | Promise<DropzoneValidatorResult>;
export type DropzonePolicy = {
  accept?: DropzoneAccept;
  minSize?: number;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  selectionMode?: DropzoneSelectionMode;
  allowDuplicates?: boolean;
  validator?: DropzoneValidator;
};

export type DropzoneFileMetadata = {
  name?: string;
  size?: number;
  type?: string;
  lastModified?: number;
  webkitRelativePath?: string;
};

export type DropzoneProcessResult = {
  acceptedFiles: readonly File[];
  fileRejections: readonly DropzoneFileRejection[];
  value: readonly File[];
  removedFiles: readonly File[];
};

export type DropzoneDragVerdictOptions = {
  customExtraction?: boolean;
};

type NormalizedAcceptEntry = {
  mime: string;
  extensions: readonly string[];
};

type FileAcceptance = "accept" | "reject" | "unknown";

const DEFAULT_POLICY = {
  minSize: 0,
  maxSize: Number.POSITIVE_INFINITY,
  maxFiles: 0,
  multiple: true,
  selectionMode: "append",
  allowDuplicates: false,
} satisfies Required<Pick<DropzonePolicy, "minSize" | "maxSize" | "maxFiles" | "multiple" | "selectionMode" | "allowDuplicates">>;

export function normalizeDropzoneAccept(accept: DropzoneAccept | undefined): readonly NormalizedAcceptEntry[] {
  if (!accept) return [];

  return Object.entries(accept).flatMap(([rawMime, rawExtensions]) => {
    const mime = rawMime.trim().toLowerCase();
    const extensions = Array.from(
      new Set(
        rawExtensions.flatMap((rawExtension) => {
          const extension = rawExtension.trim().toLowerCase();
          if (!extension) return [];
          return [extension.startsWith(".") ? extension : `.${extension}`];
        }),
      ),
    );

    return mime || extensions.length > 0 ? [{ mime, extensions }] : [];
  });
}

export function compileDropzoneAccept(accept: DropzoneAccept | undefined): string | undefined {
  const values = normalizeDropzoneAccept(accept).flatMap(({ mime, extensions }) => {
    if (extensions.length > 0) return extensions;
    return mime ? [mime] : [];
  });
  return values.length > 0 ? values.join(",") : undefined;
}

export function isDropzoneFileAccepted(file: Pick<File, "name" | "type">, accept: DropzoneAccept | undefined) {
  return getFileAcceptance(file, normalizeDropzoneAccept(accept)) === "accept";
}

export function normalizeDropzoneMaxFiles(maxFiles: number | undefined) {
  const value = maxFiles ?? DEFAULT_POLICY.maxFiles;
  if (!Number.isFinite(value) || value <= 0) return Number.POSITIVE_INFINITY;
  return Math.max(1, Math.floor(value));
}

export function getDropzoneSelectionMode(policy: DropzonePolicy | undefined): DropzoneSelectionMode {
  return policy?.multiple === false ? "replace" : (policy?.selectionMode ?? DEFAULT_POLICY.selectionMode);
}

export function getDropzoneCapacity(policy: DropzonePolicy | undefined) {
  return policy?.multiple === false ? 1 : normalizeDropzoneMaxFiles(policy?.maxFiles);
}

export function getDropzoneFileIdentity(file: DropzoneFileMetadata) {
  const path = file.webkitRelativePath || file.name || "";
  return `${path}\0${file.size ?? ""}\0${file.type?.toLowerCase() ?? ""}\0${file.lastModified ?? ""}`;
}

export function toDropzoneError(value: unknown) {
  return value instanceof Error ? value : new Error(String(value));
}

export async function validateDropzoneFile(
  file: File,
  policy: DropzonePolicy | undefined,
  signal: AbortSignal,
): Promise<readonly DropzoneFileError[]> {
  const errors: DropzoneFileError[] = [];
  const minSize = policy?.minSize ?? DEFAULT_POLICY.minSize;
  const maxSize = policy?.maxSize ?? DEFAULT_POLICY.maxSize;

  if (!isDropzoneFileAccepted(file, policy?.accept)) {
    errors.push({
      code: DropzoneErrorCode.FileInvalidType,
      message: "File type is not accepted.",
    });
  }
  if (file.size < minSize) {
    errors.push({
      code: DropzoneErrorCode.FileTooSmall,
      message: `File is smaller than the ${formatDropzoneFileSize(minSize)} minimum.`,
    });
  }
  if (file.size > maxSize) {
    errors.push({
      code: DropzoneErrorCode.FileTooLarge,
      message: `File is larger than the ${formatDropzoneFileSize(maxSize)} limit.`,
    });
  }

  if (policy?.validator) {
    signal.throwIfAborted();
    const result = await policy.validator(file, signal);
    signal.throwIfAborted();
    if (result) errors.push(...normalizeValidatorErrors(result));
  }

  return errors;
}

export async function processDropzoneFiles(
  files: readonly File[],
  currentValue: readonly File[],
  policy: DropzonePolicy | undefined,
  signal: AbortSignal,
): Promise<DropzoneProcessResult> {
  signal.throwIfAborted();
  const validatedFiles = await Promise.all(
    files.map(async (file) => ({ file, errors: await validateDropzoneFile(file, policy, signal) })),
  );
  signal.throwIfAborted();

  const acceptedFiles: File[] = [];
  const fileRejections: DropzoneFileRejection[] = [];
  const selectionMode = getDropzoneSelectionMode(policy);
  const capacity = getDropzoneCapacity(policy);
  const selectedFiles = selectionMode === "append" ? [...currentValue] : [];
  const selectedIdentities = new Set(
    policy?.allowDuplicates
      ? []
      : (selectionMode === "append" ? currentValue : []).map(getDropzoneFileIdentity),
  );

  for (const { file, errors } of validatedFiles) {
    if (errors.length > 0) {
      fileRejections.push({ file, errors });
      continue;
    }

    const identity = getDropzoneFileIdentity(file);
    if (!policy?.allowDuplicates && selectedIdentities.has(identity)) {
      fileRejections.push({
        file,
        errors: [
          {
            code: DropzoneErrorCode.FileAlreadySelected,
            message: `File "${file.name}" is already selected.`,
          },
        ],
      });
      continue;
    }

    if (selectedFiles.length >= capacity) {
      fileRejections.push({
        file,
        errors: [{ code: DropzoneErrorCode.TooManyFiles, message: "Too many files." }],
      });
      continue;
    }

    acceptedFiles.push(file);
    selectedFiles.push(file);
    selectedIdentities.add(identity);
  }

  if (selectionMode === "replace" && acceptedFiles.length === 0) {
    return {
      acceptedFiles,
      fileRejections,
      value: currentValue,
      removedFiles: [],
    };
  }

  return {
    acceptedFiles,
    fileRejections,
    value: selectedFiles,
    removedFiles: selectionMode === "replace" ? getRemovedFiles(currentValue, selectedFiles) : [],
  };
}

export function getDropzoneDragVerdict(
  files: readonly DropzoneFileMetadata[] | null,
  currentValue: readonly File[],
  policy: DropzonePolicy | undefined,
  options: DropzoneDragVerdictOptions = {},
): Exclude<DropzoneVisualState, "idle" | "processing"> {
  const selectionMode = getDropzoneSelectionMode(policy);
  const capacity = getDropzoneCapacity(policy);
  if (selectionMode === "append" && currentValue.length >= capacity) return "reject";
  if (!files || files.length === 0) return "unknown";

  const availableSlots = selectionMode === "append" ? capacity - currentValue.length : capacity;
  if (files.length > availableSlots) return "reject";

  const normalizedAccept = normalizeDropzoneAccept(policy?.accept);
  const metadataVerdicts = files.map((file) => getDropzoneMetadataVerdict(file, normalizedAccept, policy));
  if (metadataVerdicts.includes("reject")) return "reject";

  const duplicateVerdict = getDropzoneDuplicateVerdict(files, currentValue, policy, selectionMode);
  if (duplicateVerdict === "reject") return "reject";
  if (
    policy?.validator ||
    options.customExtraction ||
    metadataVerdicts.includes("unknown") ||
    duplicateVerdict === "unknown"
  ) {
    return "unknown";
  }
  return "accept";
}

export function formatDropzoneFileSize(size: number) {
  const safeSize = Number.isFinite(size) && size >= 0 ? size : 0;
  const units = ["B", "KB", "MB", "GB", "TB"];
  if (safeSize === 0) return "0 B";

  const unitIndex = Math.min(Math.floor(Math.log(safeSize) / Math.log(1024)), units.length - 1);
  const value = Math.round((safeSize / 1024 ** unitIndex) * 10) / 10;
  return `${value} ${units[unitIndex]}`;
}

function getFileAcceptance(
  file: Pick<DropzoneFileMetadata, "name" | "type">,
  entries: readonly NormalizedAcceptEntry[],
): FileAcceptance {
  if (entries.length === 0) return "accept";
  const verdicts = entries.map((entry) => getAcceptEntryVerdict(file, entry));
  if (verdicts.includes("accept")) return "accept";
  return verdicts.includes("unknown") ? "unknown" : "reject";
}

function getAcceptEntryVerdict(
  file: Pick<DropzoneFileMetadata, "name" | "type">,
  { mime, extensions }: NormalizedAcceptEntry,
): FileAcceptance {
  if (extensions.length > 0) {
    if (!file.name) return "unknown";
    const name = file.name.toLowerCase();
    return extensions.some((extension) => name.endsWith(extension)) ? "accept" : "reject";
  }

  if (!file.type) return "unknown";
  const type = file.type.toLowerCase();
  const matchesMime = mime.endsWith("/*") ? type.startsWith(mime.slice(0, -1)) : type === mime;
  return matchesMime ? "accept" : "reject";
}

function getDropzoneMetadataVerdict(
  file: DropzoneFileMetadata,
  normalizedAccept: readonly NormalizedAcceptEntry[],
  policy: DropzonePolicy | undefined,
): FileAcceptance {
  const acceptance = getFileAcceptance(file, normalizedAccept);
  if (acceptance === "reject") return "reject";
  if (file.size === undefined) return "unknown";
  if (file.size < (policy?.minSize ?? DEFAULT_POLICY.minSize)) return "reject";
  if (file.size > (policy?.maxSize ?? DEFAULT_POLICY.maxSize)) return "reject";
  return acceptance;
}

function getDropzoneDuplicateVerdict(
  files: readonly DropzoneFileMetadata[],
  currentValue: readonly File[],
  policy: DropzonePolicy | undefined,
  selectionMode: DropzoneSelectionMode,
): FileAcceptance {
  if (policy?.allowDuplicates) return "accept";

  const selectedIdentities = new Set(
    selectionMode === "append" ? currentValue.map(getDropzoneFileIdentity) : [],
  );
  let hasUnknownIdentity = false;
  for (const file of files) {
    if (!hasCompleteIdentity(file)) {
      hasUnknownIdentity = true;
      continue;
    }
    const identity = getDropzoneFileIdentity(file);
    if (selectedIdentities.has(identity)) return "reject";
    selectedIdentities.add(identity);
  }
  return hasUnknownIdentity ? "unknown" : "accept";
}

function isDropzoneErrorList(
  result: DropzoneFileError | readonly DropzoneFileError[],
): result is readonly DropzoneFileError[] {
  return Array.isArray(result);
}

function normalizeValidatorErrors(
  result: DropzoneFileError | readonly DropzoneFileError[],
): readonly DropzoneFileError[] {
  return isDropzoneErrorList(result) ? result : [result];
}

function hasCompleteIdentity(file: DropzoneFileMetadata) {
  return (
    Boolean(file.webkitRelativePath || file.name) &&
    file.size !== undefined &&
    file.type !== undefined &&
    file.lastModified !== undefined
  );
}

function getRemovedFiles(currentValue: readonly File[], nextValue: readonly File[]) {
  const unmatchedNext = [...nextValue];
  return currentValue.filter((file) => {
    const index = unmatchedNext.indexOf(file);
    if (index < 0) return true;
    unmatchedNext.splice(index, 1);
    return false;
  });
}
