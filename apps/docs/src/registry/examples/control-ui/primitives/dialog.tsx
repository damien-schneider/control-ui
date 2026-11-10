"use client";

import { Button } from "@/components/control-ui/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/control-ui/ui/dialog";
import { Input } from "@/components/control-ui/ui/input";
import { Text } from "@/components/control-ui/ui/typography";

const termsSections = [
  { title: "Workspace data", body: "Projects, deployments, and logs stay in the region you choose when the workspace is created." },
  { title: "Seats", body: "Each member with write access uses one seat. Viewers and billing contacts are free." },
  { title: "Usage limits", body: "Build minutes and bandwidth reset on the first day of each billing period." },
  { title: "Overages", body: "Usage above the plan allowance is billed at the end of the period at the listed rates." },
  { title: "Support", body: "Priority support answers within one business day. Critical incidents are handled around the clock." },
  { title: "Retention", body: "Deployment logs are kept for 30 days and audit logs for one year." },
  { title: "Cancellation", body: "Cancel at any time. The workspace stays active until the end of the paid period." },
  { title: "Exports", body: "Export projects and environment variables from workspace settings before the workspace is deleted." },
  { title: "Changes", body: "We announce changes to these terms by email at least 30 days before they take effect." },
];

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
          <DialogBody>
            <Input aria-label="Display name" defaultValue="Ada Lovelace" />
          </DialogBody>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <DialogClose variant="solid" tone="primary">
              Save changes
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger render={<Button variant="surface">Review plan terms</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plan terms</DialogTitle>
            <DialogDescription>The header and footer stay in place while the body scrolls.</DialogDescription>
          </DialogHeader>
          <DialogBody className="gap-4">
            {termsSections.map((section) => (
              <div key={section.title} className="flex flex-col gap-1">
                <Text weight="medium">{section.title}</Text>
                <Text tone="muted">{section.body}</Text>
              </div>
            ))}
          </DialogBody>
          <DialogFooter>
            <DialogClose>Decline</DialogClose>
            <DialogClose variant="solid" tone="primary">
              Accept terms
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
