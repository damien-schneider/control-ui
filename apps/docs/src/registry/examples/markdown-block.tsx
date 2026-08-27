import {
  MarkdownBlock,
  MarkdownBlockContent,
  MarkdownBlockCopy,
  MarkdownBlockHeader,
  MarkdownBlockTitle,
} from "@/components/control-ui/markdown-block";
import { noteMarkdown } from "@/src/registry/examples/shared";

// Shared demo driver, identical in both sources — twinning explained in chat-message.tsx.
export function MarkdownBlockExample() {
  return (
    <div>
      <MarkdownBlock code={noteMarkdown}>
        <MarkdownBlockHeader>
          <MarkdownBlockTitle />
          <MarkdownBlockCopy />
        </MarkdownBlockHeader>
        <MarkdownBlockContent />
      </MarkdownBlock>
    </div>
  );
}
