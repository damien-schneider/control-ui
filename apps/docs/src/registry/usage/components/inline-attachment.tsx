import {
  InlineAttachment,
  InlineAttachmentContent,
  InlineAttachmentMedia,
  InlineAttachmentTitle,
} from "@/components/control-ui/inline-attachment";

export function Example({ url }: { url?: string }) {
  return (
    <InlineAttachment name="app-icon.png" state={url ? "ready" : "pending"} aspect={1}>
      <InlineAttachmentMedia src={url} />
      <InlineAttachmentContent>
        <InlineAttachmentTitle />
      </InlineAttachmentContent>
    </InlineAttachment>
  );
}
