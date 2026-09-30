import { content, example, part } from "./types";

export const formsCompositions = {
  "filter-bar": [
    example(
      "Button entry",
      part("FilterBar.Root", part("FilterBar.Chips"), part("FilterBar.AddButton"), part("FilterBar.Clear")),
      "The app supplies fields, operators, and controlled filters, and owns evaluation and persistence. Only complete filters reach onValueChange. Operator arity is one by default; many commits an array and none commits null.",
    ),
    example(
      "Inline entry",
      part("FilterBar.Root", part("FilterBar.Chips"), part("FilterBar.Input"), part("FilterBar.Clear")),
      "Input and AddButton can coexist. Escape goes back through the editor and then cancels without changing committed filters. Multiple selections finish with Done or Ctrl/⌘+Enter.",
    ),
    example(
      "Remote values",
      part("FilterBar.Root", part("FilterBar.Chips"), part("FilterBar.AddButton"), part("FilterBar.Clear")),
      "Fields with optionsMode=remote notify onQueryChange with fieldId, operatorId, and query. Supply options, loading, error, and formatValue for persistent labels. The host owns fetching, cancellation, and stale responses.",
    ),
    example(
      "Custom chips",
      part("FilterBar.Root", part("FilterBar.Chips", content("renderChip(item)", part("FilterBar.Chip"))), part("FilterBar.AddButton")),
    ),
  ],
  slider: [example("Value control", part("Slider"))],
  select: [example("Anatomy", part("Select", part("SelectTrigger", part("SelectValue")), part("SelectContent", part("SelectItem"))))],
  switch: [example("On/off control", part("Switch"))],
  input: [example("Text input", part("Input"))],
  "input-group": [
    example("Input with addons", part("InputGroup", part("InputGroupAddon", content("addon content")), part("InputGroupInput"))),
  ],
  dropzone: [
    example(
      "File intake",
      part(
        "Dropzone",
        part("DropzoneInput"),
        part("DropzoneArea", part("DropzoneTrigger"), part("DropzoneOverlay")),
        part("DropzoneFileList", content("file render callback", content("file content"), part("DropzoneRemove"))),
        part("DropzoneRejectionList"),
        part("DropzoneStatus"),
        part("DropzoneClear"),
      ),
    ),
  ],
  "phone-input": [
    example(
      "Country-aware form field",
      part(
        "Field",
        part("FieldLabel"),
        part("FieldControl", content("render prop", part("PhoneInput"))),
        part("FieldDescription"),
        part("FieldError"),
      ),
    ),
  ],
  checkbox: [example("Choice control", part("Checkbox"))],
  "radio-group": [example("Anatomy", part("RadioGroup", part("RadioGroupItem", part("Radio"))))],
  field: [
    example(
      "Labeled control",
      part(
        "FieldSet",
        part("FieldLegend"),
        part(
          "FieldGroup",
          part(
            "Field",
            part("FieldLabel"),
            part("FieldControl", content("render prop", part("Input"))),
            part("FieldDescription"),
            part("FieldError"),
          ),
          part("FieldSeparator"),
        ),
      ),
    ),
    example(
      "Choice card",
      part(
        "Field",
        part("FieldLabel", part("FieldItem", part("Checkbox"), part("FieldContent", part("FieldTitle"), part("FieldDescription")))),
      ),
    ),
  ],
  form: [
    example(
      "Validated form",
      part(
        "Form",
        part("Field", part("FieldLabel"), part("FieldControl", content("render prop", part("Input"))), part("FieldError")),
        part("Button"),
      ),
    ),
  ],
  "native-select": [example("Native options", part("NativeSelect", part("optgroup", part("option"))))],
  textarea: [example("Multiline input", part("Textarea"))],
  "input-otp": [
    example(
      "Custom digit groups",
      part(
        "InputOTP",
        content("first digit group", part("InputOTPSlot")),
        part("InputOTPSeparator"),
        content("remaining digits", part("InputOTPSlot")),
      ),
      "Pass length and separator to generate the slots automatically, or compose indexed slots as children.",
    ),
  ],
  combobox: [
    example(
      "Searchable list",
      part(
        "Combobox",
        part("ComboboxInput"),
        part(
          "ComboboxContent",
          part("ComboboxEmpty"),
          part("ComboboxList", part("ComboboxGroup", part("ComboboxGroupLabel"), part("ComboboxItem"))),
        ),
      ),
      "ComboboxInput includes its trigger by default.",
    ),
    example(
      "Standalone trigger",
      part("Combobox", part("ComboboxTrigger"), part("ComboboxContent", part("ComboboxList", part("ComboboxItem")))),
    ),
  ],
  "checkbox-group": [example("Anatomy", part("CheckboxGroup", part("CheckboxGroupItem", part("Checkbox"))))],
  autocomplete: [
    example(
      "Free-text suggestions",
      part(
        "Autocomplete",
        part("AutocompleteInput"),
        part(
          "AutocompleteContent",
          part("AutocompleteEmpty"),
          part("AutocompleteList", part("AutocompleteGroup", part("AutocompleteGroupLabel"), part("AutocompleteItem"))),
        ),
      ),
      "AutocompleteInput includes its clear button.",
    ),
    example("Separate clear action", part("Autocomplete", part("AutocompleteInput"), part("AutocompleteClear"))),
  ],
  "number-field": [
    example(
      "Anatomy",
      part(
        "NumberField",
        part("NumberFieldScrubArea"),
        part("NumberFieldGroup", part("NumberFieldDecrement"), part("NumberFieldInput"), part("NumberFieldIncrement")),
      ),
    ),
  ],
  "color-picker": [
    example(
      "Popup color editor",
      part(
        "ColorPicker",
        part("ColorPickerTrigger"),
        part("ColorPickerOutput"),
        part(
          "ColorPickerContent",
          part("ColorPickerArea", part("ColorPickerAreaThumb")),
          part("ColorPickerEyeDropper"),
          part("ColorPickerHue"),
          part("ColorPickerAlpha"),
          part("ColorPickerFormatSelect"),
          part("ColorPickerInput"),
          part("ColorPickerChannels", part("ColorPickerChannel")),
          part("ColorPickerContrast"),
          part("ColorPickerSwatches", part("ColorPickerSwatch"), part("ColorPickerSwatchAdd")),
        ),
      ),
      "Area, Channels, and Swatches supply their default children when omitted.",
    ),
    example(
      "Inline color wheel",
      part("ColorPicker", part("ColorPickerPanel", part("ColorPickerWheel"), part("ColorPickerAlpha"), part("ColorPickerInput"))),
    ),
  ],
  "gradient-editor": [
    example(
      "Gradient stops",
      part(
        "GradientEditor",
        part("GradientEditorPreview"),
        part("GradientEditorTrack", part("GradientEditorStop")),
        part("GradientEditorStopColor"),
        part("GradientEditorTypeSelect"),
        part("GradientEditorStopAdd"),
      ),
      "Track renders a stop for each entry; supply children to customize those stops.",
    ),
  ],
  calendar: [example("Date selection", part("Calendar"))],
} as const;
