"use client";

import { AlertTriangleIcon, EyeIcon, EyeOffIcon, FileUpIcon, PlusIcon, RotateCcwIcon, SaveIcon, Trash2Icon } from "lucide-react";
import type { ChangeEvent, ClipboardEvent, ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, use, useId } from "react";
import type { FormSubmitEvent } from "@/components/control-ui/control-props";
import {
  type EnvironmentVariableRow,
  type EnvironmentVariablesController,
  type UseEnvironmentVariablesOptions,
  useEnvironmentVariables,
} from "@/components/control-ui/hooks/use-environment-variables";
import type { EnvironmentVariablesKnobStyle } from "@/components/control-ui/knob-contracts/environment-variables-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import {
  collectEnvironmentVariables,
  DUPLICATE_ENVIRONMENT_VARIABLE_MESSAGE,
  rowsToEnvFileText,
} from "@/components/control-ui/lib/env-file";
import { Button } from "@/components/control-ui/ui/button";
import { Input } from "@/components/control-ui/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/control-ui/ui/input-group";

export type EnvironmentVariablesRowErrors = Record<number, { key?: ReactNode; value?: ReactNode }>;

export type EnvironmentVariablesSubmitPayload<TRow extends EnvironmentVariableRow = EnvironmentVariableRow> = {
  rows: TRow[];
  variables: Record<string, string>;
  envFileText: string;
  reset: () => void;
};

/**
 * React context cannot carry Root's TRow, so controller is projected onto row-agnostic surface here.
 * TRow stays exact on Root and onSubmit.
 */
type EnvironmentVariablesRenderController = Omit<EnvironmentVariablesController, "setRows" | "resetRows" | "appendRow"> & {
  resetRows: () => void;
  appendRow: () => void;
};

type EnvironmentVariablesContextValue = {
  editor: EnvironmentVariablesRenderController;
  disabled: boolean;
  readOnly: boolean;
  rowErrors?: EnvironmentVariablesRowErrors;
  keyLabel: ReactNode;
  valueLabel: ReactNode;
  keyPlaceholder: string;
  valuePlaceholder: string;
  duplicateKeyMessage: ReactNode;
};

const EnvironmentVariablesContext = createContext<EnvironmentVariablesContextValue | null>(null);

function useEnvironmentVariablesContext(componentName: string) {
  const context = use(EnvironmentVariablesContext);
  if (!context) throw new Error(`${componentName} must be used inside <EnvironmentVariables.Root>.`);
  return context;
}

export type EnvironmentVariablesRootProps<TRow extends EnvironmentVariableRow = EnvironmentVariableRow> = Omit<
  ComponentProps<"form">,
  "onSubmit"
> & {
  editor: EnvironmentVariablesController<TRow>;
  disabled?: boolean;
  readOnly?: boolean;
  rowErrors?: EnvironmentVariablesRowErrors;
  keyLabel?: ReactNode;
  valueLabel?: ReactNode;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  duplicateKeyMessage?: ReactNode;
  onSubmit?: (payload: EnvironmentVariablesSubmitPayload<TRow>) => void | Promise<void>;
} & { style?: CSSProperties & EnvironmentVariablesKnobStyle };

