import { Fragment, useState } from "react";
import { createRoot } from "react-dom/client";
import { Tabs, TabsList, TabsPanel, TabsTab } from "../../src/registry/sources/control-ui/ui/tabs";

const releaseVersions = Array.from(
  { length: new URLSearchParams(location.search).has("dense") ? 200 : 6 },
  (_, index) => `v1.0.${index + 1}`,
);

function TabsTransitionFixture() {
  const [value, setValue] = useState("releases");
  const parameters = new URLSearchParams(location.search);
  const orientation = parameters.get("orientation") === "vertical" ? "vertical" : "horizontal";
  const PanelContainer = parameters.has("wrapped") ? "div" : Fragment;
  const uncontrolled = parameters.has("uncontrolled");
  const variant = parameters.get("variant") === "browser" ? "browser" : "default";

  return (
    <main>
      <h1>Changelog</h1>
      <button type="button" onClick={() => setValue("settings")}>
        Open settings
      </button>
      <Tabs {...(uncontrolled ? { defaultValue: "releases" } : { value, onValueChange: setValue })} orientation={orientation}>
        <TabsList variant={variant} activateOnFocus>
          <TabsTab value="releases">Releases</TabsTab>
          <TabsTab value="settings">Settings</TabsTab>
          <TabsTab value="embed">Embed</TabsTab>
        </TabsList>
        <PanelContainer>
          <TabsPanel value="releases" className="mt-6 flex flex-col" keepMounted>
            <section className="generate">
              <h2>Generate your changelog</h2>
              <p>Import past releases from your git history.</p>
            </section>
            {releaseVersions.map((version) => (
              <article key={version}>
                <h2>Release {version}</h2>
                <p>Product improvements and fixes.</p>
              </article>
            ))}
          </TabsPanel>
          <TabsPanel value="settings" className="mt-6 grid">
            <article>
              <h2>Versioning</h2>
              <p>Auto-versioning</p>
            </article>
            <article>
              <h2>Automation</h2>
              <p>Create a GitHub Release when publishing product improvements, bug fixes, and updates to your changelog.</p>
            </article>
          </TabsPanel>
          <TabsPanel value="embed" className="mt-6" keepMounted>
            <article>
              <h2>Embed your changelog</h2>
              <input aria-label="Embed title" defaultValue="Product updates" />
            </article>
          </TabsPanel>
        </PanelContainer>
      </Tabs>
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Tabs fixture root is missing");
createRoot(root).render(<TabsTransitionFixture />);
