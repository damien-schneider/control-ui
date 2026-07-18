import { architectureSkills } from "./concerns/architecture";
import { controlUiSkills } from "./concerns/control-ui";
import { cssFirstSkills } from "./concerns/css-first";
import { reactCodeQualitySkills } from "./concerns/react-code-quality";
import { uiTailwindSkills } from "./concerns/ui-tailwind";
import { uxSkills } from "./concerns/ux";

export type { PracticeSkillDefinition, SkillConcern, SkillConcernId } from "./types";
export { skillConcerns } from "./types";

export const practiceSkills = [
  ...cssFirstSkills,
  ...reactCodeQualitySkills,
  ...architectureSkills,
  ...uiTailwindSkills,
  ...uxSkills,
  ...controlUiSkills,
] as const;

export type PracticeSkill = (typeof practiceSkills)[number];
export type PracticeSkillId = PracticeSkill["id"];

export function getPracticeSkill(id: string) {
  return practiceSkills.find((skill) => skill.id === id);
}
