"use client";

import { useState } from "react";

import { Checkbox } from "@/components/control-ui/ui/checkbox";
import { CheckboxGroup, CheckboxGroupItem } from "@/components/control-ui/ui/checkbox-group";

const ALL_VALUES = ["email", "sms", "push", "slack"];

export function PrimitiveCheckboxGroupExample() {
  const [value, setValue] = useState<string[]>(["email", "push"]);

  const allChecked = value.length === ALL_VALUES.length;
  const someChecked = value.length > 0 && !allChecked;

  return (
    <CheckboxGroup value={value} onValueChange={setValue} aria-label="Notification channels" className="w-full max-w-xs">
      <CheckboxGroupItem htmlFor="channels-all" className="items-center font-medium text-foreground">
        <Checkbox
          id="channels-all"
          checked={allChecked}
          indeterminate={someChecked}
          onCheckedChange={(checked) => setValue(checked ? ALL_VALUES : [])}
          aria-label="Select all channels"
        />
        Select all channels
      </CheckboxGroupItem>
      <CheckboxGroupItem htmlFor="channel-email" className="ml-6">
        <Checkbox id="channel-email" value="email" className="mt-0.5" aria-label="Email" />
        <span className="flex flex-col">
          <span className="font-medium text-foreground">Email</span>
          <span className="text-caption text-muted-foreground">Digest and receipts</span>
        </span>
      </CheckboxGroupItem>
      <CheckboxGroupItem htmlFor="channel-sms" className="ml-6">
        <Checkbox id="channel-sms" value="sms" className="mt-0.5" aria-label="SMS" />
        <span className="flex flex-col">
          <span className="font-medium text-foreground">SMS</span>
          <span className="text-caption text-muted-foreground">Critical alerts only</span>
        </span>
      </CheckboxGroupItem>
      <CheckboxGroupItem htmlFor="channel-push" className="ml-6">
        <Checkbox id="channel-push" value="push" className="mt-0.5" aria-label="Push" />
        <span className="flex flex-col">
          <span className="font-medium text-foreground">Push</span>
          <span className="text-caption text-muted-foreground">Mobile and desktop</span>
        </span>
      </CheckboxGroupItem>
      <CheckboxGroupItem htmlFor="channel-slack" className="ml-6">
        <Checkbox id="channel-slack" value="slack" className="mt-0.5" aria-label="Slack" />
        <span className="flex flex-col">
          <span className="font-medium text-foreground">Slack</span>
          <span className="text-caption text-muted-foreground">Post to #alerts</span>
        </span>
      </CheckboxGroupItem>
    </CheckboxGroup>
  );
}
