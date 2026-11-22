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
import { Badge } from "@/components/control-ui/ui/badge";
import { Button } from "@/components/control-ui/ui/button";
import { ButtonGroup } from "@/components/control-ui/ui/button-group";
import { Input } from "@/components/control-ui/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";
import { Slider } from "@/components/control-ui/ui/slider";
import { Switch } from "@/components/control-ui/ui/switch";
import { Tabs, TabsList, TabsTab } from "@/components/control-ui/ui/tabs";
import { Toggle, ToggleGroup } from "@/components/control-ui/ui/toggle";

const parameters = new URLSearchParams(location.search);
const layout = parameters.get("layout") === "stacked" ? "stacked" : "auto";
const models = [{ value: "claude-sonnet-4-5" }, { value: "gpt-5" }];
const corner = parameters.get("corner");
const CORNERS: Record<string, React.ReactNode> = {
  slider: <Slider className="w-44" variant="plain" label="Detail" min={1} max={5} step={1} defaultValue={3} />,
  "slider-default": <Slider className="w-44" aria-label="Level" defaultValue={30} />,
  badge: <Badge variant="outline">notes.md</Badge>,
  "badge-default": <Badge>notes.md</Badge>,
  tabs: (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTab value="a">Ask</TabsTab>
        <TabsTab value="b">Plan</TabsTab>
      </TabsList>
    </Tabs>
  ),
  select: (
    <Select defaultValue="a">
      <SelectTrigger size="xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Ask</SelectItem>
      </SelectContent>
    </Select>
  ),
  "select-ghost": (
    <Select defaultValue="a">
      <SelectTrigger size="xs" variant="ghost">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Ask</SelectItem>
      </SelectContent>
    </Select>
  ),
  switch: <Switch aria-label="Web" />,
  input: <Input size="xs" aria-label="Path" defaultValue="src" />,
  "button-group": (
    <ButtonGroup>
      <Button size="xs" variant="surface">
        A
      </Button>
      <Button size="xs" variant="surface">
        B
      </Button>
    </ButtonGroup>
  ),
  "toggle-group": (
    <ToggleGroup defaultValue={["a"]}>
      <Toggle value="a" size="xs">
        Ask
      </Toggle>
      <Toggle value="b" size="xs">
        Plan
      </Toggle>
    </ToggleGroup>
  ),
  "toggle-ghost": (
    <ToggleGroup defaultValue={["a"]}>
      <Toggle variant="ghost" value="a" size="xs">
        Ask
      </Toggle>
      <Toggle variant="ghost" value="b" size="xs">
        Plan
      </Toggle>
    </ToggleGroup>
  ),
};

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
              {corner ? CORNERS[corner] : null}
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
