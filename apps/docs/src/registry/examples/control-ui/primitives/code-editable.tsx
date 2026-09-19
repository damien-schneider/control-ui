"use client";

import { useState } from "react";

import { Code, CodeActions, CodeContent, CodeCopy, CodeEditable, CodeHeader, CodeTitle } from "@/components/control-ui/ui/code";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";
import { codeClientSnippet, codeServerSnippet } from "../../shared";

const fileKeys = ["client", "server", "scratch"] as const;

type FileKey = (typeof fileKeys)[number];

const files: Record<FileKey, { code: string; fileName: string }> = {
  client: { code: codeClientSnippet, fileName: "client-highlight.tsx" },
  server: { code: codeServerSnippet, fileName: "server-highlight.tsx" },
  scratch: {
    code: `export function EditableStep() {
  return <div>Editable code</div>;
}`,
    fileName: "scratch.tsx",
  },
};

function isFileKey(value: string): value is FileKey {
  return fileKeys.some((key) => key === value);
}

export function PrimitiveCodeEditableExample() {
  const [activeKey, setActiveKey] = useState<FileKey>("client");
  const [scratchCode, setScratchCode] = useState(files.scratch.code);
  const file = files[activeKey];
  const copyValue = activeKey === "scratch" ? scratchCode : file.code;

  return (
    <div className="w-full">
      <Tabs value={activeKey} onValueChange={(value) => isFileKey(value) && setActiveKey(value)}>
        <Code>
          <CodeHeader>
            <div className="flex min-w-0 items-center gap-3">
              <TabsList>
                {fileKeys.map((key) => (
                  <TabsTab key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </TabsTab>
                ))}
              </TabsList>
              <CodeTitle>{file.fileName}</CodeTitle>
            </div>
            <CodeActions>
              <CodeCopy value={copyValue} />
            </CodeActions>
          </CodeHeader>
          <TabsPanel key={activeKey} value={activeKey}>
            {activeKey === "scratch" ? (
              <CodeEditable value={scratchCode} onValueChange={setScratchCode} fileName={files.scratch.fileName} />
            ) : (
              <CodeContent code={file.code} lang="tsx" />
            )}
          </TabsPanel>
        </Code>
      </Tabs>
    </div>
  );
}
