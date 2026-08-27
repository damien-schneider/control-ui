import {
  InlineAttachment,
  InlineAttachmentContent,
  InlineAttachmentMedia,
  InlineAttachmentTitle,
} from "@/components/control-ui/inline-attachment";

export function InlineAttachmentExample() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-4">
      <InlineAttachment name="handwritten-note.jpeg">
        <InlineAttachmentMedia />
        <InlineAttachmentContent>
          <InlineAttachmentTitle />
        </InlineAttachmentContent>
      </InlineAttachment>

      <InlineAttachment name="app-icon.png" state="pending" aspect={1} className="max-w-48">
        <InlineAttachmentMedia />
      </InlineAttachment>
    </div>
  );
}
