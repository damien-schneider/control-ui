import { preferredTheme } from "@/components/theme";
import { loadInitialTheme } from "./presets";
import { writeVars } from "./write-vars";

document.documentElement.classList.toggle("dark", preferredTheme() === "dark");
writeVars(loadInitialTheme(window.location.search));
