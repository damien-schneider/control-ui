import { writeFileSync } from "node:fs";
import path from "node:path";
import { componentStyleClass, componentStyleMessage, controlUiImportPath, rawTypeClass, rawTypeMessage } from "./class-policy.mjs";

function gritRegex(pattern: string) {
  return `r"(?s).*(?:${pattern.replaceAll('"', '\\"')}).*"`;
}

function gritString(text: string) {
  return JSON.stringify(text);
}

const stringTexts = "or { JsxString(), JsStringLiteralExpression(), JsTemplateChunkElement() }";

export const gritRules = {
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
    $import <: ${gritRegex(String.raw`from\s+['"]${controlUiImportPath}`)},
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

if (import.meta.main) {
  for (const [file, source] of Object.entries(gritRules)) writeFileSync(path.join(import.meta.dir, file), source);
}
