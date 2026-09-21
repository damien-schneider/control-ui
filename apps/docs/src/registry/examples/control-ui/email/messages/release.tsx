import { ReleaseNotesEmail } from "@/components/control-ui/email/templates";
import { brand, browserUrl, marketingFooter } from "../content";
import type { EmailExampleProps } from "../options";

export function ReleaseNotesEmailExample({ theme, variant }: EmailExampleProps) {
  return (
    <ReleaseNotesEmail
      theme={theme}
      variant={variant}
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
      migration={{
        notes:
          "### Upgrading\n\nWorkspace tokens move from `workspace.key` to a scoped `workspace.id` before [June 30](https://example.com/changelog/2-4), and the old keys keep working until then.",
        language: "typescript",
        code: 'const workspace = await fieldwork.workspaces.get({\n  id: "ws_7f3a", // was: key: "studio-north"\n  include: ["members", "projects"],\n});',
      }}
    />
  );
}
