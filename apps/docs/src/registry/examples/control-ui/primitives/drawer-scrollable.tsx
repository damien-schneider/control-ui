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
        <DrawerHeader className="sticky top-0 z-10 bg-background pb-2">
          <DrawerTitle>Deployment activity</DrawerTitle>
          <DrawerDescription>Header and actions remain available while the event log scrolls.</DrawerDescription>
        </DrawerHeader>

        <ol className="grid gap-1 px-4 pb-20">
          {activity.map((event, index) => (
            <li key={event} className="flex items-start gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm">
              <span className="mt-0.5 font-medium tabular-nums text-foreground/40">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-foreground">{event}</span>
            </li>
          ))}
        </ol>

        <DrawerFooter className="sticky bottom-0 z-10 bg-background pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
          <DrawerClose render={<Button variant="surface" />}>Close activity</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
