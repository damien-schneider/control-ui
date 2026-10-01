"use client";

import { useState } from "react";
import { DiscussionComment, DiscussionComposer } from "@/components/control-ui/blocks/discussion";

type Comment = { id: string; author: string; createdAt: string; relativeTime: string; body: string };

export default function FeedbackDiscussion({ comments, onPost }: { comments: Comment[]; onPost: (body: string) => Promise<void> }) {
  const [draft, setDraft] = useState("");

  return (
    <section aria-label="Discussion" className="flex flex-col gap-4">
      <DiscussionComposer
        label="Write a comment"
        placeholder="Write a comment…"
        value={draft}
        onValueChange={setDraft}
        onSubmit={async ({ value, clear }) => {
          await onPost(value);
          clear();
        }}
      />
      {comments.map((comment) => (
        <DiscussionComment key={comment.id} author={comment.author} sentAt={comment.createdAt} timeLabel={comment.relativeTime}>
          {comment.body}
        </DiscussionComment>
      ))}
    </section>
  );
}
