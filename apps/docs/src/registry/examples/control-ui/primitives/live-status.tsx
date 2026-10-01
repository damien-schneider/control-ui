"use client";

import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { LiveStatus } from "@/components/control-ui/ui/live-status";

export function PrimitiveLiveStatusExample() {
  const [count, setCount] = useState(0);
  const message = count === 0 ? "" : `${count} ${count === 1 ? "file" : "files"} uploaded`;

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-3">
      <Button variant="surface" size="sm" onClick={() => setCount((value) => value + 1)}>
        Upload file
      </Button>
      <p className="text-label text-muted-foreground" aria-hidden="true">
        {message || "Nothing uploaded yet"}
      </p>
      <LiveStatus message={message} />
    </div>
  );
}
