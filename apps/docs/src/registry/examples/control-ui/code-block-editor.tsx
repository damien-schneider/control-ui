"use client";

import { useState } from "react";

import {
  CodeBlockEditor,
  CodeBlockEditorActions,
  CodeBlockEditorContent,
  CodeBlockEditorCopy,
  CodeBlockEditorHeader,
  CodeBlockEditorTextarea,
  CodeBlockEditorTitle,
} from "@/components/control-ui/code-block-editor";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";
import { codeBlockClientCode, codeBlockServerCode } from "../shared";

const codeFileKeys = ["client", "server", "scratch"] as const;

const codeFiles = {
  client: {
    code: codeBlockClientCode,
    fileName: "client-highlight.tsx",
  },
  server: {
    code: codeBlockServerCode,
    fileName: "server-highlight.tsx",
  },
  scratch: {
    code: `export function EditableStep() {
  return <div>Editable code</div>;
}`,
    fileName: "scratch.tsx",
  },
};

const firstCodeFileKey = codeFileKeys[0];

const isFileKey = (value: string): value is (typeof codeFileKeys)[number] => codeFileKeys.some((key) => key === value);

export function CodeBlockEditorExample() {
  const [activeFile, setActiveFile] = useState<string>(firstCodeFileKey);
  const [scratchCode, setScratchCode] = useState(codeFiles.scratch.code);
  const selectedFile = isFileKey(activeFile) ? activeFile : firstCodeFileKey;
  const file = codeFiles[selectedFile];
  const copyValue = selectedFile === "scratch" ? scratchCode : file.code;

  return (
    <div className="w-full p-6">
      <Tabs value={selectedFile} onValueChange={(value) => setActiveFile(isFileKey(value) ? value : firstCodeFileKey)}>
        <CodeBlockEditor>
          <CodeBlockEditorHeader>
            <div className="flex min-w-0 items-center gap-3">
              <TabsList>
                {codeFileKeys.map((key) => (
                  <TabsTab key={key} value={key}>
                    {key[0].toUpperCase() + key.slice(1)}
                  </TabsTab>
                ))}
              </TabsList>
              <CodeBlockEditorTitle>{file.fileName}</CodeBlockEditorTitle>
            </div>
            <CodeBlockEditorActions>
              <CodeBlockEditorCopy value={copyValue} />
            </CodeBlockEditorActions>
          </CodeBlockEditorHeader>
          <TabsPanel key={selectedFile} value={selectedFile}>
            {selectedFile === "scratch" ? (
              <CodeBlockEditorTextarea value={scratchCode} onValueChange={setScratchCode} fileName={codeFiles.scratch.fileName} />
            ) : (
              <CodeBlockEditorContent code={file.code} lang="tsx" />
            )}
          </TabsPanel>
        </CodeBlockEditor>
      </Tabs>
    </div>
  );
}
