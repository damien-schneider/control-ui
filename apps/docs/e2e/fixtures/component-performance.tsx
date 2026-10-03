import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "../../src/registry/sources/control-ui/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../src/registry/sources/control-ui/ui/collapsible";
import { PopoverViewport } from "../../src/registry/sources/control-ui/ui/popover";

const entries = Array.from({ length: 400 }, (_, index) => index + 1);
const rows = (
  <>
    {entries.map((index) => (
      <article key={index}>
        <strong>Entry {index}</strong>
        <p>
          Details for this entry <span>Ready</span>
        </p>
      </article>
    ))}
  </>
);

function ViewportExample() {
  const [large, setLarge] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setLarge(!large)}>
        Resize content
      </button>
      <PopoverViewport>
        <div style={{ height: large ? 480 : 240, overflow: "auto" }}>{rows}</div>
      </PopoverViewport>
    </>
  );
}

function PanelExample() {
  const kind = new URLSearchParams(location.search).get("kind");
  if (kind === "accordion")
    return (
      <Accordion>
        <AccordionItem value="entries">
          <AccordionTrigger>Show entries</AccordionTrigger>
          <AccordionPanel>{rows}</AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  if (kind === "collapsible")
    return (
      <Collapsible>
        <CollapsibleTrigger>Show entries</CollapsibleTrigger>
        <CollapsibleContent keepMounted>{rows}</CollapsibleContent>
      </Collapsible>
    );
  return <ViewportExample />;
}
const root = document.getElementById("root");
if (!root) throw new Error("Performance fixture root is missing");
createRoot(root).render(
  <main style={{ width: 700, margin: "40px auto" }}>
    <PanelExample />
  </main>,
);
