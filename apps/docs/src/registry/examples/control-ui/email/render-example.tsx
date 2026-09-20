import { render, toPlainText } from "react-email";
import type { EmailTheme } from "@/components/control-ui/email/theme";
import { AnnouncementEmailExample } from "./messages/announcement";
import { EditorialEmailExample } from "./messages/editorial";
import { InvitationEmailExample } from "./messages/invitation";
import { NewsletterEmailExample } from "./messages/newsletter";
import { ReceiptEmailExample } from "./messages/receipt";
import { ReleaseNotesEmailExample } from "./messages/release";
import { SummaryEmailExample } from "./messages/summary";
import { VerificationEmailExample } from "./messages/verification";
import type { EmailLayoutId, EmailPreviewResult } from "./options";

const exampleMessages: Record<EmailLayoutId, ({ theme }: { theme: EmailTheme }) => React.JSX.Element> = {
  invitation: InvitationEmailExample,
  product: AnnouncementEmailExample,
  release: ReleaseNotesEmailExample,
  editorial: EditorialEmailExample,
  newsletter: NewsletterEmailExample,
  summary: SummaryEmailExample,
  verification: VerificationEmailExample,
  receipt: ReceiptEmailExample,
};

export async function renderEmailExample(layout: EmailLayoutId, theme: EmailTheme): Promise<EmailPreviewResult> {
  const Message = exampleMessages[layout];
  const html = await render(<Message theme={theme} />);
  return { html, text: toPlainText(html) };
}
