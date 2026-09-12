let anchorTransitionsSupported: boolean | undefined;

export function supportsAnchorTransitions(): boolean {
  if (anchorTransitionsSupported !== undefined) return anchorTransitionsSupported;
  if (!CSS.supports("(anchor-name: --_track-transition-probe) and (anchor-scope: --_track-transition-probe)")) {
    anchorTransitionsSupported = false;
    return false;
  }

  const probeTrack = document.createElement("div");
  probeTrack.style.cssText = "position:fixed;left:-10000px;top:0;visibility:hidden;anchor-scope:--_track-transition-probe";
  const initialAnchor = document.createElement("div");
  initialAnchor.style.cssText = "position:absolute;top:0;width:1px;height:1px;anchor-name:--_track-transition-probe";
  const nextAnchor = document.createElement("div");
  nextAnchor.style.cssText = "position:absolute;top:10px;width:1px;height:1px";
  const probeHighlight = document.createElement("div");
  probeHighlight.style.cssText = "position:absolute;top:anchor(--_track-transition-probe top);width:1px;height:1px";
  probeHighlight.style.setProperty("transition", "top 1s linear", "important");
  probeTrack.append(initialAnchor, nextAnchor, probeHighlight);
  document.body.append(probeTrack);
  try {
    void probeHighlight.offsetTop;
    initialAnchor.style.anchorName = "none";
    nextAnchor.style.anchorName = "--_track-transition-probe";
    anchorTransitionsSupported = probeHighlight.getAnimations().length > 0;
    return anchorTransitionsSupported;
  } finally {
    probeTrack.remove();
  }
}
