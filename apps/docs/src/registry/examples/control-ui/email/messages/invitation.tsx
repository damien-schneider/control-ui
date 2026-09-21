import { InvitationEmail } from "@/components/control-ui/email/templates";
import { brand, browserUrl, transactionalFooter } from "../content";
import type { EmailExampleProps } from "../options";

export function InvitationEmailExample({ theme, variant }: EmailExampleProps) {
  return (
    <InvitationEmail
      theme={theme}
      variant={variant}
      brand={brand}
      browserUrl={browserUrl}
      footer={transactionalFooter}
      inviter="Alex Morgan"
      workspace="Studio North"
      inviteUrl="https://example.com/invitation"
    />
  );
}
