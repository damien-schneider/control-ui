import {
  InlineAttachment,
  InlineAttachmentContent,
  InlineAttachmentMedia,
  InlineAttachmentTitle,
} from "@/components/control-ui/inline-attachment";

// Shared demo driver, identical in both sources — twinning explained in chat-message.tsx.
export function InlineAttachmentExample() {
  return (
    <div className="flex justify-end p-6">
      <InlineAttachment name="handwritten-note.jpeg">
        <InlineAttachmentMedia />
        <InlineAttachmentContent>
          <InlineAttachmentTitle />
        </InlineAttachmentContent>
      </InlineAttachment>
    </div>
  );
}
