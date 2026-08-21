export const identityAttribute = "data-control-ui";
export const familyAttribute = "data-control-family";
export const slotAttribute = "data-slot";
export const skinScopeAttribute = "data-skin";

export const controlAttribute = "data-control";
export const surfaceAttribute = "data-surface";
export const effectsAttribute = "data-effects";

export const structuralAttributes = [identityAttribute, familyAttribute, slotAttribute, skinScopeAttribute] as const;
export const paintContextAttributes = [controlAttribute, surfaceAttribute, effectsAttribute] as const;

export const familyPartAttribute = (family: string) => `data-${family}-part`;
export const familyKindAttribute = (family: string) => `data-${family}-kind`;

const familyPartPattern = /^data-[a-z0-9-]+-part$/;
const familyKindPattern = /^data-[a-z0-9-]+-kind$/;

export const isFamilyPartAttribute = (attribute: string) => familyPartPattern.test(attribute);
export const isFamilyKindAttribute = (attribute: string) => familyKindPattern.test(attribute);
export const isFamilyQualifierAttribute = (attribute: string) => isFamilyPartAttribute(attribute) || isFamilyKindAttribute(attribute);

export const isStructuralAttribute = (attribute: string) =>
  structuralAttributes.some((name) => name === attribute) || isFamilyPartAttribute(attribute);

export const isPaintContextAttribute = (attribute: string) => paintContextAttributes.some((name) => name === attribute);

/** Anatomy addresses the element; a state describes it. A family kind is a state a skin may target. */
export const isAnatomyMetadataAttribute = (attribute: string) => isStructuralAttribute(attribute) || isPaintContextAttribute(attribute);

export function skinSelector({ skin, family, part }: { skin: string; family: string; part: string }): string {
  return `[${skinScopeAttribute}="${skin}"] :where([${slotAttribute}="${part}"][${familyAttribute}="${family}"])`;
}
