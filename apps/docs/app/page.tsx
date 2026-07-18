import { permanentRedirect } from "next/navigation";

export const instant = false;

export default function Home() {
  permanentRedirect("/overview");
}
