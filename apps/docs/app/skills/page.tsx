import { permanentRedirect } from "next/navigation";
import { skillPageIds } from "@/app/(features)/model/page-ids";

export default function SkillsPage() {
  permanentRedirect(`/skills/${skillPageIds[0]}`);
}
