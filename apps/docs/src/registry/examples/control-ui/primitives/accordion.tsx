"use client";

import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/control-ui/ui/accordion";

export function PrimitiveAccordionExample() {
  return (
    <Accordion defaultValue={["what"]} className="w-full max-w-sm">
      <AccordionItem value="what">
        <AccordionTrigger>What is Control UI?</AccordionTrigger>
        <AccordionPanel>
          A registry of Base UI primitives styled entirely with your theme tokens, so every surface tracks the design direction.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="install">
        <AccordionTrigger>How do I install a primitive?</AccordionTrigger>
        <AccordionPanel>
          Run the shadcn CLI against the Control UI registry and the slot lands under components/control-ui/ui.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="skin">
        <AccordionTrigger>Can I restyle it?</AccordionTrigger>
        <AccordionPanel>Yes — swap the theme tokens or add a skin pack; the primitive markup and behavior stay the same.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
