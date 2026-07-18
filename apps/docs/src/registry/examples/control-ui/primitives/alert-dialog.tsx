"use client";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/control-ui/ui/alert-dialog";
import { Button } from "@/components/control-ui/ui/button";

export function PrimitiveAlertDialogExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="surface" tone="danger">
              Delete project
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the project and all of its deployments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <AlertDialogClose variant="solid" tone="danger">
              Delete
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
