import { Decoration, type DecorationSet, type EditorView, MatchDecorator, ViewPlugin, type ViewUpdate } from "@codemirror/view";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { MarkdownEditorSuggestions } from "@/components/control-ui/markdown-editor/suggestions";
import { MarkdownEditorToolbar, MarkdownEditorUploads } from "@/components/control-ui/markdown-editor/toolbar";
import type { MarkdownImageUploader } from "@/components/control-ui/markdown-editor/uploads";
import { MarkdownEditor, MarkdownEditorContent } from "@/components/control-ui/markdown-editor-live";

const drafts = {
  "Load blocks": "## First\n\nSecond paragraph\n\n- [ ] Third task",
  "Load table":
    "| Need | Start with | Decision |\n| --- | --- | --- |\n| Launch | Framer | Connect proof |\n| Demo | Vectors | Return to UI |\n| Film | Analytics | Several proofs |",
  "Load unusual Markdown": "* starred item\n\n__bold__ and _em_\n\n<details><summary>More</summary>Preserve me</details>",
  "Load inline markup": "Some **bold** text\n\nSecond line",
  "Load external value": "External **update**",
  "Clear draft": "",
};

const proofMarks = new MatchDecorator({ regexp: /\bproof\b/g, decoration: Decoration.mark({ class: "proof-mark" }) });
const highlightProof = ViewPlugin.fromClass(
  class {
    marks: DecorationSet;
    constructor(view: EditorView) {
      this.marks = proofMarks.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.marks = proofMarks.updateDeco(update, this.marks);
    }
  },
  { decorations: (plugin) => plugin.marks },
);

const uploadImage: MarkdownImageUploader = async (file, { signal, onProgress }) => {
  onProgress(25);
  const response = await fetch(`/upload?name=${encodeURIComponent(file.name)}`, { method: "POST", body: file, signal });
  if (!response.ok) throw new Error("Upload unavailable");
  const url = await response.text();
  onProgress(100);
  return { url, alt: file.name };
};

function Fixture() {
  const [draft, setDraft] = useState("");
  const [disabled, setDisabled] = useState(false);
  return (
    <main style={{ maxWidth: 700, margin: "40px auto" }}>
      <MarkdownEditor value={draft} onValueChange={setDraft} onUploadImage={uploadImage} disabled={disabled} extensions={highlightProof}>
        <MarkdownEditorToolbar />
        <MarkdownEditorContent label="Comment" />
        <MarkdownEditorSuggestions
          mentions={[
            { id: "alex", label: "Alex Morgan", href: "/people/alex" },
            { id: "sam", label: "Sam Rivera", href: "/people/sam" },
          ]}
        />
        <MarkdownEditorUploads />
      </MarkdownEditor>
      <output aria-label="Markdown value" style={{ whiteSpace: "pre" }}>
        {draft}
      </output>
      {Object.entries(drafts).map(([label, markdown]) => (
        <button key={label} type="button" onClick={() => setDraft(markdown)}>
          {label}
        </button>
      ))}
      <button type="button" onClick={() => setDisabled(!disabled)}>
        Toggle disabled
      </button>
    </main>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<Fixture />);
