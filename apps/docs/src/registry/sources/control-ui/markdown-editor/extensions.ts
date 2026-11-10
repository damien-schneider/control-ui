import { Extension, type Extensions, type JSONContent, Node } from "@tiptap/core";
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

export type MarkdownUrlKind = "link" | "image";
/** Decides which URLs the editor keeps. Content with a refused URL stays in source mode, so nothing is dropped. */
export type MarkdownUrlPolicy = (url: string, kind: MarkdownUrlKind) => boolean;

/** Web apps only keep URLs that still resolve after a reload: HTTP(S), mailto, root-relative paths and anchors. */
export const persistentUrlPolicy: MarkdownUrlPolicy = (url, kind) => isEditorUrl(url, kind === "image");

export type MarkdownExtensionOptions = {
  /** Extra TipTap extensions, applied after the built-in Markdown set. */
  extensions?: Extensions;
  isUrlAllowed?: MarkdownUrlPolicy;
};

function safeImage(isUrlAllowed: MarkdownUrlPolicy) {
  return Image.extend({
    renderMarkdown: (node) => {
      const src = String(node.attrs?.src ?? "").replace(/[()]/g, (character) => `\\${character}`);
      const alt = String(node.attrs?.alt ?? "").replace(/[\\[\]]/g, (character) => `\\${character}`);
      const title = String(node.attrs?.title ?? "").replace(/[\\"]/g, (character) => `\\${character}`);
      return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
    },
    // a pasted image with a refused URL would save as "![alt]()" and force the whole document into source mode
    parseHTML() {
      return [
        {
          tag: 'img[src]:not([src^="data:"])',
          getAttrs: (element) => (isUrlAllowed(element.getAttribute("src") ?? "", "image") ? null : false),
        },
      ];
    },
    addAttributes() {
      return {
        ...this.parent?.(),
        src: {
          default: null,
          parseHTML: (element) => {
            const src = element.getAttribute("src") ?? "";
            return isUrlAllowed(src, "image") ? src : null;
          },
          renderHTML: (attributes) => ({ src: isUrlAllowed(attributes.src ?? "", "image") ? attributes.src : undefined }),
        },
      };
    },
  });
}

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

export function markdownExtensions({ extensions = [], isUrlAllowed = persistentUrlPolicy }: MarkdownExtensionOptions = {}) {
  return [
    StarterKit.configure({
      underline: false,
      paragraph: false,
      link: { openOnClick: false, isAllowedUri: (url) => isUrlAllowed(url, "link") },
    }),
    MarkdownParagraph,
    MarkdownHeadings,
    safeImage(isUrlAllowed).configure({ allowBase64: false, inline: true }),
    TaskList,
    MarkdownTaskItem.configure({ nested: true, HTMLAttributes: { "data-type": "taskItem" } }),
    TableKit.configure({ table: { resizable: false } }),
    ImageUpload,
    Markdown,
    ...extensions,
  ];
}

export function createMarkdownCodec(options?: MarkdownExtensionOptions) {
  return new MarkdownManager({ extensions: markdownExtensions(options) });
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

function unsupportedToken(value: unknown, isUrlAllowed: MarkdownUrlPolicy): boolean {
  if (Array.isArray(value)) return value.some((item) => unsupportedToken(item, isUrlAllowed));
  if (typeof value !== "object" || value === null) return false;
  if ("type" in value && typeof value.type === "string") {
    if (!supportedTokens.has(value.type)) return true;
    if (
      (value.type === "image" || value.type === "link") &&
      "href" in value &&
      typeof value.href === "string" &&
      !isUrlAllowed(value.href, value.type)
    )
      return true;
  }
  return Object.values(value).some((item) => unsupportedToken(item, isUrlAllowed));
}

export function requiresMarkdownSource(
  markdown: string,
  codec: MarkdownManager,
  isUrlAllowed: MarkdownUrlPolicy = persistentUrlPolicy,
): boolean {
  return unsupportedToken(codec.instance.lexer(markdown), isUrlAllowed);
}

export function hasMarkdownContent(document: JSONContent): boolean {
  if (document.type === "image") return true;
  if (document.type === "text" && document.text?.trim()) return true;
  return document.content?.some(hasMarkdownContent) ?? false;
}
