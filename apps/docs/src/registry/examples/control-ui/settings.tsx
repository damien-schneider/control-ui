"use client";

import { SettingsIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { SettingsBackAction, SettingsBlock, type SettingsPageDefinition } from "@/components/control-ui/blocks/settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";
import { Switch } from "@/components/control-ui/ui/switch";

const destinationLabels: Record<string, string> = {
  vscode: "VS Code",
  finder: "Finder",
  system: "System default",
};

const languageLabels: Record<string, string> = {
  auto: "Auto detect",
  en: "English",
  fr: "French",
};

const personalityLabels: Record<string, string> = {
  concise: "Concise",
  balanced: "Balanced",
  detailed: "Detailed",
};

export function SettingsExample() {
  const [defaultPermissions, setDefaultPermissions] = useState(true);
  const [autoReview, setAutoReview] = useState(true);
  const [fullAccess, setFullAccess] = useState(true);
  const [showInMenuBar, setShowInMenuBar] = useState(false);
  const [bottomPanel, setBottomPanel] = useState(true);
  const [openDestination, setOpenDestination] = useState("vscode");
  const [language, setLanguage] = useState("auto");
  const [personality, setPersonality] = useState("concise");

  const pages: readonly SettingsPageDefinition[] = [
    {
      id: "general",
      title: "General",
      icon: <SettingsIcon />,
      sections: [
        {
          id: "permissions",
          title: "Permissions",
          settings: [
            {
              id: "default-permissions",
              title: "Default permissions",
              description: "Allow the app to read and edit files in its workspace and request additional access when needed.",
              keywords: ["files", "workspace", "access"],
              renderControl: (props) => <Switch {...props} checked={defaultPermissions} onCheckedChange={setDefaultPermissions} />,
            },
            {
              id: "auto-review",
              title: "Auto-review",
              description: "Automatically review requests for additional access and flag elevated risks before continuing.",
              keywords: ["approval", "risk", "permissions"],
              renderControl: (props) => <Switch {...props} checked={autoReview} onCheckedChange={setAutoReview} />,
            },
            {
              id: "full-access",
              title: "Full access",
              description: "Allow editing files across your computer and running commands with network access.",
              keywords: ["computer", "network", "commands"],
              renderControl: (props) => <Switch {...props} checked={fullAccess} onCheckedChange={setFullAccess} />,
            },
          ],
        },
        {
          id: "general-preferences",
          title: "General",
          settings: [
            {
              id: "open-destination",
              title: "Default file open destination",
              description: "Choose where files and folders open by default.",
              keywords: ["editor", "files", "folders"],
              renderControl: (props) => (
                <Select value={openDestination} onValueChange={setOpenDestination}>
                  <SelectTrigger {...props}>
                    <SelectValue>{(value) => destinationLabels[value] ?? value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vscode">VS Code</SelectItem>
                    <SelectItem value="finder">Finder</SelectItem>
                    <SelectItem value="system">System default</SelectItem>
                  </SelectContent>
                </Select>
              ),
            },
            {
              id: "language",
              title: "Language",
              description: "Language used throughout the app interface.",
              keywords: ["locale", "translation"],
              renderControl: (props) => (
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger {...props}>
                    <SelectValue>{(value) => languageLabels[value] ?? value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto detect</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              ),
            },
            {
              id: "show-in-menu-bar",
              title: "Show in menu bar",
              description: "Keep the app in the macOS menu bar when the main window is closed.",
              keywords: ["menub", "tray", "macos"],
              renderControl: (props) => <Switch {...props} checked={showInMenuBar} onCheckedChange={setShowInMenuBar} />,
            },
            {
              id: "bottom-panel",
              title: "Bottom panel",
              description: "Show the bottom panel control in the app header.",
              keywords: ["layout", "panel", "header"],
              renderControl: (props) => <Switch {...props} checked={bottomPanel} onCheckedChange={setBottomPanel} />,
            },
          ],
        },
      ],
    },
    {
      id: "personalization",
      title: "Personalization",
      icon: <SparklesIcon />,
      sections: [
        {
          id: "responses",
          title: "Responses",
          settings: [
            {
              id: "personality",
              title: "Personality",
              description: "Choose the default style used for generated responses.",
              keywords: ["tone", "writing", "voice"],
              renderControl: (props) => (
                <Select value={personality} onValueChange={setPersonality}>
                  <SelectTrigger {...props}>
                    <SelectValue>{(value) => personalityLabels[value] ?? value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              ),
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="h-[min(720px,80vh)] min-h-150 w-full overflow-hidden rounded-[var(--radius-panel)] border bg-background">
      <SettingsBlock pages={pages} layout="contained" backAction={<SettingsBackAction />} />
    </div>
  );
}
