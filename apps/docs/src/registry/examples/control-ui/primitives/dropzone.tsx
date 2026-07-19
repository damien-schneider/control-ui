"use client";

import { FileWarning } from "lucide-react";
import { useState } from "react";

import {
  Dropzone,
  DropzoneArea,
  DropzoneClear,
  DropzoneErrorCode,
  DropzoneFileList,
  DropzoneInput,
  type DropzonePolicy,
  DropzoneRejectionList,
  DropzoneStatus,
  DropzoneTrigger,
} from "@/components/control-ui/ui/dropzone";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/control-ui/ui/item";

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

const rejectionMessages: Partial<Record<string, string>> = {
  [DropzoneErrorCode.FileInvalidType]: "Choose a PNG, JPEG, WebP, or PDF file.",
  [DropzoneErrorCode.FileTooLarge]: "Choose a file smaller than 5 MB.",
  [DropzoneErrorCode.TooManyFiles]: "You can select up to 4 files.",
  [DropzoneErrorCode.FileAlreadySelected]: "This file is already selected.",
};

export function PrimitiveDropzoneExample() {
  const [files, setFiles] = useState<readonly File[]>([]);

  return (
    <Dropzone
      value={files}
      onValueChange={(nextFiles) => setFiles(nextFiles)}
      policy={documentPolicy}
      className="w-full max-w-xl"
    >
      <DropzoneInput />
      <DropzoneArea>
        <DropzoneTrigger />
      </DropzoneArea>
      <DropzoneFileList />
      <DropzoneRejectionList>
        {(rejection) => (
          <Item variant="muted">
            <ItemMedia className="text-destructive-text">
              <FileWarning aria-hidden="true" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="wrap-anywhere leading-normal">{rejection.file.name}</ItemTitle>
              {rejection.errors.map((error) => (
                <ItemDescription key={`${error.code}-${error.message}`} className="text-destructive-text">
                  {rejectionMessages[error.code] ?? error.message}
                </ItemDescription>
              ))}
            </ItemContent>
          </Item>
        )}
      </DropzoneRejectionList>
      <div className="mt-3">
        <DropzoneClear />
      </div>
      <DropzoneStatus />
    </Dropzone>
  );
}
