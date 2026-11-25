import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
} from "@/components/control-ui/chat-composer";
import { ChatLayout, ChatThread, ChatThreadScrollButton, ChatTurn } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";

const parameters = new URLSearchParams(location.search);
const startingTurns = Number(parameters.get("turns") ?? 8);

type Turn = { id: string; from: "user" | "assistant"; paragraphs: string[] };

const PARAGRAPH =
  "A reply grows paragraph by paragraph while it streams, so the reader has to see each new line land right under the question they just asked.";

function Fixture() {
  const [turns, setTurns] = useState<Turn[]>(() =>
    Array.from({ length: startingTurns }, (_turn, index) => ({
      id: `seed-${index}`,
      from: index % 2 === 0 ? "user" : "assistant",
      paragraphs: [`Message ${index + 1} in a conversation that already scrolls.`, PARAGRAPH],
    })),
  );
  const [streaming, setStreaming] = useState(false);

  const write = (count: number) =>
    setTurns((current) => {
      const last = current.at(-1);
      if (last?.from !== "assistant") return current;
      return [...current.slice(0, -1), { ...last, paragraphs: [...last.paragraphs, ...Array.from({ length: count }, () => PARAGRAPH)] }];
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", blockSize: 640, inlineSize: 560 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => write(1)}>
          Write a paragraph
        </button>
        <button type="button" onClick={() => write(12)}>
          Write a long answer
        </button>
        <button type="button" aria-pressed={streaming} onClick={() => setStreaming((value) => !value)}>
          Streaming
        </button>
      </div>
      <ChatLayout chrome="embedded">
        <ChatThread
          composer={
            <>
              <ChatThreadScrollButton busy={streaming} />
              <ChatComposer
                density="compact"
                onSubmit={({ value, clear }) => {
                  clear();
                  setTurns((current) => [
                    ...current,
                    { id: `sent-${current.length}`, from: "user", paragraphs: [value] },
                    { id: `reply-${current.length}`, from: "assistant", paragraphs: ["Thinking"] },
                  ]);
                }}
              >
                <ChatComposerShell>
                  <ChatComposerTextarea aria-label="Message" placeholder="Ask anything…" />
                  <ChatComposerToolbar>
                    <ChatComposerSubmit size="sm" iconOnly aria-label="Send message">
                      ↑
                    </ChatComposerSubmit>
                  </ChatComposerToolbar>
                </ChatComposerShell>
              </ChatComposer>
            </>
          }
        >
          {turns.map((turn) => (
            <ChatTurn key={turn.id} from={turn.from} data-testid={turn.id}>
              <ChatMessage from={turn.from} density="compact">
                <ChatMessageRow>
                  <ChatMessageBody>
                    <ChatMessageContent>
                      {turn.paragraphs.map((paragraph, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs only ever append
                        <p key={index}>{paragraph}</p>
                      ))}
                    </ChatMessageContent>
                  </ChatMessageBody>
                </ChatMessageRow>
              </ChatMessage>
            </ChatTurn>
          ))}
        </ChatThread>
      </ChatLayout>
    </div>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<Fixture />);
