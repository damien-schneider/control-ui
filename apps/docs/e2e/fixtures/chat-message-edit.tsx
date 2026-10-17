import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ActionBarCopy, ActionBarEdit } from "@/components/control-ui/action-bar";
import { ChatTurn } from "@/components/control-ui/chat-layout";
import {
  ChatMessage,
  ChatMessageBody,
  ChatMessageEditable,
  ChatMessageRow,
  ChatMessageTime,
} from "../../src/registry/sources/control-ui/chat-message";

function Fixture() {
  const params = new URLSearchParams(location.search);
  const [value, setValue] = useState(params.get("text") ?? "Summarize the latest deployment notes.");
  const [pending, setPending] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const settlement = useRef<{ resolve: () => void; reject: () => void } | null>(null);

  async function save(nextValue: string) {
    setSaveCount((count) => count + 1);
    if (params.has("async")) {
      setPending(true);
      try {
        await new Promise<void>((resolve, reject) => {
          settlement.current = { resolve, reject: () => reject(new Error("Save failed")) };
        });
      } finally {
        setPending(false);
      }
    }
    setValue(nextValue);
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: 16 }}>
      <ChatTurn from="user">
        <ChatMessage from="user" layout={params.has("flat") ? "flat" : "bubble"}>
          <ChatMessageRow>
            <ChatMessageBody>
              <ChatMessageEditable value={value} onSave={save}>
                {params.has("time") ? (
                  <>
                    <ChatMessageTime dateTime="2026-10-17T17:04:00Z">5:04 PM</ChatMessageTime>
                    <ActionBarCopy />
                    <ActionBarEdit />
                  </>
                ) : null}
              </ChatMessageEditable>
            </ChatMessageBody>
          </ChatMessageRow>
        </ChatMessage>
      </ChatTurn>
      <p data-testid="following-message">The following message stays in place.</p>
      <output aria-label="Saved value">{value}</output>
      <output aria-label="Save count">{saveCount}</output>
      <button type="button" disabled={!pending} onClick={() => settlement.current?.resolve()}>
        Resolve save
      </button>
      <button type="button" disabled={!pending} onClick={() => settlement.current?.reject()}>
        Reject save
      </button>
      <button type="button" onClick={() => setValue("Updated by the host")}>
        Update externally
      </button>
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Message fixture root is missing");
createRoot(root).render(<Fixture />);
