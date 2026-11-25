"use client";

import NextLink from "next/link";
import { type ComponentProps, useState } from "react";

export function IntentLink({ onPointerEnter, onFocus, ...props }: Omit<ComponentProps<typeof NextLink>, "prefetch">) {
  const [intended, setIntended] = useState(false);

  return (
    <NextLink
      {...props}
      prefetch={intended ? null : false}
      onPointerEnter={(event) => {
        setIntended(true);
        onPointerEnter?.(event);
      }}
      onFocus={(event) => {
        setIntended(true);
        onFocus?.(event);
      }}
    />
  );
}
