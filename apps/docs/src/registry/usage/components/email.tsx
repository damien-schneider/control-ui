import { render, toPlainText } from "react-email";
import { InvitationEmail } from "@/components/control-ui/email/templates";
import { emailThemeFromCss } from "@/components/control-ui/email/theme";

export async function renderInvitation({
  coreThemeCss,
  skinThemeCss,
  overrideCss,
  inviter,
  workspace,
  inviteUrl,
}: {
  coreThemeCss: string;
  skinThemeCss: string;
  overrideCss: string;
  inviter: string;
  workspace: string;
  inviteUrl: string;
}) {
  const theme = emailThemeFromCss([coreThemeCss, skinThemeCss, overrideCss], "light");
  const html = await render(
    <InvitationEmail
      theme={theme}
      brand="Your company"
      footer="You received this email because a teammate invited you."
      inviter={inviter}
      workspace={workspace}
      inviteUrl={inviteUrl}
    />,
  );
  return { html, text: toPlainText(html) };
}
