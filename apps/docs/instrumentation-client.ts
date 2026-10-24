if (process.env.NODE_ENV === "development" && !navigator.webdriver && process.env.NEXT_PUBLIC_REACT_SCAN === "1") {
  void import("react-scan").then(({ scan }) => {
    scan({ enabled: true });
  });
}
