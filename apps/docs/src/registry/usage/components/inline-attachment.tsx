import {
  InlineAttachment,
  InlineAttachmentContent,
  InlineAttachmentMedia,
  InlineAttachmentTitle,
} from "@/components/control-ui/inline-attachment";

export function Example() {
  return (
    <InlineAttachment name="note.jpeg">
      <InlineAttachmentMedia />
      <InlineAttachmentContent>
        <InlineAttachmentTitle />
      </InlineAttachmentContent>
    </InlineAttachment>
  );
}
