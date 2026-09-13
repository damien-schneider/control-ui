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

export function PrimitiveDrawerExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Drawer>
        <DrawerTrigger render={<Button variant="surface" />}>Open drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Move to project</DrawerTitle>
            <DrawerDescription>Swipe down or use the button to dismiss. Snap points and gestures are native Base UI.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-1 px-4">
            {["Inbox", "Roadmap", "Archive"].map((name) => (
              <Button key={name} variant="ghost" className="justify-start">
                {name}
              </Button>
            ))}
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button variant="surface" />}>Cancel</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
