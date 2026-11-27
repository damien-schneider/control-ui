import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/control-ui/ui/card";

export function PreviewPanel({ children }: { children: ReactNode }) {
  return (
    <Card size="sm" className="w-full">
      <CardContent>{children}</CardContent>
    </Card>
  );
}
