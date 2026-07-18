export const surfaceEnterExitMotionClasses =
  "transition-[opacity,scale] duration-[var(--duration-base)] ease-[var(--ease-emphasized)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0";

export const floatingSurfaceClasses =
  "rounded-[var(--radius-popover)] ring-1 ring-inset ring-border bg-popover backdrop-blur-[var(--backdrop-blur-popover)] text-popover-foreground shadow-pop outline-none";

export const floatingContentClasses = `${floatingSurfaceClasses} ${surfaceEnterExitMotionClasses}`;

export const floatingListContentClasses = `${floatingContentClasses} p-[var(--popover-padding)]`;

// Disabled rows cover 2 attribute conventions w/o false positives: Base UI sets bare data-disabled only when disabled, cmdk always renders data-disabled="true"|"false".
// :not([data-disabled=false]) guard keeps enabled command items from picking up the disabled look.
export const floatingListItemClasses =
  "flex min-h-[var(--control-h-xs)] cursor-pointer select-none items-center gap-2 rounded-[var(--radius-popup-item)] px-[calc(var(--padding-x)*0.5)] py-1 text-body text-[var(--popup-item-foreground,var(--foreground))] outline-none data-[highlighted]:bg-[var(--popup-item-highlight-background,oklch(from_var(--foreground)_l_c_h_/_0.06))] data-[selected=true]:bg-[var(--popup-item-highlight-background,oklch(from_var(--foreground)_l_c_h_/_0.06))] [&[data-disabled]:not([data-disabled=false])]:cursor-not-allowed [&[data-disabled]:not([data-disabled=false])]:opacity-[var(--popup-item-disabled-opacity,0.4)] data-[disabled=true]:pointer-events-none [&_svg]:text-[var(--popup-item-icon-foreground,currentColor)]";
