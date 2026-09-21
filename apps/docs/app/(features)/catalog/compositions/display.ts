import { content, example, part } from "./types";

export const displayCompositions = {
  collapsible: [example("Anatomy", part("Collapsible", part("CollapsibleTrigger"), part("CollapsibleContent")))],
  sidebar: [
    example(
      "Application shell",
      part(
        "SidebarProvider",
        part(
          "Sidebar",
          part("SidebarHeader"),
          part(
            "SidebarContent",
            part(
              "SidebarGroup",
              part("SidebarGroupLabel"),
              part(
                "SidebarGroupContent",
                part(
                  "SidebarMenu",
                  part(
                    "SidebarMenuItem",
                    part("SidebarMenuButton"),
                    part("SidebarMenuAction"),
                    part("SidebarMenuSub", part("SidebarMenuItem", part("SidebarMenuButton"))),
                  ),
                ),
              ),
            ),
          ),
          part("SidebarFooter"),
          part("SidebarRail"),
        ),
        part("SidebarInset", part("SidebarTrigger")),
      ),
    ),
    example(
      "Collapsible navigation group",
      part(
        "SidebarProvider",
        part(
          "Sidebar",
          part(
            "SidebarContent",
            part(
              "SidebarGroup",
              part(
                "SidebarMenu",
                part(
                  "SidebarMenuItem",
                  part(
                    "Collapsible",
                    part("SidebarMenuButton", content("render prop", part("CollapsibleTrigger"))),
                    part("CollapsibleContent", part("SidebarMenuSub", part("SidebarMenuItem", part("SidebarMenuButton")))),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  ],
  "page-layout": [
    example(
      "Page shell",
      part(
        "PageLayout",
        part("PageHeader", part("PageTitle"), part("PageDescription"), part("PageActions")),
        part("PageBody", content("page content")),
      ),
      "PageLayout owns the scroll container and the shared measure; the header and body align to the same edges.",
    ),
    example(
      "Reading page with a rail",
      part("PageLayout", part("PageBody", content("article"), content("aside prop", part("TableOfContents")))),
      "Pass aside to add a secondary column; it widens the measure and hides below the breakpoint.",
    ),
  ],
  "scroll-area": [example("Scrollable content", part("ScrollArea", content("scrollable content")))],
  "progressive-blur": [
    example(
      "Decorative edge overlay",
      part("div", content("background content"), part("ProgressiveBlur")),
      "Position the container relatively and place the blur over its content.",
    ),
  ],
  timeline: [
    example(
      "Anatomy",
      part(
        "Timeline",
        part(
          "TimelineItem",
          part("TimelineIndicator"),
          part("TimelineSeparator"),
          part("TimelineContent", part("TimelineTitle"), part("TimelineDescription"), part("TimelineMeta", part("SourceBadge"))),
        ),
      ),
    ),
  ],
  skeleton: [example("Loading placeholder", part("Skeleton"))],
  toast: [example("Application toast host", part("Toaster"))],
  kbd: [example("Keyboard chord", part("KbdGroup", part("Kbd")))],
  accordion: [example("Anatomy", part("Accordion", part("AccordionItem", part("AccordionTrigger"), part("AccordionPanel"))))],
  avatar: [example("Avatar group", part("AvatarGroup", part("Avatar", part("AvatarImage"), part("AvatarFallback"))))],
  progress: [
    example("Anatomy", part("Progress", part("ProgressLabel"), part("ProgressValue"), part("ProgressTrack", part("ProgressIndicator")))),
  ],
  alert: [example("Anatomy", part("Alert", part("AlertTitle"), part("AlertDescription")))],
  badge: [example("Status or label", part("Badge"))],
  card: [
    example(
      "Panel anatomy",
      part(
        "Card",
        part("CardHeader", part("CardTitle"), part("CardDescription"), part("CardAction")),
        part("CardContent"),
        part("CardFooter"),
      ),
    ),
  ],
  table: [
    example(
      "Anatomy",
      part(
        "Table",
        part("TableCaption"),
        part("TableHeader", part("TableRow", part("TableHead"))),
        part("TableBody", part("TableRow", part("TableCell"))),
        part("TableFooter", part("TableRow", part("TableCell"))),
      ),
    ),
  ],
  "aspect-ratio": [example("Constrained media", part("AspectRatio", part("img")))],
  empty: [
    example(
      "Anatomy",
      part(
        "Empty",
        part("EmptyHeader", part("EmptyMedia"), part("EmptyTitle"), part("EmptyDescription")),
        part("EmptyContent", part("Button")),
      ),
    ),
  ],
  item: [
    example(
      "Grouped content rows",
      part(
        "ItemGroup",
        part(
          "Item",
          part("ItemHeader"),
          part("ItemMedia"),
          part("ItemContent", part("ItemTitle"), part("ItemDescription")),
          part("ItemActions"),
          part("ItemFooter"),
        ),
        part("ItemSeparator"),
      ),
    ),
  ],
  spinner: [example("Pending indicator", part("Spinner"))],
  meter: [example("Anatomy", part("Meter", part("MeterLabel"), part("MeterValue"), part("MeterTrack", part("MeterIndicator"))))],
  tree: [
    example(
      "Branching tree",
      part(
        "Tree",
        part(
          "TreeItem",
          part("TreeItemTrigger", part("TreeItemIndicator"), part("TreeItemLabel")),
          part("TreeItemContent", part("TreeItem", part("TreeItemTrigger", part("TreeItemLabel")))),
        ),
      ),
    ),
  ],
  "dockable-panel": [
    example(
      "Workspace panel",
      part(
        "DockablePanel",
        part(
          "DockablePanelHeader",
          part("DockablePanelDragHandle", part("DockablePanelTitle")),
          part("DockablePanelActions", part("DockablePanelDock"), part("DockablePanelToggle"), part("DockablePanelClose")),
        ),
        part("DockablePanelContent"),
      ),
    ),
  ],
  "infinite-canvas": [
    example(
      "Spatial workspace",
      part("InfiniteCanvas", part("InfiniteCanvasContent", content("spatial nodes")), part("InfiniteCanvasControls")),
    ),
  ],
  "morphing-panel": [
    example(
      "Expandable surface",
      part("MorphingPanel", part("MorphingPanelTrigger"), part("MorphingPanelContent", content("expanded content"))),
    ),
  ],
  resizable: [
    example(
      "Split panels",
      part(
        "ResizablePanelGroup",
        content("first panel", part("ResizablePanel")),
        part("ResizableHandle"),
        content("second panel", part("ResizablePanel")),
      ),
    ),
  ],
  typography: [
    example(
      "Semantic text",
      content("text utilities on semantic HTML", part("h1"), part("h2"), part("p"), part("span")),
      "Apply the text-* utilities to native elements; there is no Typography component.",
    ),
  ],
  code: [
    example(
      "Code with header",
      part("Code", part("CodeHeader", part("CodeTitle"), part("CodeActions", part("CodeCopy"))), part("CodeContent")),
    ),
    example(
      "Code without a header",
      part("Code", part("CodeContent")),
      "A headerless surface overlays its own copy button. Pass copy={false} and place CodeFloatingCopy or CodeCopy yourself.",
    ),
    example(
      "Custom copy placement",
      part("Code", part("CodeFloatingCopy"), part("CodeContent")),
      "Pass copy={false} when you need the overlay elsewhere, with a different value, or with your own tone.",
    ),
    example(
      "Editable code",
      part("Code", part("CodeHeader", part("CodeTitle"), part("CodeActions", part("CodeCopy"))), part("CodeEditable")),
      "CodeEditable swaps the read-only content for a textarea. It never overlays a copy button over text you are typing, so give it a header.",
    ),
    example(
      "One panel, several files",
      part(
        "Tabs",
        part("Code", part("CodeHeader", part("TabsList", part("TabsTab")), part("CodeActions")), part("TabsPanel", part("CodeContent"))),
      ),
      "Wrap Code in Tabs and put TabsList in the header; the panel keeps one frame and Code needs no file API.",
    ),
    example(
      "Custom token rendering",
      part("pre", part("code", part("CodeTokenLine"))),
      "CodeTokenLine renders highlighted tokens inside your own code surface.",
    ),
  ],
  "code-diff": [
    example(
      "Rendered diff",
      part("CodeDiff", content("built-in header actions", part("CodeDiffCopy"))),
      "Pass a patch or oldText/newText. CodeDiff renders the files and its copy action internally.",
    ),
  ],
  markdown: [
    example(
      "Rendered markdown",
      part("Markdown", part("MarkdownRoot", content("rendered prose and code fences"))),
      "Pass the source in content. Markdown supplies the root and parsed children.",
    ),
    example("Custom prose", part("MarkdownRoot", content("consumer-rendered prose"))),
  ],
} as const;