export function EnvironmentVariablesRoot<TRow extends EnvironmentVariableRow = EnvironmentVariableRow>({
  editor,
  disabled = false,
  readOnly = false,
  rowErrors,
  keyLabel = "Key",
  valueLabel = "Value",
  keyPlaceholder = "OPENAI_API_KEY",
  valuePlaceholder = "sk-...",
  duplicateKeyMessage = DUPLICATE_ENVIRONMENT_VARIABLE_MESSAGE,
  onSubmit,
  className,
  children,
  ...props
}: EnvironmentVariablesRootProps<TRow>) {
  function handleSubmit(event: FormSubmitEvent) {
    if (event.defaultPrevented || !onSubmit) return;

    event.preventDefault();
    if (editor.hasDuplicateKeys) return;

    const rows = editor.getRowsForSubmit();
    const payload = {
      rows,
      variables: collectEnvironmentVariables(rows),
      envFileText: rowsToEnvFileText(rows),
      reset: () => editor.resetRows(rows),
    } satisfies EnvironmentVariablesSubmitPayload<TRow>;

    void onSubmit(payload);
  }

  return (
    <EnvironmentVariablesContext.Provider
      value={{
        editor,
        disabled,
        readOnly,
        rowErrors,
        keyLabel,
        valueLabel,
        keyPlaceholder,
        valuePlaceholder,
        duplicateKeyMessage,
      }}
    >
      <form
        data-control-ui="environment-variables"
        data-control-family="environment-variables"
        data-slot="root"
        data-surface="panel"
        data-disabled={disabled ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        className={cn("flex min-w-0 flex-col", className)}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    </EnvironmentVariablesContext.Provider>
  );
}

export type EnvironmentVariablesProps<TRow extends EnvironmentVariableRow = EnvironmentVariableRow> = Omit<
  EnvironmentVariablesRootProps<TRow>,
  "editor"
> &
  UseEnvironmentVariablesOptions<TRow> & {
    editor?: EnvironmentVariablesController<TRow>;
    title?: ReactNode;
    description?: ReactNode;
    error?: ReactNode;
    submitLabel?: ReactNode;
    resetLabel?: ReactNode;
    addLabel?: ReactNode;
    hideDefaultActions?: boolean;
  };

function EnvironmentVariablesComponent<TRow extends EnvironmentVariableRow = EnvironmentVariableRow>({
  editor: providedEditor,
  initialRows,
  rows,
  onRowsChange,
  createDefaultRow,
  createRow,
  getEditableRows,
  getPreservedRows,
  maxUploadSize,
  title = "Environment variables",
  description,
  error,
  submitLabel = "Save",
  resetLabel = "Reset",
  addLabel = "Add variable",
  hideDefaultActions = false,
  children,
  onSubmit,
  ...props
}: EnvironmentVariablesProps<TRow>) {
  const internalEditor = useEnvironmentVariables({
    initialRows,
    rows,
    onRowsChange,
    createDefaultRow,
    createRow,
    getEditableRows,
    getPreservedRows,
    maxUploadSize,
  });
  const editor = providedEditor ?? internalEditor;

  return (
    <EnvironmentVariablesRoot editor={editor} onSubmit={onSubmit} {...props}>
      {children ?? (
        <>
          <EnvironmentVariablesHeader title={title} description={description} />
          <EnvironmentVariablesToolbar />
          <EnvironmentVariablesUploadError />
          <EnvironmentVariablesRows />
          <EnvironmentVariablesDuplicateKeysError />
          <EnvironmentVariablesMessage error={error} />
          {!hideDefaultActions && (
            <EnvironmentVariablesActions>
              <EnvironmentVariablesAddButton>{addLabel}</EnvironmentVariablesAddButton>
              <div className="flex min-w-0 items-center">
                <EnvironmentVariablesResetButton>{resetLabel}</EnvironmentVariablesResetButton>
                {onSubmit ? <EnvironmentVariablesSubmitButton>{submitLabel}</EnvironmentVariablesSubmitButton> : null}
              </div>
            </EnvironmentVariablesActions>
          )}
        </>
      )}
    </EnvironmentVariablesRoot>
  );
}

export type EnvironmentVariablesHeaderProps = ComponentProps<"div"> & {
  title?: ReactNode;
  description?: ReactNode;
} & { style?: CSSProperties & EnvironmentVariablesKnobStyle };

export function EnvironmentVariablesHeader({ title, description, className, children, ...props }: EnvironmentVariablesHeaderProps) {
  if (children) {
    return (
      <div
        data-control-ui="environment-variables"
        data-control-family="environment-variables"
        data-slot="header"
        className={cn("flex flex-col", className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (!title && !description) return null;

  return (
    <div
      data-control-ui="environment-variables"
      data-control-family="environment-variables"
      data-slot="header"
      className={cn("flex flex-col", className)}
      {...props}
    >
      {title ? (
        <div data-control-ui="environment-variables" data-control-family="environment-variables" data-slot="title">
          {title}
        </div>
      ) : null}
      {description ? (
        <div
          data-control-ui="environment-variables"
          data-control-family="environment-variables"
          data-slot="description"
          className="max-w-2xl"
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}

export type EnvironmentVariablesToolbarProps = ComponentProps<"div"> & { style?: CSSProperties & EnvironmentVariablesKnobStyle };

export function EnvironmentVariablesToolbar({ className, children, ...props }: EnvironmentVariablesToolbarProps) {
  const { readOnly } = useEnvironmentVariablesContext("EnvironmentVariables.Toolbar");
  if (readOnly) return null;

  return (
    <div
      data-control-ui="environment-variables"
      data-control-family="environment-variables"
      data-slot="toolbar"
      className={cn("flex min-w-0 flex-col sm:flex-row sm:items-center", className)}
      {...props}
    >
      {children ?? (
        <>
          <p
            data-control-ui="environment-variables"
            data-control-family="environment-variables"
            data-slot="hint"
            className="min-w-0 flex-1"
          >
            Paste one or more{" "}
            <code data-control-ui="environment-variables" data-control-family="environment-variables" data-slot="hint-code">
              KEY=value
            </code>{" "}
            lines directly into any field.
          </p>
          <EnvironmentVariablesUploadButton />
        </>
      )}
    </div>
  );
}

export type EnvironmentVariablesUploadButtonProps = ComponentProps<typeof Button> & {
  inputLabel?: string;
};

export function EnvironmentVariablesUploadButton({
  inputLabel = "Import .env file",
  children = "Upload .env",
  variant = "surface",
  size = "sm",
  disabled,
  onClick,
  ...props
}: EnvironmentVariablesUploadButtonProps) {
  const { editor, disabled: contextDisabled, readOnly } = useEnvironmentVariablesContext("EnvironmentVariables.UploadButton");
  const inputId = useId();
  const isDisabled = disabled ?? (contextDisabled || readOnly);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    void editor.handleFileUpload(event);
  }

  return (
    <>
      <input
        id={inputId}
        type="file"
        accept=".env,text/plain"
        className="sr-only"
        disabled={isDisabled}
        aria-label={inputLabel}
        onChange={handleChange}
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={isDisabled}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) event.currentTarget.ownerDocument.getElementById(inputId)?.click();
        }}
        {...props}
      >
        <FileUpIcon aria-hidden="true" className="size-3.5" />
        {children}
      </Button>
    </>
  );
}

export type EnvironmentVariablesRowsProps = ComponentProps<"div"> & {
  rowErrors?: EnvironmentVariablesRowErrors;
} & { style?: CSSProperties & EnvironmentVariablesKnobStyle };

export function EnvironmentVariablesRows({ rowErrors, className, children, ...props }: EnvironmentVariablesRowsProps) {
  const { editor, keyLabel, valueLabel, readOnly } = useEnvironmentVariablesContext("EnvironmentVariables.Rows");

  return (
    <div
      data-control-ui="environment-variables"
      data-control-family="environment-variables"
      data-slot="rows"
      className={cn("min-w-0", className)}
      {...props}
    >
      {children ?? (
        <>
          <div
            aria-hidden="true"
            data-control-ui="environment-variables"
            data-control-family="environment-variables"
            data-slot="column-labels"
            className={cn(
              "hidden min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] sm:grid",
              readOnly && "grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]",
            )}
          >
            <span>{keyLabel}</span>
            <span>{valueLabel}</span>
            {!readOnly ? <span className="size-[var(--control-h-sm)]" /> : null}
          </div>
          {editor.rows.map((row, index) => (
            <EnvironmentVariablesRow key={editor.getRowId(index)} row={row} index={index} rowErrors={rowErrors} />
          ))}
        </>
      )}
    </div>
  );
}

export type EnvironmentVariablesRowProps = Omit<ComponentProps<"div">, "children"> & {
  row: EnvironmentVariableRow;
  index: number;
  rowErrors?: EnvironmentVariablesRowErrors;
} & { style?: CSSProperties & EnvironmentVariablesKnobStyle };

export function EnvironmentVariablesRow({ row, index, rowErrors, className, ...props }: EnvironmentVariablesRowProps) {
  const {
    editor,
    disabled,
    readOnly,
    rowErrors: contextRowErrors,
    keyLabel,
    valueLabel,
    keyPlaceholder,
    valuePlaceholder,
    duplicateKeyMessage,
  } = useEnvironmentVariablesContext("EnvironmentVariables.Row");
  const resolvedRowErrors = rowErrors ?? contextRowErrors;
  const keyError = resolvedRowErrors?.[index]?.key ?? (editor.rowHasDuplicateKey(index) ? duplicateKeyMessage : null);
  const valueError = resolvedRowErrors?.[index]?.value;
  const isDisabled = disabled || readOnly;
  const rowId = editor.getRowId(index);
  const keyInputId = `${rowId}-key`;
  const valueInputId = `${rowId}-value`;
  const revealValueLabel = editor.isValueRevealed(index) ? "Hide value" : "Show value";
  const removeRowLabel = `Remove environment variable ${row.key.trim() || index + 1}`;

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    if (editor.handlePaste(index, event.clipboardData.getData("text"))) {
      event.preventDefault();
    }
  }

  return (
    <div
      data-control-ui="environment-variables"
      data-control-family="environment-variables"
      data-slot="row"
      className={cn("relative grid min-w-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]", className)}
      {...props}
    >
      <div className="flex min-w-0 flex-col">
        <label
          data-control-ui="environment-variables"
          data-control-family="environment-variables"
          data-slot="field-label"
          htmlFor={keyInputId}
          className="sm:sr-only"
        >
          {keyLabel}
        </label>
        <Input
          data-control-ui="environment-variables"
          data-control-family="environment-variables"
          data-slot="key-input"
          id={keyInputId}
          size="sm"
          value={row.key}
          placeholder={keyPlaceholder}
          disabled={isDisabled}
          aria-invalid={Boolean(keyError)}
          onChange={(event) => editor.updateRow(index, { key: event.target.value })}
          onPaste={handlePaste}
        />
        {keyError ? (
          <p data-control-ui="environment-variables" data-control-family="environment-variables" data-slot="field-error">
            {keyError}
          </p>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col">
        <label
          data-control-ui="environment-variables"
          data-control-family="environment-variables"
          data-slot="field-label"
          htmlFor={valueInputId}
          className="sm:sr-only"
        >
          {valueLabel}
        </label>
        <InputGroup
          data-control-ui="environment-variables"
          data-control-family="environment-variables"
          data-slot="value-group"
          data-invalid={valueError ? "true" : undefined}
          size="sm"
        >
          <InputGroupInput
            data-control-ui="environment-variables"
            data-control-family="environment-variables"
            data-slot="value-input"
            id={valueInputId}
            value={row.value}
            placeholder={valuePlaceholder}
            disabled={isDisabled}
            aria-invalid={Boolean(valueError)}
            type={editor.isValueRevealed(index) ? "text" : "password"}
            onChange={(event) => editor.updateRow(index, { value: event.target.value })}
            onPaste={handlePaste}
          />
          <InputGroupAddon className="pr-1">
            <Button
              type="button"
              variant="quiet"
              size="sm"
              iconOnly
              disabled={isDisabled}
              aria-label={revealValueLabel}
              title={revealValueLabel}
              onClick={() => editor.toggleValueVisibility(index)}
            >
              {editor.isValueRevealed(index) ? (
                <EyeOffIcon aria-hidden="true" className="size-3.5" />
              ) : (
                <EyeIcon aria-hidden="true" className="size-3.5" />
              )}
            </Button>
          </InputGroupAddon>
        </InputGroup>
        {valueError ? (
          <p data-control-ui="environment-variables" data-control-family="environment-variables" data-slot="field-error">
            {valueError}
          </p>
        ) : null}
      </div>

      {!readOnly ? (
        <Button
          type="button"
          variant="quiet"
          tone="danger"
          size="sm"
          iconOnly
          disabled={disabled}
          aria-label={removeRowLabel}
          title="Remove variable"
          className="absolute top-2 right-1 sm:static sm:justify-self-end sm:self-start"
          onClick={() => editor.removeRow(index)}
        >
          <Trash2Icon aria-hidden="true" className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}

export type EnvironmentVariablesAddButtonProps = ComponentProps<typeof Button>;

export function EnvironmentVariablesAddButton({
  children = "Add variable",
  variant = "surface",
  size = "sm",
  disabled,
  onClick,
  ...props
}: EnvironmentVariablesAddButtonProps) {
  const { editor, disabled: contextDisabled, readOnly } = useEnvironmentVariablesContext("EnvironmentVariables.AddButton");
  if (readOnly) return null;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled ?? contextDisabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) editor.appendRow();
      }}
      {...props}
    >
      <PlusIcon aria-hidden="true" className="size-3.5" />
      {children}
    </Button>
  );
}

export type EnvironmentVariablesResetButtonProps = ComponentProps<typeof Button>;

export function EnvironmentVariablesResetButton({
  children = "Reset",
  variant = "quiet",
  size = "sm",
  disabled,
  onClick,
  ...props
}: EnvironmentVariablesResetButtonProps) {
  const { editor, disabled: contextDisabled, readOnly } = useEnvironmentVariablesContext("EnvironmentVariables.ResetButton");
  if (readOnly) return null;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled ?? (contextDisabled || !editor.isDirty)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) editor.resetRows();
      }}
      {...props}
    >
      <RotateCcwIcon aria-hidden="true" className="size-3.5" />
      {children}
    </Button>
  );
}

