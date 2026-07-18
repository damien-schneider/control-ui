"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/control-ui/ui/avatar";

export function PrimitiveAvatarExample() {
  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&dpr=2&q=80" alt="Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      {/* No image provided: Base UI shows the fallback initials. */}
      <Avatar>
        <AvatarFallback>DS</AvatarFallback>
      </Avatar>
      {/* Broken image URL: Base UI falls back after the load error. */}
      <Avatar className="size-12">
        <AvatarImage src="https://example.invalid/missing.png" alt="Grace Hopper" />
        <AvatarFallback>GH</AvatarFallback>
      </Avatar>
    </div>
  );
}
