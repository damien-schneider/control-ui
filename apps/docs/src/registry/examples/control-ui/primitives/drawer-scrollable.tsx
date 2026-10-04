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

const activity = [
  "Created the production deployment",
  "Uploaded the server bundle",
  "Provisioned runtime secrets",
  "Updated the edge routes",
  "Warmed the primary region",
  "Ran the smoke test suite",
  "Promoted the deployment",
  "Invalidated the previous cache",
  "Notified project maintainers",
  "Recorded the release checkpoint",
];

export function PrimitiveScrollableDrawerExample() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="surface" />}>View deployment activity</DrawerTrigger>
      <DrawerContent className="h-[min(38rem,85vh)]">
        <DrawerHeader>
          <DrawerTitle>Deployment activity</DrawerTitle>
          <DrawerDescription>Header and actions remain available while the event log scrolls.</DrawerDescription>
        </DrawerHeader>

        <DrawerBody>
          <ol className="grid gap-1 px-4">
            {activity.map((event, index) => (
              <li key={event} className="flex items-start gap-3 rounded-[var(--radius-control)] px-3 py-2.5">
                <Text weight="medium" className="mt-0.5 tabular-nums text-foreground/40">
                  {String(index + 1).padStart(2, "0")}
                </Text>
                <Text tone="foreground">{event}</Text>
              </li>
            ))}
          </ol>
        </DrawerBody>

        <DrawerFooter>
          <DrawerClose render={<Button variant="surface" />}>Close activity</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
