import { useEffect, useId, useRef, useState } from "react";
import { defaultMarkdownEditorLabels, type MarkdownEditorLabels } from "./context";
import type { MarkdownEditorEngine } from "./engine";
import { type MarkdownUrlPolicy, persistentUrlPolicy } from "./url-policy";

export type MarkdownImage = { url: string; alt?: string; title?: string };
export type MarkdownImageUploader = (
  file: File,
  options: { signal: AbortSignal; onProgress: (progress: number) => void },
) => Promise<MarkdownImage>;
export type MarkdownImageUpload = {
  id: string;
  file: File;
  status: "uploading" | "error";
  progress?: number;
  error?: string;
};

export const markdownImageTypes = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/avif"];

function refusedImageUrl(isUrlAllowed: MarkdownUrlPolicy) {
  return new Error(
    isUrlAllowed === persistentUrlPolicy
      ? "The upload must return a permanent HTTP(S) or root-relative image URL."
      : "The upload returned an image URL this editor does not accept.",
  );
}

export function useImageUploads(
  engine: MarkdownEditorEngine | null,
  uploader: MarkdownImageUploader | undefined,
  maxImageBytes: number,
  isUrlAllowed: MarkdownUrlPolicy = persistentUrlPolicy,
  labels: Pick<MarkdownEditorLabels, "uploadFailed" | "uploadRejected"> = defaultMarkdownEditorLabels,
) {
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
    if (!engine) return;
    return engine.subscribe(() => {
      for (const [id, job] of jobs.current) {
        if (engine.uploads.has(id)) continue;
        job.controller.abort();
        jobs.current.delete(id);
        setUploads((current) => current.filter((item) => item.id !== id));
      }
    });
  }, [engine]);

  async function run(id: string, file: File) {
    if (!engine || !uploader) return;
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
      if (controller.signal.aborted) return;
      if (!isUrlAllowed(image.url, "image")) throw refusedImageUrl(isUrlAllowed);
      engine.uploads.complete(id, { url: image.url, alt: image.alt ?? file.name, title: image.title });
      discard(id);
    } catch (error) {
      if (controller.signal.aborted) return;
      setUploads((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: "error", error: error instanceof Error ? error.message : labels.uploadFailed } : item,
        ),
      );
    }
  }

  function upload(files: File[], position?: number) {
    if (!engine || !uploader) return;
    setUploadError(null);
    let at = position;
    for (const file of files) {
      if (!markdownImageTypes.includes(file.type) || file.size > maxImageBytes) {
        setUploadError(labels.uploadRejected(Math.round(maxImageBytes / 1024 / 1024)));
        continue;
      }
      const id = `${uploadPrefix}-${nextId.current++}`;
      engine.uploads.insert(id, file.name, at);
      at = undefined;
      void run(id, file);
    }
  }

  function removeUpload(id: string) {
    discard(id);
    engine?.uploads.remove(id);
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
