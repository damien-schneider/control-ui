import {
  ThreadRail,
  ThreadRailFile,
  ThreadRailFileIcon,
  ThreadRailFooter,
  ThreadRailItem,
  ThreadRailLine,
  ThreadRailMore,
  ThreadRailPopover,
  ThreadRailSummary,
  ThreadRailTitle,
} from "@/components/control-ui/thread-rail";

type UserTurn = {
  id: string;
  prompt: string;
  reply: string;
  files: string[];
};

const TURNS: UserTurn[] = [
  {
    id: "m1",
    prompt: "scaffold the turborepo workspace",
    reply: "Created apps/docs and packages/skills with a shared tsconfig and turbo pipelines.",
    files: [],
  },
  {
    id: "m2",
    prompt: "add a shadcn registry",
    reply: "Added registry/ manifests and a generated public/r mirror so installs use real URLs.",
    files: ["chat.json"],
  },
  {
    id: "m3",
    prompt: "make installs copy source files",
    reply: "Each manifest maps src/registry files to components/control-ui targets, so the app owns the code.",
    files: [],
  },
  {
    id: "m4",
    prompt: "write a refined skin",
    reply: "Added a compact, rounded, Notion-like skin across every documented component.",
    files: [],
  },
  {
    id: "m5",
    prompt: "keep skins runner-agnostic",
    reply: "Validation now fails if installable UI or a visual preview imports a runtime provider.",
    files: [],
  },
  {
    id: "m6",
    prompt: "add tool call states",
    reply: "Rendered pending, running, success, and error as status badges in both skins.",
    files: ["activity.tsx"],
  },
  {
    id: "m7",
    prompt: "compose the chat block",
    reply: "Made ChatBlock a controlled shell around ChatLayout and ChatThread with caller-owned turns and composer.",
    files: ["chat.tsx"],
  },
  {
    id: "m8",
    prompt: "read examples from real files",
    reply: "Docs tabs now read the actual source instead of duplicated strings.",
    files: [],
  },
  {
    id: "m9",
    prompt: "show the mastra composition",
    reply: "Usage files render provider-owned parts directly with Control UI components.",
    files: [],
  },
  {
    id: "m10",
    prompt: "fix the typecheck",
    reply: "Resolved the ComponentId union and the example map so tsc --noEmit passes.",
    files: [],
  },
];

const ACTIVE: UserTurn = {
  id: "m11",
  prompt: "use Mono Sans font please",
  reply:
    'Done. I updated the global docs font stack in globals.css to use "Mono Sans" first. Validated with npm run format:check, npm run lint, and the typecheck.',
  files: ["globals.css"],
};

export function ThreadRailExample() {
  const turns = [
    ...TURNS,
    ACTIVE,
    { id: "m12", prompt: "ship it", reply: "Opened a draft PR with the refined skin and provider-native usage examples.", files: [] },
  ];

  return (
    <div className="flex min-h-[420px] w-full items-center pl-10">
      <ThreadRail>
        {turns.map((turn) => {
          const visible = turn.files.slice(0, 2);
          const overflow = turn.files.length - visible.length;

          return (
            <ThreadRailItem key={turn.id} inView={turn.id === ACTIVE.id}>
              <ThreadRailLine aria-label={turn.prompt} />
              <ThreadRailPopover>
                <ThreadRailTitle>{turn.prompt}</ThreadRailTitle>
                <ThreadRailSummary>{turn.reply}</ThreadRailSummary>
                {turn.files.length > 0 ? (
                  <ThreadRailFooter>
                    {visible.map((file) => (
                      <ThreadRailFile key={file}>
                        <ThreadRailFileIcon>#</ThreadRailFileIcon>
                        {file}
                      </ThreadRailFile>
                    ))}
                    {overflow > 0 ? <ThreadRailMore>+{overflow}</ThreadRailMore> : null}
                  </ThreadRailFooter>
                ) : null}
              </ThreadRailPopover>
            </ThreadRailItem>
          );
        })}
      </ThreadRail>
    </div>
  );
}