export type EnvironmentVariablesSubmitButtonProps = ComponentProps<typeof Button>;

export function EnvironmentVariablesSubmitButton({
  children = "Save",
  variant = "solid",
  tone = "primary",
  size = "sm",
  disabled,
  ...props
}: EnvironmentVariablesSubmitButtonProps) {
  const { editor, disabled: contextDisabled, readOnly } = useEnvironmentVariablesContext("EnvironmentVariables.SubmitButton");
  if (readOnly) return null;

  return (
    <Button
      type="submit"
      variant={variant}
      tone={tone}
      size={size}
      disabled={disabled ?? (contextDisabled || editor.hasDuplicateKeys)}
      {...props}
    >
      <SaveIcon aria-hidden="true" className="size-3.5" />
      {children}
    </Button>
  );
}

export type EnvironmentVariablesActionsProps = ComponentProps<"div"> & { style?: CSSProperties & EnvironmentVariablesKnobStyle };

export function EnvironmentVariablesActions({ className, ...props }: EnvironmentVariablesActionsProps) {
  return (
    <div
      data-control-ui="environment-variables"
      data-control-family="environment-variables"
      data-slot="actions"
      className={cn("flex min-w-0 items-center justify-between", className)}
      {...props}
    />
  );
}

export type EnvironmentVariablesMessageProps = Omit<ComponentProps<"div">, "style"> & {
  error?: ReactNode;
  style?: CSSProperties & EnvironmentVariablesKnobStyle;
};

