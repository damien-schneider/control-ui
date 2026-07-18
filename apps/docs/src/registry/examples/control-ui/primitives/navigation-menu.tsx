"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/control-ui/ui/navigation-menu";

const overview = [
  { title: "Quick start", description: "Install and assemble your first component." },
  { title: "Accessibility", description: "How the primitives stay keyboard and screen-reader friendly." },
  { title: "Theming", description: "Swap the design language through CSS tokens alone." },
  { title: "Releases", description: "See what shipped in the latest versions." },
];

const resources = [
  { title: "Styling", description: "Plain CSS, Tailwind, or CSS Modules — your call." },
  { title: "Animation", description: "Token-driven motion with a reduce-motion kill-switch." },
  { title: "Composition", description: "Replace any element via the render prop." },
];

export function PrimitiveNavigationMenuExample() {
  return (
    <div className="flex w-full max-w-2xl justify-start">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Overview</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[min(28rem,calc(100vw-3rem))] grid-cols-2 gap-1">
                {overview.map((item) => (
                  <li key={item.title}>
                    <NavigationMenuLink href="#">
                      <div className="text-label font-medium text-foreground">{item.title}</div>
                      <p className="mt-0.5 text-meta text-muted-foreground">{item.description}</p>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="flex w-[min(20rem,calc(100vw-3rem))] flex-col gap-1">
                {resources.map((item) => (
                  <li key={item.title}>
                    <NavigationMenuLink href="#">
                      <div className="text-label font-medium text-foreground">{item.title}</div>
                      <p className="mt-0.5 text-meta text-muted-foreground">{item.description}</p>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink href="#" variant="compact">
              Changelog
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>

        <NavigationMenuViewport />
      </NavigationMenu>
    </div>
  );
}
