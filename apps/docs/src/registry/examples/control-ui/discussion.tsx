"use client";

import { MoreHorizontalIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { DiscussionComment, DiscussionComposer } from "@/components/control-ui/blocks/discussion";
import type { ChatComposerSubmitPayload } from "@/components/control-ui/hooks/use-chat-composer";
import { Button } from "@/components/control-ui/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/control-ui/ui/dropdown-menu";

type Comment = { id: string; author: string; sentAt: string; timeLabel: string; body: string; edited?: boolean; replies: Comment[] };

const viewerName = "Damien Schneider";

const initialComments: Comment[] = [
  {
    id: "c1",
    author: "Maya Chen",
    sentAt: "2026-10-01T08:10:00Z",
    timeLabel: "about 1 hour ago",
    body: "Our support team would use this daily. Could the predicted label show its confidence so agents know when to double-check?",
    replies: [
      {
        id: "c1r1",
        author: viewerName,
        sentAt: "2026-10-01T08:40:00Z",
        timeLabel: "30 minutes ago",
        body: "Yes. Low-confidence predictions will show a dashed outline and a tooltip with the score.",
        replies: [],
      },
    ],
  },
];

function updateComment(comments: Comment[], id: string, update: (comment: Comment) => Comment | null): Comment[] {
  return comments.flatMap((comment) => {
    if (comment.id === id) return update(comment) ?? [];
    return [{ ...comment, replies: updateComment(comment.replies, id, update) }];
  });
}

function newComment(body: string): Comment {
  return { id: crypto.randomUUID(), author: viewerName, sentAt: new Date().toISOString(), timeLabel: "just now", body, replies: [] };
}

function countComments(comments: Comment[]): number {
  return comments.reduce((total, comment) => total + 1 + countComments(comment.replies), 0);
}

export function DiscussionExample() {
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  function postComment({ value, clear }: ChatComposerSubmitPayload) {
    setComments((current) => [...current, newComment(value)]);
    clear();
  }

  function postReply(parentId: string, { value }: ChatComposerSubmitPayload) {
    setComments((current) =>
      updateComment(current, parentId, (parent) => ({ ...parent, replies: [...parent.replies, newComment(value)] })),
    );
    setReplyingToId(null);
  }

  function saveEdit(id: string, { value }: ChatComposerSubmitPayload) {
    setComments((current) => updateComment(current, id, (comment) => ({ ...comment, body: value, edited: true })));
    setEditingId(null);
  }

  function renderComment(comment: Comment, depth: number) {
    const isOwn = comment.author === viewerName;
    const isEditing = editingId === comment.id;

    return (
      <DiscussionComment
        key={comment.id}
        author={comment.author}
        sentAt={comment.sentAt}
        timeLabel={comment.timeLabel}
        edited={comment.edited}
        onReply={depth === 0 ? () => setReplyingToId(comment.id) : undefined}
        actions={
          isOwn && !isEditing ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="xs" iconOnly aria-label="Comment options">
                    <MoreHorizontalIcon aria-hidden="true" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditingId(comment.id)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setComments((current) => updateComment(current, comment.id, () => null))}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null
        }
        replies={comment.replies.length > 0 ? comment.replies.map((replyComment) => renderComment(replyComment, depth + 1)) : null}
        replyComposer={
          replyingToId === comment.id ? (
            <DiscussionComposer
              label={`Reply to ${comment.author}`}
              placeholder="Write a reply…"
              submitLabel="Reply"
              autoFocus
              onSubmit={(payload) => postReply(comment.id, payload)}
              secondaryAction={
                <Button variant="ghost" size="xs" onClick={() => setReplyingToId(null)}>
                  Cancel
                </Button>
              }
            />
          ) : null
        }
      >
        {isEditing ? (
          <DiscussionComposer
            label="Edit comment"
            defaultValue={comment.body}
            submitLabel="Save"
            hint={null}
            autoFocus
            onSubmit={(payload) => saveEdit(comment.id, payload)}
            secondaryAction={
              <Button variant="ghost" size="xs" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
            }
          />
        ) : (
          <span className="whitespace-pre-wrap">{comment.body}</span>
        )}
      </DiscussionComment>
    );
  }

  return (
    <section aria-labelledby="discussion-heading" className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h2 id="discussion-heading" className="text-label font-semibold">
        Discussion <span className="font-normal text-muted-foreground">({countComments(comments)})</span>
      </h2>
      <DiscussionComposer
        label="Write a comment"
        placeholder="Write a comment…"
        value={draft}
        onValueChange={setDraft}
        onSubmit={postComment}
        secondaryAction={
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDraft("Thanks for the detailed request! We're looking into confidence scores now.")}
          >
            <SparklesIcon aria-hidden="true" />
            Draft reply
          </Button>
        }
      />
      <div className="flex flex-col">{comments.map((comment) => renderComment(comment, 0))}</div>
    </section>
  );
}
