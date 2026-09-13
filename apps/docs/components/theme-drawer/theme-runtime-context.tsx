"use client";

import { createContext, type ReactNode, useContext } from "react";
import { SkinProvider } from "@/components/control-ui/skin-provider";
import { SKIN_CONFIGS } from "@/components/skin-registry";
import { usePersistentTheme } from "./use-persistent-theme";

type ThemeRuntimeValue = ReturnType<typeof usePersistentTheme>;

const ThemeRuntimeContext = createContext<ThemeRuntimeValue | null>(null);

export function ThemeRuntimeProvider({ children }: { children: ReactNode }) {
  const runtime = usePersistentTheme();
  return (
    <ThemeRuntimeContext.Provider value={runtime}>
      <SkinProvider skin={SKIN_CONFIGS[runtime.t.skin]}>{children}</SkinProvider>
    </ThemeRuntimeContext.Provider>
  );
}

export function useThemeRuntime() {
  const runtime = useContext(ThemeRuntimeContext);
  if (!runtime) throw new Error("useThemeRuntime must be used within a ThemeRuntimeProvider");
  return runtime;
}
