import type { Emoji } from "frimousse";

export const initialRecentEmoji = [
  { emoji: "🎥", label: "Movie camera" },
  { emoji: "🐶", label: "Dog face" },
  { emoji: "🕹️", label: "Joystick" },
] satisfies readonly Emoji[];

export const commonReactions = [
  { emoji: "👍", label: "Thumbs up" },
  { emoji: "❤️", label: "Red heart" },
  { emoji: "😂", label: "Face with tears of joy" },
  { emoji: "🎉", label: "Party popper" },
  { emoji: "👀", label: "Eyes" },
  { emoji: "🙏", label: "Folded hands" },
] satisfies readonly Emoji[];

export function rememberEmoji(recent: readonly Emoji[], selected: Emoji): Emoji[] {
  return [selected, ...recent.filter((emoji) => emoji.emoji !== selected.emoji)].slice(0, 24);
}
