"use client";

import { Badge } from "@/components/control-ui/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/control-ui/ui/card";

export function PrimitiveCardExample() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Pro plan</CardTitle>
        <CardDescription>Everything you need to ship agents.</CardDescription>
        <CardAction>
          <Badge variant="secondary">Popular</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">
          $29<span className="text-sm font-normal text-muted-foreground">/mo</span>
        </p>
      </CardContent>
      <CardFooter>
        <span className="text-sm text-muted-foreground">Billed monthly. Cancel anytime.</span>
      </CardFooter>
    </Card>
  );
}
