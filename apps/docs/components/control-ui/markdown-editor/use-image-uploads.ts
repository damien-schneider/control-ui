import type { Editor } from "@tiptap/core";
import { useEffect, useId, useRef, useState } from "react";
import { completeImageUpload, findImageUpload, type MarkdownImageUpload, type MarkdownImageUploader, markdownImageTypes } from "./uploads";

export function useImageUploads(editor: Editor | null, uploader: MarkdownImageUploader | undefined, maxImageBytes: number) {
  const [uploads, setUploads] = useState<MarkdownImageUpload[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadPrefix = useId();
  const nextId = useRef(0);
  const jobs = useRef(new Map<string, { file: File; controller: AbortController }>());

  function discard(id: string) {
    jobs.current.get(id)?.controller.abort();
    jobs.current.delete(id);
    setUploads((current) => current.filter((item) => item.id !== id));
  }

  function cancelAll() {
    for (const job of jobs.current.values()) job.controller.abort();
    jobs.current.clear();
    setUploads([]);
  }

  useEffect(() => {
    const activeJobs = jobs.current;
    return () => {
      for (const job of activeJobs.values()) job.controller.abort();
      activeJobs.clear();
    };
  }, []);

  useEffect(() => {
    if (!editor) return;
    const prune = () => {
      for (const id of jobs.current.keys()) {
        if (findImageUpload(editor.state.doc, id) === undefined) {
          jobs.current.get(id)?.controller.abort();
          jobs.current.delete(id);
          setUploads((current) => current.filter((item) => item.id !== id));
        }
      }
    };
    editor.on("update", prune);
    return () => {
      editor.off("update", prune);
    };
  }, [editor]);

  async function run(id: string, file: File) {
    if (!editor || !uploader) return;
    const controller = new AbortController();
    jobs.current.set(id, { file, controller });
    setUploads((current) => [...current.filter((item) => item.id !== id), { id, file, status: "uploading" }]);
    try {
      const image = await uploader(file, {
        signal: controller.signal,
        onProgress: (progress) => {
          if (controller.signal.aborted || !Number.isFinite(progress)) return;
          setUploads((current) =>
            current.map((item) => (item.id === id ? { ...item, progress: Math.max(0, Math.min(100, progress)) } : item)),
          );
        },
      });
      if (controller.signal.aborted || editor.isDestroyed) return;
      completeImageUpload(editor, id, image, file.name);
      discard(id);
    } catch (error) {
      if (controller.signal.aborted) return;
      setUploads((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "error",
                error: error instanceof Error ? error.message : "Image upload failed.",
              }
            : item,
        ),
      );
    }
  }

  function upload(files: File[], position?: number) {
    if (!editor || !uploader || !editor.isEditable) return;
    setUploadError(null);
    let insertAt = position ?? editor.state.selection.to;
    for (const file of files) {
      if (!markdownImageTypes.includes(file.type) || file.size > maxImageBytes) {
        setUploadError(`Choose a PNG, JPEG, GIF, WebP or AVIF image up to ${Math.round(maxImageBytes / 1024 / 1024)} MB.`);
        continue;
      }
      const id = `${uploadPrefix}-${nextId.current++}`;
      editor
        .chain()
        .focus()
        .insertContentAt(insertAt, { type: "imageUpload", attrs: { id, name: file.name } })
        .run();
      insertAt = editor.state.selection.to;
      void run(id, file);
    }
  }

  function removeUpload(id: string) {
    discard(id);
    if (!editor) return;
    const position = findImageUpload(editor.state.doc, id);
    if (position !== undefined) editor.view.dispatch(editor.state.tr.delete(position, position + 1).setMeta("addToHistory", false));
  }

  function retryUpload(id: string) {
    const job = jobs.current.get(id);
    if (job) {
      job.controller.abort();
      void run(id, job.file);
    }
  }

  return { uploads, uploadError, upload, retryUpload, removeUpload, cancelAll };
}
