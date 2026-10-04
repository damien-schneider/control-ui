import { useState } from "react";
import { createRoot } from "react-dom/client";
import { DiscussionComment, DiscussionComposer } from "@/components/control-ui/blocks/discussion";
import type { MarkdownImageUploader } from "@/components/control-ui/markdown-editor/uploads";

function Fixture() {
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState("");
  const [editing, setEditing] = useState(false);
  const [failPost, setFailPost] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const uploadImage: MarkdownImageUploader = async (file, { signal, onProgress }) => {
    onProgress(25);
    const response = await fetch(`/upload?name=${encodeURIComponent(file.name)}`, { method: "POST", body: file, signal });
    if (!response.ok) throw new Error("Upload unavailable");
    const url = await response.text();
    onProgress(100);
    return { url, alt: file.name };
  };
  return (
    <main style={{ maxWidth: 700, margin: "40px auto" }}>
      <h1>Feedback</h1>
      <DiscussionComposer
        label="Comment"
        format="markdown"
        value={draft}
        onValueChange={setDraft}
        onUploadImage={uploadImage}
        disabled={disabled}
        mentions={[
          { id: "alex", label: "Alex Morgan", href: "/people/alex" },
          { id: "sam", label: "Sam Rivera", href: "/people/sam" },
        ]}
        submitLabel={editing ? "Save" : "Post"}
        onSubmit={async ({ value, clear }) => {
          if (failPost) throw new Error("Post unavailable");
          setSaved(value);
          setEditing(false);
          clear();
        }}
      />
      <output aria-label="Markdown value">{draft}</output>
      <button
        type="button"
        onClick={() => {
          setDraft(saved);
          setEditing(true);
        }}
      >
        Edit saved comment
      </button>
      <button type="button" onClick={() => setFailPost(!failPost)}>
        Toggle post failure
      </button>
      <button type="button" onClick={() => setDraft("<details><summary>More</summary>Preserve me</details>")}>
        Load HTML source
      </button>
      <button type="button" onClick={() => setDraft("External **update**")}>
        Load external value
      </button>
      <button type="button" onClick={() => setDraft("")}>
        Clear draft
      </button>
      <button type="button" onClick={() => setDisabled(!disabled)}>
        Toggle disabled
      </button>
      <button type="button" onClick={() => setDraft("## First\n\nSecond paragraph\n\n- [ ] Third task")}>
        Load blocks
      </button>
      <DiscussionComment author="Tester" sentAt="2026-10-04T10:00:00Z" timeLabel="Now" markdown={saved} />
    </main>
  );
}
const root = document.getElementById("root");
if (root) createRoot(root).render(<Fixture />);
