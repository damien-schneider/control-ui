"use client";

import { useRender } from "@base-ui/react/use-render";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMarkdownEditor } from "./markdown-editor/context";
import { MarkdownEditorDragHandle } from "./markdown-editor/drag/drag-handle";
import { createLiveEditor, type LiveEditor } from "./markdown-editor/live/live-engine";
import { LiveTaskCheckboxes } from "./markdown-editor/live/preview/task-checkboxes";
import { TaskCheckboxes } from "./markdown-editor/live/preview/widgets";
import { type MarkdownEditorContentProps, MarkdownEditorRoot, type MarkdownEditorRootProps } from "./markdown-editor/root";
import { MarkdownEditorSourceView } from "./markdown-editor/source-view";
import { MarkdownEditorTableControls } from "./markdown-editor/table/table-controls";
import { persistentUrlPolicy } from "./markdown-editor/url-policy";

export type {
  MarkdownEditorContentProps,
  MarkdownEditorRootProps as MarkdownEditorProps,
  MarkdownEditorStatus,
} from "./markdown-editor/root";

const LiveEditorContext = createContext<{ live: LiveEditor | null; tasks: TaskCheckboxes } | null>(null);

function useLiveEditor() {
  const context = useContext(LiveEditorContext);
  if (!context) throw new Error("MarkdownEditorContent requires a MarkdownEditor parent from the same module.");
  return context;
}

export function MarkdownEditor({ isUrlAllowed: urlPolicy = persistentUrlPolicy, ...props }: MarkdownEditorRootProps) {
  const [isUrlAllowed] = useState(() => urlPolicy);
  const [initial] = useState(() => ({ markdown: props.value ?? props.defaultValue ?? "", editable: !props.disabled && !props.readOnly }));
  const [tasks] = useState(() => new TaskCheckboxes());
  const [live, setLive] = useState<LiveEditor | null>(null);
  useEffect(() => {
    const editor = createLiveEditor(initial.markdown, initial.editable, { isUrlAllowed, tasks });
    setLive(editor);
    return () => editor.destroy();
  }, [initial, isUrlAllowed, tasks]);
  return (
    <LiveEditorContext value={{ live, tasks }}>
      <MarkdownEditorRoot engine={live?.engine ?? null} isUrlAllowed={isUrlAllowed} {...props} />
    </LiveEditorContext>
  );
}

export function MarkdownEditorContent({ label, placeholder, autoFocus = false, ref, ...props }: MarkdownEditorContentProps) {
  const container = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const { live, tasks } = useLiveEditor();
  const { disabled, readOnly, source } = useMarkdownEditor();
  const content = useRender({
    ref: [container, ref ?? null],
    render: (
      <div data-control-ui="markdown-editor" data-control-family="markdown-editor" data-slot="content" {...props}>
        <div ref={host} />
        <MarkdownEditorDragHandle container={container} />
        <MarkdownEditorTableControls container={container} />
        <LiveTaskCheckboxes registry={tasks} />
      </div>
    ),
  });

  useLayoutEffect(() => {
    const node = host.current;
    if (!(node && live)) return;
    node.append(live.view.dom);
    live.view.requestMeasure();
    return () => live.view.dom.remove();
  }, [live]);

  useEffect(() => {
    live?.configure({
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": label,
        "aria-disabled": String(disabled),
        "aria-readonly": String(readOnly),
        spellcheck: "true",
        autocorrect: "on",
        autocapitalize: "sentences",
      },
      placeholder: placeholder ?? "",
    });
  }, [live, label, disabled, readOnly, placeholder]);

  useEffect(() => {
    live?.configure({ preview: !source });
  }, [live, source]);

  useEffect(() => {
    if (live && autoFocus && !disabled) live.focusEnd();
  }, [live, autoFocus, disabled]);

  if (!live) return <MarkdownEditorSourceView ref={ref} label={label} placeholder={placeholder} autoFocus={autoFocus} {...props} />;
  return content;
}
