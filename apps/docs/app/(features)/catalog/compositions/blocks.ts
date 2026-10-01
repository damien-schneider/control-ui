import { content, example, part } from "./types";

export const blocksCompositions = {
  chat: [
    example(
      "Rendered chat shell",
      part(
        "ChatBlock",
        part(
          "ChatLayout",
          part("ChatThread", content("children prop", content("rendered turns")), content("composer prop", part("ChatComposer"))),
        ),
      ),
    ),
  ],
  "theme-toggle": [
    example("Three-way choice", part("ThemeSegmentedSwitch")),
    example("Binary choice", part("ThemeSwitch", part("Switch"))),
    example("Cycle button", part("ThemeToggle", part("Button"))),
    example(
      "Dropdown choice",
      part(
        "ThemeDropdown",
        part(
          "DropdownMenu",
          part("DropdownMenuTrigger"),
          part("DropdownMenuContent", part("DropdownMenuRadioGroup", part("DropdownMenuLabel"), part("DropdownMenuRadioItem"))),
        ),
      ),
    ),
  ],
  "coding-agent": [
    example(
      "Rendered workspace shell",
      part(
        "CodingAgentBlock",
        part(
          "SidebarProvider",
          part("Sidebar", content("navigation"), content("projects and tasks")),
          part(
            "SidebarInset",
            content("task header"),
            content(
              "children prop",
              part(
                "CodingAgentConversation",
                part(
                  "ChatLayout",
                  part(
                    "ChatThread",
                    content("rendered turns or empty content", part("CodingAgentEmptyState")),
                    content("composer prop", part("ChatComposer")),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  ],
  "team-chat": [
    example(
      "Channel with a side thread",
      part(
        "TeamChatBlock",
        part(
          "SidebarProvider",
          content(
            "sidebar prop",
            part(
              "Sidebar",
              part("SidebarMenuItem", part("SidebarMenuButton", part("AvatarBadge")), part("SidebarMenuBadge"), part("SidebarMenuAction")),
            ),
          ),
          part(
            "SidebarInset",
            content(
              "children prop",
              part(
                "ChatLayout",
                part("ChatLayoutHeader", part("ChatLayoutTitle"), part("ChatLayoutDescription"), part("ChatLayoutActions")),
                part(
                  "ChatThread",
                  part("TranscriptDivider"),
                  part(
                    "ChatMessage",
                    content("flat layout"),
                    part("ChatMessageReactions"),
                    part("ChatMessageReplySummary"),
                    part("ChatMessageActions"),
                  ),
                  part("ChatTypingIndicator"),
                  content("composer prop", part("ChatComposer")),
                ),
              ),
            ),
            content("thread prop", part("ChatLayout")),
          ),
        ),
      ),
    ),
  ],
  discussion: [
    example(
      "Comment with a reply",
      content(
        "discussion section",
        part(
          "DiscussionComposer",
          part("ChatComposer", content("mod-enter submit key"), part("ChatComposerTextarea"), part("ChatComposerSubmit")),
        ),
        part(
          "DiscussionComment",
          part(
            "ChatMessage",
            content("flat layout"),
            part("ChatMessageFooter", content("Reply")),
            part("ChatMessageReplies", part("DiscussionComment"), part("DiscussionComposer")),
            part("ChatMessageActions"),
          ),
        ),
      ),
    ),
  ],
  settings: [
    example(
      "Rendered settings shell",
      part(
        "SettingsBlock",
        part(
          "SidebarProvider",
          part("Sidebar", content("search"), content("page navigation")),
          part(
            "SidebarInset",
            content("back action", part("SettingsBackAction")),
            content("active page content", part("FieldSet", part("FieldLegend"), part("FieldGroup", part("Field")))),
          ),
        ),
      ),
    ),
  ],
  "file-explorer": [
    example(
      "Rendered file browser",
      part(
        "FileExplorerBlock",
        part(
          "SidebarProvider",
          part("Sidebar", content("grouped locations")),
          part(
            "SidebarInset",
            content("toolbar and search"),
            content("address breadcrumb"),
            content("folder columns or search results", part("ResizablePanelGroup", part("ResizablePanel"))),
            content("path status bar"),
          ),
        ),
      ),
    ),
  ],
  "design-canvas": [
    example(
      "Rendered design editor",
      part(
        "DesignCanvasBlock",
        content("layers panel", part("ScrollArea", part("Button"))),
        part(
          "InfiniteCanvas",
          part("InfiniteCanvasContent", part("InfiniteCanvasItem", content("layer node"))),
          part("InfiniteCanvasControls"),
        ),
        part("Toolbar", part("ToolbarGroup", part("ToolbarButton"))),
        content(
          "properties panel",
          part("NumberField", part("NumberFieldGroup", part("NumberFieldScrubArea"), part("NumberFieldInput"))),
          part(
            "ColorPicker",
            part("InputGroup", part("InputGroupAddon", part("ColorPickerTrigger")), part("ColorPickerInput"), part("NumberField")),
            part("ColorPickerContent"),
          ),
          part("Toggle"),
        ),
      ),
    ),
  ],
} as const;
