"use client";

import type { KeyboardEvent, ReactNode, RefObject } from "react";
import { useRef } from "react";
import type { OpenChangeEventDetails } from "@/components/control-ui/control-props";
import { Button } from "@/components/control-ui/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  type ComboboxInputProps,
  ComboboxItem,
  ComboboxList,
} from "@/components/control-ui/ui/combobox";
import { Text } from "@/components/control-ui/ui/typography";
import { type FilterBarContextValue, useFilterBarContext } from "./context";
import { allowsCustomValue, fieldOperators, fieldOptions, parseCustomValue } from "./model";
import type { FilterBarDraft, FilterBarField, FilterBarScalar, FilterBarStage } from "./types";

type FilterChoice = { id: string; label: string; ariaLabel?: string; icon?: ReactNode; value?: FilterBarScalar; disabled?: boolean };

function valueChoice(value: FilterBarScalar, label: string): FilterChoice {
  return { id: `${typeof value}:${value}`, value, label };
}

function sameChoice(first: FilterChoice, second: FilterChoice) {
  return first.id === second.id;
}

function valueChoices(field: FilterBarField, query: string) {
  const choices: FilterChoice[] = fieldOptions(field).map((option) => ({
    ...valueChoice(option.value, option.label),
    icon: option.icon,
    disabled: option.disabled,
  }));
  const customValue = allowsCustomValue(field) ? parseCustomValue(field, query) : undefined;
  if (customValue !== undefined && !choices.some((choice) => choice.value === customValue))
    choices.push(valueChoice(customValue, `Use “${customValue}”`));
  return choices;
}

function editorChoices(context: FilterBarContextValue, draft: FilterBarDraft | null): FilterChoice[] {
  if (!draft || draft.stage === "field")
    return context.fields
      .filter((candidate) => fieldOperators(candidate, context.operators).length > 0)
      .map((candidate) => ({ id: candidate.id, label: candidate.label, icon: candidate.icon }));
  const field = context.fields.find((candidate) => candidate.id === draft.fieldId);
  if (!field) return [];
  if (draft.stage === "operator")
    return fieldOperators(field, context.operators).map((operator) => ({
      id: operator.id,
      label: operator.label,
      ariaLabel: operator.ariaLabel,
    }));
  return valueChoices(field, draft.query);
}

function searchLabel(stage: FilterBarStage, field: FilterBarField | undefined) {
  if (stage === "field") return "Filter field";
  if (stage === "operator") return "Filter operator";
  return `${field?.label ?? "Filter"} value`;
}

function statusId(owner: string) {
  return `${owner}-filter-status`;
}

function handleSelection(context: FilterBarContextValue, draft: FilterBarDraft | null, choice: FilterChoice | FilterChoice[] | null) {
  if (!choice || !draft) return;
  const field = context.fields.find((candidate) => candidate.id === draft.fieldId);
  if (draft.stage === "value" && (field?.loading || field?.error)) return;
  if (Array.isArray(choice)) context.selectValues(choice.flatMap((selected) => (selected.value === undefined ? [] : [selected.value])));
  else if (draft.stage === "field") context.selectField(choice.id);
  else if (draft.stage === "operator") context.selectOperator(choice.id);
  else if (choice.value !== undefined) context.commit(choice.value);
}

function handleEditorKeyDown(context: FilterBarContextValue, draft: FilterBarDraft | null, event: KeyboardEvent<HTMLInputElement>) {
  if (event.nativeEvent.isComposing) return false;
  const backwards = event.key === "Escape" || (event.key === "Backspace" && draft?.query === "");
  if (draft && backwards) {
    event.preventDefault();
    event.stopPropagation();
    context.back();
    return true;
  }
  const operator = context.operators.find((candidate) => candidate.id === draft?.operatorId);
  const field = context.fields.find((candidate) => candidate.id === draft?.fieldId);
  const committing = draft?.stage === "value" && operator?.arity === "many" && event.key === "Enter" && (event.metaKey || event.ctrlKey);
  if (!committing || !draft || draft.values.length === 0 || field?.loading || field?.error) return false;
  event.preventDefault();
  context.commit(draft.values);
  return true;
}

function EditorOptions({ field, invalidNumber, owner }: { field?: FilterBarField; invalidNumber: boolean; owner: string }) {
  if (field?.loading || field?.error)
    return (
      <Text as="div" size="caption" id={statusId(owner)} className="p-3">
        {field.error ?? "Loading values…"}
      </Text>
    );
  return (
    <>
      <ComboboxEmpty>{invalidNumber ? "Enter a number, like 42 or 3.5." : "No matching options."}</ComboboxEmpty>
      <ComboboxList<FilterChoice>>
        {(choice) => (
          <ComboboxItem key={choice.id} value={choice} disabled={choice.disabled} aria-label={choice.ariaLabel}>
            <span className="flex min-w-0 items-center gap-2">
              {choice.icon}
              <span className="truncate" title={choice.label}>
                {choice.label}
              </span>
            </span>
          </ComboboxItem>
        )}
      </ComboboxList>
    </>
  );
}

