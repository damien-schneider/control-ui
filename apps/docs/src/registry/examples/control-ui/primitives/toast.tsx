"use client";

import { Toaster, toast } from "@/components/control-ui/ui/toast";

const buttonClass =
  "inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--radius-control)] bg-card px-4 text-sm font-medium text-foreground shadow-sm ring-1 ring-inset ring-border transition hover:bg-foreground/5";

export function PrimitiveToastExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={buttonClass}
          onClick={() => toast("Changes saved", { description: "Your workspace is up to date." })}
        >
          Show toast
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => toast.success("Deployment live", { description: "Build 4f2a shipped." })}
        >
          Success
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => toast.error("Upload failed", { description: "The file exceeds the 25 MB limit." })}
        >
          Error
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() =>
            toast("Message archived", {
              actionProps: { children: "Undo", onClick: () => toast.success("Restored") },
            })
          }
        >
          With action
        </button>
      </div>
      {/* Mount once at the app root in real usage. */}
      <Toaster />
    </div>
  );
}
