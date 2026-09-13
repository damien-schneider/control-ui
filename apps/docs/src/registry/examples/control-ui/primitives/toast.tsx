"use client";

import { Button } from "@/components/control-ui/ui/button";
import { Toaster, toast } from "@/components/control-ui/ui/toast";

export function PrimitiveToastExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="surface" onClick={() => toast("Changes saved", { description: "Your workspace is up to date." })}>
          Show toast
        </Button>
        <Button variant="surface" onClick={() => toast.success("Deployment live", { description: "Build 4f2a shipped." })}>
          Success
        </Button>
        <Button variant="surface" onClick={() => toast.error("Upload failed", { description: "The file exceeds the 25 MB limit." })}>
          Error
        </Button>
        <Button
          variant="surface"
          onClick={() =>
            toast("Message archived", {
              actionProps: { children: "Undo", onClick: () => toast.success("Restored") },
            })
          }
        >
          With action
        </Button>
      </div>
      <Toaster />
    </div>
  );
}
