"use client";

import { Braces, FileCode2 } from "lucide-react";
import { useState } from "react";

import {
  Dropzone,
  DropzoneArea,
  DropzoneFileList,
  DropzoneInput,
  DropzoneOverlay,
  type DropzonePolicy,
  DropzoneRejectionList,
  DropzoneStatus,
} from "@/components/control-ui/ui/dropzone";

const workspacePolicy: DropzonePolicy = {
  accept: {
    "application/json": [".json"],
    "text/css": [".css"],
  },
  validator: async (file, signal) => {
    signal.throwIfAborted();
    if (file.name.toLowerCase().endsWith(".css")) return null;

    const source = await file.text();
    signal.throwIfAborted();
    try {
      JSON.parse(source);
      signal.throwIfAborted();
      return null;
    } catch (error) {
      signal.throwIfAborted();
      if (error instanceof SyntaxError) {
        return { code: "invalid-json", message: "Choose valid JSON." };
      }
      throw error;
    }
  },
};

export function PrimitiveDropzoneOverlayExample() {
  const [files, setFiles] = useState<readonly File[]>([]);
  const [intakeError, setIntakeError] = useState<string | null>(null);

  return (
    <Dropzone
      value={files}
      onValueChange={(nextFiles) => setFiles(nextFiles)}
      policy={workspacePolicy}
      onDrop={() => setIntakeError(null)}
      onError={(error) => setIntakeError(error.message)}
      className="w-full max-w-2xl"
    >
      <DropzoneInput />
      <DropzoneArea>
        <div className="relative min-h-64 overflow-hidden rounded-[var(--radius-panel)] border border-border bg-card p-5">
          <div className="flex items-center gap-2 border-b border-border pb-3 text-sm font-medium text-foreground">
            <Braces className="size-4 text-muted-foreground" aria-hidden="true" />
            Configuration workspace
          </div>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileCode2 className="size-4" aria-hidden="true" />
              Drop JSON or CSS anywhere on this workspace.
            </div>
            <p>Dragging over the document reveals this bounded target; dropping elsewhere never adds files.</p>
          </div>
          <DropzoneOverlay scope="global" />
        </div>
      </DropzoneArea>
      <DropzoneFileList />
      <DropzoneRejectionList />
      {intakeError ? (
        <p role="alert" className="mt-3 text-sm text-destructive-text">
          {intakeError}
        </p>
      ) : null}
      <DropzoneStatus />
    </Dropzone>
  );
}
