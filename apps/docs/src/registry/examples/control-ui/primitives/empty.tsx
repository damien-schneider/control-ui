"use client";

import { Inbox } from "lucide-react";
import { Button } from "@/components/control-ui/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/control-ui/ui/empty";

export function PrimitiveEmptyExample() {
  return (
    <Empty className="w-full max-w-sm ring-1 ring-border">
      <EmptyHeader>
        <EmptyMedia>
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>No messages yet</EmptyTitle>
        <EmptyDescription>Start a conversation and every thread you open will collect here for quick access.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="solid" size="sm">
          New message
        </Button>
      </EmptyContent>
    </Empty>
  );
}
