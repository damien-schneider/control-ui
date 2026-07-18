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

const sides = [
  { side: "top", label: "Top" },
  { side: "right", label: "Right" },
  { side: "bottom", label: "Bottom" },
  { side: "left", label: "Left" },
] as const;

export function PrimitiveDrawerSidesExample() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {sides.map(({ side, label }) => (
        <Drawer key={side} side={side}>
          <DrawerTrigger render={<Button variant="surface" />}>{label}</DrawerTrigger>
          <DrawerContent side={side}>
            <DrawerHeader>
              <DrawerTitle>{label} drawer</DrawerTitle>
              <DrawerDescription>Swipe toward the {side} edge or use the close action to dismiss.</DrawerDescription>
            </DrawerHeader>
            <div className="flex min-h-24 flex-1 items-center justify-center px-4">
              <div className="w-full rounded-[var(--radius-panel)] bg-foreground/4 p-4 text-center text-sm text-muted-foreground ring-1 ring-inset ring-border">
                Edge-aligned content
              </div>
            </div>
            <DrawerFooter>
              <DrawerClose render={<Button variant="surface" />}>Close</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}
