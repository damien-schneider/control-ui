import { useEffect, useState } from "react";

export function useKeyboardNavigation() {
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);

  useEffect(() => {
    function markKeyboardNavigation(event: KeyboardEvent) {
      if (event.key === "Tab") setKeyboardNavigation(true);
    }

    function clearKeyboardNavigation() {
      setKeyboardNavigation(false);
    }

    document.addEventListener("keydown", markKeyboardNavigation, true);
    document.addEventListener("pointerdown", clearKeyboardNavigation, true);
    return () => {
      document.removeEventListener("keydown", markKeyboardNavigation, true);
      document.removeEventListener("pointerdown", clearKeyboardNavigation, true);
    };
  }, []);

  return keyboardNavigation;
}
