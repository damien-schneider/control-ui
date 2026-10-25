"use client";

import { PaperclipIcon } from "lucide-react";
import { useState } from "react";

import {
  Dropzone,
  DropzoneArea,
  DropzoneFileList,
  DropzoneInput,
  DropzoneOverlay,
  type DropzonePolicy,
  DropzoneRejectionList,
  DropzoneTrigger,
} from "@/components/control-ui/ui/dropzone";

const imagePolicy: DropzonePolicy = {
  accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
  maxSize: 5_000_000,
  maxFiles: 5,
};

export function PrimitiveDropzoneCompactExample() {
  const [images, setImages] = useState<readonly File[]>([]);

  return (
    <Dropzone
      size="sm"
      value={images}
      onValueChange={(nextImages) => setImages(nextImages)}
      policy={imagePolicy}
      className="w-full max-w-md"
    >
      <DropzoneInput aria-label="Attach images" />
      <DropzoneArea>
        <DropzoneTrigger>
          <PaperclipIcon aria-hidden="true" />
          Attach images
        </DropzoneTrigger>
        <DropzoneOverlay />
      </DropzoneArea>
      <DropzoneFileList aria-label="Attached images" />
      <DropzoneRejectionList />
    </Dropzone>
  );
}
