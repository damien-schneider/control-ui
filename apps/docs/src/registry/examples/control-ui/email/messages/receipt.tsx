import { ReceiptEmail } from "@/components/control-ui/email/templates";
import type { EmailTheme } from "@/components/control-ui/email/theme";
import { brand, transactionalFooter } from "../content";

export function ReceiptEmailExample({ theme }: { theme: EmailTheme }) {
  return (
    <ReceiptEmail
      theme={theme}
      brand={brand}
      footer={transactionalFooter}
      orderNumber="FW-20418"
      orderDate="March 4, 2026"
      invoiceUrl="https://example.com/invoices/FW-20418"
      paymentMethod="Visa ending 4242"
      total="$96.00"
      lines={[
        { label: "Studio plan · 1 seat", value: "$72.00" },
        { label: "Extra storage · 200 GB", value: "$16.00" },
        { label: "Tax", value: "$8.00" },
      ]}
    />
  );
}
