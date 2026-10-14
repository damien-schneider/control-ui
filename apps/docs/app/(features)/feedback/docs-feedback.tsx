"use client";

import dynamic from "next/dynamic";
import { useThemeRuntime } from "@/components/theme-drawer/theme-runtime-context";
import { env } from "@/env";

const RefletFeedback = dynamic(() => import("reflet-sdk/feedback").then((module) => module.RefletFeedback), {
  ssr: false,
});

export function DocsFeedback() {
  const { isDark } = useThemeRuntime();
  const publicKey = env.NEXT_PUBLIC_REFLET_PUBLIC_KEY;
  if (!publicKey) return null;
  return <RefletFeedback publicKey={publicKey} theme={isDark ? "dark" : "light"} metadata={{ surface: "docs" }} />;
}
