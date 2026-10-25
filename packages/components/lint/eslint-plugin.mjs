import {
  componentPartClass,
  componentPartMessage,
  componentStyleClass,
  componentStyleKey,
  componentStyleMessage,
  componentStylePropMessage,
  controlUiImportPattern,
  rawTypeClass,
  rawTypeMessage,
} from "./class-policy.mjs";

const componentStyle = new RegExp(componentStyleClass);
const componentPart = new RegExp(componentPartClass);
const componentStyleProperty = new RegExp(`^(?:${componentStyleKey})$`);
const rawType = new RegExp(rawTypeClass);

function stringsIn(node) {
  if (Array.isArray(node)) return node.flatMap(stringsIn);
  if (!node || typeof node !== "object") return [];
  if (node.type === "Literal") return typeof node.value === "string" ? [node.value] : [];
  if (node.type === "TemplateElement") return [node.value.cooked ?? node.value.raw];
  return Object.entries(node).flatMap(([key, child]) => (key === "parent" ? [] : stringsIn(child)));
}

function referencedNames(node) {
  if (Array.isArray(node)) return node.flatMap(referencedNames);
  if (!node || typeof node !== "object") return [];
  if (node.type === "Identifier") return [node.name];
  if (node.type === "MemberExpression" && !node.computed) return referencedNames(node.object);
  if (node.type === "Property" && !node.computed) return referencedNames(node.value);
  return Object.entries(node).flatMap(([key, child]) => (key === "parent" ? [] : referencedNames(child)));
}

function propertyKeysIn(node) {
  if (Array.isArray(node)) return node.flatMap(propertyKeysIn);
  if (!node || typeof node !== "object") return [];
  const key = node.type === "Property" && !node.computed ? [node.key.name ?? node.key.value] : [];
  return [...key, ...Object.entries(node).flatMap(([name, child]) => (name === "parent" ? [] : propertyKeysIn(child)))];
}

const classLiteralTypes = new Set(["Literal", "TemplateLiteral", "ObjectExpression"]);
const styleLiteralTypes = new Set(["ObjectExpression"]);

function literalOf(init, types) {
  const value = init?.type === "TSAsExpression" || init?.type === "TSSatisfiesExpression" ? init.expression : init;
  return types.has(value?.type) ? value : undefined;
}

function insideRenderProp(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === "JSXAttribute" && parent.name.name === "render") return true;
  }
  return false;
}

function classNameMatches(attribute, pattern) {
  return attribute.name.name === "className" && Boolean(attribute.value) && stringsIn(attribute.value).some((text) => pattern.test(text));
}

function elementRootName(name) {
  if (name.type === "JSXIdentifier") return name.name;
  if (name.type === "JSXMemberExpression") return elementRootName(name.object);
  return undefined;
}

function renderPropOwner(element) {
  const body =
    element.parent.type === "ReturnStatement" && element.parent.parent.type === "BlockStatement" ? element.parent.parent : element;
  const value = body.parent.type === "ArrowFunctionExpression" ? body.parent : element;
  const attribute = value.parent.type === "JSXExpressionContainer" ? value.parent.parent : undefined;
  return attribute?.type === "JSXAttribute" && attribute.name.name === "render" ? attribute.parent : undefined;
}

function controlUiLocalNames(program, controlUiImport) {
  const names = new Set();
  for (const statement of program.body) {
    if (statement.type !== "ImportDeclaration" || statement.importKind === "type") continue;
    if (!controlUiImport.test(statement.source.value)) continue;
    for (const specifier of statement.specifiers) names.add(specifier.local.name);
  }
  return names;
}

function componentAttributeRule({ attribute, description, message, literalTypes, valuesIn, pattern, part }) {
  return {
    meta: {
      type: "problem",
      docs: { description },
      messages: { component: message, ...(part && { part: part.message }) },
      schema: [
        {
          type: "object",
          properties: { importSources: { type: "array", items: { type: "string" } } },
          additionalProperties: false,
        },
      ],
    },
    create(context) {
      const controlUiImport = new RegExp(`^${controlUiImportPattern(context.options[0]?.importSources)}`);
      let controlUiNames = new Set();
      const isControlUi = (element) => element !== undefined && controlUiNames.has(elementRootName(element.name));
      const constants = new Map();
      const checks = [];
      return {
        Program(program) {
          controlUiNames = controlUiLocalNames(program, controlUiImport);
        },
        VariableDeclarator(declarator) {
          const literal = literalOf(declarator.init, literalTypes);
          if (declarator.parent.kind !== "const" || declarator.id.type !== "Identifier" || !literal) return;
          constants.set(declarator.id.name, [...(constants.get(declarator.id.name) ?? []), ...valuesIn(literal)]);
        },
        JSXAttribute(node) {
          if (node.name.name !== attribute || !node.value) return;
          const element = node.parent;
          if (isControlUi(element) || isControlUi(renderPropOwner(element.parent))) {
            checks.push({ node, messageId: "component", pattern });
          } else if (part && !insideRenderProp(node)) {
            checks.push({ node, messageId: "part", pattern: part.pattern });
          }
        },
        "Program:exit"() {
          for (const check of checks) {
            const referenced = referencedNames(check.node.value).flatMap((name) => constants.get(name) ?? []);
            if ([...valuesIn(check.node.value), ...referenced].some((value) => check.pattern.test(value))) {
              context.report({ node: check.node, messageId: check.messageId });
            }
          }
        },
      };
    },
  };
}

const noComponentStyleClasses = componentAttributeRule({
  attribute: "className",
  description: "Keep className on Control UI components to layout, and off their parts; the component owns its look.",
  message: componentStyleMessage,
  literalTypes: classLiteralTypes,
  valuesIn: stringsIn,
  pattern: componentStyle,
  part: { message: componentPartMessage, pattern: componentPart },
});

const noComponentStyleProps = componentAttributeRule({
  attribute: "style",
  description: "Keep style on Control UI components to --cui-* knobs and layout; the component owns its look.",
  message: componentStylePropMessage,
  literalTypes: styleLiteralTypes,
  valuesIn: propertyKeysIn,
  pattern: componentStyleProperty,
});

const noRawTypeClasses = {
  meta: {
    type: "problem",
    docs: { description: "Size text through the Control UI type scale instead of text-* classes." },
    messages: { rawType: rawTypeMessage },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(attribute) {
        if (classNameMatches(attribute, rawType)) context.report({ node: attribute, messageId: "rawType" });
      },
    };
  },
};

const plugin = {
  meta: { name: "control-ui" },
  rules: {
    "no-component-style-classes": noComponentStyleClasses,
    "no-component-style-props": noComponentStyleProps,
    "no-raw-type-classes": noRawTypeClasses,
  },
};

export default plugin;
