"use client";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/control-ui/ui/alert-dialog";
import { Button } from "@/components/control-ui/ui/button";
import { Text } from "@/components/control-ui/ui/typography";

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
          <AlertDialogBody>
            <ul className="list-disc ps-5">
              <Text as="li" tone="muted">
                3 production deployments
              </Text>
              <Text as="li" tone="muted">
                12 environment variables
              </Text>
            </ul>
          </AlertDialogBody>
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
