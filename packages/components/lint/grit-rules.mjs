import {
  componentPartClass,
  componentPartCssMessage,
  componentPartMessage,
  componentPartSelector,
  componentStyleClass,
  componentStyleKey,
  componentStyleMessage,
  componentStylePropMessage,
  controlUiImportPattern,
  paintProperty,
  rawTypeClass,
  rawTypeMessage,
} from "./class-policy.mjs";

function gritRegex(pattern) {
  return `r"(?s).*(?:${pattern.replaceAll('"', '\\"')}).*"`;
}

function gritExactRegex(pattern) {
  return `r"${pattern.replaceAll('"', '\\"')}"`;
}

function gritString(text) {
  return JSON.stringify(text);
}

const stringTexts = (name) =>
  `or { JsxString(), JsStringLiteralExpression(), JsTemplateChunkElement(), JsLiteralMemberName() as $${name}Member where { $${name}Member <: r"(?s)[\\"'].*" } }`;
const classLiterals = "or { JsStringLiteralExpression(), JsTemplateExpression(), JsObjectExpression() }";
const renderedTag = "or { JsxTagExpression(tag=$tag), JsParenthesizedExpression(expression=JsxTagExpression(tag=$tag)) }";
const componentName = `r"([A-Z]\\w*)(?:\\.[\\w.]+)?"`;

function constantMatches(reference, literals, offends) {
  return `contains JsReferenceIdentifier() as $${reference} where {
      $${reference} <: r"(.+)"($${reference}Name),
      $module <: contains JsVariableDeclaration(declarators=$${reference}Declarators) as $${reference}Declaration where {
        $${reference}Declaration <: r"(?s)const\\s.*",
        $${reference}Declarators <: some JsVariableDeclarator(id=$${reference}Name, initializer=JsInitializerClause(expression=$${reference}Value)),
        $${reference}Value <: or { ${literals}, TsAsExpression(expression=${literals}), TsSatisfiesExpression(expression=${literals}) },
        $${reference}Value <: ${offends}
      }
    }`;
}

function classNameMatches(attribute, pattern) {
  const offending = (prefix) => `contains ${stringTexts(prefix)} as $${prefix}Text where { $${prefix}Text <: ${gritRegex(pattern)} }`;
  const name = attribute.slice(1);
  return `${attribute} <: or {
    ${offending(name)},
    ${constantMatches(`${name}Constant`, classLiterals, offending(`${name}Constant`))}
  }`;
}

function styleMatches(attribute) {
  const offending = (prefix) =>
    `contains or { JsPropertyObjectMember(name=$${prefix}Key), JsShorthandPropertyObjectMember(name=$${prefix}Key) } where { $${prefix}Key <: ${gritExactRegex(componentStyleKey)} }`;
  const name = attribute.slice(1);
  return `${attribute} <: or {
    ${offending(name)},
    ${constantMatches(`${name}Constant`, "JsObjectExpression()", offending(`${name}Constant`))}
  }`;
}

function importedFromControlUi(component, importSources, suffix = "") {
  return `$module <: contains JsImport() as $import${suffix} where {
    $import${suffix} <: ${gritRegex(String.raw`from\s+['"]${controlUiImportPattern(importSources)}`)},
    $import${suffix} <: contains JsIdentifierBinding() as $binding${suffix} where { $binding${suffix} <: ${component} }
  }`;
}

function componentAttributePattern({ attribute, offends, message, importSources }) {
  return `or {
    or {
      JsxSelfClosingElement(name=$name, attributes=$attributes),
      JsxOpeningElement(name=$name, attributes=$attributes)
    } where {
      $attributes <: some JsxAttribute(name=\`${attribute}\`) as $attr
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
      $renderedAttributes <: some JsxAttribute(name=\`${attribute}\`) as $attr,
      $render <: within or { JsxSelfClosingElement(name=$name), JsxOpeningElement(name=$name) },
      $render <: within JsModule() as $module,
      $renderedName <: r"([^.]+).*"($renderedComponent),
      not ${importedFromControlUi("$renderedComponent", importSources, "Rendered")}
    }
  } where {
    $name <: ${componentName}($component),
    $attr <: within JsModule() as $module,
    ${offends("$attr")},
    ${importedFromControlUi("$component", importSources)},
    register_diagnostic(span=$attr, message=${gritString(message)}, severity="error")
  }`;
}

function partClassPattern(importSources) {
  return `or {
    JsxSelfClosingElement(name=$plainName, attributes=$plainAttributes),
    JsxOpeningElement(name=$plainName, attributes=$plainAttributes)
  } where {
    $plainAttributes <: some JsxAttribute(name=\`className\`) as $plainAttr,
    not $plainAttr <: within JsxAttribute(name=\`render\`),
    $plainAttr <: within JsModule() as $module,
    ${classNameMatches("$plainAttr", componentPartClass)},
    not and {
      $plainName <: ${componentName}($plainComponent),
      ${importedFromControlUi("$plainComponent", importSources, "Plain")}
    },
    register_diagnostic(span=$plainAttr, message=${gritString(componentPartMessage)}, severity="error")
  }`;
}

const partSubject = gritExactRegex(componentPartSelector);
const enclosingRule = (selectors) => `or { CssQualifiedRule(prelude=${selectors}), CssNestedQualifiedRule(prelude=${selectors}) }`;

export function gritRules(importSources = []) {
  return {
    "no-component-style-classes.grit": `language js(typescript, jsx)

or {
  ${componentAttributePattern({
    attribute: "className",
    offends: (attribute) => classNameMatches(attribute, componentStyleClass),
    message: componentStyleMessage,
    importSources,
  })},
  ${partClassPattern(importSources)}
}
`,
    "no-component-style-props.grit": `language js(typescript, jsx)

${componentAttributePattern({ attribute: "style", offends: styleMatches, message: componentStylePropMessage, importSources })}
`,
    "no-component-part-css.grit": `language css

or {
  CssGenericProperty(name=$property) as $paint where { $property <: ${gritExactRegex(`(?i)${paintProperty}`)} },
  CssAtRule() as $paint where { $paint <: r"(?s)@apply\\s.*", $paint <: ${gritRegex(componentStyleClass)} }
} where {
  $paint <: within ${enclosingRule("$selectors")} as $rule,
  or {
    $selectors <: some ${partSubject},
    and {
      $selectors <: some r"\\s*&[^\\s>+~]*\\s*",
      $rule <: within ${enclosingRule("$outer")} where { $outer <: some ${partSubject} }
    }
  },
  register_diagnostic(span=$paint, message=${gritString(componentPartCssMessage)}, severity="error")
}
`,
    "no-raw-type-classes.grit": `language js(typescript, jsx)

JsxAttribute(name=\`className\`) as $attr where {
  $attr <: contains ${stringTexts("attr")} as $text where { $text <: ${gritRegex(rawTypeClass)} },
  register_diagnostic(span=$attr, message=${gritString(rawTypeMessage)}, severity="error")
}
`,
  };
}
