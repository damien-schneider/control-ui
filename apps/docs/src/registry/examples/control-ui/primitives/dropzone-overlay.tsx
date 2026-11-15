"use client";

import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
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
        <Card className="relative min-h-64 overflow-hidden">
          <CardHeader>
            <CardTitle>Configuration workspace</CardTitle>
            <CardDescription>Drop JSON or CSS anywhere on this workspace.</CardDescription>
          </CardHeader>
          <DropzoneOverlay scope="global" />
        </Card>
      </DropzoneArea>
      <DropzoneFileList />
      <DropzoneRejectionList />
      {intakeError ? (
        <Text as="p" role="alert" tone="danger" className="mt-3">
          {intakeError}
        </Text>
      ) : null}
      <DropzoneStatus />
    </Dropzone>
  );
}
