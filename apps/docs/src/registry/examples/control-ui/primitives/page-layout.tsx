"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { NativeSelect } from "@/components/control-ui/ui/native-select";
import {
  PageActions,
  PageBody,
  PageDescription,
  PageHeader,
  PageLayout,
  PageTitle,
  type PageWidth,
  pageWidths,
} from "@/components/control-ui/ui/page-layout";

const releases = [
  { name: "Inbox triage", detail: "12 unread items across 3 projects." },
  { name: "Weekly digest", detail: "Sent every Monday at 09:00 UTC." },
  { name: "Retention alerts", detail: "Two accounts crossed the churn threshold." },
];

export function PrimitivePageLayoutExample() {
  const [width, setWidth] = useState<PageWidth>("content");

  return (
    <PageLayout scroll="inset" width={width} className="h-[26rem]">
      <PageHeader variant="sticky">
        <PageTitle>Surveys</PageTitle>
        <PageDescription>Every survey in this workspace, newest first.</PageDescription>
        <PageActions>
          <NativeSelect aria-label="Page width" value={width} onChange={(event) => setWidth(event.target.value as PageWidth)}>
            {pageWidths.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </NativeSelect>
          <Button variant="solid" tone="primary" size="sm">
            <PlusIcon />
            New survey
          </Button>
        </PageActions>
      </PageHeader>
      <PageBody contentClassName="grid gap-3">
        {releases.map((release) => (
          <Card key={release.name}>
            <CardHeader>
              <CardTitle>{release.name}</CardTitle>
              <CardDescription>{release.detail}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </PageBody>
    </PageLayout>
  );
}
