"use client";

import { Badge } from "@/components/control-ui/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveCardExample() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Pro plan</CardTitle>
        <CardDescription>Everything you need to ship agents.</CardDescription>
        <CardAction>
          <Badge>Popular</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Text as="p" size="heading-2">
          $29
          <Text weight="normal" tone="muted">
            /mo
          </Text>
        </Text>
      </CardContent>
      <CardFooter>
        <Text tone="muted">Billed monthly. Cancel anytime.</Text>
      </CardFooter>
    </Card>
  );
}