export function EnvironmentVariablesMessage({ error, className, children, ...props }: EnvironmentVariablesMessageProps) {
  const content = children ?? error;
  if (!content) return null;

  return (
    <div
      role="alert"
      data-control-ui="environment-variables"
      data-control-family="environment-variables"
      data-slot="message"
      className={cn("flex items-start", className)}
      {...props}
    >
      <AlertTriangleIcon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
      <span className="min-w-0">{content}</span>
    </div>
  );
}

export type EnvironmentVariablesDuplicateKeysErrorProps = Omit<EnvironmentVariablesMessageProps, "error"> & {
  message?: ReactNode;
};

export function EnvironmentVariablesDuplicateKeysError({ message, ...props }: EnvironmentVariablesDuplicateKeysErrorProps) {
  const { editor, duplicateKeyMessage } = useEnvironmentVariablesContext("EnvironmentVariables.DuplicateKeysError");
  if (!editor.hasDuplicateKeys) return null;

  return <EnvironmentVariablesMessage error={message ?? duplicateKeyMessage} {...props} />;
}

export type EnvironmentVariablesUploadErrorProps = Omit<EnvironmentVariablesMessageProps, "error">;

export function EnvironmentVariablesUploadError(props: EnvironmentVariablesUploadErrorProps) {
  const { editor } = useEnvironmentVariablesContext("EnvironmentVariables.UploadError");
  return <EnvironmentVariablesMessage error={editor.uploadError} {...props} />;
}

