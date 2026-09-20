import { InvitationEmail } from "@/components/control-ui/email/templates";
import type { EmailTheme } from "@/components/control-ui/email/theme";
import { brand, browserUrl, transactionalFooter } from "../content";

export function InvitationEmailExample({ theme }: { theme: EmailTheme }) {
  return (
    <InvitationEmail
      theme={theme}
      brand={brand}
      browserUrl={browserUrl}
      footer={transactionalFooter}
      inviter="Alex Morgan"
      workspace="Studio North"
      inviteUrl="https://example.com/invitation"
    />
  );
}
