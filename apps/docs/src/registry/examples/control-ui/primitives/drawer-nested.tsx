"use client";

import { Button } from "@/components/control-ui/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/control-ui/ui/drawer";

const summaryRows = [
  ["Environment", "Production"],
  ["Region", "Europe West"],
  ["Branch", "main"],
] as const;

const accessRows = [
  ["Workspace members", "View"],
  ["Project maintainers", "Edit"],
  ["Deployment admins", "Publish"],
] as const;

export function PrimitiveNestedDrawerExample() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="surface" />}>Open drawer stack</DrawerTrigger>
      <DrawerContent className="h-[min(32rem,85vh)] data-[nested-drawer-open]:brightness-95">
        <DrawerHeader>
          <DrawerTitle>Publish project</DrawerTitle>
          <DrawerDescription>Review the destination before publishing the current branch.</DrawerDescription>
        </DrawerHeader>

        <dl className="grid gap-1 px-4">
          {summaryRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-[var(--radius-control)] px-3 py-2 text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        <DrawerFooter className="sm:flex-row sm:justify-end">
          <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
          <Drawer>
            <DrawerTrigger render={<Button variant="solid" tone="primary" />}>Review access</DrawerTrigger>
            <DrawerContent className="h-[min(27rem,80vh)] data-[nested-drawer-open]:brightness-95">
              <DrawerHeader>
                <DrawerTitle>Project access</DrawerTitle>
                <DrawerDescription>The parent drawer stays mounted while this step opens above it.</DrawerDescription>
              </DrawerHeader>

              <dl className="grid gap-1 px-4">
                {accessRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-[var(--radius-control)] bg-foreground/4 px-3 py-2.5 text-sm"
                  >
                    <dt className="text-foreground">{label}</dt>
                    <dd className="text-muted-foreground">{value}</dd>
                  </div>
                ))}
              </dl>

              <DrawerFooter className="sm:flex-row sm:justify-end">
                <DrawerClose render={<Button variant="ghost" />}>Back</DrawerClose>
                <Drawer>
                  <DrawerTrigger render={<Button variant="solid" tone="primary" />}>Continue</DrawerTrigger>
                  <DrawerContent className="h-[min(22rem,75vh)]">
                    <DrawerHeader>
                      <DrawerTitle>Ready to publish</DrawerTitle>
                      <DrawerDescription>Three drawers now share one focus-managed stack.</DrawerDescription>
                    </DrawerHeader>

                    <div className="mx-4 rounded-[var(--radius-panel)] bg-primary/8 p-4 text-sm text-foreground ring-1 ring-inset ring-primary/20">
                      Production will receive the latest commit from main. Existing deployments stay available during the rollout.
                    </div>

                    <DrawerFooter className="sm:flex-row sm:justify-end">
                      <DrawerClose render={<Button variant="ghost" />}>Back</DrawerClose>
                      <DrawerClose render={<Button variant="solid" tone="primary" />}>Publish</DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
