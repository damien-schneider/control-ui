import { content, example, part } from "./types";

export const navigationCompositions = {
  button: [
    example("Action button", part("Button", content("button content"))),
    example("Navigation link", part("ButtonLink", content("link content"))),
    example("Label-backed control", part("ButtonLabel", content("label content"))),
  ],
  tabs: [example("Anatomy", part("Tabs", part("TabsList", part("TabsTab")), part("TabsPanel")))],
  "track-highlight": [
    example(
      "Custom hover or selection track",
      part("div", content("items with data-track-item", part("Button")), part("TrackHighlight")),
      'Set data-track="hover" or "slide" on the container; mark the selected item with data-active.',
    ),
  ],
  "table-of-contents": [
    example(
      "Section navigation",
      part("TableOfContents"),
      "Pass items with IDs matching the headings in the document; the component renders the navigation.",
    ),
  ],
  stepper: [
    example(
      "Interactive steps",
      part(
        "Stepper",
        part(
          "StepperList",
          part(
            "StepperItem",
            part("StepperTrigger", part("StepperIndicator"), part("StepperTitle"), part("StepperDescription")),
            part("StepperSeparator"),
          ),
        ),
        part("StepperContent"),
      ),
    ),
    example(
      "Static steps",
      part(
        "Stepper",
        part(
          "StepperList",
          part("StepperItem", part("StepperIndicator"), part("StepperTitle"), part("StepperDescription"), part("StepperSeparator")),
        ),
      ),
    ),
  ],
  "dropdown-menu": [
    example(
      "Actions and selection",
      part(
        "DropdownMenu",
        part("DropdownMenuTrigger"),
        part(
          "DropdownMenuContent",
          part(
            "DropdownMenuGroup",
            part("DropdownMenuLabel"),
            part("DropdownMenuItem", part("DropdownMenuShortcut")),
            part("DropdownMenuCheckboxItem"),
          ),
          part("DropdownMenuSeparator"),
          part("DropdownMenuRadioGroup", part("DropdownMenuRadioItem")),
          part("DropdownMenuSub", part("DropdownMenuSubTrigger"), part("DropdownMenuSubContent", part("DropdownMenuItem"))),
        ),
      ),
      "Content includes its portal and positioner.",
    ),
    example(
      "Custom portal content",
      part("DropdownMenu", part("DropdownMenuTrigger"), part("DropdownMenuPortal", content("custom positioned popup"))),
      "Use the portal only when supplying your own popup instead of DropdownMenuContent.",
    ),
  ],
  "context-menu": [
    example(
      "Contextual actions and selection",
      part(
        "ContextMenu",
        part("ContextMenuTrigger"),
        part(
          "ContextMenuContent",
          part(
            "ContextMenuGroup",
            part("ContextMenuLabel"),
            part("ContextMenuItem", part("ContextMenuShortcut")),
            part("ContextMenuCheckboxItem"),
          ),
          part("ContextMenuSeparator"),
          part("ContextMenuRadioGroup", part("ContextMenuRadioItem")),
          part("ContextMenuSub", part("ContextMenuSubTrigger"), part("ContextMenuSubContent", part("ContextMenuItem"))),
        ),
      ),
      "Content includes its portal and positioner.",
    ),
    example(
      "Custom portal content",
      part("ContextMenu", part("ContextMenuTrigger"), part("ContextMenuPortal", content("custom positioned popup"))),
      "Use the portal only when supplying your own popup instead of ContextMenuContent.",
    ),
  ],
  toggle: [example("Single toggle", part("Toggle")), example("Toggle group", part("ToggleGroup", part("Toggle")))],
  command: [
    example(
      "Inline command list",
      part(
        "Command",
        part("CommandInput"),
        part(
          "CommandList",
          part("CommandEmpty"),
          part("CommandGroup", part("CommandItem", part("CommandShortcut"))),
          part("CommandSeparator"),
        ),
      ),
    ),
    example(
      "Command palette dialog",
      part("CommandDialog", part("CommandInput"), part("CommandList", part("CommandEmpty"), part("CommandGroup", part("CommandItem")))),
      "CommandDialog supplies the dialog and Command root.",
    ),
  ],
  menubar: [
    example(
      "Anatomy",
      part(
        "Menubar",
        part(
          "MenubarMenu",
          part("MenubarTrigger"),
          part(
            "MenubarContent",
            part("MenubarGroup", part("MenubarLabel"), part("MenubarItem", part("MenubarShortcut"))),
            part("MenubarSeparator"),
            part("MenubarSub", part("MenubarSubTrigger"), part("MenubarSubContent", part("MenubarItem"))),
            part("MenubarItem", part("MenubarShortcut")),
          ),
        ),
      ),
    ),
  ],
  "navigation-menu": [
    example(
      "Anatomy",
      part(
        "NavigationMenu",
        part(
          "NavigationMenuList",
          part(
            "NavigationMenuItem",
            part("NavigationMenuTrigger"),
            part("NavigationMenuContent", part("NavigationMenuLink")),
            part("NavigationMenuLink"),
          ),
        ),
        part("NavigationMenuViewport"),
      ),
    ),
  ],
  "button-group": [
    example(
      "Joined actions",
      part(
        "ButtonGroup",
        part("ButtonGroupText"),
        content("primary action", part("Button")),
        part("ButtonGroupSeparator"),
        content("secondary action", part("Button")),
      ),
    ),
  ],
  pagination: [
    example(
      "Page navigation",
      part(
        "Pagination",
        part(
          "PaginationContent",
          content("previous page", part("PaginationItem", part("PaginationPrevious"))),
          content("each page", part("PaginationItem", part("PaginationLink"))),
          content("skipped pages", part("PaginationItem", part("PaginationEllipsis"))),
          content("next page", part("PaginationItem", part("PaginationNext"))),
        ),
      ),
    ),
  ],
  "trigger-menu": [
    example(
      "Grouped suggestions",
      part(
        "TriggerMenu",
        part(
          "TriggerMenuList",
          part("TriggerMenuEmpty"),
          part("TriggerMenuGroup", part("TriggerMenuGroupLabel"), part("TriggerMenuItem", part("TriggerMenuIcon"))),
        ),
      ),
    ),
  ],
  toolbar: [
    example(
      "Editing controls",
      part("Toolbar", part("ToolbarGroup", part("ToolbarButton"), part("ToolbarLink")), part("ToolbarSeparator"), part("ToolbarInput")),
    ),
  ],
} as const;
