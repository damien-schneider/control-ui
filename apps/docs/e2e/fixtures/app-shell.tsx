import { InboxIcon } from "lucide-react";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { AppShell, AppShellContent, AppShellHeader } from "@/components/control-ui/ui/app-shell";
import { Button } from "@/components/control-ui/ui/button";
import { PageBody, PageHeader, PageLayout, type PageScrollMode, PageTitle } from "@/components/control-ui/ui/page-layout";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/control-ui/ui/sidebar";
import { Skeleton } from "@/components/control-ui/ui/skeleton";

const parameters = new URLSearchParams(location.search);
const requestedScroll = parameters.get("scroll");
const scroll: PageScrollMode = requestedScroll === "inset" || requestedScroll === "none" ? requestedScroll : "page";
const requestedVariant = parameters.get("variant");
const variant =
  requestedVariant === "inset" || requestedVariant === "floating" || requestedVariant === "page" ? requestedVariant : "sidebar";
const rows = Array.from({ length: 60 }, (_, index) => `Conversation ${index + 1}`);

function Fixture() {
  const [loading, setLoading] = useState(true);
  const [long, setLong] = useState(false);
  return (
    <AppShell scroll={scroll} defaultOpen={parameters.get("collapsed") !== "true"} persistOpen={false}>
      <Sidebar collapsible="icon" variant={variant}>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Inbox">
                <InboxIcon />
                <span>Inbox</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarRail resizable />
      </Sidebar>
      <AppShellContent>
        <AppShellHeader>
          <SidebarTrigger />
          <Button onClick={() => setLoading(!loading)}>Toggle loading</Button>
          <Button onClick={() => setLong(!long)}>Toggle length</Button>
        </AppShellHeader>
        <PageLayout width={scroll === "none" ? "full" : "wide"}>
          <PageHeader>
            <PageTitle>Inbox</PageTitle>
          </PageHeader>
          {scroll === "none" ? (
            <div className="flex min-h-0 flex-1">
              <ScrollArea className="min-h-0 flex-1" aria-label="Conversations">
                {rows.map((row) => (
                  <p className="p-4" key={row}>
                    {row}
                  </p>
                ))}
              </ScrollArea>
              <div className="flex-1 p-4">Select a conversation</div>
            </div>
          ) : (
            <PageBody>
              {loading ? <Skeleton className="h-20" /> : <p>You’re all caught up.</p>}
              {long &&
                rows.map((row) => (
                  <p className="p-4" key={row}>
                    {row}
                  </p>
                ))}
            </PageBody>
          )}
        </PageLayout>
      </AppShellContent>
    </AppShell>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing fixture root");
createRoot(root).render(<Fixture />);
