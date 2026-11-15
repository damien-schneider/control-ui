"use client";

import { Button } from "@/components/control-ui/ui/button";
import { Card, CardContent } from "@/components/control-ui/ui/card";
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
            <DrawerBody className="min-h-24 items-center justify-center">
              <Card size="sm" className="w-full">
                <CardContent>
                  <Text as="p" tone="muted" className="text-center">
                    Edge-aligned content
                  </Text>
                </CardContent>
              </Card>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose render={<Button variant="surface" />}>Close</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}
