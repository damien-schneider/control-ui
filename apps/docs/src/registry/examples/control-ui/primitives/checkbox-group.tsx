"use client";

import { useState } from "react";

import { Checkbox } from "@/components/control-ui/ui/checkbox";
import { CheckboxGroup, CheckboxGroupItem } from "@/components/control-ui/ui/checkbox-group";
import { Text } from "@/components/control-ui/ui/typography";

const ALL_VALUES = ["email", "sms", "push", "slack"];

export function PrimitiveCheckboxGroupExample() {
  const [value, setValue] = useState<string[]>(["email", "push"]);

  const allChecked = value.length === ALL_VALUES.length;
  const someChecked = value.length > 0 && !allChecked;

  return (
    <CheckboxGroup value={value} onValueChange={setValue} aria-label="Notification channels" className="w-full max-w-xs">
      <CheckboxGroupItem htmlFor="channels-all">
        <Checkbox
          id="channels-all"
          checked={allChecked}
          indeterminate={someChecked}
          onCheckedChange={(checked) => setValue(checked ? ALL_VALUES : [])}
          aria-label="Select all channels"
        />
        <Text weight="medium" tone="foreground">
          Select all channels
        </Text>
      </CheckboxGroupItem>
      <CheckboxGroupItem htmlFor="channel-email" className="ml-6">
        <Checkbox id="channel-email" value="email" aria-label="Email" />
        <span className="flex flex-col">
          <Text weight="medium" tone="foreground">
            Email
          </Text>
          <Text size="caption" tone="muted">
            Digest and receipts
          </Text>
        </span>
      </CheckboxGroupItem>
      <CheckboxGroupItem htmlFor="channel-sms" className="ml-6">
        <Checkbox id="channel-sms" value="sms" aria-label="SMS" />
        <span className="flex flex-col">
          <Text weight="medium" tone="foreground">
            SMS
          </Text>
          <Text size="caption" tone="muted">
            Critical alerts only
          </Text>
        </span>
      </CheckboxGroupItem>
      <CheckboxGroupItem htmlFor="channel-push" className="ml-6">
        <Checkbox id="channel-push" value="push" aria-label="Push" />
        <span className="flex flex-col">
          <Text weight="medium" tone="foreground">
            Push
          </Text>
          <Text size="caption" tone="muted">
            Mobile and desktop
          </Text>
        </span>
      </CheckboxGroupItem>
      <CheckboxGroupItem htmlFor="channel-slack" className="ml-6">
        <Checkbox id="channel-slack" value="slack" aria-label="Slack" />
        <span className="flex flex-col">
          <Text weight="medium" tone="foreground">
            Slack
          </Text>
          <Text size="caption" tone="muted">
            Post to #alerts
          </Text>
        </span>
      </CheckboxGroupItem>
    </CheckboxGroup>
  );
}
