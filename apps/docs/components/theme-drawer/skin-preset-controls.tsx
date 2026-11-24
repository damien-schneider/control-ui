"use client";

import { PlusIcon, SlidersHorizontalIcon, WandSparklesIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/control-ui/ui/select";
import { resetConversation, setDrawerOpen } from "./generation-store";
import { ALL_SKIN_IDS, isSkinId, SKIN_META_BY_ID } from "./presets";
import { SkinLogo } from "./skin-logo";
import { THEME_EDITOR_PATH } from "./theme-categories";
import { useThemeRuntime } from "./theme-runtime-context";
import { useThemeConversation } from "./use-theme-conversation";

const CREATE_SKIN_VALUE = "create-skin";
const EDIT_THEME_VALUE = "edit-theme";
const customSkinValue = (id: string) => `custom:${id}`;

function SkinOption({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      {icon}
      <span className="truncate">{label}</span>
    </span>
  );
}

const customSkinIcon = <WandSparklesIcon aria-hidden />;

export function SkinPresetControls({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { t, selectSkin, selectCustomSkin } = useThemeRuntime();
  const { customSkins, activeCustomSkin, startNewTheme } = useThemeConversation();
  const router = useRouter();
  const pathname = usePathname();
  const selectedValue = activeCustomSkin ? customSkinValue(activeCustomSkin.id) : t.skin;

  function openThemeEditor() {
    if (pathname !== THEME_EDITOR_PATH) router.push(THEME_EDITOR_PATH);
    onNavigate?.();
  }

  function createSkin() {
    startNewTheme();
    setDrawerOpen(true);
    openThemeEditor();
  }

  function selectValue(value: string) {
    if (value === EDIT_THEME_VALUE) return openThemeEditor();
    if (value === CREATE_SKIN_VALUE) return createSkin();

    const customSkin = customSkins.find((skin) => customSkinValue(skin.id) === value);
    if (customSkin) return selectCustomSkin(customSkin);

    if (isSkinId(value)) {
      selectSkin(value);
      resetConversation();
    }
  }

  return (
    <Select value={selectedValue} onValueChange={selectValue}>
      <SelectTrigger size="sm" aria-label="Skin" className={className}>
        <SelectValue placeholder="Skin">
          {() =>
            activeCustomSkin ? (
              <SkinOption icon={customSkinIcon} label={activeCustomSkin.name} />
            ) : (
              <SkinOption icon={<SkinLogo id={t.skin} size="sm" />} label={SKIN_META_BY_ID[t.skin].label} />
            )
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectGroupLabel>Skin</SelectGroupLabel>
          {ALL_SKIN_IDS.map((id) => (
            <SelectItem key={id} value={id} label={SKIN_META_BY_ID[id].label}>
              <SkinLogo id={id} size="sm" />
              {SKIN_META_BY_ID[id].label}
            </SelectItem>
          ))}
          {customSkins.map((skin) => (
            <SelectItem key={skin.id} value={customSkinValue(skin.id)} label={skin.name}>
              {customSkinIcon}
              {skin.name}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value={EDIT_THEME_VALUE} label="Edit theme">
          <SlidersHorizontalIcon aria-hidden />
          Edit theme…
        </SelectItem>
        <SelectItem value={CREATE_SKIN_VALUE} label="Create skin">
          <PlusIcon aria-hidden />
          Create skin
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
