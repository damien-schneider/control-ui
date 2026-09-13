import { preferredTheme } from "@/components/theme";
import { DEFAULT_THEME, loadStored } from "./presets";
import { writeVars } from "./write-vars";

document.documentElement.classList.toggle("dark", preferredTheme() === "dark");
writeVars(loadStored() ?? DEFAULT_THEME);
