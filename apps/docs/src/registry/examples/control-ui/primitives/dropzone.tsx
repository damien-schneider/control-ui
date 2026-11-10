"use client";

import { useState } from "react";

import {
  Dropzone,
  DropzoneArea,
  DropzoneClear,
  DropzoneFileList,
  DropzoneInput,
  type DropzonePolicy,
  DropzoneRejectionList,
  DropzoneStatus,
  DropzoneTrigger,
} from "@/components/control-ui/ui/dropzone";

const documentPolicy: DropzonePolicy = {
  accept: {
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
    "application/pdf": [".pdf"],
  },
  maxSize: 5_000_000,
  maxFiles: 4,
};

const triggerMessages = {
  idle: "Drop up to 4 images or PDFs, or choose files",
  accept: "Release to add these files",
  reject: "Only PNG, JPEG, WebP, and PDF files up to 5 MB",
};

export function PrimitiveDropzoneExample() {
  const [files, setFiles] = useState<readonly File[]>([]);

  return (
    <Dropzone value={files} onValueChange={(nextFiles) => setFiles(nextFiles)} policy={documentPolicy} className="w-full max-w-xl">
      <DropzoneInput />
      <DropzoneArea>
        <DropzoneTrigger messages={triggerMessages} />
      </DropzoneArea>
      <DropzoneFileList />
      <DropzoneRejectionList />
      <div className="mt-3">
        <DropzoneClear />
      </div>
      <DropzoneStatus className="sr-only" />
    </Dropzone>
  );
}
