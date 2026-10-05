import { Extension, type JSONContent, Node } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { TaskList } from "@tiptap/extension-list";
import Paragraph from "@tiptap/extension-paragraph";
import { TableKit } from "@tiptap/extension-table";
import { Markdown, MarkdownManager } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import { markdownHeadingAttributes } from "@/components/control-ui/ui/markdown-heading";
import { MarkdownTaskItem } from "./task-item";

const MarkdownHeadings = Extension.create({
  name: "markdownHeadings",
  addGlobalAttributes() {
    return [
      {
        types: ["heading"],
        attributes: {
          markdownHeading: {
            default: null,
            renderHTML: (attributes) =>
              markdownHeadingAttributes(([1, 2, 3, 4, 5, 6] as const).find((level) => level === attributes.level) ?? 1),
          },
        },
      },
    ];
  },
});

export function isEditorUrl(value: string, image = false): boolean {
  if (!value || /[\s\\]/.test(value) || Array.from(value).some((character) => character.charCodeAt(0) < 32)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (!image && value.startsWith("#")) return true;
  try {
    const url = new URL(value);
    return ["https:", "http:", ...(image ? [] : ["mailto:"])].includes(url.protocol);
  } catch {
    return false;
  }
}

const SafeImage = Image.extend({
  renderMarkdown: (node) => {
    const src = String(node.attrs?.src ?? "").replace(/[()]/g, (character) => `\\${character}`);
    const alt = String(node.attrs?.alt ?? "").replace(/[\\[\]]/g, (character) => `\\${character}`);
    const title = String(node.attrs?.title ?? "").replace(/[\\"]/g, (character) => `\\${character}`);
    return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element) => {
          const src = element.getAttribute("src") ?? "";
          return isEditorUrl(src, true) ? src : null;
        },
        renderHTML: (attributes) => ({ src: isEditorUrl(attributes.src ?? "", true) ? attributes.src : undefined }),
      },
    };
  },
});

const MarkdownParagraph = Paragraph.extend({
  parseMarkdown: (token, helpers) => {
    const content = helpers.parseInline(token.tokens ?? []);
    const first = content[0];
    const empty = content.length === 1 && first?.type === "text" && ["&nbsp;", "\u00a0"].includes(first.text ?? "");
    return helpers.createNode("paragraph", undefined, empty ? [] : content);
  },
});

export const ImageUpload = Node.create({
  name: "imageUpload",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes: () => ({ id: { default: null }, name: { default: "Image" } }),
  renderHTML: ({ node }) => ["div", { "data-image-upload": "", role: "status" }, `Image: ${node.attrs.name}`],
  renderMarkdown: () => "",
});

export function markdownExtensions() {
  return [
    StarterKit.configure({
      underline: false,
      paragraph: false,
      link: { openOnClick: false, isAllowedUri: (url) => isEditorUrl(url) },
    }),
    MarkdownParagraph,
    MarkdownHeadings,
    SafeImage.configure({ allowBase64: false, inline: true }),
    TaskList,
    MarkdownTaskItem.configure({ nested: true, HTMLAttributes: { "data-type": "taskItem" } }),
    TableKit.configure({ table: { resizable: false } }),
    ImageUpload,
    Markdown,
  ];
}

export function createMarkdownCodec() {
  return new MarkdownManager({ extensions: markdownExtensions() });
}

const supportedTokens = new Set([
  "space",
  "code",
  "heading",
  "hr",
  "blockquote",
  "list",
  "list_item",
  "paragraph",
  "text",
  "escape",
  "link",
  "image",
  "strong",
  "em",
  "codespan",
  "br",
  "del",
  "table",
  "def",
  "taskList",
  "taskItem",
]);

function unsupportedToken(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(unsupportedToken);
  if (typeof value !== "object" || value === null) return false;
  if ("type" in value && typeof value.type === "string") {
    if (!supportedTokens.has(value.type)) return true;
    if (
      (value.type === "image" || value.type === "link") &&
      "href" in value &&
      typeof value.href === "string" &&
      !isEditorUrl(value.href, value.type === "image")
    )
      return true;
  }
  return Object.values(value).some(unsupportedToken);
}

export function requiresMarkdownSource(markdown: string, codec: MarkdownManager): boolean {
  return unsupportedToken(codec.instance.lexer(markdown));
}

export function hasMarkdownContent(document: JSONContent): boolean {
  if (document.type === "image") return true;
  if (document.type === "text" && document.text?.trim()) return true;
  return document.content?.some(hasMarkdownContent) ?? false;
}
