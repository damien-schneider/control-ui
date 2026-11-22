import { Wrench } from "lucide-react";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { ActionBar, ActionBarCopy, ActionBarMeta } from "@/components/control-ui/action-bar";
import { Activity, ActivityIcon, ActivityTitle, ActivityTrigger } from "@/components/control-ui/activity";
import { ChatTurn } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageContent } from "@/components/control-ui/chat-message";
import { Button } from "@/components/control-ui/ui/button";

const steps = ["Reading notes.md", "Searching the web for disclosure patterns used by assistant interfaces", "Editing notes.md"];

function Run() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  return (
    <div style={{ inlineSize: 360 }}>
      <Button size="xs" variant="surface" onClick={() => setStep((current) => (current + 1) % steps.length)}>
        Next step
      </Button>
      <Button size="xs" variant="surface" onClick={() => setDone(true)}>
        Finish
      </Button>
      <Activity kind="tool" state={done ? "success" : "running"}>
        <ActivityTrigger aria-label="Run">
          <ActivityIcon>
            <Wrench />
          </ActivityIcon>
          <ActivityTitle>{done ? "Worked for 12s" : steps[step]}</ActivityTitle>
        </ActivityTrigger>
      </Activity>
    </div>
  );
}

function Answer({ name }: { name: string }) {
  return (
    <ChatTurn from="assistant" aria-label={name}>
      <ChatMessage from="assistant">
        <ChatMessageContent>{`${name} text.`}</ChatMessageContent>
      </ChatMessage>
      <ActionBar label={`${name} actions`} copyValue={`${name} text.`}>
        <ActionBarCopy />
        <ActionBarMeta>Opus · High · 12s</ActionBarMeta>
      </ActionBar>
    </ChatTurn>
  );
}

function Fixture() {
  return (
    <main style={{ display: "grid", gap: 24, padding: 24 }}>
      <Run />
      <div>
        <Answer name="Earlier answer" />
        <ChatTurn from="user" aria-label="Question">
          <ChatMessage from="user">
            <ChatMessageContent>And then?</ChatMessageContent>
          </ChatMessage>
        </ChatTurn>
        <Answer name="Latest answer" />
        <section aria-label="Suggested edit">Suggested edit ready to review</section>
      </div>
    </main>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<Fixture />);
