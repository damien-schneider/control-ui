import type { ReactGrabAPI } from "react-grab/core";

declare global {
  interface Window {
    __REACT_GRAB__?: ReactGrabAPI;
  }
  interface WindowEventMap {
    "react-grab:init": CustomEvent<ReactGrabAPI>;
  }
}

if (process.env.NODE_ENV === "development" && !navigator.webdriver) {
  if (process.env.NEXT_PUBLIC_REACT_SCAN === "1") {
    void import("react-scan").then(({ scan }) => {
      scan({ enabled: true });
    });
  }

  void import("react-grab/core").then(({ init }) => {
    if (window.__REACT_GRAB__) return;

    window.__REACT_GRAB__ = init({
      maxContextLines: 5,
      telemetry: false,
    });
    window.dispatchEvent(new CustomEvent("react-grab:init", { detail: window.__REACT_GRAB__ }));
  });
}
