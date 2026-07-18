"use client";

import type { IntegrationId } from "@/app/(features)/model/types";

function MastraLogo({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 34 21" fill="none" className={className}>
      <path
        d="M4.5 11.7C7 11.7 9 13.7 9 16.2S7 20.7 4.5 20.7 0 18.7 0 16.2s2-4.5 4.5-4.5ZM10.4 0c2.5 0 4.5 2 4.5 4.5 0 .3 0 .7-.1 1-.3 1.4-.6 3 .2 4.2l1.3 1.9c.1.1.2.2.4.2.1 0 .2-.1.3-.2l1.3-1.9c.8-1.2.5-2.7.2-4.1-.1-.3-.1-.6-.1-1 0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 .4 0 .7-.1 1.1-.3 1.3-.6 2.7.1 3.9l1.2 2.1c0 .1.1.1.1.1 2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5c0-.4 0-.8.1-1.1.3-1.3.6-2.7-.1-3.9L23 9.2c0-.1-.1-.1-.2-.1l-1.3 1.9c-.8 1.2-.5 2.8-.2 4.2.1.3.1.7.1 1 0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5c0-.3 0-.5.1-.8.2-1.3.4-2.7-.3-3.8l-.9-1.3c-.6-.8-1.5-1.3-2.5-1.6-1.7-.7-2.9-2.3-2.9-4.2C5.9 2 7.9 0 10.4 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function VercelLogo({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path d="M12 4 22 20H2L12 4Z" fill="currentColor" />
    </svg>
  );
}

// Logo + label, self-contained flex so it renders identically in SelectItem and SelectValue (trigger) — picked integration shows its logo too.
export function IntegrationOption({ id }: { id: IntegrationId }) {
  return (
    <span className="flex items-center gap-2">
      {id === "mastra" ? <MastraLogo className="h-3.5 w-[22px]" /> : <VercelLogo className="size-3.5" />}
      {id === "mastra" ? "Mastra" : "AI SDK"}
    </span>
  );
}
