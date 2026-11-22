import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
} from "@/components/control-ui/chat-composer";
import {
  ChatLayout,
  ChatLayoutActions,
  ChatLayoutHeader,
  ChatLayoutTitle,
  ChatThread,
  ChatThreadScrollButton,
  ChatTurn,
} from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import {
  ChatWorkspace,
  ChatWorkspaceCollapsible,
  ChatWorkspaceDockToggle,
  ChatWorkspaceExpandToggle,
  ChatWorkspaceInset,
  ChatWorkspaceMain,
  ChatWorkspacePanel,
  ChatWorkspaceResizeHandle,
  type ChatWorkspaceSide,
  useChatWorkspace,
} from "@/components/control-ui/chat-workspace";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

const parameters = new URLSearchParams(location.search);
const blockCount = Number(parameters.get("blocks") ?? 40);
const turnCount = Number(parameters.get("turns") ?? 12);
const side: ChatWorkspaceSide = parameters.get("side") === "left" ? "left" : "right";
const docked = parameters.get("docked") === "1";
const frameWidth = parameters.get("frame");
const startsClosed = parameters.get("closed") === "1";

const blocks = Array.from(
  { length: blockCount },
  (_block, index) => `Block ${index}: a line of canvas content long enough to wrap when the main column narrows beside a pinned chat.`,
);
const turns = Array.from({ length: turnCount }, (_turn, index) => ({
  id: `turn-${index}`,
  from: index % 2 === 0 ? ("user" as const) : ("assistant" as const),
  text: `Message ${index} in a conversation that runs long enough to scroll inside the transcript.`,
}));

const recorded: { widths: number[]; docked: boolean[]; expanded: boolean[] } = { widths: [], docked: [], expanded: [] };
Object.assign(window, { recorded });

const composer = (
  <ChatComposer density="compact" onSubmit={({ clear }) => clear()}>
    <ChatComposerShell>
      <ChatComposerTextarea aria-label="Message" placeholder="Ask anything…" />
      <ChatComposerToolbar>
        <ChatComposerSubmit size="sm" iconOnly aria-label="Send message">
          <ArrowUp />
        </ChatComposerSubmit>
      </ChatComposerToolbar>
    </ChatComposerShell>
  </ChatComposer>
);

function Remote() {
  const workspace = useChatWorkspace();
  Object.assign(window, { workspace });
  return null;
}

function Fixture() {
  const [open, setOpen] = useState(!startsClosed);
  return (
    <div className="h-dvh p-0" style={frameWidth ? { inlineSize: `${frameWidth}px` } : undefined}>
      <ChatWorkspace
        className="h-full"
        side={side}
        defaultDocked={docked}
        onDockedChange={(next) => recorded.docked.push(next)}
        onExpandedChange={(next) => recorded.expanded.push(next)}
        onPanelWidthChange={(next) => recorded.widths.push(next)}
      >
        <Remote />
        <ChatWorkspaceMain>
          <ScrollArea aria-label="Canvas" className="h-full">
            <article className="flex flex-col gap-3 p-6">
              {blocks.map((block) => (
                <p key={block}>{block}</p>
              ))}
              <p data-testid="canvas-end">End of canvas</p>
              <button type="button" onClick={() => setOpen(!open)}>
                {open ? "Close chat" : "Open chat"}
              </button>
              <ChatWorkspaceInset />
            </article>
          </ScrollArea>
        </ChatWorkspaceMain>
        {open ? (
          <ChatWorkspacePanel>
            <ChatLayout chrome="embedded">
              <ChatLayoutHeader>
                <ChatWorkspaceExpandToggle />
                <ChatLayoutTitle>Chat</ChatLayoutTitle>
                <ChatLayoutActions>
                  <ChatWorkspaceDockToggle />
                </ChatLayoutActions>
              </ChatLayoutHeader>
              <ChatThread
                composer={
                  <>
                    <ChatThreadScrollButton />
                    {composer}
                  </>
                }
              >
                <ChatWorkspaceCollapsible>
                  {turns.map((turn) => (
                    <ChatTurn key={turn.id} from={turn.from}>
                      <ChatMessage from={turn.from} density="compact">
                        <ChatMessageRow>
                          <ChatMessageBody>
                            <ChatMessageContent>{turn.text}</ChatMessageContent>
                          </ChatMessageBody>
                        </ChatMessageRow>
                      </ChatMessage>
                    </ChatTurn>
                  ))}
                </ChatWorkspaceCollapsible>
              </ChatThread>
            </ChatLayout>
            <ChatWorkspaceResizeHandle />
          </ChatWorkspacePanel>
        ) : null}
      </ChatWorkspace>
    </div>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Fixture root is missing");
createRoot(root).render(<Fixture />);
