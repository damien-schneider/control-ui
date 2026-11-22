import { ArrowUp, Plus } from "lucide-react";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ChatComposer,
  ChatComposerFooter,
  ChatComposerHeader,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
  ChatComposerTools,
  useHoldChatComposerOpen,
} from "@/components/control-ui/chat-composer";
import { ChatComposerAttachment, ChatComposerAttachments } from "@/components/control-ui/chat-composer-attachment";
import { ChatComposerEditor } from "@/components/control-ui/chat-composer-editor";
import { ModelSwitcher } from "@/components/control-ui/model-switcher";
import { Button } from "@/components/control-ui/ui/button";

const parameters = new URLSearchParams(location.search);
const layout = parameters.get("layout") === "stacked" ? "stacked" : "auto";
const models = [{ value: "claude-sonnet-4-5" }, { value: "gpt-5" }];

function Hold({ held }: { held: boolean }) {
  useHoldChatComposerOpen(held);
  return null;
}

function Composer({ name }: { name: string }) {
  const [model, setModel] = useState("claude-sonnet-4-5");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [held, setHeld] = useState(false);

  return (
    <>
      <Button size="xs" variant="surface" onClick={() => setAttachments((names) => [...names, `notes-${names.length}.txt`])}>
        {`Attach to ${name}`}
      </Button>
      <Button size="xs" variant="surface" aria-pressed={held} onClick={() => setHeld((holding) => !holding)}>
        {`Hold ${name} open`}
      </Button>
      <ChatComposer layout={layout} aria-label={name} onSubmit={({ clear }) => clear()}>
        <Hold held={held} />
        <ChatComposerShell>
          {parameters.has("header") ? <ChatComposerHeader>Context: release notes</ChatComposerHeader> : null}
          <ChatComposerAttachments>
            {attachments.map((attachment) => (
              <ChatComposerAttachment key={attachment} name={attachment} />
            ))}
          </ChatComposerAttachments>
          {parameters.has("editor") ? (
            <ChatComposerEditor aria-label="Message" placeholder="Ask anything, @ to mention" />
          ) : (
            <ChatComposerTextarea placeholder="Ask anything, @ to mention" />
          )}
          <ChatComposerToolbar>
            <ChatComposerTools>
              <Button size="xs" variant="ghost" iconOnly aria-label="Add context">
                <Plus aria-hidden="true" />
              </Button>
            </ChatComposerTools>
            <ModelSwitcher models={models} value={model} onValueChange={setModel} size="xs" variant="ghost" />
            <ChatComposerSubmit iconOnly aria-label="Send">
              <ArrowUp aria-hidden="true" />
            </ChatComposerSubmit>
          </ChatComposerToolbar>
          {parameters.has("footer") ? <ChatComposerFooter>Answers can be wrong.</ChatComposerFooter> : null}
        </ChatComposerShell>
      </ChatComposer>
    </>
  );
}

function Fixture() {
  return (
    <main style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 24, height: "100dvh", padding: 24 }}>
      <Button variant="surface">Outside</Button>
      <div style={{ inlineSize: 560 }}>
        <Composer name="Second composer" />
      </div>
      <div style={{ inlineSize: 560 }}>
        <Composer name="Composer" />
      </div>
    </main>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<Fixture />);