function handleOpenChange(
  context: FilterBarContextValue,
  draft: FilterBarDraft | null,
  anchorRef: RefObject<HTMLInputElement | null> | undefined,
  owner: string,
  open: boolean,
  eventDetails: OpenChangeEventDetails,
) {
  if (open && !draft && anchorRef?.current && eventDetails.reason !== "input-change") context.start(owner, anchorRef.current);
  if (open || !draft) return;
  if (eventDetails.reason === "item-press" || eventDetails.reason === "escape-key") eventDetails.cancel();
  else context.close(false);
}

function editorView(context: FilterBarContextValue, draft: FilterBarDraft | null) {
  const field = context.fields.find((candidate) => candidate.id === draft?.fieldId);
  const operator = context.operators.find((candidate) => candidate.id === draft?.operatorId);
  const stage = draft?.stage ?? "field";
  const many = stage === "value" && operator?.arity === "many";
  const query = draft?.query ?? "";
  const choices = editorChoices(context, draft);
  const selected = (draft?.values ?? []).map(
    (value) => choices.find((choice) => choice.value === value) ?? valueChoice(value, field?.formatValue?.(value) ?? String(value)),
  );
  const customNumber = field?.type === "number" && allowsCustomValue(field);
  const invalidNumber =
    stage === "value" &&
    Boolean(customNumber) &&
    query.trim() !== "" &&
    field !== undefined &&
    parseCustomValue(field, query) === undefined;
  const remote = stage === "value" && field?.optionsMode === "remote";
  const unavailable = stage === "value" && Boolean(field?.loading || field?.error);
  const label = searchLabel(stage, field);
  const described = stage === "value" && Boolean(field?.error);
  return { field, stage, many, query, choices, selected, invalidNumber, remote, unavailable, label, described };
}

export function FilterBarEditor({
  owner,
  mode,
  anchorRef,
  children,
}: {
  owner: string;
  mode: "input" | "button";
  anchorRef?: RefObject<HTMLInputElement | null>;
  children: ReactNode;
}) {
  const context = useFilterBarContext();
  const searchRef = useRef<HTMLInputElement>(null);
  const draft = context.draft?.owner === owner ? context.draft : null;
  const { field, stage, many, query, choices, selected, invalidNumber, remote, unavailable, label, described } = editorView(context, draft);

  const canCommitMany = selected.length > 0 && !unavailable && !context.disabled && !context.readOnly;

  return (
    <Combobox<FilterChoice, boolean>
      items={choices}
      multiple={many}
      value={many ? selected : null}
      inputValue={query}
      open={draft !== null}
      disabled={context.disabled}
      readOnly={context.readOnly}
      modal={false}
      isItemEqualToValue={sameChoice}
      filter={remote ? null : undefined}
      onValueChange={(choice) => handleSelection(context, draft, choice)}
      onInputValueChange={(nextQuery, eventDetails) => {
        if (eventDetails.reason !== "input-change" && eventDetails.reason !== "input-clear") return;
        if (draft) context.setQuery(nextQuery);
        else if (anchorRef?.current) context.start(owner, anchorRef.current, "field", undefined, nextQuery);
      }}
      onOpenChange={(open, eventDetails) => handleOpenChange(context, draft, anchorRef, owner, open, eventDetails)}
    >
      {children}
      <ComboboxContent
        anchor={draft?.anchor}
        initialFocus={mode === "input" ? false : searchRef}
        finalFocus={false}
        className="w-72 max-h-(--available-height) overflow-y-auto"
        onKeyDown={(event) => {
          if (event.key === "Escape" && !event.defaultPrevented) {
            event.preventDefault();
            context.back();
          }
        }}
      >
        {mode === "button" && (
          <div className="p-2">
            <ComboboxInput
              ref={searchRef}
              size="sm"
              aria-label={label}
              aria-describedby={described ? statusId(owner) : undefined}
              placeholder={label}
              inputMode={field?.type === "number" && stage === "value" ? "decimal" : undefined}
              onKeyDown={(event) => handleEditorKeyDown(context, draft, event)}
            />
          </div>
        )}
        <EditorOptions field={stage === "value" ? field : undefined} invalidNumber={invalidNumber} owner={owner} />
        {many && (
          <div className="flex justify-end p-2">
            <Button disabled={!canCommitMany} onClick={() => context.commit(draft?.values ?? [])}>
              Apply
            </Button>
          </div>
        )}
      </ComboboxContent>
    </Combobox>
  );
}

export function FilterBarInlineInput({
  owner,
  inputRef,
  className,
  ...props
}: Omit<ComboboxInputProps, "ref"> & { owner: string; inputRef: RefObject<HTMLInputElement | null> }) {
  const context = useFilterBarContext();
  const draft = context.draft?.owner === owner ? context.draft : null;
  const { label, described } = editorView(context, draft);
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    props.onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    if (handleEditorKeyDown(context, draft, event) || event.currentTarget.value !== "") return;
    const last = context.items.at(-1);
    if (event.key === "Backspace" && !draft && last) {
      event.preventDefault();
      context.remove(last);
    } else context.navigate(event);
  }
  return (
    <ComboboxInput
      ref={inputRef}
      size="sm"
      className={className}
      {...props}
      aria-label={draft ? label : props["aria-label"]}
      aria-describedby={described ? statusId(owner) : props["aria-describedby"]}
      onKeyDown={handleKeyDown}
    />
  );
}
