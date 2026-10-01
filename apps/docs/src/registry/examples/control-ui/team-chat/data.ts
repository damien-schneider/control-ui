import type { AvatarBadgeStatus } from "@/components/control-ui/ui/avatar";

export type TeamPerson = { id: string; name: string; initials: string; status: AvatarBadgeStatus };

export type TeamReaction = { emoji: string; userIds: string[] };

export type TeamMessage = {
  id: string;
  authorId: string;
  sentAt: string;
  text: string;
  reactions: TeamReaction[];
  replies: TeamMessage[];
  edited?: boolean;
};

export type TeamChannel = { id: string; name: string; topic: string; unread: number };

export const viewerId = "you";

export const people: Record<string, TeamPerson> = {
  you: { id: "you", name: "Damien Schneider", initials: "DS", status: "online" },
  maya: { id: "maya", name: "Maya Chen", initials: "MC", status: "online" },
  leo: { id: "leo", name: "Léo Martin", initials: "LM", status: "away" },
  ines: { id: "ines", name: "Inès Diallo", initials: "ID", status: "busy" },
  sam: { id: "sam", name: "Sam Rivera", initials: "SR", status: "offline" },
};

export const channels: TeamChannel[] = [
  { id: "support", name: "support", topic: "Customer conversations that need a second pair of eyes", unread: 0 },
  { id: "releases", name: "releases", topic: "What ships, when, and who is on call", unread: 4 },
  { id: "design", name: "design", topic: "Critiques, assets, and the occasional hot take", unread: 12 },
];

export const directMessagePeople = ["maya", "leo", "ines", "sam"] as const;

export const unreadDirectMessages: Record<string, number> = { leo: 2 };

export const supportMessages: TeamMessage[] = [
  {
    id: "m1",
    authorId: "maya",
    sentAt: "2026-09-30T16:02:00Z",
    text: "Acme reports that triage keeps tagging their billing questions as bugs. Anyone free to look before their 5pm sync?",
    reactions: [{ emoji: "👀", userIds: ["leo", "ines"] }],
    replies: [
      {
        id: "m1r1",
        authorId: "leo",
        sentAt: "2026-09-30T16:10:00Z",
        text: "The classifier never saw their new invoice template. I'm adding three samples now.",
        reactions: [],
        replies: [],
      },
      {
        id: "m1r2",
        authorId: "ines",
        sentAt: "2026-09-30T16:24:00Z",
        text: "Retagged the last 40 conversations by hand so their queue is clean for the call.",
        reactions: [{ emoji: "🙏", userIds: ["maya"] }],
        replies: [],
      },
    ],
  },
  {
    id: "m2",
    authorId: "maya",
    sentAt: "2026-09-30T16:03:00Z",
    text: "Screenshots are in the ticket.",
    reactions: [],
    replies: [],
  },
  {
    id: "m3",
    authorId: "you",
    sentAt: "2026-10-01T09:12:00Z",
    text: "Morning! I'm rethinking triage to be more predictive. Draft of the new rules goes out before lunch.",
    reactions: [
      { emoji: "🔥", userIds: ["maya", "leo", "sam"] },
      { emoji: "👍", userIds: ["ines"] },
    ],
    replies: [],
  },
  {
    id: "m4",
    authorId: "you",
    sentAt: "2026-10-01T09:13:00Z",
    text: "Reply here if your team has edge cases I should cover.",
    reactions: [],
    replies: [],
    edited: true,
  },
  {
    id: "m5",
    authorId: "ines",
    sentAt: "2026-10-01T09:40:00Z",
    text: "Refund requests that mention a bug. Those land in the wrong queue every week.",
    reactions: [{ emoji: "💯", userIds: ["you", "maya"] }],
    replies: [],
  },
];

const shortTime = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
const fullTime = new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short", timeZone: "UTC" });
const dayLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

export function formatMessageTime(sentAt: string) {
  return { short: shortTime.format(new Date(sentAt)), full: fullTime.format(new Date(sentAt)) };
}

const CONTINUATION_WINDOW_MS = 5 * 60 * 1000;

export function continuesPrevious(previous: TeamMessage | undefined, message: TeamMessage) {
  if (!previous || previous.authorId !== message.authorId) return false;
  return Date.parse(message.sentAt) - Date.parse(previous.sentAt) < CONTINUATION_WINDOW_MS;
}

export function groupByDay(messages: TeamMessage[]) {
  const days = new Map<string, TeamMessage[]>();
  for (const message of messages) {
    const label = dayLabel.format(new Date(message.sentAt));
    days.set(label, [...(days.get(label) ?? []), message]);
  }
  return [...days].map(([label, dayMessages]) => ({ label, messages: dayMessages }));
}

export function toggleReaction(reactions: TeamReaction[], emoji: string, userId: string): TeamReaction[] {
  const existing = reactions.find((reaction) => reaction.emoji === emoji);
  if (!existing) return [...reactions, { emoji, userIds: [userId] }];
  const userIds = existing.userIds.includes(userId) ? existing.userIds.filter((id) => id !== userId) : [...existing.userIds, userId];
  if (userIds.length === 0) return reactions.filter((reaction) => reaction.emoji !== emoji);
  return reactions.map((reaction) => (reaction.emoji === emoji ? { ...reaction, userIds } : reaction));
}
