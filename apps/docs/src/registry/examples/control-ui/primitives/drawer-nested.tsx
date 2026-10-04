"use client";

import { Button } from "@/components/control-ui/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/control-ui/ui/drawer";
import { Text } from "@/components/control-ui/ui/typography";

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
      <DrawerContent className="h-[min(32rem,85vh)]">
        <DrawerHeader>
          <DrawerTitle>Publish project</DrawerTitle>
          <DrawerDescription>Review the destination before publishing the current branch.</DrawerDescription>
        </DrawerHeader>

        <DrawerBody>
          <dl className="grid gap-1 px-4">
            {summaryRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-[var(--radius-control)] px-3 py-2">
                <Text as="dt" tone="muted">
                  {label}
                </Text>
                <Text as="dd" weight="medium" tone="foreground">
                  {value}
                </Text>
              </div>
            ))}
          </dl>
        </DrawerBody>

        <DrawerFooter>
          <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
          <Drawer>
            <DrawerTrigger render={<Button variant="solid" tone="primary" />}>Review access</DrawerTrigger>
            <DrawerContent className="h-[min(27rem,80vh)]">
              <DrawerHeader>
                <DrawerTitle>Project access</DrawerTitle>
                <DrawerDescription>The parent drawer stays mounted while this step opens above it.</DrawerDescription>
              </DrawerHeader>

              <DrawerBody>
                <dl className="grid gap-1 px-4">
                  {accessRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-[var(--radius-control)] bg-foreground/4 px-3 py-2.5"
                    >
                      <Text as="dt" tone="foreground">
                        {label}
                      </Text>
                      <Text as="dd" tone="muted">
                        {value}
                      </Text>
                    </div>
                  ))}
                </dl>
              </DrawerBody>

              <DrawerFooter>
                <DrawerClose render={<Button variant="ghost" />}>Back</DrawerClose>
                <Drawer>
                  <DrawerTrigger render={<Button variant="solid" tone="primary" />}>Continue</DrawerTrigger>
                  <DrawerContent className="h-[min(22rem,75vh)]">
                    <DrawerHeader>
                      <DrawerTitle>Ready to publish</DrawerTitle>
                      <DrawerDescription>Three drawers now share one focus-managed stack.</DrawerDescription>
                    </DrawerHeader>

                    <DrawerBody>
                      <Text
                        as="div"
                        tone="foreground"
                        className="mx-4 rounded-[var(--radius-panel)] bg-primary/8 p-4 ring-1 ring-inset ring-primary/20"
                      >
                        Production will receive the latest commit from main. Existing deployments stay available during the rollout.
                      </Text>
                    </DrawerBody>

                    <DrawerFooter>
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
