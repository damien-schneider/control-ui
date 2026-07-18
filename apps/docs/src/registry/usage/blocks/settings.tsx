"use client";

import { SettingsIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { SettingsBackAction, SettingsBlock, type SettingsPageDefinition } from "@/components/control-ui/blocks/settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";
import { Switch } from "@/components/control-ui/ui/switch";

const themeLabels: Record<string, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("system");

  const pages: readonly SettingsPageDefinition[] = [
    {
      id: "general",
      title: "General",
      icon: <SettingsIcon />,
      sections: [
        {
          id: "preferences",
          title: "Preferences",
          settings: [
            {
              id: "notifications",
              title: "Notifications",
              description: "Receive an alert when a background run finishes.",
              keywords: ["alerts", "background"],
              renderControl: (props) => <Switch {...props} checked={notifications} onCheckedChange={setNotifications} />,
            },
          ],
        },
      ],
    },
    {
      id: "appearance",
      title: "Appearance",
      icon: <SparklesIcon />,
      sections: [
        {
          id: "theme",
          title: "Theme",
          settings: [
            {
              id: "color-mode",
              title: "Color mode",
              description: "Choose how the interface follows your system appearance.",
              renderControl: (props) => (
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger {...props}>
                    <SelectValue>{(value) => themeLabels[value] ?? value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              ),
            },
          ],
        },
      ],
    },
  ];

  return <SettingsBlock pages={pages} backAction={<SettingsBackAction />} />;
}
