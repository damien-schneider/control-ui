"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/control-ui/ui/table";
import { Text } from "@/components/control-ui/ui/typography";

const deployments = [
  { id: "dpl_9f2c", branch: "main", environment: "Production", duration: "1m 42s" },
  { id: "dpl_8e1b", branch: "fix/billing-rounding", environment: "Preview", duration: "58s" },
  { id: "dpl_7d0a", branch: "feat/audit-log", environment: "Preview", duration: "1m 12s" },
  { id: "dpl_6c9f", branch: "main", environment: "Production", duration: "1m 39s" },
  { id: "dpl_5b8e", branch: "chore/upgrade-react", environment: "Preview", duration: "2m 04s" },
  { id: "dpl_4a7d", branch: "feat/team-invites", environment: "Preview", duration: "1m 08s" },
  { id: "dpl_396c", branch: "main", environment: "Production", duration: "1m 44s" },
  { id: "dpl_285b", branch: "fix/webhook-retries", environment: "Preview", duration: "49s" },
  { id: "dpl_174a", branch: "feat/usage-export", environment: "Preview", duration: "1m 21s" },
  { id: "dpl_0639", branch: "main", environment: "Production", duration: "1m 37s" },
  { id: "dpl_f528", branch: "docs/api-reference", environment: "Preview", duration: "36s" },
  { id: "dpl_e417", branch: "main", environment: "Production", duration: "1m 41s" },
];

export function PrimitiveTableStickyHeaderExample() {
  return (
    <div className="w-full max-w-lg">
      <Table aria-label="Recent deployments" maxHeight="16rem" stickyHeader>
        <TableHeader>
          <TableRow>
            <TableHead>Deployment</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Environment</TableHead>
            <TableHead className="text-right">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deployments.map((deployment) => (
            <TableRow key={deployment.id}>
              <TableCell>
                <Text weight="medium" mono>
                  {deployment.id}
                </Text>
              </TableCell>
              <TableCell>{deployment.branch}</TableCell>
              <TableCell>{deployment.environment}</TableCell>
              <TableCell className="text-right">
                <Text numeric>{deployment.duration}</Text>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
