const edgeDisplacementMap = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="x">
      <stop offset="0" stop-color="rgb(128,0,0)"/>
      <stop offset=".025" stop-color="rgb(255,0,0)"/>
      <stop offset=".09" stop-color="rgb(128,0,0)"/>
      <stop offset=".91" stop-color="rgb(128,0,0)"/>
      <stop offset=".975" stop-color="rgb(0,0,0)"/>
      <stop offset="1" stop-color="rgb(128,0,0)"/>
    </linearGradient>
    <linearGradient id="y" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgb(0,128,0)"/>
      <stop offset=".025" stop-color="rgb(0,255,0)"/>
      <stop offset=".09" stop-color="rgb(0,128,0)"/>
      <stop offset=".91" stop-color="rgb(0,128,0)"/>
      <stop offset=".975" stop-color="rgb(0,0,0)"/>
      <stop offset="1" stop-color="rgb(0,128,0)"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" fill="url(#x)"/>
  <rect width="256" height="256" fill="url(#y)" style="mix-blend-mode:screen"/>
</svg>`;

const sharedRefractionFilterId = "cui-modern-apple-refraction";

export function ModernAppleGlassFilter() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
      <defs>
        <filter
          id={sharedRefractionFilterId}
          x="0"
          y="0"
          width="100%"
          height="100%"
          primitiveUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={`data:image/svg+xml,${encodeURIComponent(edgeDisplacementMap)}`}
            x="0"
            y="0"
            width="1"
            height="1"
            preserveAspectRatio="none"
            result="edge"
          />
          <feDisplacementMap in="SourceGraphic" in2="edge" scale="0.06" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
