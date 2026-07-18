"use client";

import { Button } from "@/components/control-ui/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/control-ui/ui/dialog";

export function PrimitiveDialogExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Dialog>
        <DialogTrigger render={<Button variant="surface">Edit profile</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Update your display name. Changes are saved to your workspace.</DialogDescription>
          </DialogHeader>
          <div className="px-4">
            <input
              defaultValue="Ada Lovelace"
              className="h-9 w-full rounded-[var(--radius-control)] bg-background px-3 text-sm text-foreground outline-none ring-1 ring-inset ring-border focus-visible:ring-2 focus-visible:ring-foreground/20"
            />
          </div>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <DialogClose variant="solid" tone="primary">
              Save changes
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
