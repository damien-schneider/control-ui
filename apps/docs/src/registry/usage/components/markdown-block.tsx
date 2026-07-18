import {
  MarkdownBlock,
  MarkdownBlockContent,
  MarkdownBlockCopy,
  MarkdownBlockHeader,
  MarkdownBlockTitle,
} from "@/components/control-ui/markdown-block";

export function Example({ markdown }: { markdown: string }) {
  return (
    <MarkdownBlock code={markdown}>
      <MarkdownBlockHeader>
        <MarkdownBlockTitle />
        <MarkdownBlockCopy />
      </MarkdownBlockHeader>
      <MarkdownBlockContent />
    </MarkdownBlock>
  );
}
