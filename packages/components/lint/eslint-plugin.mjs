import { componentStyleClass, componentStyleMessage, controlUiImportPattern, rawTypeClass, rawTypeMessage } from "./class-policy.mjs";

const componentStyle = new RegExp(componentStyleClass);
const rawType = new RegExp(rawTypeClass);

function stringsIn(node) {
  if (Array.isArray(node)) return node.flatMap(stringsIn);
  if (!node || typeof node !== "object") return [];
  if (node.type === "Literal") return typeof node.value === "string" ? [node.value] : [];
  if (node.type === "TemplateElement") return [node.value.cooked ?? node.value.raw];
  return Object.entries(node).flatMap(([key, child]) => (key === "parent" ? [] : stringsIn(child)));
}

function classNameMatches(attribute, pattern) {
  if (attribute.name.name !== "className" || !attribute.value) return false;
  return stringsIn(attribute.value).some((text) => pattern.test(text));
}

function elementRootName(name) {
  if (name.type === "JSXIdentifier") return name.name;
  if (name.type === "JSXMemberExpression") return elementRootName(name.object);
  return undefined;
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

const noComponentStyleClasses = {
  meta: {
    type: "problem",
    docs: { description: "Keep className on Control UI components to layout; the component owns its look." },
    messages: { componentStyle: componentStyleMessage },
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
    return {
      Program(program) {
        controlUiNames = controlUiLocalNames(program, controlUiImport);
      },
      JSXAttribute(attribute) {
        if (!controlUiNames.has(elementRootName(attribute.parent.name))) return;
        if (classNameMatches(attribute, componentStyle)) context.report({ node: attribute, messageId: "componentStyle" });
      },
    };
  },
};

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
    "no-raw-type-classes": noRawTypeClasses,
  },
};

export default plugin;
