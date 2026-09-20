import { VerificationEmail } from "@/components/control-ui/email/templates";
import type { EmailTheme } from "@/components/control-ui/email/theme";
import { brand, transactionalFooter } from "../content";

export function VerificationEmailExample({ theme }: { theme: EmailTheme }) {
  return (
    <VerificationEmail
      theme={theme}
      brand={brand}
      footer={transactionalFooter}
      code="418 902"
      expiresInMinutes={10}
      supportUrl="https://example.com/support"
    />
  );
}
