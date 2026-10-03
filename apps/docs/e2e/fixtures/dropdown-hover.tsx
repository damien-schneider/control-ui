import { Profiler, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../src/registry/sources/control-ui/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../src/registry/sources/control-ui/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../src/registry/sources/control-ui/ui/select";

const entries = Array.from({ length: 200 }, (_, index) => `Entry ${index + 1}`);
const observeLeave = () => performance.mark("consumer-pointer-leave");

function Example() {
  const [selected, setSelected] = useState("");
  const kind = new URLSearchParams(location.search).get("kind");
  return (
    <>
      {kind === "select" && (
        <Select onValueChange={setSelected}>
          <SelectTrigger aria-label="Entries">
            <SelectValue placeholder="Choose entry" />
          </SelectTrigger>
          <SelectContent>
            {entries.map((entry, index) => (
              <SelectItem key={entry} value={entry} disabled={index === 3} onPointerLeave={observeLeave}>
                <span className="w-full">{entry}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {kind === "context-menu" && (
        <ContextMenu>
          <ContextMenuTrigger role="button">Entries</ContextMenuTrigger>
          <ContextMenuContent>
            {entries.map((entry, index) => (
              <ContextMenuItem key={entry} disabled={index === 3} onClick={() => setSelected(entry)} onPointerLeave={observeLeave}>
                <span className="w-full">{entry}</span>
              </ContextMenuItem>
            ))}
          </ContextMenuContent>
        </ContextMenu>
      )}
      {kind === "menu" && (
        <DropdownMenu>
          <DropdownMenuTrigger>Entries</DropdownMenuTrigger>
          <DropdownMenuContent>
            {entries.map((entry, index) => (
              <DropdownMenuItem key={entry} disabled={index === 3} onClick={() => setSelected(entry)} onPointerLeave={observeLeave}>
                <span className="w-full">{entry}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <output aria-label="Selected entry">{selected || "None"}</output>
    </>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Hover fixture root is missing");
createRoot(root).render(
  <main style={{ width: 700, margin: "40px auto" }}>
    <Profiler id="dropdown" onRender={() => performance.mark("popup-render")}>
      <Example />
    </Profiler>
  </main>,
);
