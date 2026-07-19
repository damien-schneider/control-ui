"use client";

import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/control-ui/ui/avatar";

export function PrimitiveAvatarExample() {
  return (
    <div className="flex flex-col items-start gap-5">
      <AvatarGroup aria-label="Project contributors">
        <Avatar>
          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&dpr=2&q=80" alt="Ada Lovelace" />
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>DS</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
      </AvatarGroup>
      <Avatar className="size-12">
        <AvatarFallback>CU</AvatarFallback>
      </Avatar>
    </div>
  );
}
