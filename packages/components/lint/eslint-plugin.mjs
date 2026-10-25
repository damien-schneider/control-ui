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

function referencedNames(node) {
  if (Array.isArray(node)) return node.flatMap(referencedNames);
  if (!node || typeof node !== "object") return [];
  if (node.type === "Identifier") return [node.name];
  if (node.type === "MemberExpression" && !node.computed) return referencedNames(node.object);
  if (node.type === "Property" && !node.computed) return referencedNames(node.value);
  return Object.entries(node).flatMap(([key, child]) => (key === "parent" ? [] : referencedNames(child)));
}

const classLiteralTypes = new Set(["Literal", "TemplateLiteral", "ObjectExpression"]);

function classLiteral(init) {
  const value = init?.type === "TSAsExpression" || init?.type === "TSSatisfiesExpression" ? init.expression : init;
  return classLiteralTypes.has(value?.type) ? value : undefined;
}

function isClassName(attribute) {
  return attribute.name.name === "className" && Boolean(attribute.value);
}

function classNameMatches(attribute, pattern) {
  return isClassName(attribute) && stringsIn(attribute.value).some((text) => pattern.test(text));
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
    const isControlUi = (element) => element !== undefined && controlUiNames.has(elementRootName(element.name));
    const constantClasses = new Map();
    const componentClassNames = [];
    return {
      Program(program) {
        controlUiNames = controlUiLocalNames(program, controlUiImport);
      },
      VariableDeclarator(declarator) {
        const literal = classLiteral(declarator.init);
        if (declarator.parent.kind !== "const" || declarator.id.type !== "Identifier" || !literal) return;
        constantClasses.set(declarator.id.name, [...(constantClasses.get(declarator.id.name) ?? []), ...stringsIn(literal)]);
      },
      JSXAttribute(attribute) {
        if (!isClassName(attribute)) return;
        const element = attribute.parent;
        if (isControlUi(element) || isControlUi(renderPropOwner(element.parent))) componentClassNames.push(attribute);
      },
      "Program:exit"() {
        for (const attribute of componentClassNames) {
          const constants = referencedNames(attribute.value).flatMap((name) => constantClasses.get(name) ?? []);
          if ([...stringsIn(attribute.value), ...constants].some((text) => componentStyle.test(text))) {
            context.report({ node: attribute, messageId: "componentStyle" });
          }
        }
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
