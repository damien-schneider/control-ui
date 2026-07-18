export function DynamicNotificationDemoBackdrop() {
  return (
    <img
      aria-hidden="true"
      data-dn-capture-backdrop
      alt=""
      className="pointer-events-none absolute inset-0 z-0 size-full select-none object-cover"
      src="/dynamic-notification/sequoia-sunrise.png"
    />
  );
}
