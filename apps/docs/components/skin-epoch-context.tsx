"use client";

import type { ReactNode } from "react";
import { createContext, Fragment, use, useState } from "react";

type SkinEpochContextValue = {
  skinEpoch: number;
  bumpSkinEpoch: () => void;
};

const SkinEpochContext = createContext<SkinEpochContextValue | null>(null);

export function SkinEpochProvider({ children }: { children: ReactNode }) {
  const [skinEpoch, setSkinEpoch] = useState(0);

  function bumpSkinEpoch() {
    setSkinEpoch((epoch) => epoch + 1);
  }

  const value: SkinEpochContextValue = { skinEpoch, bumpSkinEpoch };

  return <SkinEpochContext.Provider value={value}>{children}</SkinEpochContext.Provider>;
}

export function useSkinEpoch(): SkinEpochContextValue {
  const context = use(SkinEpochContext);
  if (!context) throw new Error("useSkinEpoch must be used within a SkinEpochProvider");
  return context;
}

export function SkinEpochBoundary({ children }: { children: ReactNode }) {
  const { skinEpoch } = useSkinEpoch();
  return <Fragment key={skinEpoch}>{children}</Fragment>;
}
