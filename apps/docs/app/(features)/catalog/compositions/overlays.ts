import { content, example, part } from "./types";

export const overlaysCompositions = {
  dialog: [
    example(
      "Anatomy",
      part(
        "Dialog",
        part("DialogTrigger"),
        part(
          "DialogContent",
          part("DialogHeader", part("DialogTitle"), part("DialogDescription")),
          part("Input"),
          part("DialogFooter", part("DialogClose")),
        ),
      ),
    ),
  ],
  popover: [
    example(
      "Anchored inspector",
      part(
        "Popover",
        part("PopoverTrigger"),
        part(
          "PopoverContent",
          part("PopoverHeader", part("PopoverTitle"), part("PopoverDescription")),
          content("panel content"),
          part("PopoverClose"),
        ),
      ),
    ),
    example(
      "Separate positioning anchor",
      part(
        "Popover",
        part("PopoverAnchor", content("anchor content")),
        part("PopoverTrigger"),
        part("PopoverContent", content("panel content")),
      ),
    ),
  ],
  tooltip: [example("Anatomy", part("TooltipProvider", part("Tooltip", part("TooltipTrigger"), part("TooltipContent"))))],
  "rich-tooltip": [
    example(
      "Guided tour",
      part(
        "RichTooltipTour",
        part(
          "RichTooltip",
          part("RichTooltipTrigger"),
          part(
            "RichTooltipContent",
            part("RichTooltipMedia"),
            part("RichTooltipHeader", part("RichTooltipTitle"), part("RichTooltipClose")),
            part("RichTooltipDescription"),
            part("RichTooltipFooter", part("RichTooltipProgress"), part("RichTooltipPrevious"), part("RichTooltipNext")),
          ),
        ),
      ),
    ),
  ],
  drawer: [
    example(
      "Anatomy",
      part(
        "Drawer",
        part("DrawerTrigger"),
        part(
          "DrawerContent",
          part("DrawerHeader", part("DrawerTitle"), part("DrawerDescription")),
          part("DrawerBody", part("Button")),
          part("DrawerFooter", part("DrawerClose")),
        ),
      ),
    ),
  ],
  "responsive-dialog": [
    example(
      "Anatomy",
      part(
        "ResponsiveDialog",
        part("ResponsiveDialogTrigger"),
        part(
          "ResponsiveDialogContent",
          part("ResponsiveDialogHeader", part("ResponsiveDialogTitle"), part("ResponsiveDialogDescription")),
          part("Field"),
          part("ResponsiveDialogFooter", part("ResponsiveDialogClose")),
        ),
      ),
    ),
  ],
  "hover-card": [example("Anatomy", part("HoverCard", part("HoverCardTrigger"), part("HoverCardContent")))],
  "alert-dialog": [
    example(
      "Anatomy",
      part(
        "AlertDialog",
        part("AlertDialogTrigger"),
        part(
          "AlertDialogContent",
          part("AlertDialogHeader", part("AlertDialogTitle"), part("AlertDialogDescription")),
          part("AlertDialogFooter", part("AlertDialogClose")),
        ),
      ),
    ),
  ],
} as const;
