import {
  CodeBlockEditor,
  CodeBlockEditorActions,
  CodeBlockEditorContent,
  CodeBlockEditorCopy,
  CodeBlockEditorHeader,
  CodeBlockEditorTextarea,
  CodeBlockEditorTitle,
} from "@/components/control-ui/code-block-editor";
import { highlightCodeToTokens } from "@/components/control-ui/lib/code-block-shiki";

export async function ServerHighlightedSnippet({ code }: { code: string }) {
  const tokens = await highlightCodeToTokens(code, "tsx");

  return (
    <CodeBlockEditor>
      <CodeBlockEditorHeader>
        <CodeBlockEditorTitle>agent-step.tsx</CodeBlockEditorTitle>
        <CodeBlockEditorActions>
          <CodeBlockEditorCopy value={code} />
        </CodeBlockEditorActions>
      </CodeBlockEditorHeader>
      <CodeBlockEditorContent code={code} lang="tsx" tokens={tokens} />
    </CodeBlockEditor>
  );
}

export function ClientHighlightedSnippet({ json }: { json: string }) {
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
}

export function EditableSnippet({ code }: { code: string }) {
  return (
    <CodeBlockEditor>
      <CodeBlockEditorHeader>
        <CodeBlockEditorTitle>scratch.tsx</CodeBlockEditorTitle>
      </CodeBlockEditorHeader>
      <CodeBlockEditorTextarea defaultValue={code} fileName="scratch.tsx" />
    </CodeBlockEditor>
  );
}
