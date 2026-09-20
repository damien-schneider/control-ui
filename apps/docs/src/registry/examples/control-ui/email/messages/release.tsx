import { ReleaseNotesEmail } from "@/components/control-ui/email/templates";
import type { EmailTheme } from "@/components/control-ui/email/theme";
import { brand, browserUrl, marketingFooter } from "../content";

export function ReleaseNotesEmailExample({ theme }: { theme: EmailTheme }) {
  return (
    <ReleaseNotesEmail
      theme={theme}
      brand={brand}
      browserUrl={browserUrl}
      footer={marketingFooter}
      version="2.4"
      summary="A quieter canvas, faster search, and a few things you asked for. Here is everything that shipped this month."
      changelogUrl="https://example.com/changelog/2-4"
      sections={[
        {
          title: "New",
          changes: [
            "Shared spaces: invite a client to a single project without giving away the workspace.",
            "Offline drafts keep writing when the connection drops, then sync on reconnect.",
          ],
        },
        {
          title: "Improved",
          changes: [
            "Search returns results while you type, across comments and attachments.",
            "Exports keep their folder structure instead of flattening into one archive.",
          ],
        },
        { title: "Fixed", changes: ["Recurring reminders no longer skip the first week of a new month."] },
      ]}
    />
  );
}
