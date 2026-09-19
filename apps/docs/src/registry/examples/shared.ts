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

export const codeClientSnippet = `import { Code, CodeActions, CodeContent, CodeCopy, CodeHeader, CodeTitle } from "@/components/control-ui/ui/code";

export function ClientHighlightedToolResult({ json }: { json: string }) {
  return (
    <Code>
      <CodeHeader>
        <CodeTitle>tool-result.json</CodeTitle>
        <CodeActions>
          <CodeCopy value={json} />
        </CodeActions>
      </CodeHeader>
      <CodeContent code={json} lang="json" />
    </Code>
  );
}`;

export const codeServerSnippet = `import { highlightToTokens } from "@/components/control-ui/lib/code-tokens";
import { Code, CodeActions, CodeContent, CodeCopy, CodeHeader, CodeTitle } from "@/components/control-ui/ui/code";

export async function ServerHighlightedSnippet({ code }: { code: string }) {
  const tokens = await highlightToTokens(code, "tsx");

  return (
    <Code>
      <CodeHeader>
        <CodeTitle>server-snippet.tsx</CodeTitle>
        <CodeActions>
          <CodeCopy value={code} />
        </CodeActions>
      </CodeHeader>
      <CodeContent code={code} lang="tsx" tokens={tokens} />
    </Code>
  );
}`;
