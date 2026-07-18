export const socialImageSize = { width: 1200, height: 630 } as const;

export function socialImagePath(pathname: string) {
  return `/og${pathname}`;
}