export type EnvironmentVariablesReadOnlyListProps = ComponentProps<"div"> & {
  rows?: readonly EnvironmentVariableRow[];
  emptyMessage?: ReactNode;
} & { style?: CSSProperties & EnvironmentVariablesKnobStyle };

export function EnvironmentVariablesReadOnlyList({
  rows,
  emptyMessage = "No environment variables",
  className,
  children,
  ...props
}: EnvironmentVariablesReadOnlyListProps) {
  const context = use(EnvironmentVariablesContext);
  const resolvedRows = rows ?? context?.editor.rows ?? [];
  const filledRows = resolvedRows.filter((row) => row.key.trim());

  return (
    <div
      data-control-ui="environment-variables"
      data-control-family="environment-variables"
      data-slot="readonly-list"
      className={cn("flex flex-col", className)}
      {...props}
    >
      {children ??
        (filledRows.length > 0 ? (
          filledRows.map((row) => <EnvironmentVariablesReadOnlyItem key={row.key} name={row.key} value={row.value} />)
        ) : (
          <div data-control-ui="environment-variables" data-control-family="environment-variables" data-slot="empty">
            {emptyMessage}
          </div>
        ))}
    </div>
  );
}

export type EnvironmentVariablesReadOnlyItemProps = Omit<ComponentProps<"div">, "style"> & {
  name: ReactNode;
  value?: ReactNode;
  revealed?: boolean;
  style?: CSSProperties & EnvironmentVariablesKnobStyle;
};

