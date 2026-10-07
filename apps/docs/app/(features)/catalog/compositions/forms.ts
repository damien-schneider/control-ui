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
  "input-group": [example("Input with addons", part("InputGroup", part("InputGroupAddon", content("addon content")), part("Input")))],
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
  "emoji-picker": [
    example(
      "Popover emoji picker",
      part(
        "EmojiPicker",
        part("EmojiPickerSearch"),
        part("EmojiPickerCategories"),
        part("EmojiPickerContent", part("EmojiPickerRecent")),
        part("EmojiPickerFooter"),
      ),
    ),
    example(
      "Quick reactions",
      part("PopoverViewport", part("EmojiPickerReactions")),
      "EmojiPickerReactions works without an EmojiPicker root. The app supplies emoji labels and handles selection.",
    ),
    example(
      "Emoji or icon",
      part(
        "EmojiIconPicker",
        part("EmojiIconPickerTabs"),
        part("EmojiIconPickerEmoji", part("EmojiPickerSearch"), part("EmojiPickerContent")),
        part("EmojiIconPickerIcons", part("IconPickerSearch"), part("IconPickerContent")),
      ),
      "Place inside PopoverContent. Each panel owns its selection callback; the host stores the selected symbol and closes the popover.",
    ),
  ],
  "icon-picker": [
    example(
      "Icon grid",
      part("IconPicker", part("IconPickerSearch"), part("IconPickerColors"), part("IconPickerContent")),
      "The app supplies icons, search keywords, and color choices. IconPickerColors controls a separate color value; apply it through --cui-icon-picker-foreground.",
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
          part("ColorPickerArea", part("ColorPickerAreaContrast"), part("ColorPickerAreaThumb")),
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
      "Area, Channels, and Swatches supply their default children when omitted. AreaContrast draws the WCAG threshold for a background over the area.",
    ),
    example(
      "Inline color wheel",
      part("ColorPicker", part("ColorPickerPanel", part("ColorPickerWheel"), part("ColorPickerBrightness"), part("ColorPickerInput"))),
    ),
    example(
      "Inline strips",
      part(
        "ColorPicker",
        part("ColorPickerSwatch"),
        part("ColorPickerHue"),
        part("ColorPickerSaturation"),
        part("ColorPickerBrightness"),
        part("ColorPickerOutput"),
      ),
      "Every strip edits one coordinate of the same color, so parts sit in a toolbar or inspector row without a popup.",
    ),
    example(
      "Gradient stops",
      part(
        "GradientEditor",
        part("GradientEditorPreview"),
        part("GradientEditorTrack", part("GradientEditorStop")),
        part("GradientEditorStopColor"),
        part("GradientEditorTypeSelect"),
        part("GradientEditorInterpolationSelect"),
        part("GradientEditorAngle"),
        part("GradientEditorStopAdd"),
      ),
      "Track renders a stop for each entry; supply children to customize those stops. The value is structured; formatGradient turns it into CSS.",
    ),
  ],
  calendar: [example("Date selection", part("Calendar"))],
} as const;
