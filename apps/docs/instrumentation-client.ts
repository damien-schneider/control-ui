import type { ReactGrabAPI } from "react-grab/core";

declare global {
  interface Window {
    __REACT_GRAB__?: ReactGrabAPI;
    __REACT_GRAB_DISABLED__?: boolean;
  }
}

if (process.env.NODE_ENV === "development") {
  void import("react-grab/core").then(({ init }) => {
    if (window.__REACT_GRAB__ || window.__REACT_GRAB_DISABLED__) return;

    window.__REACT_GRAB__ = init({
      maxContextLines: 5,
      telemetry: false,
    });
    window.dispatchEvent(new CustomEvent("react-grab:init", { detail: window.__REACT_GRAB__ }));
  });
}
