import { SIDEBAR_COOKIE_NAME } from "@/components/control-ui/control-props";

export const DOCS_SIDEBAR_COLLAPSIBLE = "offcanvas";
export const DOCS_SIDEBAR_MIN_WIDTH = 224;
export const DOCS_SIDEBAR_MAX_WIDTH = 420;

const WIDTH_STORAGE_KEY = "control-ui-docs:sidebar-width";

export function storedSidebarCollapsed() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").includes(`${SIDEBAR_COOKIE_NAME}=false`);
}

export function readStoredSidebarWidth(): number | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const stored = Number(window.localStorage.getItem(WIDTH_STORAGE_KEY));
    return Number.isFinite(stored) && stored > 0 ? Math.min(DOCS_SIDEBAR_MAX_WIDTH, Math.max(DOCS_SIDEBAR_MIN_WIDTH, stored)) : undefined;
  } catch {
    return undefined;
  }
}

export function writeStoredSidebarWidth(width: number) {
  try {
    window.localStorage.setItem(WIDTH_STORAGE_KEY, String(width));
  } catch {
    // private mode or quota — width will not persist
  }
}

// Static HTML cannot know the visitor's saved sidebar, and React only reaches it once hydration runs — several
// painted frames after the expanded default is already on screen. This head script patches the sidebar the
// instant the parser inserts it, before the first paint. Every value it writes is what DocsShell renders from
// the same two sources, down to React's own style serialization, so hydration finds the DOM it expects.
export const sidebarFirstPaintScript = `(()=>{try{
const collapsed=document.cookie.split("; ").includes("${SIDEBAR_COOKIE_NAME}=false");
const stored=Number(localStorage.getItem("${WIDTH_STORAGE_KEY}"));
const width=Number.isFinite(stored)&&stored>0?Math.min(${DOCS_SIDEBAR_MAX_WIDTH},Math.max(${DOCS_SIDEBAR_MIN_WIDTH},stored)):null;
if(!collapsed&&width===null)return;
let sidebarPatched=false;
const patchSidebar=()=>{
const root=document.querySelector('[data-control-ui="sidebar"][data-slot="root"]');
if(!root)return false;
const wrapper=width===null?null:root.closest('[data-slot="wrapper"]');
const style=wrapper&&wrapper.getAttribute("style");
if(style)wrapper.setAttribute("style",style.replace(/--sidebar-width:[^;]*/,"--sidebar-width:"+width+"px"));
if(!collapsed)return true;
const inner=root.querySelector('[data-slot="inner"]');
if(!inner)return false;
root.dataset.state="collapsed";
root.dataset.collapsible="${DOCS_SIDEBAR_COLLAPSIBLE}";
inner.inert=true;
return true;
};
const apply=()=>{
sidebarPatched||=patchSidebar();
if(!sidebarPatched||!collapsed)return sidebarPatched;
const triggers=document.querySelectorAll("[data-docs-sidebar-trigger] [data-sidebar-trigger]");
for(const trigger of triggers)trigger.setAttribute("aria-expanded","false");
return triggers.length>0;
};
if(apply())return;
const observer=new MutationObserver(()=>{if(apply())observer.disconnect();});
observer.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener("DOMContentLoaded",()=>observer.disconnect());
}catch{}})();`;
