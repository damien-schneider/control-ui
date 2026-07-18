import { permanentRedirect } from "next/navigation";

export default function HooksPage() {
  permanentRedirect("/hooks/use-chat-message");
}
