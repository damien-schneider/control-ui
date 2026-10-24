import { componentStyleClass, componentStyleMessage, controlUiImportPattern, rawTypeClass, rawTypeMessage } from "./class-policy.mjs";

function gritRegex(pattern) {
  return `r"(?s).*(?:${pattern.replaceAll('"', '\\"')}).*"`;
}

function gritString(text) {
  return JSON.stringify(text);
}

const stringTexts = "or { JsxString(), JsStringLiteralExpression(), JsTemplateChunkElement() }";

export function gritRules(importSources = []) {
  return {
    "no-component-style-classes.grit": `language js(typescript, jsx)

or {
  JsxSelfClosingElement(name=$name, attributes=$attributes),
  JsxOpeningElement(name=$name, attributes=$attributes)
} as $element where {
  $name <: r"([A-Z]\\w*)(?:\\.[\\w.]+)?"($component),
  $attributes <: some JsxAttribute(name=\`className\`) as $attr,
  $attr <: contains ${stringTexts} as $text where { $text <: ${gritRegex(componentStyleClass)} },
  $element <: within JsModule() as $module,
  $module <: contains JsImport() as $import where {
    $import <: ${gritRegex(String.raw`from\s+['"]${controlUiImportPattern(importSources)}`)},
    $import <: contains JsIdentifierBinding() as $binding where { $binding <: $component }
  },
  register_diagnostic(span=$attr, message=${gritString(componentStyleMessage)}, severity="error")
}
`,
    "no-raw-type-classes.grit": `language js(typescript, jsx)

JsxAttribute(name=\`className\`) as $attr where {
  $attr <: contains ${stringTexts} as $text where { $text <: ${gritRegex(rawTypeClass)} },
  register_diagnostic(span=$attr, message=${gritString(rawTypeMessage)}, severity="error")
}
`,
  };
}
