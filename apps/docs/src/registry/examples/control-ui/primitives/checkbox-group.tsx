"use client";

import { useState } from "react";

import { Checkbox } from "@/components/control-ui/ui/checkbox";
import { CheckboxGroup } from "@/components/control-ui/ui/checkbox-group";

const ALL_VALUES = ["email", "sms", "push", "slack"];

export function PrimitiveCheckboxGroupExample() {
  const [value, setValue] = useState<string[]>(["email", "push"]);

  const allChecked = value.length === ALL_VALUES.length;
  const someChecked = value.length > 0 && !allChecked;

  return (
    <CheckboxGroup
      value={value}
      onValueChange={setValue}
      allValues={ALL_VALUES}
      aria-label="Notification channels"
      className="w-full max-w-xs"
    >
      <label
        htmlFor="channels-all"
        className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] p-2 text-[13px] font-medium text-foreground transition-colors hover:bg-foreground/4"
      >
        <Checkbox
          id="channels-all"
          checked={allChecked}
          indeterminate={someChecked}
          onCheckedChange={(checked) => setValue(checked ? ALL_VALUES : [])}
          aria-label="Select all channels"
        />
        Select all channels
      </label>
      <label
        htmlFor="channel-email"
        className="ml-6 flex cursor-pointer items-start gap-2.5 rounded-[var(--radius-md)] p-2 text-[13px] transition-colors hover:bg-foreground/4 has-[[data-checked]]:bg-foreground/4"
      >
        <Checkbox id="channel-email" value="email" className="mt-0.5" aria-label="Email" />
        <span className="flex flex-col">
          <span className="font-medium text-foreground">Email</span>
          <span className="text-meta text-muted-foreground">Digest and receipts</span>
        </span>
      </label>
      <label
        htmlFor="channel-sms"
        className="ml-6 flex cursor-pointer items-start gap-2.5 rounded-[var(--radius-md)] p-2 text-[13px] transition-colors hover:bg-foreground/4 has-[[data-checked]]:bg-foreground/4"
      >
        <Checkbox id="channel-sms" value="sms" className="mt-0.5" aria-label="SMS" />
        <span className="flex flex-col">
          <span className="font-medium text-foreground">SMS</span>
          <span className="text-meta text-muted-foreground">Critical alerts only</span>
        </span>
      </label>
      <label
        htmlFor="channel-push"
        className="ml-6 flex cursor-pointer items-start gap-2.5 rounded-[var(--radius-md)] p-2 text-[13px] transition-colors hover:bg-foreground/4 has-[[data-checked]]:bg-foreground/4"
      >
        <Checkbox id="channel-push" value="push" className="mt-0.5" aria-label="Push" />
        <span className="flex flex-col">
          <span className="font-medium text-foreground">Push</span>
          <span className="text-meta text-muted-foreground">Mobile and desktop</span>
        </span>
      </label>
      <label
        htmlFor="channel-slack"
        className="ml-6 flex cursor-pointer items-start gap-2.5 rounded-[var(--radius-md)] p-2 text-[13px] transition-colors hover:bg-foreground/4 has-[[data-checked]]:bg-foreground/4"
      >
        <Checkbox id="channel-slack" value="slack" className="mt-0.5" aria-label="Slack" />
        <span className="flex flex-col">
          <span className="font-medium text-foreground">Slack</span>
          <span className="text-meta text-muted-foreground">Post to #alerts</span>
        </span>
      </label>
    </CheckboxGroup>
  );
}
