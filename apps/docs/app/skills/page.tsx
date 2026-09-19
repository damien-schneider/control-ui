import { permanentRedirect } from "next/navigation";
import { sectionIndexTargets } from "@/app/(features)/model/page-ids";

export default function SkillsPage() {
  permanentRedirect(sectionIndexTargets["/skills"]);
}
