import { AnnotationTag } from "@/app/(features)/home/shared/annotation-tag";
import { SectionHeader } from "@/app/(features)/home/shared/section-header";
import { generatedSkinContract } from "@/app/(features)/model/generated-skin-contract";
import { buttonKnobs } from "@/components/control-ui/knob-contracts/button-knobs";
import { AcmePreview } from "./acme-preview";
import { acmeAccent, acmeSkin, acmeStyleSheet, pinnedKnob } from "./acme-skin";
import { PinBoard } from "./pin-wires";
import { type KnobFacts, SkinEditor } from "./skin-editor";

const title = ["A skin is", "three files."] as const;

function pinnedKnobFacts(): KnobFacts | undefined {
  const knob = generatedSkinContract.knobs.button?.find((candidate) => candidate.name === pinnedKnob);
  return knob && { name: knob.name, syntax: knob.syntax, initialValue: knob.initialValue, familyKnobCount: buttonKnobs.length };
}

export function SkinStudio() {
  return (
    <section id="skin-studio" aria-labelledby="skin-studio-title" className="grid min-w-0 gap-14 @4xl/home:gap-18">
      <SectionHeader
        titleId="skin-studio-title"
        title={title}
        lead="Tokens, behavior, component knobs. Start from a preset or an empty folder. The files live in your repo, and no component source changes."
        link={{ href: "/create-a-skin", label: "Read Create a skin" }}
      />
      <style>{acmeStyleSheet}</style>
      <PinBoard
        accent={acmeAccent}
        className="grid min-w-0 gap-6 @4xl/home:grid-cols-[minmax(0,52fr)_minmax(4.5rem,12fr)_minmax(0,51fr)] @4xl/home:gap-0"
      >
        <figure className="relative grid min-w-0 justify-items-start gap-1.5">
          <AnnotationTag className="@4xl/home:absolute @4xl/home:-top-7 @4xl/home:left-0">{`data-skin="${acmeSkin.id}"`}</AnnotationTag>
          <div data-pin-lane="from" className="size-full min-w-0">
            <AcmePreview />
          </div>
        </figure>
        <div data-pin-lane="to" className="min-w-0 @4xl/home:col-start-3">
          <SkinEditor knob={pinnedKnobFacts()} />
        </div>
      </PinBoard>
    </section>
  );
}
