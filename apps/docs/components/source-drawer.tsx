"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactGrabAPI } from "react-grab/core";
import type { DevSourceFile } from "@/app/api/dev/source/route";
import { Code, CodeContent, CodeFloatingCopy } from "@/components/control-ui/ui/code";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/control-ui/ui/drawer";

const REACT_GRAB_PLUGIN_NAME = "source-drawer";
const CONTEXT_LINES_ABOVE_ELEMENT = 6;

type GrabbedSource = { title: string; description: string; file: DevSourceFile | null };

async function grabSource(api: ReactGrabAPI, element: Element): Promise<GrabbedSource> {
  const source = await api.getSource(element);
  if (!source) {
    return {
      title: `<${element.tagName.toLowerCase()}>`,
      description: "React Grab found no React source for this element.",
      file: null,
    };
  }

  const title = source.componentName ?? "Anonymous component";
  const query = new URLSearchParams({ path: source.filePath });
  if (source.lineNumber !== null) query.set("line", String(source.lineNumber));
  if (source.columnNumber !== null) query.set("column", String(source.columnNumber));
  const response = await fetch(`/api/dev/source?${query}`);
  if (!response.ok) {
    const { error }: { error: string } = await response.json();
    return { title, description: error, file: null };
  }

  const file: DevSourceFile = await response.json();
  return { title, description: source.lineNumber === null ? file.path : `${file.path}:${source.lineNumber}`, file };
}

function GrabbedFile({ file }: { file: DevSourceFile }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const lineCount = file.code.split("\n").length;
  const [firstElementLine] = file.elementLines;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || firstElementLine === undefined) return;
    const lineHeight = viewport.scrollHeight / lineCount;
    viewport.scrollTop = lineHeight * (firstElementLine - 1 - CONTEXT_LINES_ABOVE_ELEMENT);
  }, [firstElementLine, lineCount]);

  return (
    <Code chrome="embedded" className="mx-4 mb-4 grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)]">
      <CodeFloatingCopy value={file.code} />
      <CodeContent
        ref={viewportRef}
        code={file.code}
        lang={file.path.split(".").at(-1)}
        showLineNumbers
        highlightLines={file.elementLines}
        maxHeight="none"
      />
    </Code>
  );
}

export function SourceDrawer() {
  const [grabbed, setGrabbed] = useState<GrabbedSource | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function registerSourceDrawer(api: ReactGrabAPI) {
      api.registerPlugin({
        name: REACT_GRAB_PLUGIN_NAME,
        hooks: {
          onElementSelect: (element) => {
            // returning the promise would make React Grab skip its clipboard copy
            void grabSource(api, element).then((source) => {
              setGrabbed(source);
              setOpen(true);
            });
          },
        },
      });
    }
    function registerOnReactGrabInit(event: CustomEvent<ReactGrabAPI>) {
      registerSourceDrawer(event.detail);
    }

    if (window.__REACT_GRAB__) registerSourceDrawer(window.__REACT_GRAB__);
    else window.addEventListener("react-grab:init", registerOnReactGrabInit, { once: true });
    return () => {
      window.removeEventListener("react-grab:init", registerOnReactGrabInit);
      window.__REACT_GRAB__?.unregisterPlugin(REACT_GRAB_PLUGIN_NAME);
    };
  }, []);

  return (
    <Drawer side="right" open={open} onOpenChange={setOpen}>
      <DrawerContent side="right" variant="floating" surface="card" className="max-w-3xl" data-react-grab-ignore>
        {grabbed ? (
          <>
            <DrawerHeader>
              <DrawerTitle>{grabbed.title}</DrawerTitle>
              <DrawerDescription>{grabbed.description}</DrawerDescription>
            </DrawerHeader>
            {grabbed.file ? <GrabbedFile file={grabbed.file} /> : null}
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
