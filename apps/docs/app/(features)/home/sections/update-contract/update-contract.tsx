import "./update-contract.css";
import { SectionHeader } from "@/app/(features)/home/shared/section-header";
import { ContractDiagram } from "./contract-diagram";

export function UpdateContract() {
  return (
    <section id="update-contract" aria-labelledby="update-contract-title" className="grid min-w-0 gap-10 @4xl/home:gap-14">
      <SectionHeader
        titleId="update-contract-title"
        title={["We overwrite our files."]}
        mutedTitle="Never yours."
        link={{ href: "/update", label: "Read the update contract" }}
        lead="You never edit an installed component. Everything you change lives in the skin, and a typed contract sits between the two. So an update is a diff you read, then an overwrite you run."
      />
      <ContractDiagram />
    </section>
  );
}
