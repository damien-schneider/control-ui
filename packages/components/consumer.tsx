import { ChatMessage } from "@ctrl-ui/react/chat-message";
import { EmailLayout } from "@ctrl-ui/react/email/email";
import { emailThemeFromCss } from "@ctrl-ui/react/email/theme";
import { buttonKnobs } from "@ctrl-ui/react/knob-contracts/button-knobs";
import { Button, ButtonLink } from "@ctrl-ui/react/ui/button";
import { Combobox, ComboboxContent, ComboboxItem, ComboboxList } from "@ctrl-ui/react/ui/combobox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@ctrl-ui/react/ui/dropdown-menu";
import { SidebarGroupContent, SidebarMenuAction } from "@ctrl-ui/react/ui/sidebar";

export const smoke = [Button, ButtonLink, ChatMessage, buttonKnobs, EmailLayout, emailThemeFromCss];

export function ComposedMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Workspace</DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" sideOffset={8} alignOffset={2}>
        <DropdownMenuGroup>
          <DropdownMenuItem render={<a href="/settings" />} nativeButton={false}>
            Settings<DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem checked onCheckedChange={(checked) => checked}>
            Notifications
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="team" onValueChange={(value) => value}>
            <DropdownMenuRadioItem value="team">Team</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent side="left">
              <DropdownMenuItem>Copy link</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RepositorySearch() {
  return (
    <Combobox
      items={[{ name: "Control UI", slug: "ctrl-ui" }]}
      filter={(repository, query) => repository.slug.includes(query)}
      itemToStringLabel={(repository) => repository.name}
      onValueChange={(repository) => repository?.slug}
    >
      <ComboboxContent>
        <ComboboxList<{ name: string; slug: string }>>
          {(repository) => (
            <ComboboxItem value={repository} key={repository.slug}>
              {repository.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export function SidebarActions() {
  return (
    <SidebarGroupContent>
      <SidebarMenuAction showOnHover render={<a href="/settings" />}>
        Settings
      </SidebarMenuAction>
    </SidebarGroupContent>
  );
}
