"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/control-ui/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="flex items-center gap-5">
        <h1 className="text-heading-2 font-medium">404</h1>
        <div className="h-8 w-px bg-border" />
        <p className="text-body text-muted-foreground">This page could not be found.</p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="solid" tone="primary" onClick={() => router.push("/overview")}>
          Back to home
        </Button>
        <Button variant="surface" onClick={() => router.refresh()}>
          Retry
        </Button>
      </div>
    </main>
  );
}
