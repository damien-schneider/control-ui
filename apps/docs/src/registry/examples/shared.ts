export const noteMarkdown = `# Notes

## Memory / Studio / Platform / Gallery

- Design mode in foreground UI
  - Import in website / other
- Text editor with [?] modes

### Core ideas

- Safe area for text edit
- Resize -> mobile

### Possible components / tools

- Motion / video
- Full-screen
- Mini-browser
- Animation
- Agent slot
- Extension
- Demo / memory stream
- Game slot
- Workflow grid panel / scene / mini
- Predefined memory for vibe

---

# UX / Website Builder

- You always need to branch
  - Less is more
- Hierarchy is the key
  - Think about advanced users
  - Estimate how complex the feature is
  - Check if the user can understand it

---

# Open Question

Should we have rules about what is beautiful design?`;

export const userPrompt = "Can you make a markdown of this note pleas";
export const assistantLead = "Here's the markdown version. Some handwriting is hard to read, so I marked uncertain parts with [?].";
export const assistantCopy = `${assistantLead}\n\n${noteMarkdown}`;

export const codeBlockClientCode = `import {
  CodeBlockEditor,
  CodeBlockEditorActions,
  CodeBlockEditorContent,
  CodeBlockEditorCopy,
  CodeBlockEditorHeader,
  CodeBlockEditorTitle,
} from "@/components/control-ui/code-block-editor";

export function ClientHighlightedToolResult({ json }: { json: string }) {
  return (
    <CodeBlockEditor>
      <CodeBlockEditorHeader>
        <CodeBlockEditorTitle>tool-result.json</CodeBlockEditorTitle>
        <CodeBlockEditorActions>
          <CodeBlockEditorCopy value={json} />
        </CodeBlockEditorActions>
      </CodeBlockEditorHeader>
      <CodeBlockEditorContent code={json} lang="json" />
    </CodeBlockEditor>
  );
}`;

export const codeBlockServerCode = `import {
  CodeBlockEditor,
  CodeBlockEditorActions,
  CodeBlockEditorContent,
  CodeBlockEditorCopy,
  CodeBlockEditorHeader,
  CodeBlockEditorTitle,
} from "@/components/control-ui/code-block-editor";
import { highlightCodeToTokens } from "@/components/control-ui/lib/code-block-shiki";

export async function ServerHighlightedSnippet({ code }: { code: string }) {
  const tokens = await highlightCodeToTokens(code, "tsx");

  return (
    <CodeBlockEditor>
      <CodeBlockEditorHeader>
        <CodeBlockEditorTitle>server-snippet.tsx</CodeBlockEditorTitle>
        <CodeBlockEditorActions>
          <CodeBlockEditorCopy value={code} />
        </CodeBlockEditorActions>
      </CodeBlockEditorHeader>
      <CodeBlockEditorContent code={code} lang="tsx" tokens={tokens} />
    </CodeBlockEditor>
  );
}`;
