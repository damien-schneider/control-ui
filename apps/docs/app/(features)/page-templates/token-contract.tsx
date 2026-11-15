"use client";

import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/control-ui/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/control-ui/ui/table";
import { Text } from "@/components/control-ui/ui/typography";
import { THEME_CONTRACT, type ThemeContractGroup, type ThemeContractToken } from "@/src/registry/lib/theme-contract";

const GROUP_ORDER = [
  "color",
  "typography",
  "radius",
  "shadow",
  "motion",
  "surface",
  "layout",
] as const satisfies readonly ThemeContractGroup[];

const GROUP_LABELS: Record<ThemeContractGroup, string> = {
  color: "Color",
  typography: "Typography",
  radius: "Radius",
  shadow: "Shadow",
  motion: "Motion",
  surface: "Surface",
  layout: "Layout",
};

const coreTokens = GROUP_ORDER.flatMap((group) => THEME_CONTRACT.filter((token) => token.tier === "core" && token.group === group));

const advancedGroups = GROUP_ORDER.flatMap((group) => {
  const tokens = THEME_CONTRACT.filter((token) => token.tier === "advanced" && token.group === group);
  return tokens.length > 0 ? [{ group, tokens }] : [];
});

const derivedTokens = GROUP_ORDER.flatMap((group) => THEME_CONTRACT.filter((token) => token.tier === "derived" && token.group === group));

function TokenTable({ label, tokens }: { label: string; tokens: ThemeContractToken[] }) {
  return (
    <Table aria-label={label}>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tokens.map((token) => (
          <TableRow key={token.name}>
            <TableCell>
              <Text as="code" size="label" mono>
                {token.name}
              </Text>
            </TableCell>
            <TableCell>
              <Text size="caption" tone="muted">
                {GROUP_LABELS[token.group]}
              </Text>
            </TableCell>
            <TableCell>
              <span className="block min-w-64 whitespace-normal">
                <Text size="label" tone="muted">
                  {token.description}
                </Text>
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TokenContractTable() {
  return (
    <div className="grid min-w-0 gap-4">
      <Card size="sm" className="min-w-0">
        <CardHeader>
          <CardTitle>Core</CardTitle>
          <CardDescription>
            The <Text numeric>{coreTokens.length}</Text> tokens a skin typically re-values first
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TokenTable label="Core tokens" tokens={coreTokens} />
        </CardContent>
      </Card>

      <Card size="sm" className="min-w-0">
        <CardContent>
          <Accordion multiple>
            <AccordionItem value="derived">
              <AccordionTrigger>
                <span className="flex flex-wrap items-baseline gap-x-2">
                  Derived — optional overrides
                  <Text size="caption" tone="muted" numeric>
                    {derivedTokens.length} tokens with a core default; re-value one in theme.css only to diverge
                  </Text>
                </span>
              </AccordionTrigger>
              <AccordionPanel>
                <TokenTable label="Derived tokens" tokens={derivedTokens} />
              </AccordionPanel>
            </AccordionItem>
            {advancedGroups.map(({ group, tokens }) => (
              <AccordionItem key={group} value={group}>
                <AccordionTrigger>
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    Advanced — {GROUP_LABELS[group]}
                    <Text size="caption" tone="muted" numeric>
                      {tokens.length} {tokens.length === 1 ? "token" : "tokens"}
                    </Text>
                  </span>
                </AccordionTrigger>
                <AccordionPanel>
                  <TokenTable label={`Advanced ${GROUP_LABELS[group]} tokens`} tokens={tokens} />
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
