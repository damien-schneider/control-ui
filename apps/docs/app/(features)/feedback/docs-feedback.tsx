"use client";

import dynamic from "next/dynamic";
import { useIsMobile } from "@/components/control-ui/hooks/use-mobile";
import { useThemeRuntime } from "@/components/theme-drawer/theme-runtime-context";
import { env } from "@/env";

const RefletFeedback = dynamic(() => import("reflet-sdk/feedback").then((module) => module.RefletFeedback), {
  ssr: false,
});

export function DocsFeedback() {
  const { isDark } = useThemeRuntime();
  const docsMenuFloatsAtBottomEnd = useIsMobile("--breakpoint-sidebar");
  const publicKey = env.NEXT_PUBLIC_REFLET_PUBLIC_KEY;
  if (!publicKey) return null;
  return (
    <RefletFeedback
      publicKey={publicKey}
      theme={isDark ? "dark" : "light"}
      position={docsMenuFloatsAtBottomEnd ? "bottom-left" : "bottom-right"}
      metadata={{ surface: "docs" }}
    />
  );
}
