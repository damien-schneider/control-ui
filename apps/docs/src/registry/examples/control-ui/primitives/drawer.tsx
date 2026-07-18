"use client";

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

const triggerClass =
  "inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--radius-control)] bg-card px-4 text-sm font-medium text-foreground shadow-sm ring-1 ring-inset ring-border transition hover:bg-foreground/5";

export function PrimitiveDrawerExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Drawer>
        <DrawerTrigger className={triggerClass}>Open drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Move to project</DrawerTitle>
            <DrawerDescription>Swipe down or use the button to dismiss. Snap points and gestures are native Base UI.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-1 px-4">
            {["Inbox", "Roadmap", "Archive"].map((name) => (
              <button
                key={name}
                type="button"
                className="flex h-10 items-center rounded-[var(--radius-control)] px-3 text-left text-sm text-foreground transition hover:bg-foreground/6"
              >
                {name}
              </button>
            ))}
          </div>
          <DrawerFooter>
            <DrawerClose className={triggerClass}>Cancel</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
