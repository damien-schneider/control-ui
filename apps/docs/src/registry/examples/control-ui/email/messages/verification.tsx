import { VerificationEmail } from "@/components/control-ui/email/templates";
import { brand, transactionalFooter } from "../content";
import type { EmailExampleProps } from "../options";

export function VerificationEmailExample({ theme, variant }: EmailExampleProps) {
  return (
    <VerificationEmail
      theme={theme}
      variant={variant}
      brand={brand}
      footer={{ ...transactionalFooter, align: "center" }}
      code="418 902"
      expiresInMinutes={10}
      supportUrl="https://example.com/support"
    />
  );
}
