"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableRowLink,
} from "@/components/control-ui/ui/table";
import { Text } from "@/components/control-ui/ui/typography";

const invoices = [
  { id: "INV-001", status: "Paid", method: "Credit Card", amount: "$250.00" },
  { id: "INV-002", status: "Pending", method: "PayPal", amount: "$150.00" },
  { id: "INV-003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
];

export function PrimitiveTableExample() {
  const [openInvoiceId, setOpenInvoiceId] = useState<string>();
  return (
    <div className="w-full max-w-lg">
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} data-state={openInvoiceId === invoice.id ? "selected" : undefined}>
              <TableCell>
                <TableRowLink onClick={() => setOpenInvoiceId(invoice.id)}>
                  <Text weight="medium">{invoice.id}</Text>
                </TableRowLink>
              </TableCell>
              <TableCell>{invoice.status}</TableCell>
              <TableCell>{invoice.method}</TableCell>
              <TableCell className="text-right">
                <Text numeric>{invoice.amount}</Text>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">
              <Text numeric>$750.00</Text>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
