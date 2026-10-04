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
import { Text } from "@/components/control-ui/ui/typography";

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
          <Text as="div" weight="medium" tone="foreground" className="flex items-center gap-2 border-b border-border pb-3">
            <Braces className="size-4 text-muted-foreground" aria-hidden="true" />
            Configuration workspace
          </Text>
          <Text as="div" tone="muted" className="mt-4 flex items-center gap-2">
            <FileCode2 className="size-4" aria-hidden="true" />
            Drop JSON or CSS anywhere on this workspace.
          </Text>
          <DropzoneOverlay scope="global" />
        </div>
      </DropzoneArea>
      <DropzoneFileList />
      <DropzoneRejectionList />
      {intakeError ? (
        <Text as="p" role="alert" tone="destructive" className="mt-3">
          {intakeError}
        </Text>
      ) : null}
      <DropzoneStatus className="sr-only" />
    </Dropzone>
  );
}
