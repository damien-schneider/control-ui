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
import { Input } from "@/components/control-ui/ui/input";

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
            <Input aria-label="Display name" defaultValue="Ada Lovelace" />
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