export function EnvironmentVariablesReadOnlyItem({
  name,
  value = "********",
  revealed = false,
  className,
  ...props
}: EnvironmentVariablesReadOnlyItemProps) {
  return (
    <div
      data-control-ui="environment-variables"
      data-control-family="environment-variables"
      data-slot="readonly-item"
      className={cn("grid min-w-0 grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]", className)}
      {...props}
    >
      <span
        data-control-ui="environment-variables"
        data-control-family="environment-variables"
        data-slot="readonly-key"
        className="min-w-0 truncate"
      >
        {name}
      </span>
      <span
        data-control-ui="environment-variables"
        data-control-family="environment-variables"
        data-slot="readonly-value"
        className="min-w-0 truncate"
      >
        {revealed ? value : "********"}
      </span>
    </div>
  );
}

export const EnvironmentVariables = Object.assign(EnvironmentVariablesComponent, {
  Root: EnvironmentVariablesRoot,
  Header: EnvironmentVariablesHeader,
  Toolbar: EnvironmentVariablesToolbar,
  UploadButton: EnvironmentVariablesUploadButton,
  UploadError: EnvironmentVariablesUploadError,
  Rows: EnvironmentVariablesRows,
  Row: EnvironmentVariablesRow,
  AddButton: EnvironmentVariablesAddButton,
  ResetButton: EnvironmentVariablesResetButton,
  SubmitButton: EnvironmentVariablesSubmitButton,
  Actions: EnvironmentVariablesActions,
  Message: EnvironmentVariablesMessage,
  DuplicateKeysError: EnvironmentVariablesDuplicateKeysError,
  ReadOnlyList: EnvironmentVariablesReadOnlyList,
  ReadOnlyItem: EnvironmentVariablesReadOnlyItem,
});
