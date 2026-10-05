"use client";

import { TaskItem } from "@tiptap/extension-list";
import { closeHistory } from "@tiptap/pm/history";
import { NodeViewContent, type NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Checkbox } from "@/components/control-ui/ui/checkbox";
import { useMarkdownEditor } from "./context";

function MarkdownTaskItemView({ editor, node, getPos }: NodeViewProps) {
  const { disabled } = useMarkdownEditor();
  return (
    <NodeViewWrapper data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="task-item">
      <span contentEditable={false} data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="task-checkbox">
        <Checkbox
          checked={Boolean(node.attrs.checked)}
          disabled={disabled}
          aria-label={node.firstChild?.textContent || "Task item"}
          onCheckedChange={(checked) => {
            const position = getPos();
            if (!editor.isEditable || position === undefined) return;
            editor.view.dispatch(closeHistory(editor.state.tr).setNodeMarkup(position, undefined, { ...node.attrs, checked }));
          }}
        />
      </span>
      <NodeViewContent data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="task-content" />
    </NodeViewWrapper>
  );
}

export const MarkdownTaskItem = TaskItem.extend({
  addNodeView() {
    return ReactNodeViewRenderer(MarkdownTaskItemView, {
      as: "li",
      attrs: ({ node }) => ({ "data-type": "taskItem", "data-checked": String(node.attrs.checked) }),
    });
  },
});
