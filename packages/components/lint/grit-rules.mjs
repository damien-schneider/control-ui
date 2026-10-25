import { componentStyleClass, componentStyleMessage, controlUiImportPattern, rawTypeClass, rawTypeMessage } from "./class-policy.mjs";

function gritRegex(pattern) {
  return `r"(?s).*(?:${pattern.replaceAll('"', '\\"')}).*"`;
}

function gritString(text) {
  return JSON.stringify(text);
}

const stringTexts = `or { JsxString(), JsStringLiteralExpression(), JsTemplateChunkElement(), JsLiteralMemberName() as $memberName where { $memberName <: r"(?s)[\\"'].*" } }`;
const classLiterals = "or { JsStringLiteralExpression(), JsTemplateExpression(), JsObjectExpression() }";
const renderedTag = "or { JsxTagExpression(tag=$tag), JsParenthesizedExpression(expression=JsxTagExpression(tag=$tag)) }";

const styled = gritRegex(componentStyleClass);
const styledClassName = `$attr <: or {
    contains ${stringTexts} as $text where { $text <: ${styled} },
    contains JsReferenceIdentifier() as $reference where {
      $reference <: r"(.+)"($referenced),
      $module <: contains JsVariableDeclaration(declarators=$declarators) as $declaration where {
        $declaration <: r"(?s)const\\s.*",
        $declarators <: some JsVariableDeclarator(id=$referenced, initializer=JsInitializerClause(expression=$value)),
        $value <: or { ${classLiterals}, TsAsExpression(expression=${classLiterals}), TsSatisfiesExpression(expression=${classLiterals}) },
        $value <: contains ${stringTexts} as $constText where { $constText <: ${styled} }
      }
    }
  }`;

function importedFromControlUi(component, importSources, suffix = "") {
  return `$module <: contains JsImport() as $import${suffix} where {
    $import${suffix} <: ${gritRegex(String.raw`from\s+['"]${controlUiImportPattern(importSources)}`)},
    $import${suffix} <: contains JsIdentifierBinding() as $binding${suffix} where { $binding${suffix} <: ${component} }
  }`;
}

export function gritRules(importSources = []) {
  return {
    "no-component-style-classes.grit": `language js(typescript, jsx)

or {
  or {
    JsxSelfClosingElement(name=$name, attributes=$attributes),
    JsxOpeningElement(name=$name, attributes=$attributes)
  } where {
    $attributes <: some JsxAttribute(name=\`className\`) as $attr
  },
  JsxAttribute(name=\`render\`, initializer=JsxAttributeInitializerClause(value=JsxExpressionAttributeValue(expression=$rendered))) as $render where {
    $rendered <: or {
      JsxTagExpression(tag=$tag),
      JsArrowFunctionExpression(body=or {
        ${renderedTag},
        JsFunctionBody(statements=some JsReturnStatement(argument=${renderedTag}))
      })
    },
    $tag <: or {
      JsxSelfClosingElement(name=$renderedName, attributes=$renderedAttributes),
      JsxElement(opening_element=JsxOpeningElement(name=$renderedName, attributes=$renderedAttributes))
    },
    $renderedAttributes <: some JsxAttribute(name=\`className\`) as $attr,
    $render <: within or { JsxSelfClosingElement(name=$name), JsxOpeningElement(name=$name) },
    $render <: within JsModule() as $module,
    $renderedName <: r"([^.]+).*"($renderedComponent),
    not ${importedFromControlUi("$renderedComponent", importSources, "Rendered")}
  }
} where {
  $name <: r"([A-Z]\\w*)(?:\\.[\\w.]+)?"($component),
  $attr <: within JsModule() as $module,
  ${styledClassName},
  ${importedFromControlUi("$component", importSources)},
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
